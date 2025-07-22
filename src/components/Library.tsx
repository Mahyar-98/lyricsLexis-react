import "../styles/library.css";
import { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import Dictionary from "./Dictionary";
import Lyrics from "./Lyrics";
import { DateTime } from "luxon";

interface Session {
  token: string;
  userId: string;
}
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
  artist: string;
  lyrics: string;
  thumbnail: string;
  url: string;
}

interface OutletContextType {
  session: Session;
  allSavedWords: SavedWord[];
  dicOpen: boolean;
  setDicOpen: (dicOpen: boolean) => void;
  setLoading: (loading: boolean) => void;
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
  const { session, allSavedWords, dicOpen, setDicOpen, setLoading } =
    useOutletContext() as OutletContextType;
  const navigate = useNavigate();

  // Load saved songs on component mount
  useEffect(() => {
    setLoading(true);
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
        .then((data) => {
          setSavedSongs(data);
          setLoading(false);
        })
        .catch(() => {
          console.log("Error fetching saved songs");
          setLoading(false);
        });
    }
  }, [session, navigate, setLoading]);

  // Handle sort change for songs
  const handleSongSortChange = (sortBy: string) => {
    setSongSortOrder((prevSortOrder) =>
      sortBy === songSortBy
        ? prevSortOrder === "asc"
          ? "desc"
          : "asc"
        : "asc",
    );
    setSongSortBy(sortBy as "title" | "author" | "createdAt");
  };

  // Handle sort change for words
  const handleWordSortChange = (sortBy: string) => {
    setWordSortOrder((prevSortOrder) =>
      sortBy === wordSortBy
        ? prevSortOrder === "asc"
          ? "desc"
          : "asc"
        : "asc",
    );
    setWordSortBy(sortBy as "word" | "learned" | "createdAt");
  };

  // Sort items based on the selected sort options
  const sortItems = <T extends SavedSong | SavedWord>(
    items: T[],
    sortBy: keyof T,
    sortOrder: "asc" | "desc",
  ): T[] => {
    return items.slice().sort((a, b) => {
      const aValue = a[sortBy] as unknown as string | number | Date;
      const bValue = b[sortBy] as unknown as string | number | Date;

      if (sortBy === "createdAt") {
        return sortOrder === "asc"
          ? new Date(aValue).getTime() - new Date(bValue).getTime()
          : new Date(bValue).getTime() - new Date(aValue).getTime();
      } else if (
        sortBy === "title" ||
        sortBy === "author" ||
        sortBy === "word"
      ) {
        return sortOrder === "asc"
          ? aValue.toString().localeCompare(bValue.toString())
          : bValue.toString().localeCompare(aValue.toString());
      } else if (sortBy === "learned") {
        // Flip the order for "learned" attribute
        return sortOrder === "asc" ? (aValue ? -1 : 1) : aValue ? 1 : -1;
      }
      return 0;
    });
  };

  // Handle click on a song
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
          setLoading(false);
        })
        .catch(() => {
          console.log("Error fetching song from external API");
          setLoading(false);
        });
    }
  };

  // Handle click on a word
  const handleWordClick = (word: string) => {
    setSelectedWord(word);
    setDicOpen(true);
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
              value={showSongs ? songSortBy : wordSortBy}
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
              value={showSongs ? songSortOrder : wordSortOrder}
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
                    onClick={() => {
                      handleSongClick(savedSong);
                      setLoading(true);
                    }}
                    className={
                      selectedSong?.title === savedSong.title &&
                      selectedSong?.artist === savedSong.author
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
                  onClick={() => {
                    handleWordClick(savedWord.word);
                    setLoading(true);
                  }}
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
        <div
          className="overlay"
          onClick={() => {
            setDicOpen(false);
            setSelectedWord(null);
          }}
        ></div>
      )}
    </div>
  );
};

export default Library;
