import { useState } from "react";
import {
  addDoc,
  collection,
  serverTimestamp,
  query,
  where,
  getDocs
} from "firebase/firestore";
import { db } from "../../services/firebase";
import { questionBank } from "../../data/questionBank";
import { useAuth } from "../../context/useAuth";
import { useNavigate } from "react-router-dom";

/* ---------- UNIQUE ROOM CODE ---------- */
const generateUniqueRoomCode = async () => {
  let code;
  let exists = true;

  while (exists) {
    code = Math.random().toString(36).substring(2, 8).toUpperCase();

    const q = query(
      collection(db, "rooms"),
      where("roomCode", "==", code)
    );

    const snap = await getDocs(q);
    exists = !snap.empty;
  }

  return code;
};

/* ---------- QUESTION PICKER ---------- */
const getRandomQuestions = (topic) => {
  const pool = questionBank[topic];

  if (!pool || pool.length < 10) {
    throw new Error("Not enough questions for this topic");
  }

  return [...pool].sort(() => 0.5 - Math.random()).slice(0, 10);
};

const CreateRoom = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [topic, setTopic] = useState("react");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [duration, setDuration] = useState(10);
  const [loading, setLoading] = useState(false);

  const createRoom = async () => {
    try {
      if (!startTime || !endTime) {
        alert("Please select start and end time");
        return;
      }

      if (new Date(startTime) >= new Date(endTime)) {
        alert("End time must be after start time");
        return;
      }

      if (duration <= 0) {
        alert("Duration must be greater than 0");
        return;
      }

      setLoading(true);

      const roomCode = await generateUniqueRoomCode();
      const questions = getRandomQuestions(topic);

      await addDoc(collection(db, "rooms"), {
        roomCode,
        leaderId: currentUser.uid,
        leaderName: currentUser.displayName || "Student",
        topic,
        duration,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        questions,
        status: "ACTIVE",
        createdAt: serverTimestamp(),
      });

      navigate("/quizzes/room-code/join");
    } catch (err) {
      alert(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={{ textAlign: "center" }}>Create Quiz Room</h2>

        <label>Topic</label>
        <select value={topic} onChange={(e) => setTopic(e.target.value)}>
          <optgroup label="💻 Computer Science">
            <option value="react">React</option>
            <option value="java">Java</option>
          </optgroup>

          <optgroup label="👶 Children">
            <option value="animals">Animals</option>
            <option value="fruits">Fruits</option>
          </optgroup>
        </select>

        <label>Start Time</label>
        <input
          type="datetime-local"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
        />

        <label>End Time</label>
        <input
          type="datetime-local"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
        />

        <label>Duration (minutes)</label>
        <input
          type="number"
          min="1"
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
        />

        <button onClick={createRoom} disabled={loading}>
          {loading ? "Creating Room..." : "Create Room"}
        </button>
      </div>
    </div>
  );
};

export default CreateRoom;

/* ---------- STYLES ---------- */
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
    backdropFilter: "blur(10px)",
    padding: "30px",
    borderRadius: "16px",
    width: "340px",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
};
