import { useEffect, useState } from "react";
import data from "../../data/sentenceShuffler.json";
import { doc, updateDoc, increment } from "firebase/firestore";
import { db } from "../../services/firebase";
import { useAuth } from "../../context/useAuth";

const SentenceShuffler = () => {
  const { currentUser } = useAuth();

  const [level, setLevel] = useState("easy");
  const [unlocked, setUnlocked] = useState({
    easy: true,
    medium: false,
    hard: false,
  });

  const [questionIndex, setQuestionIndex] = useState(0);
  const [phase, setPhase] = useState("read"); // read | shuffle | result | complete
  const [shuffled, setShuffled] = useState([]);
  const [userOrder, setUserOrder] = useState([]);
  const [message, setMessage] = useState(" Read carefully!");
  const [showResult, setShowResult] = useState(false);
  const [xpAdded, setXpAdded] = useState(false);

  // ⭐ XP POPUP
  const [showXpPopup, setShowXpPopup] = useState(false);
  const [xpGained, setXpGained] = useState(0);

  const levelData = data[level];
  const paragraph = levelData.questions[questionIndex];

  /* ---------- XP PER LEVEL ---------- */
  const getXpForLevel = () => {
    if (level === "easy") return 10;
    if (level === "medium") return 15;
    return 20;
  };

  /* ---------- PROGRESS ---------- */
  const progress = Math.round(
    (questionIndex / levelData.questions.length) * 100
  );

  /* ---------- INIT QUESTION ---------- */
  useEffect(() => {
    startQuestion();
  }, [level, questionIndex]);

  const startQuestion = () => {
    setPhase("read");
    setUserOrder([]);
    setShowResult(false);
    setMessage(" Read carefully!");

    setTimeout(() => {
      const shuffledSentences = [...paragraph].sort(
        () => Math.random() - 0.5
      );
      setShuffled(shuffledSentences);
      setPhase("shuffle");
      setMessage(" Arrange sentences in correct order");
    }, levelData.readTime);
  };

  /* ---------- SELECT SENTENCE ---------- */
  const selectSentence = (sentence) => {
    if (userOrder.includes(sentence)) return;
    setUserOrder([...userOrder, sentence]);
  };

  /* ---------- CHECK ANSWER ---------- */
  const checkAnswer = async () => {
    const correct =
      JSON.stringify(userOrder) === JSON.stringify(paragraph);

    if (correct) {
      setMessage("🎉 Correct order!");
      setShowResult(false);

      if (questionIndex < levelData.questions.length - 1) {
        setQuestionIndex(questionIndex + 1);
      } else {
        setPhase("complete");
        const xp = getXpForLevel();
        setMessage(`🏆 Level completed! +${xp} XP`);

        if (currentUser && !xpAdded) {
          const ref = doc(db, "users", currentUser.uid);
          await updateDoc(ref, { xp: increment(xp) });
          setXpAdded(true);

          // ⭐ XP POPUP
          setXpGained(xp);
          setShowXpPopup(true);
          setTimeout(() => setShowXpPopup(false), 2000);
        }

        setUnlocked((prev) => {
          if (level === "easy") return { ...prev, medium: true };
          if (level === "medium") return { ...prev, hard: true };
          return prev;
        });
      }
    } else {
      setShowResult(true);
      setMessage(" Not quite right. Learn and try again.");
      setPhase("result");
    }
  };

  /* ---------- RETRY ---------- */
  const retry = () => {
    setUserOrder([]);
    setShowResult(false);
    setPhase("shuffle");
    setMessage("🔄 Try again carefully!");
  };

  /* ---------- CHANGE LEVEL ---------- */
  const changeLevel = (lvl) => {
    if (!unlocked[lvl]) return;
    setLevel(lvl);
    setQuestionIndex(0);
    setXpAdded(false);
  };

  return (
    <div style={styles.page}>
      <h2> Sentence Shuffler</h2>

      {/* 🤖 COACH */}
      <div style={styles.coachBox}>
        <div style={styles.coachAvatar}>🤖</div>
        <div style={styles.coachMsg}>{message}</div>
      </div>

      {/* 🎚️ LEVEL SELECT */}
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

      {/* 📊 PROGRESS BAR */}
      <div style={styles.progressWrap}>
        <div
          style={{
            ...styles.progressFill,
            width: phase === "complete" ? "100%" : `${progress}%`,
          }}
        />
      </div>

      {/* READ */}
      {phase === "read" && (
        <div style={styles.card}>
          {paragraph.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
          <p><strong> Memorize...</strong></p>
        </div>
      )}

      {/* SHUFFLE */}
      {phase === "shuffle" && (
        <>
          <div style={styles.sentenceBox}>
            {shuffled.map((s, i) => (
              <button
                key={i}
                style={styles.sentenceBtn}
                onClick={() => selectSentence(s)}
              >
                {s}
              </button>
            ))}
          </div>

          <h4>Your Order</h4>
          <div style={styles.orderBox}>
            {userOrder.map((s, i) => (
              <p key={i}>{s}</p>
            ))}
          </div>

          {userOrder.length === paragraph.length && (
            <button style={styles.checkBtn} onClick={checkAnswer}>
               Check Answer
            </button>
          )}
        </>
      )}

      {/* RESULT */}
      {phase === "result" && showResult && (
        <div style={styles.card}>
          <h4>Your Order</h4>
          {userOrder.map((s, i) => (
            <p key={i}>{s}</p>
          ))}

          <h4>Correct Order</h4>
          {paragraph.map((s, i) => (
            <p key={i}>{s}</p>
          ))}

          <button style={styles.checkBtn} onClick={retry}>
             Retry
          </button>
        </div>
      )}

      {phase === "complete" && (
        <p style={{ fontWeight: "700" }}>
           Move to the next level!
        </p>
      )}

      {/* ⭐ XP POPUP */}
      {showXpPopup && (
        <div style={styles.xpPopup}>
          ⭐ +{xpGained} XP
        </div>
      )}
    </div>
  );
};

export default SentenceShuffler;

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
  card: {
    background: "#fff",
    color: "#000",
    padding: "20px",
    borderRadius: "14px",
    maxWidth: "750px",
    margin: "0 auto",
  },
  sentenceBox: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    maxWidth: "750px",
    margin: "0 auto",
  },
  sentenceBtn: {
    padding: "10px",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    fontWeight: "600",
  },
  orderBox: {
    marginTop: "12px",
    background: "#fff",
    color: "#000",
    padding: "12px",
    borderRadius: "12px",
  },
  checkBtn: {
    marginTop: "14px",
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
    animation: "fadeUp 2s ease",
  },
};
