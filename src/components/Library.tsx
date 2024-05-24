import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import Dictionary from "./Dictionary";
import Lyrics from "./Lyrics";

interface SavedSong {
  title: string;
  author: string;
  note: string;
  createdAt: string;
}

interface SavedWord {
  word: string;
  learned: boolean;
  note: string;
  createdAt: string;
}

interface ExternalSong {
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

const Library = () => {
  const [savedSongs, setSavedSongs] = useState<SavedSong[]>([]);
  const [showSongs, setShowSongs] = useState(true);
  const [selectedSong, setSelectedSong] = useState<ExternalSong | null>(null); // Update the type here
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const { session, allSavedWords } = useOutletContext();

  useEffect(() => {
    if (session) {
      fetch(
        import.meta.env.VITE_BACKEND_URL +
          "/users/" +
          session.userId +
          "/songs/",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.token}`, // Include token in Authorization header
          },
        },
      )
        .then((res) => res.json())
        .then((data) => setSavedSongs(data))
        .catch(() => console.log("Error fetching saved songs"));
    }
  }, [session]);

  const handleSongClick = (song: SavedSong) => {
    setSelectedWord(null);
    if (session) {
      // Fetch lyrics for the selected song from the external API
      fetch(
        "https://some-random-api.com/others/lyrics/?title=" +
          song.title +
          song.author,
      )
        .then((res) => res.json())
        .then((data: ExternalSong) => {
          setSelectedSong(data);
        })
        .catch(() => console.log("Error fetching song from external API"));
    }
  };

  const handleWordClick = (word: string) => {
    setSelectedWord(word);
  };

  return (
    <div>
      <h1>Library</h1>
      <div>
        <button onClick={() => setShowSongs(true)}>Saved Songs</button>
        <button onClick={() => setShowSongs(false)}>Saved Words</button>
      </div>
      {showSongs ? (
        savedSongs.length > 0 ? (
          <ul>
            {savedSongs.map((savedSong) => (
              <li
                key={savedSong.title}
                onClick={() => handleSongClick(savedSong)}
              >
                {savedSong.title} by {savedSong.author}
                <small>Note: {savedSong.note}</small>
                <br />
                <small>Created At: {savedSong.createdAt}</small>
              </li>
            ))}
          </ul>
        ) : (
          <p>No saved songs found.</p>
        )
      ) : allSavedWords.length > 0 ? (
        <ul>
          {allSavedWords.map((savedWord) => (
            <li
              key={savedWord.word}
              onClick={() => handleWordClick(savedWord.word)}
            >
              {savedWord.word}
            </li>
          ))}
        </ul>
      ) : (
        <p>No saved words found.</p>
      )}
      {showSongs && selectedSong && (
        <Lyrics song={selectedSong} setWord={setSelectedWord} />
      )}
      {selectedWord && <Dictionary word={selectedWord} />}
    </div>
  );
};

export default Library;
