import "../styles/lyrics.css";
import React, { useState, useEffect } from "react";
import { Link, useOutletContext } from "react-router-dom";

// Import types
import Song from "@/types/Song";
import SavedWord from "@/types/SavedWord";
import Session from "@/types/Session";

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
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                    <path d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z" />
                  </svg>
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
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                    <path d="M64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V173.3c0-17-6.7-33.3-18.7-45.3L352 50.7C340 38.7 323.7 32 306.7 32H64zm0 96c0-17.7 14.3-32 32-32H288c17.7 0 32 14.3 32 32v64c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V128zM224 288a64 64 0 1 1 0 128 64 64 0 1 1 0-128z" />
                  </svg>
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
