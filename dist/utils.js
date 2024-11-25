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
        link: { url: `https://www.oxfordlearnersdictionaries.com/definition/english/${word}` },
    },
});
exports.createLink = createLink;
const createTextWithLinks = (text) => text?.split(' ').map(word => {
    const cleanWord = word.toLowerCase().replace(/[.,!?;"]/g, '');
    return skipWords.has(cleanWord)
        ? { type: 'text', text: { content: word } }
        : (0, exports.createLink)(cleanWord);
}) || [];
exports.createTextWithLinks = createTextWithLinks;
