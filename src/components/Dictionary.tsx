import React, { useEffect, useState } from "react";

interface Pronunciation {
  text: string;
  audio: string;
  sourceUrl: string;
  license: {
    name: string;
    url: string;
  };
}

interface Definition {
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

interface WordData {
  word: string;
  phonetic: string;
  phonetics: Pronunciation[];
  meanings: Definition[];
}

const Dictionary = ({ word }: { word: string | null }) => {
  const [meanings, setMeanings] = useState<WordData[] | null>(null);
  useEffect(() => {
    if (word) {
      fetch("http://localhost:3000/api/dictionary/" + word)
        .then((res) => res.json())
        .then((data) => setMeanings(data));
    }
  }, [word]);

  const handleSaveWord = (savingWord: string) => {
    return savingWord;
  };
  return (
    <>
      {meanings && meanings.length > 0 ? (
        <div className="hasMeaning">
          <button onClick={() => handleSaveWord(word!)}>save word</button>
          {meanings.map((meaning, index) => (
            <div key={index}>
              <h1>{meaning.word}</h1>
              {meaning.phonetics && meaning.phonetics.length > 0 && (
                <div className="phonetics">
                  {meaning.phonetics.map((pronunciation, index) => (
                    <div key={index}>
                      <p>{pronunciation.text}</p>
                      <audio controls>
                        <source src={pronunciation.audio} type="audio/mpeg" />
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  ))}
                </div>
              )}
              {meaning.meanings.map((definition, definitionIndex) => (
                <div key={definitionIndex}>
                  <h2>{definition.partOfSpeech}</h2>
                  <ol>
                    {definition.definitions.map((def, defIndex) => (
                      <li key={defIndex}>
                        <b>{def.definition}</b>
                        {def.example ? <p>example: {def.example}</p> : null}
                        {def.synonyms.length > 0 ? (
                          <p>synonyms: {def.synonyms.join(", ")}</p>
                        ) : null}
                        {def.antonyms.length > 0 ? (
                          <p>antonyms: {def.antonyms.join(", ")}</p>
                        ) : null}
                      </li>
                    ))}
                  </ol>
                  {definition.synonyms.length > 0 ? (
                    <p>synonyms: {definition.synonyms.join(", ")}</p>
                  ) : null}
                  {definition.antonyms.length > 0 ? (
                    <p>antonyms: {definition.antonyms.join(", ")}</p>
                  ) : null}
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <p>No definition found for the word "{word}".</p>
      )}
    </>
  );
};

export default Dictionary;
