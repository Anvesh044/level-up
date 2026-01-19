import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../services/firebase";
import { useNavigate } from "react-router-dom";

const JoinRoom = () => {
  const [rooms, setRooms] = useState([]);
  const [manualCode, setManualCode] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // 🔥 REAL-TIME LISTENER
    const unsub = onSnapshot(collection(db, "rooms"), (snapshot) => {
      const now = new Date();

      const activeRooms = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter(room => {
          if (!room.status || room.status !== "ACTIVE") return false;

          // Fallback if timestamps not ready
          if (!room.startTime || !room.endTime) return true;

          const start = room.startTime.toDate();
          const end = room.endTime.toDate();

          return now >= start && now <= end;
        });

      setRooms(activeRooms);
    });

    return () => unsub();
  }, []);

  /* ---------- MANUAL ROOM CODE JOIN ---------- */
  const joinByCode = () => {
    if (!manualCode.trim()) {
      alert("Please enter a room code");
      return;
    }

    const room = rooms.find(
      r => r.roomCode?.toUpperCase() === manualCode.trim().toUpperCase()
    );

    if (!room) {
      alert("Invalid or expired room code");
      return;
    }

    navigate(`/quizzes/room-code/play/${room.id}`);
  };

  return (
    <div style={styles.page}>
      <h2 style={{ color: "#fff" }}>Join Quiz Room</h2>

      {/* 🔐 MANUAL JOIN */}
      <div style={styles.manualCard}>
        <input
          type="text"
          placeholder="Enter Room Code"
          value={manualCode}
          onChange={(e) => setManualCode(e.target.value)}
          style={styles.input}
        />
        <button style={styles.btn} onClick={joinByCode}>
          Join by Code
        </button>
      </div>

      {/* AUTO LIST */}
      {rooms.length === 0 && (
        <p style={{ color: "#ddd" }}>No active rooms right now</p>
      )}

      {rooms.map(room => (
        <div key={room.id} style={styles.card}>
          <h3>{room.topic?.toUpperCase()} Quiz</h3>
          <p>Leader: {room.leaderName}</p>
          <p>Room Code: <b>{room.roomCode}</b></p>

          <button
            style={styles.joinBtn}
            onClick={() =>
              navigate(`/quizzes/room-code/play/${room.id}`)
            }
          >
            Join Quiz
          </button>
        </div>
      ))}
    </div>
  );
};

export default JoinRoom;

/* ---------------- STYLES ---------------- */

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #1d2671, #c33764)",
    padding: "40px",
  },
  manualCard: {
    background: "rgba(255,255,255,0.15)",
    backdropFilter: "blur(10px)",
    borderRadius: "16px",
    padding: "20px",
    marginBottom: "30px",
    maxWidth: "400px",
    display: "flex",
    gap: "10px",
  },
  input: {
    flex: 1,
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    outline: "none",
  },
  btn: {
    padding: "10px 14px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    background: "#fff",
    color: "#1d2671",
    fontWeight: "bold",
  },
  card: {
    background: "rgba(255,255,255,0.15)",
    backdropFilter: "blur(10px)",
    borderRadius: "16px",
    padding: "20px",
    marginBottom: "20px",
    color: "#fff",
    maxWidth: "400px",
  },
  joinBtn: {
    marginTop: "10px",
    padding: "10px 16px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    background: "#fff",
    color: "#1d2671",
    fontWeight: "bold",
  },
};
