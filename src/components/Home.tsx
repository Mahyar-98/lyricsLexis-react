import React from "react";
import { useEffect, useState } from "react";
import Dictionary from "./Dictionary";
import Lyrics from "./Lyrics";

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

const Home = () => {
  const [searchData, setSearchData] = useState({
    song: "",
    artist: "",
  });
  const [query, setQuery] = useState("");
  const [song, setSong] = useState<Song | null>(null);
  const [word, setWord] = useState<string | null>(null);

  useEffect(() => {
    if (query) {
      fetch("https://some-random-api.com/others/lyrics/?title=" + query)
        .then((res) => res.json())
        .then((data) => setSong(data));
    }
  }, [query]);

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
  };

  return (
    <>
      <h1>LyricsLexis</h1>
      <form action="#" method="GET" onSubmit={handleSearch}>
        <label htmlFor="song">Song: </label>
        <input type="text" name="song" onChange={handleInputChange} />
        <label htmlFor="artist">Artist: </label>
        <input type="text" name="artist" onChange={handleInputChange} />
        <button>Find lyrics</button>
      </form>
      <div>
        {song && song.lyrics ? (
          <Lyrics song={song} setWord={setWord} />
        ) : song && song.error ? (
          <p>Sorry! We couldn't find the song</p>
        ) : null}
      </div>
      {word ? <Dictionary word={word} /> : null}
    </>
  );
};

export default Home;
