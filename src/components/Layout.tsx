import "../styles/layout.css";
import { useState, useEffect } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";

// Import components
import Loading from "./Loading";

// Import types
import Session from "@/types/Session";

// Import utils
import { verifyToken } from "@/utils/auth";

const Layout = () => {
  const [loading, setLoading] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [dicOpen, setDicOpen] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [allSavedWords, setAllSavedWords] = useState([]);
  const [updateTrigger, setUpdateTrigger] = useState(false);
  const navigate = useNavigate();

  // UseEffect to check if token is present when component mounts
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      verifyToken(token)
        .then((res) => setSession(res)) // Set logged-in state to true if token is present
        .catch((err) =>
          console.error("Token verification failed in Layout component: ", err),
        );
    }
  }, []);

  useEffect(() => {
    if (session) {
      fetch(
        import.meta.env.VITE_BACKEND_URL +
          "/users/" +
          session.userId +
          "/words/",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.token}`,
          },
        },
      )
        .then((res) => res.json())
        .then((data) => setAllSavedWords(data))
        .catch(() => console.log("Words not found"));
    }
  }, [session, updateTrigger]);

  const handleLinkClick = () => {
    setNavOpen(false); // Close the side navigation
  };

  const handleSignOut = () => {
    // Clear the authentication token from local storage
    localStorage.removeItem("token");
    // Update the logged-in state to false
    setSession(null);
    // Redirect to the sign-in page or any other appropriate page
    navigate("/signin");
  };

  return (
    <div className="layout">
      <header>
        <div>
          <div className="logo">
            <Link to="/">
              <h1>LyricsLexis</h1>
            </Link>
          </div>

          <button
            id="nav-toggle"
            aria-label="Toggle navigation"
            onClick={() => setNavOpen((prevState) => !prevState)}
          >
            <span className="line"></span>
            <span className="line"></span>
            <span className="line"></span>
          </button>
          <nav className="nav">
            <ul>
              <li>
                <Link to="/">home</Link>
              </li>
              <li>
                <Link to="/about">about</Link>
              </li>
            </ul>
            {!session ? (
              <ul>
                <li>
                  <Link to="/signin">sign in</Link>
                </li>
                <li>
                  <Link to="/signup">sign up</Link>
                </li>
              </ul>
            ) : (
              <ul>
                <li>
                  <Link to="/library">library</Link>
                </li>
                <li>
                  <a href="#" onClick={handleSignOut}>
                    sign out
                  </a>
                </li>
              </ul>
            )}
          </nav>
        </div>
      </header>
      <div className={`side-nav ${navOpen ? "show" : ""}`}>
        <nav>
          <h2>LyricsLexis</h2>
          <ul>
            <li>
              <Link to="/" onClick={handleLinkClick}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512">
                  <path d="M575.8 255.5c0 18-15 32.1-32 32.1h-32l.7 160.2c0 2.7-.2 5.4-.5 8.1V472c0 22.1-17.9 40-40 40H456c-1.1 0-2.2 0-3.3-.1c-1.4 .1-2.8 .1-4.2 .1H416 392c-22.1 0-40-17.9-40-40V448 384c0-17.7-14.3-32-32-32H256c-17.7 0-32 14.3-32 32v64 24c0 22.1-17.9 40-40 40H160 128.1c-1.5 0-3-.1-4.5-.2c-1.2 .1-2.4 .2-3.6 .2H104c-22.1 0-40-17.9-40-40V360c0-.9 0-1.9 .1-2.8V287.6H32c-18 0-32-14-32-32.1c0-9 3-17 10-24L266.4 8c7-7 15-8 22-8s15 2 21 7L564.8 231.5c8 7 12 15 11 24z" />
                </svg>
                <p>Home</p>
              </Link>
            </li>
            <li>
              <Link to="about" onClick={handleLinkClick}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                  <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM216 336h24V272H216c-13.3 0-24-10.7-24-24s10.7-24 24-24h48c13.3 0 24 10.7 24 24v88h8c13.3 0 24 10.7 24 24s-10.7 24-24 24H216c-13.3 0-24-10.7-24-24s10.7-24 24-24zm40-208a32 32 0 1 1 0 64 32 32 0 1 1 0-64z" />
                </svg>
                <p>About</p>
              </Link>
            </li>
          </ul>
          <hr />
          <ul>
            {!session ? (
              <>
                <li>
                  <Link to="signin" onClick={handleLinkClick}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 512 512"
                    >
                      <path d="M217.9 105.9L340.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L217.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1L32 320c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM352 416l64 0c17.7 0 32-14.3 32-32l0-256c0-17.7-14.3-32-32-32l-64 0c-17.7 0-32-14.3-32-32s14.3-32 32-32l64 0c53 0 96 43 96 96l0 256c0 53-43 96-96 96l-64 0c-17.7 0-32-14.3-32-32s14.3-32 32-32z" />
                    </svg>
                    <p>sign in</p>
                  </Link>
                </li>
                <li>
                  <Link to="signup" onClick={handleLinkClick}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 640 512"
                    >
                      <path d="M96 128a128 128 0 1 1 256 0A128 128 0 1 1 96 128zM0 482.3C0 383.8 79.8 304 178.3 304h91.4C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7H29.7C13.3 512 0 498.7 0 482.3zM504 312V248H440c-13.3 0-24-10.7-24-24s10.7-24 24-24h64V136c0-13.3 10.7-24 24-24s24 10.7 24 24v64h64c13.3 0 24 10.7 24 24s-10.7 24-24 24H552v64c0 13.3-10.7 24-24 24s-24-10.7-24-24z" />
                    </svg>
                    <p>sign up</p>
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="library" onClick={handleLinkClick}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 448 512"
                    >
                      <path d="M96 0C43 0 0 43 0 96V416c0 53 43 96 96 96H384h32c17.7 0 32-14.3 32-32s-14.3-32-32-32V384c17.7 0 32-14.3 32-32V32c0-17.7-14.3-32-32-32H384 96zm0 384H352v64H96c-17.7 0-32-14.3-32-32s14.3-32 32-32zm32-240c0-8.8 7.2-16 16-16H336c8.8 0 16 7.2 16 16s-7.2 16-16 16H144c-8.8 0-16-7.2-16-16zm16 48H336c8.8 0 16 7.2 16 16s-7.2 16-16 16H144c-8.8 0-16-7.2-16-16s7.2-16 16-16z" />
                    </svg>
                    <p>library</p>
                  </Link>
                </li>
                <li>
                  <a
                    href="#"
                    onClick={() => {
                      handleSignOut();
                      handleLinkClick();
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 512 512"
                    >
                      <path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z" />
                    </svg>
                    <p>sign out</p>
                  </a>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
      {navOpen && (
        <div className="overlay" onClick={() => setNavOpen(false)}></div>
      )}
      <main>
        {loading && <Loading />}
        <Outlet
          context={{
            session,
            setSession,
            allSavedWords,
            setAllSavedWords,
            dicOpen,
            setDicOpen,
            setUpdateTrigger,
            loading,
            setLoading,
          }}
        />
      </main>
      <footer>
        <div>
          <p>Check out my GitHub:</p>
          <a
            href="https://github.com/Mahyar-98"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Mahyar's GitHub Profile"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512">
              <path d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3 .3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5 .3-6.2 2.3zm44.2-1.7c-2.9 .7-4.9 2.6-4.6 4.9 .3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3 .7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3 .3 2.9 2.3 3.9 1.6 1 3.6 .7 4.3-.7 .7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3 .7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3 .7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z" />
            </svg>
          </a>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
