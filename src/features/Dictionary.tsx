import { useEffect, useState } from "react";
import { useOutletContext, Link } from "react-router-dom";

// Import types
import Session from "@/types/Session";
import Word from "@/types/Word";
import SavedWord from "@/types/SavedWord";

// Import styles
import "@/styles/dictionary.css";

// Import icons
import { FaSave } from "react-icons/fa";
import { FaTrash } from "react-icons/fa";
import { HiSpeakerWave } from "react-icons/hi2";

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
                    <FaTrash />
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
                  <FaSave />
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
                          <HiSpeakerWave />
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
