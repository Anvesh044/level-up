import { useEffect, useState } from "react";
import data from "../../data/rapidFire.json";
import { useAuth } from "../../context/useAuth";
import { doc, updateDoc, increment } from "firebase/firestore";
import { db } from "../../services/firebase";
import { useNavigate } from "react-router-dom";

const QuickBurst = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // ---------------- LEVEL STATE ----------------
  const [level, setLevel] = useState("easy");
  const [unlocked, setUnlocked] = useState({
    easy: true,
    medium: false,
    hard: false,
  });

  // ---------------- GAME STATE ----------------
  const [index, setIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [failed, setFailed] = useState(false);
  const [xpAdded, setXpAdded] = useState(false);

  // ⭐ XP POPUP
  const [showXpPopup, setShowXpPopup] = useState(false);
  const [xpGained, setXpGained] = useState(0);

  const levelData = data[level];
  const questionObj = levelData?.questions[index];

  /* ---------- XP PER LEVEL ---------- */
  const getXpForLevel = () => {
    if (level === "easy") return 10;
    if (level === "medium") return 15;
    return 20;
  };

  /* ---------- PROGRESS ---------- */
  const progress = Math.round(
    ((index + (completed ? 1 : 0)) / levelData.questions.length) * 100
  );

  /* ---------- START LEVEL ---------- */
  const startLevel = () => {
    setStarted(true);
    setCompleted(false);
    setFailed(false);
    setXpAdded(false);
    setIndex(0);
    setTimeLeft(levelData.time);
  };

  /* ---------- TIMER ---------- */
  useEffect(() => {
    if (!started || completed || failed) return;

    if (timeLeft === 0) {
      handleWrong();
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, started, completed, failed]);

  /* ---------- TYPEWRITER EFFECT ---------- */
  useEffect(() => {
    if (!questionObj?.q) {
      setDisplayText("");
      return;
    }

    const text = questionObj.q.trim();
    let i = 0;
    setDisplayText("");

    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayText((prev) => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [questionObj]);

  /* ---------- CORRECT ANSWER ---------- */
  const handleCorrect = async () => {
    if (index < levelData.questions.length - 1) {
      setIndex((i) => i + 1);
      setTimeLeft(levelData.time);
    } else {
      setCompleted(true);
      setStarted(false);

      const xp = getXpForLevel();

      if (currentUser && !xpAdded) {
        const ref = doc(db, "users", currentUser.uid);
        await updateDoc(ref, { xp: increment(xp) });
        setXpAdded(true);
      }

      setXpGained(xp);
      setShowXpPopup(true);
      setTimeout(() => setShowXpPopup(false), 2000);

      setUnlocked((prev) => {
        if (level === "easy") return { ...prev, medium: true };
        if (level === "medium") return { ...prev, hard: true };
        return prev;
      });
    }
  };

  /* ---------- WRONG ANSWER ---------- */
  const handleWrong = () => {
    setFailed(true);
    setStarted(false);
  };

  /* ---------- OPTION SELECT ---------- */
  const selectOption = (option) => {
    if (!questionObj) return;
    option === questionObj.ans ? handleCorrect() : handleWrong();
  };

  /* ---------- CHANGE LEVEL ---------- */
  const changeLevel = (lvl) => {
    if (!unlocked[lvl]) return;
    setLevel(lvl);
    setStarted(false);
    setCompleted(false);
    setFailed(false);
    setXpAdded(false);
    setIndex(0);
    setDisplayText("");
  };

  return (
    <div style={styles.page}>
      <h2>⚡ Rapid Fire</h2>

      {/* LEVEL SELECT */}
      <div style={styles.levelRow}>
        {["easy", "medium", "hard"].map((lvl) => (
          <button
            key={lvl}
            disabled={!unlocked[lvl]}
            style={{
              ...styles.levelBtn,
              opacity: unlocked[lvl] ? 1 : 0.4,
              filter: unlocked[lvl] ? "none" : "blur(1px)",
            }}
            onClick={() => changeLevel(lvl)}
          >
            {lvl.toUpperCase()}
          </button>
        ))}
      </div>

      {/* PROGRESS */}
      <div style={styles.progressWrap}>
        <div
          style={{ ...styles.progressFill, width: `${progress}%` }}
        />
      </div>

      {/* START */}
      {!started && !completed && !failed && (
        <button style={styles.startBtn} onClick={startLevel}>
           Start Rapid Fire
        </button>
      )}

      {/* GAME UI */}
      {started && questionObj && (
        <>
          <div style={styles.timer}>⏱ {timeLeft}s</div>

          <div style={styles.card}>
            <h3>{displayText}</h3>
          </div>

          <div style={styles.options}>
            {questionObj.options.map((opt, i) => (
              <button
                key={i}
                style={styles.optionBtn}
                onClick={() => selectOption(opt)}
              >
                {opt}
              </button>
            ))}
          </div>

          <p>
            Question {index + 1} / {levelData.questions.length}
          </p>
        </>
      )}

      {/* FAILED */}
      {failed && (
        <div style={styles.failBox}>
          <h3> Incorrect Answer</h3>
          <p>
            Rapid Fire stopped.  
            Revise concepts and try again 
          </p>

          <button style={styles.retryBtn} onClick={startLevel}>
             Redo Level
          </button>

          <button
            style={styles.libraryBtn}
            onClick={() => navigate("/library")}
          >
             Go to E-Library
          </button>
        </div>
      )}

      {/* COMPLETED */}
      {completed && (
        <p style={{ fontWeight: "700", fontSize: "18px" }}>
          🏆 Level completed!
        </p>
      )}

      {/* XP POPUP */}
      {showXpPopup && (
        <div style={styles.xpPopup}>
          ⭐ +{xpGained} XP
        </div>
      )}
    </div>
  );
};

export default QuickBurst;

/* ================= STYLES ================= */

const styles = {
  page: {
    minHeight: "100vh",
    padding: "40px",
    background: "linear-gradient(135deg,#240046,#5a189a)",
    color: "#fff",
    textAlign: "center",
  },

  levelRow: {
    display: "flex",
    justifyContent: "center",
    gap: "12px",
    marginBottom: "14px",
  },

  levelBtn: {
    padding: "8px 18px",
    borderRadius: "20px",
    border: "none",
    fontWeight: "700",
    cursor: "pointer",
  },

  progressWrap: {
    maxWidth: "420px",
    height: "10px",
    background: "#ddd",
    borderRadius: "10px",
    margin: "0 auto 20px",
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    background: "#06d6a0",
    transition: "width 0.4s ease",
  },

  startBtn: {
    padding: "14px 26px",
    borderRadius: "30px",
    fontWeight: "800",
    border: "none",
    cursor: "pointer",
  },

  timer: {
    fontSize: "28px",
    fontWeight: "800",
    marginBottom: "10px",
  },

  card: {
    background: "#fff",
    color: "#000",
    padding: "20px",
    borderRadius: "16px",
    maxWidth: "700px",
    margin: "0 auto 20px",
    minHeight: "120px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  options: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "12px",
    maxWidth: "700px",
    margin: "0 auto",
  },

  optionBtn: {
    padding: "12px",
    borderRadius: "14px",
    border: "none",
    fontWeight: "700",
    cursor: "pointer",
  },

  failBox: {
    background: "#fff",
    color: "#000",
    padding: "20px",
    borderRadius: "16px",
    maxWidth: "500px",
    margin: "20px auto",
  },

  retryBtn: {
    margin: "8px",
    padding: "10px 18px",
    borderRadius: "12px",
    border: "none",
    fontWeight: "700",
    cursor: "pointer",
  },

  libraryBtn: {
    margin: "8px",
    padding: "10px 18px",
    borderRadius: "12px",
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
