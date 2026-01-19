import { useState } from "react";
import data from "../../data/outputOracleData.json";
import { useAuth } from "../../context/useAuth";
import { doc, updateDoc, increment } from "firebase/firestore";
import { db } from "../../services/firebase";

const OutputOracle = () => {
  const { currentUser } = useAuth();

  const [language, setLanguage] = useState(null);
  const [level, setLevel] = useState("easy");
  const [unlocked, setUnlocked] = useState({
    easy: true,
    medium: false,
    hard: false,
  });

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [message, setMessage] = useState("");

  // ⭐ XP STATE
  const [xpAdded, setXpAdded] = useState(false);
  const [showXpPopup, setShowXpPopup] = useState(false);

  const xpMap = { easy: 10, medium: 15, hard: 20 };

  if (!language) {
    return (
      <div style={styles.page}>
        <h2> Output Oracle</h2>
        <p>Select Language</p>
        <button style={styles.btn} onClick={() => setLanguage("C")}>
          C
        </button>
        <button style={styles.btn} onClick={() => setLanguage("Python")}>
          Python
        </button>
      </div>
    );
  }

  const questions = data[language][level];
  const q = questions[index];

  /* ---------- CHECK ANSWER ---------- */
  const check = async () => {
    if (selected === q.answer) {
      if (index === questions.length - 1) {
        setMessage("🎉 Level Completed!");

        // ⭐ ADD XP ONCE
        if (currentUser && !xpAdded) {
          const ref = doc(db, "users", currentUser.uid);
          await updateDoc(ref, { xp: increment(xpMap[level]) });
          setXpAdded(true);
          setShowXpPopup(true);
          setTimeout(() => setShowXpPopup(false), 2000);
        }

        // 🔓 UNLOCK NEXT LEVEL
        if (level === "easy") setUnlocked((p) => ({ ...p, medium: true }));
        if (level === "medium") setUnlocked((p) => ({ ...p, hard: true }));
      } else {
        setIndex(index + 1);
      }

      setSelected("");
      setShowHint(false);
    } else {
      setMessage("❌ Wrong. Try again or use hint.");
    }
  };

  /* ---------- CHANGE LEVEL ---------- */
  const changeLevel = (lvl) => {
    if (!unlocked[lvl]) return;
    setLevel(lvl);
    setIndex(0);
    setSelected("");
    setMessage("");
    setXpAdded(false);
    setShowHint(false);
  };

  return (
    <div style={styles.page}>
      <h2> Output Oracle</h2>
      <p>
        {language} | {level.toUpperCase()}
      </p>

      {/* LEVEL SELECT */}
      <div>
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

      {/* QUESTION */}
      {q && (
        <>
          <pre style={styles.code}>{q.code}</pre>

          <div style={styles.options}>
            {q.options.map((o, i) => (
              <button
                key={i}
                onClick={() => setSelected(o)}
                style={{
                  ...styles.optionBtn,
                  background: selected === o ? "#5a189a" : "#eee",
                  color: selected === o ? "#fff" : "#000",
                }}
              >
                {o}
              </button>
            ))}
          </div>

          <button style={styles.btn} disabled={!selected} onClick={check}>
            Check Output
          </button>

          <button
            style={styles.hintBtn}
            onClick={() => setShowHint(true)}
          >
            💡 Hint
          </button>

          {showHint && <p style={styles.hint}>{q.hint}</p>}
          {message && <p style={styles.msg}>{message}</p>}
        </>
      )}

      {/* XP POPUP */}
      {showXpPopup && (
        <div style={styles.xpPopup}>
          ⭐ +{xpMap[level]} XP
        </div>
      )}
    </div>
  );
};

export default OutputOracle;

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
    margin: "10px",
    cursor: "pointer",
  },
  levelBtn: {
    padding: "8px 18px",
    margin: "5px",
    borderRadius: "20px",
    border: "none",
    fontWeight: "700",
  },
  code: {
    background: "#1e1e1e",
    color: "#dcdcaa",
    padding: "20px",
    borderRadius: "14px",
    maxWidth: "700px",
    margin: "20px auto",
    textAlign: "left",
  },
  options: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
    gap: "10px",
    maxWidth: "700px",
    margin: "0 auto",
  },
  optionBtn: {
    padding: "12px",
    borderRadius: "14px",
    border: "none",
    fontWeight: "600",
    cursor: "pointer",
  },
  hintBtn: {
    marginTop: "10px",
    padding: "8px 18px",
    borderRadius: "20px",
    border: "none",
    fontWeight: "700",
  },
  hint: {
    color: "#ffd166",
    fontWeight: "600",
  },
  msg: {
    marginTop: "10px",
    fontWeight: "700",
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
