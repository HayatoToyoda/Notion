import 'dotenv/config';
import { Client, LogLevel } from '@notionhq/client';
import { JSONRow } from './types/JSONRow';
import { createTextWithLinks } from './utils';
import { RichTextItemRequest } from './types/RichText';
import { BlockObjectRequest } from '@notionhq/client/build/src/api-endpoints'; // 必要な型をインポート


const notion = new Client({
  auth: process.env.NOTION_API_KEY,
  logLevel: process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.WARN,
});

const databaseId = process.env.NOTION_DATABASE_ID || '';

export async function getDatabase(databaseId: string) {
  console.log("Database ID being used:", databaseId); 
  return notion.databases.retrieve({ database_id: databaseId });
}

async function ensureMultiSelectOption(databaseId: string, propertyName: string, option: string) {
  const database = await getDatabase(databaseId);
  const property = database.properties[propertyName];

  if (!property || property.type !== 'multi_select') {
    throw new Error(`Property ${propertyName} is not a multi-select property`);
  }

  if (!property.multi_select.options.some(opt => opt.name === option)) {
    await notion.databases.update({
      database_id: databaseId,
      properties: {
        [propertyName]: {
          multi_select: {
            options: [...property.multi_select.options, { name: option }],
          },
        },
      },
    });
    console.log(`Added new multi_select option: ${option}`);
  }
}

export async function createNotionPage(row: JSONRow) {
  try {
    await ensureMultiSelectOption(databaseId, 'Status', row.Status);
    await ensureMultiSelectOption(databaseId, 'Property', row.Property);

    const createRichText = (content: string, annotations?: any, link?: { url: string } | null): RichTextItemRequest => ({
        type: 'text',
        text: { content, link },
        annotations,
        plain_text: content, 
        href: link?.url || null,
    });

    const allContentRichText: RichTextItemRequest[] = [
      createRichText('**Definition:**\n', { bold: true }),
      ...Object.entries(row.Definition).flatMap(([type, definition]) => [
        createRichText(`${type}: `),
        ...createTextWithLinks(definition),
        createRichText('\n\n'),
      ]),
      createRichText(`**Synonyms:** ${row.Synonyms?.verb?.join(', ') || ''}\n\n`, { bold: true }),
      createRichText(`**Antonyms:** ${row.Antonyms?.verb?.join(', ') || ''}\n\n`, { bold: true }),
      createRichText(`**Etymology:** ${row.Etymology || ''}\n\n`, { bold: true }),
      createRichText('**Example Sentences:**\n', { bold: true }),
      ...row.ExampleSentences.flatMap(sentence => [...createTextWithLinks(sentence), createRichText('\n')]),
      createRichText(`\n**Collocations:** ${row.Collocations?.join(', ') || ''}\n\n`, { bold: true }),
      createRichText(`**Usage Notes:** ${row.UsageNotes?.join('\n') || ''}\n\n`, { bold: true }),
      createRichText(`**Related Words:** ${row.RelatedWords?.join(', ') || ''}`, { bold: true }),
    ].flat();

    const chunkSize = 100;
    const children: BlockObjectRequest[] = []; // 正しい型を指定

    for (let i = 0; i < allContentRichText.length; i += chunkSize) {
        const chunk = allContentRichText.slice(i, i + chunkSize);
        children.push({
            object: 'block',
            type: 'paragraph',
            paragraph: { rich_text: chunk }
        } as const satisfies BlockObjectRequest); // 型アサーションまたはas constを使用
    }

    await notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        Word: { title: [{ text: { content: row.Word } }] },
        Status: { multi_select: [{ name: row.Status }] },
        Property: { multi_select: [{ name: row.Property }] },
        Date: { date: { start: row.Date } },
      },
      children: children, // children 配列をそのまま渡す
    });

    console.log(`Added: ${row.Word}`);
  } catch (error) {
    console.error(`Error adding ${row.Word}: ${error}`);
  }
}

export { JSONRow } from './types/JSONRow';