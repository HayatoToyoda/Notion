export interface JSONRow {
  Word: string;
  Status: string;
  Property: string;
  Date: string;
  Definition: { [partOfSpeech: string]: string };
  Synonyms?: { [partOfSpeech: string]: string[] };
  Antonyms?: { [partOfSpeech: string]: string[] };
  Etymology?: string;
  ExampleSentences: string[];
  Collocations?: string[];
  UsageNotes?: string[];
  RelatedWords?: string[];
}