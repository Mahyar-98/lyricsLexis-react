import React from "react";
import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
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
  const [isSongSaved, setIsSongSaved] = useState(false);
  const [word, setWord] = useState<string | null>(null);
  const { session } = useOutletContext(); //TODO: add the type

  useEffect(() => {
    if (query) {
      fetch("https://some-random-api.com/others/lyrics/?title=" + query)
        .then((res) => res.json())
        .then((data) => setSong(data));
    }
  }, [query]);

  useEffect(() => {
    if (session && song) {
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
  }, [song, session, isSongSaved]);

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
            {session && isSongSaved ? (
              <button onClick={() => handleUnsaveSong(song)}>
                unsave song
              </button>
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
      {word ? <Dictionary word={word} /> : null}
    </>
  );
};

export default Home;
