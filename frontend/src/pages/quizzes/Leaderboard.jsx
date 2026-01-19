import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../../services/firebase";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

const Leaderboard = () => {
  const { roomCode } = useParams();
  const [list, setList] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, "attempts"),
      where("roomCode", "==", roomCode),
      orderBy("score", "desc"),
      orderBy("timeTaken", "asc")
    );
    const unsub = onSnapshot(q, snap =>
      setList(snap.docs.map(d => d.data()))
    );
    return () => unsub();
  }, [roomCode]);

  return (
    <div style={{ padding: 40 }}>
      <h2>Leaderboard</h2>
      {list.map((u, i) => (
        <p key={i}>{i + 1}. {u.userName} — {u.score}</p>
      ))}
    </div>
  );
};

export default Leaderboard;
