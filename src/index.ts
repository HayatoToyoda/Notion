import * as fs from 'fs';
import { createNotionPage, JSONRow } from './notion';

async function addWordsToNotion(jsonFilePath: string): Promise<void> {
  try {
    const data = await fs.promises.readFile(jsonFilePath, 'utf-8');
    const jsonData: JSONRow[] = JSON.parse(data);

    for (const row of jsonData) {
      await createNotionPage(row);
    }

    console.log('JSON file processing completed.');
  } catch (error) {
    console.error('An error occurred during file processing:', error);
  }
}

// スクリプトの実行
const jsonFilePath = './words.json';

addWordsToNotion(jsonFilePath)
  .then(() => console.log('All words have been processed'))
  .catch((error) => console.error('An error occurred:', error));

