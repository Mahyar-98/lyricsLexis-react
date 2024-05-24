import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import Dictionary from "./Dictionary";
import Lyrics from "./Lyrics";
import { DateTime } from "luxon";

interface SavedSong {
  title: string;
  author: string;
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
  const [selectedSong, setSelectedSong] = useState<ExternalSong | null>(null);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [songSortBy, setSongSortBy] = useState<
    "title" | "author" | "createdAt"
  >("title");
  const [songSortOrder, setSongSortOrder] = useState<"asc" | "desc">("asc");
  const [wordSortBy, setWordSortBy] = useState<
    "word" | "learned" | "createdAt"
  >("word");
  const [wordSortOrder, setWordSortOrder] = useState<"asc" | "desc">("asc");
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
            Authorization: `Bearer ${session.token}`,
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

  const sortItems = (items: any[], sortBy: string, sortOrder: string) => {
    return items.sort((a, b) => {
      if (sortBy === "createdAt") {
        return sortOrder === "asc"
          ? new Date(a[sortBy]).getTime() - new Date(b[sortBy]).getTime()
          : new Date(b[sortBy]).getTime() - new Date(a[sortBy]).getTime();
      } else if (
        sortBy === "title" ||
        sortBy === "author" ||
        sortBy === "word"
      ) {
        return sortOrder === "asc"
          ? a[sortBy].localeCompare(b[sortBy])
          : b[sortBy].localeCompare(a[sortBy]);
      } else if (sortBy === "learned") {
        return sortOrder === "asc" ? (a[sortBy] ? 1 : -1) : a[sortBy] ? -1 : 1;
      }
      return 0;
    });
  };

  const handleSongSortChange = (sortBy: string) => {
    setSongSortBy(sortBy as "title" | "author" | "createdAt");
    setSongSortOrder(songSortOrder === "asc" ? "desc" : "asc");
  };

  const handleWordSortChange = (sortBy: string) => {
    setWordSortBy(sortBy as "word" | "learned" | "createdAt");
    setWordSortOrder(wordSortOrder === "asc" ? "desc" : "asc");
  };

  return (
    <div>
      <h1>Library</h1>
      <div>
        <button onClick={() => setShowSongs(true)}>Saved Songs</button>
        <button onClick={() => setShowSongs(false)}>Saved Words</button>
      </div>
      <div>
        {showSongs ? (
          <div>
            Sort by:
            <button onClick={() => handleSongSortChange("title")}>Title</button>
            <button onClick={() => handleSongSortChange("author")}>
              Artist
            </button>
            <button onClick={() => handleSongSortChange("createdAt")}>
              Date
            </button>
          </div>
        ) : (
          <div>
            Sort by:
            <button onClick={() => handleWordSortChange("word")}>Word</button>
            <button onClick={() => handleWordSortChange("learned")}>
              Learned
            </button>
            <button onClick={() => handleWordSortChange("createdAt")}>
              Date
            </button>
          </div>
        )}
      </div>
      {showSongs ? (
        savedSongs.length > 0 ? (
          <ul>
            {sortItems(savedSongs, songSortBy, songSortOrder).map(
              (savedSong) => (
                <li
                  key={savedSong.title}
                  onClick={() => handleSongClick(savedSong)}
                >
                  <b>{savedSong.title}</b>
                  <p>by: {savedSong.author}</p>
                  <small>
                    saved on:{" "}
                    {DateTime.fromISO(savedSong.createdAt).toFormat(
                      "MMMM dd, yyyy",
                    )}
                  </small>
                </li>
              ),
            )}
          </ul>
        ) : (
          <p>No saved songs found.</p>
        )
      ) : allSavedWords.length > 0 ? (
        <ul>
          {sortItems(allSavedWords, wordSortBy, wordSortOrder).map(
            (savedWord) => (
              <li
                key={savedWord.word}
                onClick={() => handleWordClick(savedWord.word)}
              >
                <b className={savedWord.learned ? "learned" : ""}>
                  {savedWord.word}
                </b>
              </li>
            ),
          )}
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
