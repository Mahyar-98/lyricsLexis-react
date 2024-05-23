import React, { useState, useEffect } from "react";
import { Link, useOutletContext } from "react-router-dom";

interface Song {
  title: string;
  author: string;
  lyrics: string;
  thumbnail: {
    genius: string;
  };
  links: {
    genius: string;
  };
  disclaimer: string;
  source: number;
  error?: string;
}

interface Word {
  word: string;
  learned: boolean;
  note: string;
}

interface LyricsProps {
  song: Song;
  setWord: (word: string) => void;
}

const Lyrics: React.FC<LyricsProps> = ({ song, setWord }) => {
  const [isSongSaved, setIsSongSaved] = useState(false);
  const [songSavedWords, setSongSavedWords] = useState<Word[]>([]);
  const { session, allSavedWords } = useOutletContext();

  useEffect(() => {
    if (session && song && song.lyrics) {
      fetch(
        import.meta.env.VITE_BACKEND_URL +
          "/users/" +
          session.userId +
          "/songs/" +
          encodeURIComponent(song.author) +
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
        })
        .catch(() => console.log("Song not found"));
    }
  }, [song, session, isSongSaved, allSavedWords]);

  useEffect(() => {
    if (session && song && song.lyrics) {
      const savedWordsInLyrics: Word[] = []; // Array to store saved words found in lyrics

      // Split lyrics into words
      const words = song.lyrics.match(/\b[\w'-]+\b/g);

      // Iterate through each word in the lyrics
      words &&
        words.forEach((word) => {
          // Find the word object in allSavedWords array by matching the word
          const foundWord = allSavedWords.find(
            (savedWord: Word) => savedWord.word === word,
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
          encodeURIComponent(song.author) +
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

      if (response.ok) {
        console.log("Song unsaved successfully!");
        setIsSongSaved(false);
      } else {
        console.log("Failed to unsave song:", response.statusText);
        // Show some error message to the user
      }
    } catch (error) {
      console.error("Error unsaving song:", error);
      // Handle the error (e.g., show an error message to the user)
    }
  };

  const handleWordClick = (word: string) => {
    fetch("https://api.dictionaryapi.dev/api/v2/entries/en/" + word)
      .then((res) => res.json())
      .then((data) => console.log(data));
    setWord(word);
  };

  return (
    <>
      <div>
        here are the words you have saved from this song:
        {songSavedWords.map((w) => (
          <p key={w.word}>{w.word}</p>
        ))}
      </div>
      {session && isSongSaved ? (
        <button onClick={() => handleUnsaveSong(song)}>unsave song</button>
      ) : (
        <button onClick={() => handleSaveSong(song)}>save song</button>
      )}
      {song.title + " by " + song.author}
      <img
        src={song.thumbnail.genius}
        alt={song.title + " track cover by " + song.author}
      />
      {song.lyrics
        .split(/\n\n/) // Split based on consecutive line breaks
        .map((piece: string, index: number) => (
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
                    const isSaved = savedWord ? true : false;
                    const isLearned = savedWord ? savedWord.learned : false;

                    return (
                      <React.Fragment key={segmentIndex}>
                        {isWord ? (
                          <span
                            className={`lyricsWord${isSaved ? " saved" + (isLearned ? " learned" : "") : ""}`}
                            onClick={() => handleWordClick(segment)}
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
        ))}
      <p>...</p>
      <p>
        Wanna delve deeper into the Dictionary? Check out the lyrics on{" "}
        <Link to={song.links.genius}>Genius</Link>
      </p>
    </>
  );
};

export default Lyrics;
