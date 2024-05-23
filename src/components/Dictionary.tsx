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
  const [isLearned, setIsLearned] = useState(false);
  const [note, setNote] = useState("");
  const [showNoteForm, setShowNoteForm] = useState(false);
  const { session, setAllSavedWords, setUpdateTrigger } = useOutletContext(); //TODO: add the type

  useEffect(() => {
    if (word) {
      fetch(import.meta.env.VITE_BACKEND_URL + "/api/dictionary/" + word)
        .then((res) => res.json())
        .then((data) => setMeanings(data));
    }
  }, [word]);

  useEffect(() => {
    setNote(""); // Reset note state
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
            return res.json();
          } else {
            setIsWordSaved(false);
            return {};
          }
        })
        .then((data) => {
          setIsLearned(data.learned || false);
          setNote(data.note || "");
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

  const handleCheckboxChange = async () => {
    try {
      const response = await fetch(
        import.meta.env.VITE_BACKEND_URL +
          "/users/" +
          session.userId +
          "/words/" +
          encodeURIComponent(word.toLowerCase()),
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.token}`, // Include token in Authorization header
          },
          body: JSON.stringify({ learned: !isLearned }), // Toggle learned status
        },
      );

      if (response.ok) {
        console.log("Word learned status updated successfully!");
        setIsLearned(!isLearned); // Toggle local state
        setUpdateTrigger((prev: boolean) => !prev);
      } else {
        console.log(
          "Failed to update word learned status:",
          response.statusText,
        );
        // Show some error message to the user
      }
    } catch (error) {
      console.error("Error updating word learned status:", error);
      // Handle the error (e.g., show an error message to the user)
    }
  };

  const handleNoteChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNote(event.target.value);
  };

  const handleNoteSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const response = await fetch(
        import.meta.env.VITE_BACKEND_URL +
          "/users/" +
          session.userId +
          "/words/" +
          encodeURIComponent(word.toLowerCase()),
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.token}`, // Include token in Authorization header
          },
          body: JSON.stringify({ note }), // Send note in the request body
        },
      );

      if (response.ok) {
        console.log("Note added successfully!");
        setShowNoteForm(false);
      } else {
        console.log("Failed to add note:", response.statusText);
        // Show some error message to the user
      }
    } catch (error) {
      console.error("Error adding note:", error);
      // Handle the error (e.g., show an error message to the user)
    }
  };

  return (
    <>
      {meanings && meanings.length > 0 ? (
        <div className="hasMeaning">
          {session && isWordSaved ? (
            <>
              <button onClick={() => handleUnsaveWord(word.toLowerCase())}>
                unsave word
              </button>
              <label>
                <input
                  type="checkbox"
                  checked={isLearned}
                  onChange={handleCheckboxChange}
                />
                Learned
              </label>
              {note ? (
                <>
                  {showNoteForm ? null : <p>Note: {note}</p>}
                  <button onClick={() => setShowNoteForm(true)}>
                    Edit Note
                  </button>
                </>
              ) : (
                <button onClick={() => setShowNoteForm(true)}>Add Note</button>
              )}
              {showNoteForm && (
                <form onSubmit={handleNoteSubmit}>
                  <label htmlFor="note">Add/Edit Note: </label>
                  <textarea
                    name="note"
                    id="note"
                    cols={30}
                    rows={10}
                    value={note}
                    onChange={handleNoteChange}
                    placeholder={`I learned the word "${word.toLowerCase()}" from this line of the song: ...`}
                  ></textarea>
                  <button>Done</button>
                </form>
              )}
            </>
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
