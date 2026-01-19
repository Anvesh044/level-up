import { useEffect, useState } from "react";
import data from "../../data/echoSpeak.json";
import { useAuth } from "../../context/useAuth";
import { doc, updateDoc, increment } from "firebase/firestore";
import { db } from "../../services/firebase";

const EchoSpeak = () => {
  const { currentUser } = useAuth();

  const [level, setLevel] = useState("easy");
  const [unlocked, setUnlocked] = useState({
    easy: true,
    medium: false,
    hard: false,
  });

  const [index, setIndex] = useState(0);
  const [listening, setListening] = useState(false);
  const [spokenText, setSpokenText] = useState("");
  const [message, setMessage] = useState(" Click start and speak clearly!");
  const [completed, setCompleted] = useState(false);
  const [xpAdded, setXpAdded] = useState(false);

  // ⭐ XP POPUP
  const [showXpPopup, setShowXpPopup] = useState(false);
  const [xpGained, setXpGained] = useState(0);

  const sentence = data[level][index];

  /* ---------- XP PER LEVEL ---------- */
  const getXpForLevel = () => {
    if (level === "easy") return 10;
    if (level === "medium") return 15;
    return 20;
  };

  /* ---------- PROGRESS ---------- */
  const progress = Math.round(
    ((index + (completed ? 1 : 0)) / data[level].length) * 100
  );

  /* ---------- SIMILARITY CHECK ---------- */
  const evaluateSpeech = async (spoken) => {
    const targetWords = sentence.toLowerCase().split(" ");
    const spokenWords = spoken.toLowerCase().split(" ");

    let matchCount = 0;
    targetWords.forEach((word) => {
      if (spokenWords.includes(word)) matchCount++;
    });

    const similarity = (matchCount / targetWords.length) * 100;

    if (similarity >= 70) {
      setMessage(`🎉 Great! ${Math.round(similarity)}% match`);

      if (index < data[level].length - 1) {
        setIndex(index + 1);
        setSpokenText("");
      } else {
        setCompleted(true);
        const xp = getXpForLevel();
        setMessage(`🏆 Level completed! +${xp} XP`);

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
    } else {
      setMessage(` Try again! Only ${Math.round(similarity)}% matched`);
    }
  };

  /* ---------- START LISTEN ---------- */
  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition not supported in this browser.");
      return;
    }

    const recog = new SpeechRecognition();
    recog.lang = "en-US";

    setListening(true);
    recog.start();

    recog.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setSpokenText(transcript);
      evaluateSpeech(transcript);
    };

    recog.onend = () => setListening(false);
  };

  /* ---------- CHANGE LEVEL ---------- */
  const changeLevel = (lvl) => {
    if (!unlocked[lvl]) return;
    setLevel(lvl);
    setIndex(0);
    setCompleted(false);
    setXpAdded(false);
    setSpokenText("");
    setMessage(" Click start and speak clearly!");
  };

  return (
    <div style={styles.page}>
      <h2> Echo Speak</h2>

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

      {!completed && (
        <>
          <h3 style={styles.sentence}>{sentence}</h3>

          <button
            style={{
              ...styles.micBtn,
              background: listening ? "#ef476f" : "#ffd166",
            }}
            onClick={startListening}
          >
            🎙️ {listening ? "Listening..." : "Start Speaking"}
          </button>

          {spokenText && (
            <p>
              <strong>You said:</strong> {spokenText}
            </p>
          )}

          <p>
            Sentence {index + 1} / {data[level].length}
          </p>
        </>
      )}

      {completed && (
        <p style={{ fontWeight: "700" }}>
           Level complete! Move ahead.
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

export default EchoSpeak;

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
    marginBottom: "16px",
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

  sentence: {
    background: "#fff",
    color: "#000",
    padding: "16px",
    borderRadius: "14px",
    maxWidth: "700px",
    margin: "0 auto 16px",
  },

  micBtn: {
    padding: "14px 22px",
    borderRadius: "30px",
    border: "none",
    fontWeight: "700",
    fontSize: "16px",
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
