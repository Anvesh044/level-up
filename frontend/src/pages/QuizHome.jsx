import { useNavigate } from "react-router-dom";

const QuizHome = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>🧠 Quiz Platform</h1>
      <p style={styles.subtitle}>Choose a quiz type to begin</p>

      <div style={styles.cardContainer}>
        {/* ROOM CODE QUIZ */}
        <div
          style={styles.card}
          onClick={() => navigate("/quizzes/room-code")}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <h2>🔐 Room Code Quiz</h2>
          <p>Join live quizzes using a room code</p>
        </div>

        {/* NLP QUIZ */}
        <div
          style={styles.card}
          onClick={() => navigate("/quizzes/nlp")}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <h2>🤖 Trivia Quiz</h2>
          <p>Answer questions evaluated using AI</p>
        </div>
      </div>
    </div>
  );
};

export default QuizHome;

/* ---------------- STYLES ---------------- */

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #1d2671, #c33764)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    textAlign: "center",
    padding: "20px",
  },
  title: {
    fontSize: "2.5rem",
    marginBottom: "10px",
  },
  subtitle: {
    fontSize: "1.1rem",
    opacity: 0.9,
  },
  cardContainer: {
    marginTop: "40px",
    display: "flex",
    gap: "30px",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  card: {
    width: "260px",
    height: "160px",
    background: "rgba(255, 255, 255, 0.15)",
    backdropFilter: "blur(10px)",
    borderRadius: "16px",
    padding: "20px",
    cursor: "pointer",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
};
