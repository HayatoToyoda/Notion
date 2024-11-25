"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDatabase = getDatabase;
exports.createNotionPage = createNotionPage;
require("dotenv/config");
const client_1 = require("@notionhq/client");
const utils_1 = require("./utils");
const notion = new client_1.Client({
    auth: process.env.NOTION_API_KEY,
    logLevel: process.env.NODE_ENV === 'development' ? client_1.LogLevel.DEBUG : client_1.LogLevel.WARN,
});
const databaseId = process.env.NOTION_DATABASE_ID || '';
async function getDatabase(databaseId) {
    console.log("Database ID being used:", databaseId);
    return notion.databases.retrieve({ database_id: databaseId });
}
async function ensureMultiSelectOption(databaseId, propertyName, option) {
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
async function createNotionPage(row) {
    try {
        await ensureMultiSelectOption(databaseId, 'Status', row.Status);
        await ensureMultiSelectOption(databaseId, 'Property', row.Property);
        const createRichText = (content, annotations, link) => ({
            type: 'text',
            text: { content, link },
            annotations,
            plain_text: content,
            href: link?.url || null,
        });
        const allContentRichText = [
            createRichText('**Definition:**\n', { bold: true }),
            ...Object.entries(row.Definition).flatMap(([type, definition]) => [
                createRichText(`${type}: `),
                ...(0, utils_1.createTextWithLinks)(definition),
                createRichText('\n\n'),
            ]),
            createRichText(`**Synonyms:** ${row.Synonyms?.verb?.join(', ') || ''}\n\n`, { bold: true }),
            createRichText(`**Antonyms:** ${row.Antonyms?.verb?.join(', ') || ''}\n\n`, { bold: true }),
            createRichText(`**Etymology:** ${row.Etymology || ''}\n\n`, { bold: true }),
            createRichText('**Example Sentences:**\n', { bold: true }),
            ...row.ExampleSentences.flatMap(sentence => [...(0, utils_1.createTextWithLinks)(sentence), createRichText('\n')]),
            createRichText(`\n**Collocations:** ${row.Collocations?.join(', ') || ''}\n\n`, { bold: true }),
            createRichText(`**Usage Notes:** ${row.UsageNotes?.join('\n') || ''}\n\n`, { bold: true }),
            createRichText(`**Related Words:** ${row.RelatedWords?.join(', ') || ''}`, { bold: true }),
        ].flat();
        await notion.pages.create({
            parent: { database_id: databaseId },
            properties: {
                Word: { title: [{ text: { content: row.Word } }] },
                Status: { multi_select: [{ name: row.Status }] },
                Property: { multi_select: [{ name: row.Property }] },
                Date: { date: { start: row.Date } },
            },
            children: [{ object: 'block', type: 'paragraph', paragraph: { rich_text: allContentRichText } }],
        });
        console.log(`Added: ${row.Word}`);
    }
    catch (error) {
        console.error(`Error adding ${row.Word}: ${error}`);
    }
}
