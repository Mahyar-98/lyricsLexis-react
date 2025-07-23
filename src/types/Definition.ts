export default interface Definition {
  partOfSpeech: string;
  definitions: {
    definition: string;
    synonyms: string[];
    antonyms: string[];
    example: string;
  }[];
  synonyms: string[];
  antonyms: string[];
  sourceUrls: string[];
  license: {
    name: string;
    url: string;
  };
}
