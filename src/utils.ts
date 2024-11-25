import { RichTextItemRequest } from './types/RichText';

const skipWords = new Set([
    'a', 'an', 'the', 'to', 'of', 'in', 'on', 'at', 'for', 'with', 'as', 'is', 'are', 'be', 'by', 'it', 'its', "it's", 'this', 'that',
    'these', 'those', 'my', 'your', 'his', 'her', 'their', 'our', 'and', 'or', 'but', 'so', 'not', 'if', 'then', 'else', 'than',
    'when', 'where', 'why', 'how', 'who', 'what', 'which', 'too', 'very', 'can', 'will', 'just', 'should', 'would', 'could', 'any',
    'all', 'some', 'every', 'no', 'more', 'most', 'less', 'least', 'many', 'much', '-', '--', '(', ')', '[', ']', '{', '}', ',', '.',
    ':', ';', '!', '?', '"', "'", '’', 's',
  ]);
  
  export const createLink = (word: string): RichTextItemRequest => ({
    type: 'text',
    text: {
      content: word,
      link: { url: `https://www.oxfordlearnersdictionaries.com/definition/english/${word.toLowerCase()}` }, // ここで単語を小文字に変換
    },
  });
  
  export const createTextWithLinks = (text: string | undefined): RichTextItemRequest[] => {
    if (!text) return [];
  
    // 単語境界、または句読点と空白の組み合わせで分割
    const words = text.match(/[\w-]+|(?<=[.,!?;:"'])|(?=[.,!?;:"'])|\s+/g) || [];
  
    const richText: RichTextItemRequest[] = [];
  
    for (const word of words) {
      const cleanWord = word.trim().replace(/[.,!?;:"']/g, ''); // 前後の空白も削除
      const lowerCaseWord = cleanWord.toLowerCase();
  
      if (skipWords.has(lowerCaseWord) || !/^[a-zA-Z]+$/.test(lowerCaseWord) || cleanWord === "") {
        richText.push({ type: 'text', text: { content: word } });
      } else {
        richText.push(createLink(cleanWord));
      }
    }
  
    return richText;
  };