import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

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
            {song.title + " by " + song.author}
            <img src={song.thumbnail.genius} alt="" />
            {song.lyrics
              .split(/\n\n/) // Split based on consecutive line breaks
              .map((piece, index) => (
                <div key={index}>
                  {piece.split("\n").map((line, lineIndex) => (
                    <p key={lineIndex}>
                      {line.match(/[a-zA-Z']+/g)?.map((word, wordIndex) => (
                        <span key={wordIndex} onClick={() => console.log(word)}>
                          {word}{" "}
                        </span>
                      ))}
                    </p>
                  ))}
                  <p>&nbsp;</p> {/* Add empty line between pieces */}
                </div>
              ))}

            <p>...</p>
            <p>
              Wanna delve deeper into the meaning? Check out the lyrics on{" "}
              <Link to={song.links.genius}>Genius</Link>
            </p>
          </>
        )}
      </div>
    </>
  );
};

export default Home;
