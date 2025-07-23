import "../styles/dictionary.css";
import { useEffect, useState } from "react";
import { useOutletContext, Link } from "react-router-dom";

// Import types
import Session from "@/types/Session";
import Word from "@/types/Word";
import SavedWord from "@/types/SavedWord";

interface OutletContext {
  session: Session;
  setAllSavedWords: (words: SavedWord[]) => void;
  setUpdateTrigger: (trigger: boolean | ((prev: boolean) => boolean)) => void;
  dicOpen: boolean;
  setLoading: (loading: boolean) => void;
}

const Dictionary = ({ word }: { word: string }) => {
  const [meanings, setMeanings] = useState<Word[] | null>(null);
  const [isWordSaved, setIsWordSaved] = useState(false);
  const [isLearned, setIsLearned] = useState(false);
  const [note, setNote] = useState("");
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [noteInput, setNoteInput] = useState("");
  const { session, setAllSavedWords, setUpdateTrigger, dicOpen, setLoading } =
    useOutletContext() as OutletContext;

  useEffect(() => {
    if (word) {
      fetch(import.meta.env.VITE_BACKEND_URL + "/api/dictionary/" + word)
        .then((res) => res.json())
        .then((data) => {
          setMeanings(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching dictionary data: ", err);
          setLoading(false);
        });
    }
  }, [word, setLoading]);

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
          }
        })
        .then((data: SavedWord) => {
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
      setLoading(false);

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
      setLoading(false);

      if (response.ok) {
        console.log("Word removed successfully!");
        setIsWordSaved(false);
        const newWords = await response.json();
        setAllSavedWords(newWords);
      } else {
        console.log("Failed to remove word:", response.statusText);
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
      setLoading(false);

      if (response.ok) {
        console.log("Word learned status updated successfully!");
        setIsLearned(!isLearned); // Toggle local state
        setUpdateTrigger((prev) => !prev);
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
    setNoteInput(event.target.value); // Update noteInput state
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
          body: JSON.stringify({ note: noteInput.trim() }), // Send noteInput in the request body
        },
      );
      setLoading(false);

      if (response.ok) {
        console.log("Note added successfully!");
        setNote(noteInput.trim()); // Update note state with the value from noteInput
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

  const handleDeleteNote = async () => {
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
          body: JSON.stringify({ note: "" }), // Clear the note
        },
      );
      setLoading(false);

      if (response.ok) {
        console.log("Note deleted successfully!");
        setNote("");
        setNoteInput("");
        setShowNoteForm(false);
      } else {
        console.log("Failed to delete note:", response.statusText);
      }
    } catch (error) {
      console.error("Error deleting note:", error);
      // Handle the error (e.g., show an error message to the user)
    }
  };

  const playAudio = (audioUrl: string) => {
    const audio = new Audio(audioUrl);
    audio.play();
  };

  return (
    <div className={`side-dic ${dicOpen ? "show" : ""}`}>
      {meanings && meanings.length > 0 ? (
        <div className="hasMeaning side-dic-content">
          {session ? (
            <div className="word-operations">
              {session && isWordSaved ? (
                <>
                  <button
                    className="save-unsave-btn remove"
                    title="remove word"
                    onClick={() => {
                      handleUnsaveWord(word.toLowerCase());
                      setLoading(true);
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 448 512"
                    >
                      <path d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z" />
                    </svg>
                  </button>
                  <div className="learned-cb">
                    <input
                      type="checkbox"
                      checked={isLearned}
                      onChange={() => {
                        handleCheckboxChange();
                        setLoading(true);
                      }}
                    />
                    <label>I've learned this word</label>
                  </div>
                  <div className="note">
                    {showNoteForm ? (
                      <form
                        className="note-content"
                        onSubmit={(e) => {
                          handleNoteSubmit(e);
                          setLoading(true);
                        }}
                      >
                        <div className="note-header">
                          <b>Note</b>
                          <div className="note-btns">
                            <button onClick={() => setShowNoteForm(false)}>
                              Cancel
                            </button>
                            <button type="submit">Done</button>
                          </div>
                        </div>
                        <hr />
                        <textarea
                          name="note"
                          id="note"
                          rows={3}
                          value={noteInput}
                          onChange={handleNoteChange}
                          placeholder={`Here's the example I learned "${word.toLowerCase()}" from: ...`}
                        ></textarea>
                      </form>
                    ) : note ? (
                      <div className="note-content">
                        <div className="note-header">
                          <b>Note</b>
                          <div className="note-btns">
                            <button onClick={() => setShowNoteForm(true)}>
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                handleDeleteNote();
                                setLoading(true);
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        <hr />
                        <p>{note}</p>
                      </div>
                    ) : (
                      <button onClick={() => setShowNoteForm(true)}>
                        Add a note
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <button
                  className="save-unsave-btn save"
                  title="save word"
                  onClick={() => {
                    handleSaveWord(word.toLowerCase());
                    setLoading(true);
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                    <path d="M64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V173.3c0-17-6.7-33.3-18.7-45.3L352 50.7C340 38.7 323.7 32 306.7 32H64zm0 96c0-17.7 14.3-32 32-32H288c17.7 0 32 14.3 32 32v64c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V128zM224 288a64 64 0 1 1 0 128 64 64 0 1 1 0-128z" />
                  </svg>
                </button>
              )}
            </div>
          ) : (
            <p>
              Sign in{" "}
              <Link className="here" to="/signin">
                here
              </Link>{" "}
              to save words!
            </p>
          )}
          {meanings.map((meaning, index) => (
            <div key={index}>
              <h1>{meaning.word}</h1>
              {meaning.phonetics && meaning.phonetics.length > 0 && (
                <div className="pronunciations">
                  {meaning.phonetics.map((pronunciation, index) => (
                    <div className="pronunciation" key={index}>
                      {pronunciation.audio === "" ? null : (
                        <button
                          className="speaker"
                          onClick={() => playAudio(pronunciation.audio)}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 640 512"
                          >
                            <path d="M533.6 32.5C598.5 85.2 640 165.8 640 256s-41.5 170.7-106.4 223.5c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C557.5 398.2 592 331.2 592 256s-34.5-142.2-88.7-186.3c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zM473.1 107c43.2 35.2 70.9 88.9 70.9 149s-27.7 113.8-70.9 149c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C475.3 341.3 496 301.1 496 256s-20.7-85.3-53.2-111.8c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zm-60.5 74.5C434.1 199.1 448 225.9 448 256s-13.9 56.9-35.4 74.5c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C393.1 284.4 400 271 400 256s-6.9-28.4-17.7-37.3c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zM301.1 34.8C312.6 40 320 51.4 320 64V448c0 12.6-7.4 24-18.9 29.2s-25 3.1-34.4-5.3L131.8 352H64c-35.3 0-64-28.7-64-64V224c0-35.3 28.7-64 64-64h67.8L266.7 40.1c9.4-8.4 22.9-10.4 34.4-5.3z" />
                          </svg>
                        </button>
                      )}
                      <p>{pronunciation.text}</p>
                    </div>
                  ))}
                </div>
              )}
              {meaning.meanings.map((definition, definitionIndex) => (
                <div key={definitionIndex} className="definition">
                  <h2>{definition.partOfSpeech}</h2>
                  <ol className="meanings">
                    {definition.definitions.map((def, defIndex) => (
                      <li key={defIndex} className="meaning">
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
                  <div className="syn-ant">
                    {definition.synonyms.length > 0 ? (
                      <p>
                        <b>synonyms</b>: {definition.synonyms.join(", ")}
                      </p>
                    ) : null}
                    {definition.antonyms.length > 0 ? (
                      <p>
                        <b>antonyms</b>: {definition.antonyms.join(", ")}
                      </p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <p>No definition found for the word "{word}".</p>
      )}
    </div>
  );
};

export default Dictionary;
