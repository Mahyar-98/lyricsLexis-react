import "../styles/about.css";

const About = () => {
  return (
    <div className="about">
      <div className="container">
        <div className="small-container">
          <h2>About</h2>

          <p>
            Welcome to LyricsLexis, a personal project born out of a passion for
            English music and language learning. Are you a music enthusiast like
            me who loves to delve into the lyrics of your favorite songs?
            LyricsLexis is here to enhance your experience.
          </p>
          <p>
            I remember printing out song lyrics, meticulously highlighting new
            words, and jotting down notes to expand my vocabulary and improve my
            pronunciation. It was an invaluable tool for immersing myself in the
            English language and culture.
          </p>
          <p>
            Inspired by this journey, I created LyricsLexis—a web app designed
            to provide you with comprehensive resources for your favorite songs.
            Simply search for a song, and you'll not only access its lyrics but
            also have the option to explore pronunciation, meanings, examples,
            synonyms, and antonyms of any word within the song.
          </p>
          <p>
            But that's not all. With LyricsLexis, you can save songs for later
            study, create personalized word lists, and add notes to deepen your
            understanding. Plus, you can save lyrics to analyze or memorize them
            at your convenience. To unlock all these features, sign up as a user
            and start building your library today.
          </p>
          <p>
            I'm excited to share this project with you and would love to hear
            your feedback. Feel free to reach out to me through my personal
            portfolio website at{" "}
            <a href="https://mahyarerfanian.com/" target="__blank">
              mahyarerfanian.com
            </a>
            .
          </p>
          <p>Happy learning and exploring with LyricsLexis!</p>
          <i>
            <b>Please note:</b> LyricsLexis is not a commercial project and
            relies on two external free APIs—
            <a href="https://some-random-api.com/" target="__blank">
              Some Random Api
            </a>{" "}
            for lyrics and{" "}
            <a href="https://dictionaryapi.dev/" target="__blank">
              Free Dictionary API
            </a>{" "}
            for word definitions. While these APIs serve their respective
            purposes, they may not always provide complete or accurate results
            or have all the data that you might expect. Lyrics to lots of songs
            may not exist in their data or be truncated and incomplete, and word
            definitions might vary from other sources.
          </i>
        </div>
      </div>
    </div>
  );
};

export default About;
