import { doc, getDoc, addDoc, collection } from "firebase/firestore";
import { db } from "../../services/firebase";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { useEffect, useState } from "react";

const QuizPlay = () => {
  const { roomId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    getDoc(doc(db, "rooms", roomId)).then((snap) => {
      const data = snap.data();
      setRoom(data);
      setTimeLeft(data.duration * 60); // minutes → seconds
    });
  }, [roomId]);

  useEffect(() => {
    if (timeLeft === 0 && room) submit();
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, room]);

  const submit = async () => {
    let score = 0;
    room.questions.forEach((q, i) => {
      if (answers[i] === q.correct) score++;
    });

    await addDoc(collection(db, "attempts"), {
      roomCode: room.roomCode,
      userId: currentUser.uid,
      userName: currentUser.displayName || "Student",
      score,
      timeTaken: room.duration * 60 - timeLeft,
      submittedAt: new Date(),
    });

    navigate(`/quizzes/room-code/leaderboard/${room.roomCode}`);
  };

  if (!room) return <p>Loading...</p>;

  const q = room.questions[index];
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h3>⏱ {minutes}:{seconds.toString().padStart(2, "0")}</h3>
        <h4>Question {index + 1} / {room.questions.length}</h4>

        <p>{q.question}</p>

        {q.options.map((opt) => (
          <button
            key={opt}
            style={styles.option}
            onClick={() => {
              setAnswers({ ...answers, [index]: opt });
              if (index < room.questions.length - 1) {
                setIndex(index + 1);
              } else {
                submit();
              }
            }}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuizPlay;

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg,#1d2671,#c33764)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    background: "rgba(255,255,255,0.15)",
    padding: "30px",
    borderRadius: "16px",
    width: "350px",
    color: "#fff",
    textAlign: "center",
  },
  option: {
    display: "block",
    width: "100%",
    padding: "10px",
    margin: "10px 0",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
  },
};
