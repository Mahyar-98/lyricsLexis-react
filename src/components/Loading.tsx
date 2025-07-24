// Import styles
import "@/styles/loading.css";

const Loading = () => {
  return (
    <div className="loading-overlay">
      <div className="spinner"></div>
      <p>Loading...</p>
    </div>
  );
};

export default Loading;
