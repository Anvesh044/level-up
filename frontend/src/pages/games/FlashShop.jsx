import { useEffect, useState } from "react";
import flashcards from "../../data/flashcards.json";
import { doc, updateDoc, increment } from "firebase/firestore";
import { db } from "../../services/firebase";
import { useAuth } from "../../context/useAuth";

const FlashCards = () => {
  const { currentUser } = useAuth();

  const [level, setLevel] = useState("easy");
  const [unlocked, setUnlocked] = useState({
    easy: true,
    medium: false,
    hard: false,
  });

  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [showAll, setShowAll] = useState(true);
  const [message, setMessage] = useState("");
  const [completed, setCompleted] = useState(false);
  const [xpAdded, setXpAdded] = useState(false);

  // 🎉 XP POPUP
  const [showXpPopup, setShowXpPopup] = useState(false);
  const [xpGained, setXpGained] = useState(0);

  /* ---------- LEVEL PREVIEW TIME ---------- */
  const getPreviewTime = () => {
    if (level === "easy") return 2000;
    if (level === "medium") return 3000;
    return 5000;
  };

  /* ---------- XP PER LEVEL ---------- */
  const getXpForLevel = () => {
    if (level === "easy") return 10;
    if (level === "medium") return 15;
    return 20;
  };

  /* ---------- SHUFFLE ---------- */
  const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

  /* ---------- START GAME ---------- */
  useEffect(() => {
    startGame();
  }, [level]);

  const startGame = () => {
    setCards(shuffle(flashcards[level]));
    setFlipped([]);
    setMatched([]);
    setCompleted(false);
    setXpAdded(false);
    setShowAll(true);
    setMessage(" Memorize carefully!");

    setTimeout(() => {
      setShowAll(false);
      setMessage(" Now find the matching pairs!");
    }, getPreviewTime());
  };

  /* ---------- CARD CLICK ---------- */
  const handleFlip = (index) => {
    if (
      flipped.length === 2 ||
      flipped.includes(index) ||
      matched.includes(index)
    )
      return;

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      const [i1, i2] = newFlipped;

      if (cards[i1].label === cards[i2].label) {
        setMatched((prev) => [...prev, i1, i2]);
        setMessage(`🎉 Great! You found ${cards[i1].label}`);
        setFlipped([]);
      } else {
        setMessage(" Almost there! Try again.");
        setTimeout(() => setFlipped([]), 800);
      }
    }
  };

  /* ---------- LEVEL COMPLETE ---------- */
  useEffect(() => {
    if (matched.length === cards.length && cards.length > 0 && !xpAdded) {
      const xp = getXpForLevel();
      setCompleted(true);
      setXpAdded(true);
      setMessage(`🎊 Level completed! +${xp} XP`);

      // ⭐ ADD XP
      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        updateDoc(userRef, { xp: increment(xp) });
      }

      // 🎉 SHOW XP POPUP
      setXpGained(xp);
      setShowXpPopup(true);
      setTimeout(() => setShowXpPopup(false), 2000);

      // 🔓 UNLOCK NEXT LEVEL
      setUnlocked((prev) => {
        if (level === "easy") return { ...prev, medium: true };
        if (level === "medium") return { ...prev, hard: true };
        return prev;
      });
    }
  }, [matched, cards, xpAdded, currentUser, level]);

  /* ---------- GRID SIZE ---------- */
  const getGridColumns = () => {
    if (level === "easy") return "repeat(3, 1fr)";
    if (level === "medium") return "repeat(4, 1fr)";
    return "repeat(6, 1fr)";
  };

  /* ---------- PROGRESS ---------- */
  const progress =
    cards.length > 0
      ? Math.round((matched.length / cards.length) * 100)
      : 0;

  return (
    <div style={styles.page}>
      <h2 style={styles.heading}>🃏 Flash Cards</h2>

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
              background: level === lvl ? "#ffd166" : "#fff",
            }}
            onClick={() => setLevel(lvl)}
          >
            {lvl.toUpperCase()}
          </button>
        ))}
      </div>

      {/* 📊 PROGRESS BAR */}
      <div style={styles.progressWrap}>
        <div
          style={{ ...styles.progressFill, width: `${progress}%` }}
        />
      </div>

      {/* 🧩 CARD GRID */}
      <div
        style={{
          ...styles.grid,
          gridTemplateColumns: getGridColumns(),
        }}
      >
        {cards.map((card, idx) => {
          const isVisible =
            showAll || flipped.includes(idx) || matched.includes(idx);

          return (
            <div
              key={idx}
              style={{
                ...styles.card,
                visibility: matched.includes(idx) ? "hidden" : "visible",
              }}
              onClick={() => handleFlip(idx)}
            >
              {isVisible ? (
                <div style={styles.cardContent}>
                  <div style={styles.emoji}>{card.emoji}</div>
                  <div style={styles.label}>{card.label}</div>
                </div>
              ) : (
                <div style={styles.hidden}>❓</div>
              )}
            </div>
          );
        })}
      </div>

      {completed && (
        <p style={styles.completeText}>
           Excellent focus! Move to the next level.
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

export default FlashCards;

/* ================= STYLES ================= */

const styles = {
  page: {
    minHeight: "100vh",
    padding: "40px",
    background: "linear-gradient(135deg,#240046,#5a189a)",
    color: "#fff",
    textAlign: "center",
  },
  heading: {
    fontSize: "36px",
    marginBottom: "16px",
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
  grid: {
    display: "grid",
    gap: "14px",
    maxWidth: "650px",
    margin: "0 auto",
  },
  card: {
    height: "90px",
    background: "#fff",
    borderRadius: "14px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
  },
  cardContent: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    fontWeight: "800",
    color: "#000",
  },
  emoji: {
    fontSize: "28px",
  },
  label: {
    fontSize: "14px",
  },
  hidden: {
    fontSize: "24px",
  },
  completeText: {
    marginTop: "24px",
    fontWeight: "700",
    fontSize: "18px",
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
