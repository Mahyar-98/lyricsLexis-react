// Import icons
import { FaGithub } from "react-icons/fa";

const Footer = () => {
  return (
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
  );
};

export default Footer;
