import { useState } from "react";
import data from "../../data/balloonBoostData.json";
import { useAuth } from "../../context/useAuth";
import { doc, updateDoc, increment } from "firebase/firestore";
import { db } from "../../services/firebase";

const BalloonBoost = () => {
  const { currentUser } = useAuth();
  const { topics, rules, game } = data;

  const [topic, setTopic] = useState(null);
  const [started, setStarted] = useState(false);
  const [input, setInput] = useState("");
  const [usedWords, setUsedWords] = useState([]);
  const [height, setHeight] = useState(50);
  const [status, setStatus] = useState("idle"); // idle | win | fail
  const [hint, setHint] = useState("");

  // ⭐ XP UI
  const [xpAdded, setXpAdded] = useState(false);
  const [showXpPopup, setShowXpPopup] = useState(false);

  /* ---------- ROLL TOPIC ---------- */
  const rollTopic = () => {
    const random =
      topics[Math.floor(Math.random() * topics.length)];
    setTopic(random);
    resetGame();
  };

  const resetGame = () => {
    setStarted(false);
    setInput("");
    setUsedWords([]);
    setHeight(50);
    setStatus("idle");
    setHint("");
    setXpAdded(false);
  };

  /* ---------- START ---------- */
  const startGame = () => {
    setStarted(true);
    setHeight(50);
    setUsedWords([]);
    setHint("");
    setStatus("idle");
  };

  /* ---------- SUBMIT WORD ---------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || usedWords.includes(input)) return;

    const word = input.toLowerCase().trim();
    setUsedWords((prev) => [...prev, word]);

    if (topic.keywords.includes(word)) {
      setHeight((h) => {
        const newHeight = h + rules.correctBoost;

        if (newHeight >= rules.winHeight) {
          setStatus("win");
          setStarted(false);

          // ⭐ ADD XP ON WIN
          if (currentUser && !xpAdded) {
            const ref = doc(db, "users", currentUser.uid);
            updateDoc(ref, { xp: increment(10) });
            setXpAdded(true);
            setShowXpPopup(true);
            setTimeout(() => setShowXpPopup(false), 2000);
          }
        }
        return newHeight;
      });
      setHint("");
    } else {
      setHeight((h) => {
        const newHeight = h - rules.wrongDrop;
        if (newHeight <= rules.failHeight) {
          setStatus("fail");
          setStarted(false);
        }
        return newHeight;
      });
      setHint(topic.hint);
    }

    setInput("");
  };

  return (
    <div style={styles.page}>
      <h2>{game.title}</h2>
      <p>{game.description}</p>

      {/* ROLL */}
      {!topic && (
        <button style={styles.btn} onClick={rollTopic}>
          🎲 Roll Topic
        </button>
      )}

      {topic && !started && status === "idle" && (
        <>
          <h3> Topic: {topic.name}</h3>
          <button style={styles.btn} onClick={startGame}>
            ▶ Start Game
          </button>
        </>
      )}

      {/* SKY */}
      {started && (
        <>
          <div style={styles.sky}>
            <div
              style={{
                ...styles.balloon,
                bottom: `${height}%`,
              }}
            >
              🎈
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <input
              style={styles.input}
              placeholder="Type a related word & press Enter"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </form>

          {hint && <p style={styles.hint}>💡 Hint: {hint}</p>}

          <p style={styles.used}>
            Used words: {usedWords.join(", ")}
          </p>
        </>
      )}

      {/* WIN */}
      {status === "win" && (
        <div style={styles.winBox}>
          🎉 Balloon reached the sky! You win!
          <p>⭐ +10 XP earned</p>
        </div>
      )}

      {/* FAIL */}
      {status === "fail" && (
        <div style={styles.failBox}>
          💥 Balloon popped!
          <p>Think broader & try again.</p>
          <button style={styles.retryBtn} onClick={startGame}>
             Retry
          </button>
        </div>
      )}

      {/* XP POPUP */}
      {showXpPopup && (
        <div style={styles.xpPopup}>⭐ +10 XP</div>
      )}
    </div>
  );
};

export default BalloonBoost;

/* ================= STYLES ================= */

const styles = {
  page: {
    minHeight: "100vh",
    padding: "40px",
    background: "linear-gradient(135deg,#240046,#5a189a)",
    color: "#fff",
    textAlign: "center",
  },

  btn: {
    padding: "12px 26px",
    borderRadius: "30px",
    border: "none",
    fontWeight: "800",
    cursor: "pointer",
    margin: "10px",
  },

  sky: {
    position: "relative",
    height: "480px",
    maxWidth: "520px",
    margin: "20px auto",
    background: "linear-gradient(#87ceeb, #e0f7ff)",
    borderRadius: "20px",
    overflow: "hidden",
  },

  balloon: {
    position: "absolute",
    left: "50%",
    transform: "translateX(-50%)",
    fontSize: "56px",
    transition: "bottom 0.5s ease",
  },

  input: {
    padding: "12px",
    width: "320px",
    borderRadius: "14px",
    border: "none",
    marginTop: "12px",
  },

  hint: {
    marginTop: "10px",
    color: "#ffd166",
    fontWeight: "600",
  },

  used: {
    fontSize: "13px",
    opacity: 0.8,
  },

  winBox: {
    marginTop: "20px",
    background: "#caffbf",
    color: "#000",
    padding: "16px",
    borderRadius: "16px",
    fontWeight: "800",
  },

  failBox: {
    marginTop: "20px",
    background: "#ffadad",
    color: "#000",
    padding: "16px",
    borderRadius: "16px",
    fontWeight: "800",
  },

  retryBtn: {
    marginTop: "10px",
    padding: "8px 20px",
    borderRadius: "20px",
    border: "none",
    fontWeight: "700",
    cursor: "pointer",
  },

  xpPopup: {
    position: "fixed",
    bottom: "30px",
    right: "30px",
    background: "#ffd166",
    color: "#000",
    padding: "12px 20px",
    borderRadius: "20px",
    fontWeight: "800",
    boxShadow: "0 6px 20px rgba(0,0,0,0.3)",
  },
};
