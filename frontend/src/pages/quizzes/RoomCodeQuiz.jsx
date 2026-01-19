import { useNavigate } from "react-router-dom";

const RoomCodeQuiz = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.page}>
      <h1>🧠 Room Code Quiz</h1>
      <p>Create or join a live quiz</p>

      <div style={styles.cards}>
        <div style={styles.card} onClick={() => navigate("/quizzes/room-code/create")}>
          <h3>👑 Create Room</h3>
          <p>Become leader</p>
        </div>

        <div style={styles.card} onClick={() => navigate("/quizzes/room-code/join")}>
          <h3>🚪 Join Room</h3>
          <p>Play with others</p>
        </div>
      </div>
    </div>
  );
};

export default RoomCodeQuiz;

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg,#1d2671,#c33764)",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  cards: {
    display: "flex",
    gap: "30px",
    marginTop: "30px",
  },
  card: {
    width: "220px",
    padding: "20px",
    background: "rgba(255,255,255,0.15)",
    borderRadius: "16px",
    cursor: "pointer",
    textAlign: "center",
  },
};
