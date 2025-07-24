import React, { useState, useEffect } from "react";
import { Link, useOutletContext } from "react-router-dom";

// Import types
import Song from "@/types/Song";
import SavedWord from "@/types/SavedWord";
import Session from "@/types/Session";

// Import styles
import "@/styles/lyrics.css";

// Import icons
import { FaSave } from "react-icons/fa";
import { FaTrash } from "react-icons/fa";

interface OutletContextType {
  session: Session;
  allSavedWords: SavedWord[];
  setDicOpen: (dicOpen: boolean) => void;
  setLoading: (loading: boolean) => void;
}

const Lyrics: React.FC<{
  song: Song;
  setWord: (word: string) => void;
}> = ({ song, setWord }) => {
  const [isSongSaved, setIsSongSaved] = useState(false);
  const [songSavedWords, setSongSavedWords] = useState<SavedWord[]>([]);
  const { session, allSavedWords, setDicOpen, setLoading } =
    useOutletContext() as OutletContextType;

  useEffect(() => {
    if (session && song && song.lyrics) {
      fetch(
        import.meta.env.VITE_BACKEND_URL +
          "/users/" +
          session.userId +
          "/songs/" +
          encodeURIComponent(song.artist) +
          "/" +
          encodeURIComponent(song.title),
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
            setIsSongSaved(true);
          } else {
            setIsSongSaved(false);
          }
          setLoading(false);
        })
        .catch(() => {
          console.log("Song not found");
          setLoading(false);
        });
    }
  }, [song, session, isSongSaved, allSavedWords, setLoading]);

  useEffect(() => {
    if (session && song && song.lyrics) {
      const savedWordsInLyrics: SavedWord[] = []; // Array to store saved words found in lyrics

      // Split lyrics into words
      const words = song.lyrics.match(/\b[\w'-]+\b/g);

      // Iterate through each word in the lyrics
      words &&
        words.forEach((word) => {
          // Find the word object in allSavedWords array by matching the word
          const foundWord = allSavedWords.find(
            (savedWord: SavedWord) => savedWord.word === word.toLowerCase(),
          );

          // If the word object is found and not already included in savedWordsInLyrics, add it
          if (
            foundWord &&
            !savedWordsInLyrics.some((w) => w.word === foundWord.word)
          ) {
            savedWordsInLyrics.push(foundWord);
          }
        });
      setSongSavedWords(savedWordsInLyrics);
    }
  }, [song, session, allSavedWords]);

  const handleSaveSong = async (song: Song) => {
    try {
      const response = await fetch(
        import.meta.env.VITE_BACKEND_URL +
          "/users/" +
          session.userId +
          "/songs",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.token}`, // Include token in Authorization header
          },
          body: JSON.stringify(song),
        },
      );
      setLoading(false);

      if (response.ok) {
        console.log("Song saved successfully!");
        setIsSongSaved(true);
      } else {
        console.log("Failed to save song:", response.statusText);
        // Show some error message to the user
      }
    } catch (error) {
      console.error("Error saving song:", error);
      // Handle the error (e.g., show an error message to the user)
    }
  };

  const handleUnsaveSong = async (song: Song) => {
    try {
      const response = await fetch(
        import.meta.env.VITE_BACKEND_URL +
          "/users/" +
          session.userId +
          "/songs/" +
          encodeURIComponent(song.artist) +
          "/" +
          encodeURIComponent(song.title),
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
        console.log("Song removed successfully!");
        setIsSongSaved(false);
      } else {
        console.log("Failed to remove song:", response.statusText);
        // Show some error message to the user
      }
    } catch (error) {
      console.error("Error removing song:", error);
      // Handle the error (e.g., show an error message to the user)
    }
  };

  const handleWordClick = (word: string) => {
    setDicOpen(true);
    setWord(word);
  };

  return (
    <>
      <div className="song-info">
        <img
          src={song.thumbnail}
          alt={song.title + " track cover by " + song.artist}
        />
        <div className="song-info-right">
          <div className="song-info-right-top">
            <div>
              <b>Artist: </b>
              {song.artist}
            </div>
            <div>
              <b>Title: </b>
              {song.title}
            </div>
            {session && songSavedWords.length > 0 && (
              <div>
                <b>Saved Words: </b>
                {songSavedWords.map((savedWord, index) => {
                  const isLearned = savedWord ? savedWord.learned : false;
                  return (
                    <React.Fragment key={index}>
                      <span
                        className={"saved" + (isLearned ? " learned" : "")}
                        onClick={() => {
                          handleWordClick(savedWord.word);
                          setLoading(true);
                        }}
                      >
                        {savedWord.word}
                      </span>
                      {index !== songSavedWords.length - 1 && ", "}
                    </React.Fragment>
                  );
                })}
              </div>
            )}
          </div>
          {session ? (
            <div className="save-unsave">
              {session && isSongSaved ? (
                <button
                  className="remove"
                  title="remove song"
                  onClick={() => {
                    handleUnsaveSong(song);
                    setLoading(true);
                  }}
                >
                  <FaTrash />
                  Remove
                </button>
              ) : (
                <button
                  className="save"
                  title="save song"
                  onClick={() => {
                    handleSaveSong(song);
                    setLoading(true);
                  }}
                >
                  <FaSave />
                  Save
                </button>
              )}
            </div>
          ) : (
            <p>
              Sign in{" "}
              <Link className="here" to="/signin">
                here
              </Link>{" "}
              to save songs!
            </p>
          )}
        </div>
      </div>
      {song.lyrics ? (
        song.lyrics.split(/\n\n/).map((piece: string, index: number) => (
          <div key={index}>
            {piece.split("\n").map((line, lineIndex) => (
              <p key={lineIndex}>
                {line
                  .split(/(\b[\w'-]+\b|[^\w\s'])/)
                  .map((segment, segmentIndex) => {
                    const isWord = /\b[\w'-]+\b/.test(segment.trim());
                    const savedWord = songSavedWords.find(
                      (savedWord) =>
                        savedWord.word.toLowerCase() === segment.toLowerCase(),
                    );
                    const isSaved = !!savedWord;
                    const isLearned = savedWord?.learned;

                    return (
                      <React.Fragment key={segmentIndex}>
                        {isWord ? (
                          <span
                            className={`lyricsWord${
                              isSaved
                                ? " saved" + (isLearned ? " learned" : "")
                                : ""
                            }`}
                            onClick={() => {
                              handleWordClick(segment);
                              setLoading(true);
                            }}
                          >
                            {segment}
                          </span>
                        ) : (
                          segment
                        )}
                      </React.Fragment>
                    );
                  })}
              </p>
            ))}
            <p key={`empty-${index}`}>&nbsp;</p>
          </div>
        ))
      ) : (
        <p>Lyrics not available.</p>
      )}
    </>
  );
};

export default Lyrics;
