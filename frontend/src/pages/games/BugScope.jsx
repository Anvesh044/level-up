import { useState } from "react";
import data from "../../data/bugScope.json";
import { useAuth } from "../../context/useAuth";
import { doc, updateDoc, increment } from "firebase/firestore";
import { db } from "../../services/firebase";




const BugScope = () => {
  const { currentUser } = useAuth();

  // ---------------- LEVEL STATE ----------------
  const [level, setLevel] = useState("easy");
  const [unlocked, setUnlocked] = useState({
    easy: true,
    medium: false,
    hard: false,
  });

  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [message, setMessage] = useState("🐞 Find the bug in the code!");
  const [showHint, setShowHint] = useState(false);
  const [completed, setCompleted] = useState(false);

  // ⭐ XP STATE
  const [xpAdded, setXpAdded] = useState(false);
  const [showXpPopup, setShowXpPopup] = useState(false);

  const xpMap = { easy: 10, medium: 15, hard: 20 };

  const current = data[level][index];

  /* ---------- CHECK ANSWER (KEYWORD BASED) ---------- */
  const checkBug = async () => {
    const userAnswer = answer.toLowerCase();
    const bugKeywords = current.bug.toLowerCase().split(" ");

    const isCorrect = bugKeywords.some((keyword) =>
      userAnswer.includes(keyword)
    );

    if (isCorrect) {
      setMessage("🎉 Correct! You spotted the bug.");
      setAnswer("");
      setShowHint(false);

      if (index < data[level].length - 1) {
        setIndex(index + 1);
      } else {
        setCompleted(true);
        setMessage(`🏆 Level completed! +${xpMap[level]} XP`);

        // ⭐ ADD XP ONCE
        if (currentUser && !xpAdded) {
          const ref = doc(db, "users", currentUser.uid);
          await updateDoc(ref, { xp: increment(xpMap[level]) });
          setXpAdded(true);
          setShowXpPopup(true);
          setTimeout(() => setShowXpPopup(false), 2000);
        }

        // 🔓 UNLOCK NEXT LEVEL
        setUnlocked((prev) => {
          if (level === "easy") return { ...prev, medium: true };
          if (level === "medium") return { ...prev, hard: true };
          return prev;
        });
      }
    } else {
      setMessage("💡 Not quite right. Think carefully and try again!");
    }
  };

  /* ---------- CHANGE LEVEL ---------- */
  const changeLevel = (lvl) => {
    if (!unlocked[lvl]) return;
    setLevel(lvl);
    setIndex(0);
    setCompleted(false);
    setAnswer("");
    setShowHint(false);
    setXpAdded(false);
    setMessage("🐞 Find the bug in the code!");
  };

  return (
    <div style={styles.page}>
      <h2>🐞 BugScope</h2>

      {/* 🤖 COACH */}
      <div style={styles.coachBox}>
        <div style={styles.coachAvatar}>🤖</div>
        <div style={styles.coachMsg}>{message}</div>
      </div>

      {/* LEVEL SELECT */}
      <div style={styles.levelRow}>
        {["easy", "medium", "hard"].map((lvl) => (
          <button
            key={lvl}
            disabled={!unlocked[lvl]}
            style={{
              ...styles.levelBtn,
              opacity: unlocked[lvl] ? 1 : 0.4,
            }}
            onClick={() => changeLevel(lvl)}
          >
            {lvl.toUpperCase()}
          </button>
        ))}
      </div>

      {!completed && (
        <>
          {/* CODE BLOCK */}
          <pre style={styles.codeBlock}>{current.code}</pre>

          {/* ANSWER INPUT */}
          <input
            style={styles.input}
            placeholder="Describe the bug in simple words..."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
          />

          {/* ACTION BUTTONS */}
          <div>
            <button style={styles.btn} onClick={checkBug}>
               Submit
            </button>
            <button
              style={styles.btn}
              onClick={() => setShowHint(true)}
            >
              💡 Hint
            </button>
          </div>

          {/* HINT */}
          {showHint && (
            <p style={styles.hint}>
              Hint: {current.hint}
            </p>
          )}

          <p>
            Question {index + 1} / {data[level].length}
          </p>
        </>
      )}

      {completed && (
        <p style={{ fontWeight: "700", fontSize: "18px" }}>
           Level completed! Select next level above.
        </p>
      )}

      {/* ⭐ XP POPUP */}
      {showXpPopup && (
        <div style={styles.xpPopup}>
          ⭐ +{xpMap[level]} XP
        </div>
      )}
    </div>
  );
};

export default BugScope;

/* ================= STYLES ================= */

const styles = {
  page: {
    minHeight: "100vh",
    padding: "40px",
    background: "linear-gradient(135deg,#240046,#5a189a)",
    color: "#fff",
    textAlign: "center",
  },

  coachBox: {
    display: "flex",
    justifyContent: "center",
    gap: "16px",
    marginBottom: "20px",
  },

  coachAvatar: {
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    background: "#ffd166",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "28px",
  },

  coachMsg: {
    background: "#fff",
    color: "#000",
    padding: "14px 18px",
    borderRadius: "14px",
    fontWeight: "600",
    maxWidth: "600px",
  },

  levelRow: {
    display: "flex",
    justifyContent: "center",
    gap: "12px",
    marginBottom: "20px",
  },

  levelBtn: {
    padding: "8px 18px",
    borderRadius: "20px",
    border: "none",
    fontWeight: "700",
    cursor: "pointer",
  },

  codeBlock: {
    background: "#0b0b0b",
    color: "#00ff90",
    padding: "20px",
    borderRadius: "12px",
    textAlign: "left",
    maxWidth: "720px",
    margin: "0 auto 14px",
    fontSize: "14px",
  },

  input: {
    padding: "10px",
    borderRadius: "10px",
    width: "65%",
    border: "none",
    marginBottom: "10px",
  },

  btn: {
    margin: "6px",
    padding: "10px 18px",
    borderRadius: "12px",
    border: "none",
    fontWeight: "700",
    cursor: "pointer",
  },

  hint: {
    marginTop: "10px",
    fontStyle: "italic",
    opacity: 0.9,
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
