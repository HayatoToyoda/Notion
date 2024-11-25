"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTextWithLinks = exports.createLink = void 0;
const skipWords = new Set([
    'a', 'an', 'the', 'to', 'of', 'in', 'on', 'at', 'for', 'with', 'as', 'is', 'are', 'be', 'by', 'it', 'its', "it's", 'this', 'that',
    'these', 'those', 'my', 'your', 'his', 'her', 'their', 'our', 'and', 'or', 'but', 'so', 'not', 'if', 'then', 'else', 'than',
    'when', 'where', 'why', 'how', 'who', 'what', 'which', 'too', 'very', 'can', 'will', 'just', 'should', 'would', 'could', 'any',
    'all', 'some', 'every', 'no', 'more', 'most', 'less', 'least', 'many', 'much', '-', '--', '(', ')', '[', ']', '{', '}', ',', '.',
    ':', ';', '!', '?', '"', "'", '’', 's',
]);
const createLink = (word) => ({
    type: 'text',
    text: {
        content: word,
        link: { url: `https://www.oxfordlearnersdictionaries.com/definition/english/${word.toLowerCase()}` }, // ここで単語を小文字に変換
    },
});
exports.createLink = createLink;
const createTextWithLinks = (text) => {
    if (!text)
        return [];
    // 正規表現を使用して、単語と句読点をより正確に分割
    const words = text.match(/[\w-]+|[.,!?;:"']/g) || []; // split by word boundaries and punctuation
    const richText = [];
    for (const word of words) {
        const cleanWord = word.replace(/[.,!?;:"']/g, '');
        const lowerCaseWord = cleanWord.toLowerCase();
        if (skipWords.has(lowerCaseWord) || !/^[a-zA-Z]+$/.test(lowerCaseWord) || cleanWord === "") {
            richText.push({ type: 'text', text: { content: word } });
        }
        else {
            richText.push((0, exports.createLink)(cleanWord));
        }
    }
    return richText;
};
exports.createTextWithLinks = createTextWithLinks;
