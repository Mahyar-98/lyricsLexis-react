import "../styles/library.css";
import React, { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
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
  const { session, allSavedWords, dicOpen, setDicOpen } = useOutletContext();

  const navigate = useNavigate();

  useEffect(() => {
    if (!session) {
      navigate("/signin");
    } else {
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
  }, [session, navigate]);

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
    setDicOpen(true);
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
      <div className="library-btns">
        <button
          className={showSongs ? "selected" : ""}
          onClick={() => setShowSongs(true)}
        >
          Saved Songs
        </button>
        <button
          className={!showSongs ? "selected" : ""}
          onClick={() => setShowSongs(false)}
        >
          Saved Words
        </button>
      </div>
      <div className="container library-content">
        <div className="sort-options">
          <div>
            {" "}
            sort by:
            <select
              onChange={(e) =>
                showSongs
                  ? handleSongSortChange(e.target.value)
                  : handleWordSortChange(e.target.value)
              }
            >
              {showSongs ? (
                <>
                  <option value="title">title</option>
                  <option value="author">artist</option>
                  <option value="createdAt">date</option>
                </>
              ) : (
                <>
                  <option value="word">alphabet</option>
                  <option value="learned">learned</option>
                  <option value="createdAt">date</option>
                </>
              )}
            </select>
          </div>
          <div>
            {" "}
            order:
            <select
              onChange={(e) =>
                showSongs
                  ? setSongSortOrder(e.target.value as "asc" | "desc")
                  : setWordSortOrder(e.target.value as "asc" | "desc")
              }
            >
              <option value="asc">ascending</option>
              <option value="desc">descending</option>
            </select>
          </div>
        </div>

        {showSongs ? (
          savedSongs.length > 0 ? (
            <ul className="saved-songs">
              {sortItems(savedSongs, songSortBy, songSortOrder).map(
                (savedSong) => (
                  <li
                    key={savedSong.title}
                    onClick={() => handleSongClick(savedSong)}
                    className={
                      selectedSong?.title === savedSong.title &&
                      selectedSong?.author === savedSong.author
                        ? "selected"
                        : ""
                    }
                  >
                    <b>{savedSong.title}</b>
                    <p>by: {savedSong.author}</p>
                    <small>
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
          <ul className="saved-words">
            {sortItems(allSavedWords, wordSortBy, wordSortOrder).map(
              (savedWord) => (
                <li
                  key={savedWord.word}
                  onClick={() => handleWordClick(savedWord.word)}
                  className={`${savedWord.learned ? "learned" : ""}${selectedWord === savedWord.word ? " selected" : ""}`}
                >
                  <b>{savedWord.word}</b>
                </li>
              ),
            )}
          </ul>
        ) : (
          <p>No saved words found.</p>
        )}
      </div>
      {showSongs && selectedSong && (
        <div className="container">
          <Lyrics song={selectedSong} setWord={setSelectedWord} />
        </div>
      )}

      {selectedWord && dicOpen && <Dictionary word={selectedWord} />}
      {dicOpen && (
        <div className="overlay" onClick={() => setDicOpen(false)}></div>
      )}
    </div>
  );
};

export default Library;
