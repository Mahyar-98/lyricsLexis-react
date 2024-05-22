import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";

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

const Dictionary = ({ word }: { word: string }) => {
  const [meanings, setMeanings] = useState<WordData[] | null>(null);
  const [isWordSaved, setIsWordSaved] = useState(false);
  const { session, allSavedWords, setAllSavedWords } = useOutletContext(); //TODO: add the type

  useEffect(() => {
    if (word) {
      fetch(import.meta.env.VITE_BACKEND_URL + "/api/dictionary/" + word)
        .then((res) => res.json())
        .then((data) => setMeanings(data));
    }
  }, [word]);

  useEffect(() => {
    if (session && meanings) {
      fetch(
        import.meta.env.VITE_BACKEND_URL +
          "/users/" +
          session.userId +
          "/words/" +
          encodeURIComponent(word.toLowerCase()),
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.token}`, // Include token in Authorization header
          },
        },
      )
        .then((res) => {
          if (res.ok) {
            setIsWordSaved(true);
          } else {
            setIsWordSaved(false);
          }
        })
        .catch(() => console.log("Word not found"));
    }
  }, [session, isWordSaved, meanings, word]);

  const handleSaveWord = async (word: string) => {
    try {
      const response = await fetch(
        import.meta.env.VITE_BACKEND_URL +
          "/users/" +
          session.userId +
          "/words",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.token}`, // Include token in Authorization header
          },
          body: JSON.stringify({ word }),
        },
      );

      if (response.ok) {
        console.log("Word saved successfully!");
        setIsWordSaved(true);
        const newWords = await response.json();
        setAllSavedWords(newWords);
      } else {
        console.log("Failed to save word:", response.statusText);
        // Show some error message to the user
      }
    } catch (error) {
      console.error("Error saving word:", error);
      // Handle the error (e.g., show an error message to the user)
    }
  };

  const handleUnsaveWord = async (word: string) => {
    try {
      const response = await fetch(
        import.meta.env.VITE_BACKEND_URL +
          "/users/" +
          session.userId +
          "/words/" +
          encodeURIComponent(word),
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.token}`, // Include token in Authorization header
          },
        },
      );

      if (response.ok) {
        console.log("Word unsaved successfully!");
        setIsWordSaved(false);
        const newWords = await response.json();
        setAllSavedWords(newWords);
      } else {
        console.log("Failed to unsave word:", response.statusText);
        // Show some error message to the user
      }
    } catch (error) {
      console.error("Error unsaving word:", error);
      // Handle the error (e.g., show an error message to the user)
    }
  };

  return (
    <>
      {meanings && meanings.length > 0 ? (
        <div className="hasMeaning">
          {session && isWordSaved ? (
            <button onClick={() => handleUnsaveWord(word.toLowerCase())}>
              unsave word
            </button>
          ) : (
            <button onClick={() => handleSaveWord(word.toLowerCase())}>
              save word
            </button>
          )}
          {meanings.map((meaning, index) => (
            <div key={index}>
              <h1>{meaning.word}</h1>
              {meaning.phonetics && meaning.phonetics.length > 0 && (
                <div className="phonetics">
                  {meaning.phonetics.map((pronunciation, index) => (
                    <div key={index}>
                      <p>{pronunciation.text}</p>
                      <audio key={pronunciation.audio} controls>
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
