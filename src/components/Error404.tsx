import "../styles/error404.css";
import { Link } from "react-router-dom";

const Error404 = () => {
  return (
    <div className="container error404">
      <h1>OOPS!</h1>
      <h2>404 - Not Found</h2>
      <p>The page you&apos;re looking for does not exists or is unavailable!</p>
      <p>You could go back to the homepage by clicking the button below:</p>
      <button>
        <Link to="/">Homepage</Link>
      </button>
    </div>
  );
};

export default Error404;
