import "../styles/home.css";
import React from "react";
import { useEffect, useState } from "react";
import Dictionary from "./Dictionary";
import Lyrics from "./Lyrics";
import { useOutletContext } from "react-router-dom";

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

interface OutletContextType {
  dicOpen: boolean;
  setDicOpen: (dicOpen: boolean) => void;
  setLoading: (loading: boolean) => void;
}

const Home = () => {
  const [searchData, setSearchData] = useState({
    song: "",
    artist: "",
  });
  const [query, setQuery] = useState("");
  const [song, setSong] = useState<Song | null>(null);
  const [word, setWord] = useState<string | null>(null);
  const { dicOpen, setDicOpen, setLoading } =
    useOutletContext() as OutletContextType;

  useEffect(() => {
    if (query) {
      fetch("https://some-random-api.com/others/lyrics/?title=" + query)
        .then((res) => res.json())
        .then((data) => {
          setSong(data);
          setLoading(false);
        });
    }
  }, [query, setLoading]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSearchData({
      ...searchData,
      [name]: value,
    });
  };

  const handleSearch = (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    setQuery((searchData.song + " " + searchData.artist).trim());
    setLoading(true);
  };

  const handleBackToSearch = () => {
    setSong(null);
    setWord(null);
  };

  return (
    <div className="home">
      {song && (
        <div className="back-to-search">
          <button className="btn" onClick={handleBackToSearch}>
            Back to search
          </button>
        </div>
      )}
      <div className="container">
        {song && song.lyrics ? (
          <>
            <Lyrics song={song} setWord={setWord} />
          </>
        ) : song && song.error ? (
          <>
            <p>Sorry! We couldn't find the song</p>
          </>
        ) : (
          <div>
            <h1 className="page-title">Welcome to LyricsLexis!</h1>
            <p className="home_description">
              Discover the meaning behind your favorite tunes:
            </p>
            <form action="#" method="GET" onSubmit={handleSearch}>
              <label htmlFor="song">Song: </label>
              <input
                className="search-input"
                type="text"
                name="song"
                onChange={handleInputChange}
              />
              <label htmlFor="artist">Artist: </label>
              <input
                className="search-input"
                type="text"
                name="artist"
                onChange={handleInputChange}
              />
              <button className="form-button btn">Find lyrics</button>
            </form>
          </div>
        )}
      </div>
      {word && dicOpen && <Dictionary word={word} />}
      {dicOpen && (
        <div className="overlay" onClick={() => setDicOpen(false)}></div>
      )}
    </div>
  );
};

export default Home;
