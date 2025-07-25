import { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { DateTime } from "luxon";

// Import components
import Dictionary from "../features/Dictionary";
import Lyrics from "../features/Lyrics";

// Import types
import Session from "@/types/Session";
import SavedWord from "@/types/SavedWord";
import Song from "@/types/Song";
import SavedSong from "@/types/SavedSong";

// Import utils
import sortItems from "@/utils/sortItems";

// Import styles
import "@/styles/library.css";

interface OutletContextType {
  session: Session;
  allSavedWords: SavedWord[];
  dicOpen: boolean;
  setDicOpen: (dicOpen: boolean) => void;
  setLoading: (loading: boolean) => void;
}

const token = import.meta.env.VITE_SOME_RANDOM_API_TOKEN;

const Library = () => {
  const [savedSongs, setSavedSongs] = useState<SavedSong[]>([]);
  const [showSongs, setShowSongs] = useState(true);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [songSortBy, setSongSortBy] = useState<
    "title" | "artist" | "createdAt"
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
    setSongSortBy(sortBy as "title" | "artist" | "createdAt");
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

  // Handle click on a song
  const handleSongClick = (song: SavedSong) => {
    setSelectedWord(null);
    if (session) {
      fetch(
        "https://api.some-random-api.com/lyrics?title=" +
          song.artist +
          " " +
          song.title,
        {
          method: "GET",
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        },
      )
        .then((res) => res.json())
        .then((data: Song) => {
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
                  <option value="artist">artist</option>
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
                      selectedSong?.artist === savedSong.artist
                        ? "selected"
                        : ""
                    }
                  >
                    <b>{savedSong.title}</b>
                    <p>by: {savedSong.artist}</p>
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
