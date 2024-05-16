import React from "react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Dictionary from "./Dictionary";

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

  const handleSaveSong = (song: Song) => {
    return song;
  };

  const handleWordClick = (word: string) => {
    fetch("https://api.dictionaryapi.dev/api/v2/entries/en/" + word)
      .then((res) => res.json())
      .then((data) => console.log(data));
    setWord(word);
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
        {song && (
          <>
            <button onClick={() => handleSaveSong(song)}>save song</button>
            {song.title + " by " + song.author}
            <img
              src={song.thumbnail.genius}
              alt={song.title + " track cover by " + song.author}
            />
            {song.lyrics
              .split(/\n\n/) // Split based on consecutive line breaks
              .map((piece, index) => (
                <div key={index}>
                  {piece.split("\n").map((line, lineIndex) => (
                    <p key={lineIndex}>
                      {line
                        .split(/(\b[\w'-]+\b|[^\w\s'])/)
                        .map((segment, segmentIndex) => {
                          const isWord = /\b[\w'-]+\b/.test(segment.trim());
                          return (
                            <React.Fragment key={segmentIndex}>
                              {isWord ? (
                                <span onClick={() => handleWordClick(segment)}>
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
                  <p key={`empty-${index}`}>&nbsp;</p>{" "}
                  {/* Add unique key for empty line */}
                </div>
              ))}

            <p>...</p>
            <p>
              Wanna delve deeper into the Dictionary? Check out the lyrics on{" "}
              <Link to={song.links.genius}>Genius</Link>
            </p>
          </>
        )}
      </div>
      <Dictionary word={word} />
    </>
  );
};

export default Home;
