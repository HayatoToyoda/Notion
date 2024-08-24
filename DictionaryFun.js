const appId = '661f3e2a'; // Replace with your actual App ID
const apiKey = '28037c95ecfcbf21f7f220f1047c7e1d'; // Replace with your actual App Key

async function getWordInfo(word) {
  const url = `https://api.oxfordlearnersdictionaries.com/v1/entries/en-us/${word}?fields=definitions,examples,pronunciations,etymologies,synonyms,antonyms&app_id=${appId}&app_key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}

async function displayWordInfo(word) {
  const data = await getWordInfo(word);

  if (data) {
    const results = data.results[0];
    const lexicalEntries = results.lexicalEntries;

    for (const lexicalEntry of lexicalEntries) {
      console.log('Part of Speech:', lexicalEntry.lexicalCategory.text);
      for (const entry of lexicalEntry.entries) {
        for (const sense of entry.senses) {
          console.log('Definition:', sense.definitions[0]);

          // Check if examples exist
          if (sense.examples) {
            console.log('Example:', sense.examples[0].text);
          }

          // Check if synonyms exist
          if (sense.synonyms) {
            console.log('Synonyms:', sense.synonyms.join(', ')); // Join synonyms into a comma-separated string
          }

          // Check if antonyms exist
          if (sense.antonyms) {
            console.log('Antonyms:', sense.antonyms.join(', ')); // Join antonyms into a comma-separated string
          }

          // Check if pronunciation information exists
          if (entry.pronunciations) {
            console.log('Pronunciation:', entry.pronunciations[0].phoneticSpelling);
            console.log('Audio File (if available):', entry.pronunciations[0].audioFile); // Optional: Display audio file URL
          }

          // Check if etymology information exists
          if (entry.etymologies) {
            console.log('Etymology:', entry.etymologies[0]);
          }
        }
      }
    }
  } else {
    console.log('Word not found!');
  }
}
