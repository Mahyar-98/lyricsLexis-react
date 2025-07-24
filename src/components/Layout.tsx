import { useState, useEffect } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";

// Import components
import Loading from "./Loading";

// Import types
import Session from "@/types/Session";

// Import utils
import { verifyToken } from "@/utils/auth";

// Import styles
import "@/styles/layout.css";

// Import icons
import { IoMdHome } from "react-icons/io";
import { FaInfoCircle, FaSignOutAlt } from "react-icons/fa";
import { FaSignInAlt } from "react-icons/fa";
import { FaBook } from "react-icons/fa";
import { IoPersonAdd } from "react-icons/io5";
import { FaGithub } from "react-icons/fa";

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
        .catch((err) => {
          console.error("Token verification failed in Layout component: ", err);
          localStorage.removeItem("token");
          setSession(null);
          navigate("/signin");
        });
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

  const PUBLIC_NAV_ITEMS = [
    { to: "/", label: "Home", icon: <IoMdHome /> },
    { to: "/about", label: "About", icon: <FaInfoCircle /> },
  ];

  const AUTH_NAV_ITEMS = [
    { to: "/library", label: "Library", icon: <FaBook /> },
    { action: "signout", label: "Sign Out", icon: <FaSignOutAlt /> },
  ];

  const GUEST_NAV_ITEMS = [
    { to: "/signin", label: "Sign In", icon: <FaSignInAlt /> },
    { to: "/signup", label: "Sign Up", icon: <IoPersonAdd /> },
  ];

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
              {PUBLIC_NAV_ITEMS.map((item) => (
                <li>
                  <Link to={item.to}>{item.label}</Link>
                </li>
              ))}
            </ul>
            <ul>
              {(session ? AUTH_NAV_ITEMS : GUEST_NAV_ITEMS).map((item) => (
                <li key={item.label}>
                  {"action" in item ? (
                    <button
                      onClick={() => {
                        handleSignOut();
                        handleLinkClick();
                      }}
                    >
                      {item.label}
                    </button>
                  ) : (
                    <Link to={item.to!} onClick={handleLinkClick}>
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>
      <div className={`side-nav ${navOpen ? "show" : ""}`}>
        <nav>
          <h2>LyricsLexis</h2>
          <ul>
            {PUBLIC_NAV_ITEMS.map((item) => (
              <li>
                <Link to={item.to}>
                  {item.icon}
                  <p>{item.label}</p>
                </Link>
              </li>
            ))}
          </ul>
          <hr />
          <ul>
            {(session ? AUTH_NAV_ITEMS : GUEST_NAV_ITEMS).map((item) => (
              <li key={item.label}>
                {"action" in item ? (
                  <button
                    onClick={() => {
                      handleSignOut();
                      handleLinkClick();
                    }}
                  >
                    {item.icon}
                    <p>{item.label}</p>
                  </button>
                ) : (
                  <Link to={item.to!} onClick={handleLinkClick}>
                    {item.icon}
                    <p>{item.label}</p>
                  </Link>
                )}
              </li>
            ))}
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
            <FaGithub />
          </a>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
