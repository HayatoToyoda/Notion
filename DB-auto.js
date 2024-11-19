const { Client } = require('@notionhq/client');
const csv = require('csv-parser');
const fs = require('fs');

// Notion APIの設定
const notion = new Client({ auth: '' });
const databaseId = '';

// データベースの情報を取得する関数
async function getDatabase(databaseId) {
  const response = await notion.databases.retrieve({ database_id: databaseId });
  return response;
}

// multi_selectオプションを確認し、存在しない場合は追加する関数
async function ensureMultiSelectOption(databaseId, propertyName, option) {
  const database = await getDatabase(databaseId);
  const property = database.properties[propertyName];

  if (!property || property.type !== 'multi_select') {
    throw new Error(`Property ${propertyName} is not a multi_select property`);
  }

  const options = property.multi_select.options;
  const existingOption = options.find(opt => opt.name === option);

  if (!existingOption) {
    options.push({ name: option });
    await notion.databases.update({
      database_id: databaseId,
      properties: {
        [propertyName]: {
          multi_select: {
            options: options,
          },
        },
      },
    });
    console.log(`Added new multi_select option: ${option}`);
  }
}

// CSVファイルを読み込み、Notionデータベースに追加する関数
async function addWordsToNotion(csvFilePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        for (const row of results) {
          try {
            // StatusとPropertyのmulti_selectプロパティのオプションを確認・追加
            const statusOptions = row.Status.split(',').map(option => option.trim());
            for (const option of statusOptions) {
              await ensureMultiSelectOption(databaseId, 'Status', option);
            }

            const propertyOptions = row.Property.split(',').map(option => option.trim());
            for (const option of propertyOptions) {
              await ensureMultiSelectOption(databaseId, 'Property', option);
            }

            await notion.pages.create({
              parent: { database_id: databaseId },
              properties: {
                Word: { title: [{ text: { content: row.Word } }] },
                Status: { multi_select: statusOptions.map(option => ({ name: option })) },
                Property: { multi_select: propertyOptions.map(option => ({ name: option })) },
                Date: { date: { start: row.Date } },
              },
              children: [
                {
                  object: 'block',
                  type: 'paragraph',
                  paragraph: {
                    rich_text: [
                      {
                        type: 'text',
                        text: {
                          content: `Meaning: ${row.Meaning}\n\nExample Sentence: ${row['Example Sentence']}`
                        }
                      }
                    ]
                  }
                }
              ]
            });
            console.log(`Added: ${row.Word}`);
          } catch (error) {
            console.error(`Error adding ${row.Word}: ${error.message}`);
          }
        }
        console.log('CSV file processing completed.');
        resolve();
      })
      .on('error', reject);
  });
}

// スクリプトの実行
const csvFilePath = 'C:\\Users\\DELL\\Appdev\\Notion\\test2.csv';

addWordsToNotion(csvFilePath)
  .then(() => console.log('All words have been processed'))
  .catch((error) => console.error('An error occurred:', error));
