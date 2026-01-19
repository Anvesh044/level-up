import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from "../context/useAuth";

const GamesHome = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // 🔥 REAL game access from Firestore
  const [gameAccess, setGameAccess] = useState({});

  // 🔑 Mapping UI titles → Firestore keys
  const gameKeyMap = {
    "Choice Quest": "choiceQuest",
    "Flash Shop": "flashShop",
    "Sentence Shuffle": "sentenceShuffle",
    "Word Hunt": "wordHunt",
    "Sketch Match": "sketchMatch",
    "Echo Speak": "echoSpeak",
    "Decision Lab": "decisionLab",
    "Quick Burst": "quickBurst",
    "Pop Logic": "popLogic",
    "Output Oracle": "outputOracle",
    "Bug Scope": "bugScope",
    "Mind Wave": "mindWave",
  };

  // 🎯 Fetch gameAccess for logged-in student
  useEffect(() => {
    if (!currentUser) return;

    const fetchGameAccess = async () => {
      const ref = doc(db, "users", currentUser.uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setGameAccess(snap.data().gameAccess || {});
      }
    };

    fetchGameAccess();
  }, [currentUser]);

  const games = [
    { title: "Choice Quest", desc: "Story-based situation decisions", route: "/games/choice-quest", color: "#FF6F61" },
    { title: "Flash Shop", desc: "Flashcards for quick recall", route: "/games/flash-shop", color: "#5F6CAF" },
    { title: "Sentence Shuffle", desc: "Rearrange jumbled sentences", route: "/games/sentence-shuffle", color: "#2EC4B6" },
    { title: "Word Hunt", desc: "Unscramble words correctly", route: "/games/word-hunt", color: "#4D96FF" },
    { title: "Sketch Match", desc: "Draw the image you see", route: "/games/sketch-match", color: "#F06292" },
    { title: "Echo Speak", desc: "Repeat & improve pronunciation", route: "/games/echo-speak", color: "#FFCA3A" },
    { title: "Decision Lab", desc: "Advanced real-life decision making", route: "/games/decision-lab", color: "#6C757D" },
    { title: "Quick Burst", desc: "Rapid-fire question challenge", route: "/games/quick-burst", color: "#00B4D8" },
    { title: "Pop Logic", desc: "Pop balloons with correct logic", route: "/games/pop-logic", color: "#90DBF4" },
    { title: "Output Oracle", desc: "Predict the program output", route: "/games/output-oracle", color: "#57CC99" },
    { title: "Bug Scope", desc: "Find bugs & errors", route: "/games/bug-scope", color: "#E63946" },
    { title: "Mind Wave", desc: "Generate mind maps visually", route: "/games/mind-wave", color: "#B8B5FF" },
  ];

  return (
    <div style={styles.page}>
      <h1 style={styles.heading}>🎮 Gamified Learning Arena</h1>
      <p style={styles.subText}>Play. Learn. Level up your skills.</p>

      <div style={styles.grid}>
        {games.map((game, i) => {
          const key = gameKeyMap[game.title];
          const unlocked = gameAccess[key];

          return (
            <div
              key={i}
              className="game-card"
              style={{
                ...styles.card,
                backgroundColor: game.color,
                animationDelay: `${i * 80}ms`,
              }}
            >
              <div style={styles.cardContent}>
                <h3>{game.title}</h3>
                <p>{game.desc}</p>

                <button
                  style={styles.cardBtn}
                  disabled={!unlocked}
                  onClick={() => unlocked && navigate(game.route)}
                >
                  {unlocked ? "Play Game →" : "Locked"}
                </button>
              </div>
            </div>
          );
        })}

        {/* FINAL TEST (unchanged) */}
        <div
          className="game-card final-card"
          style={{ ...styles.card, ...styles.finalCard, animationDelay: "960ms" }}
        >
          <div style={styles.cardContent}>
            <span style={styles.badge}>FINAL ASSESSMENT</span>
            <h3>🎥 Proctored Skill Test</h3>
            <p>Camera-based evaluation & certificate.</p>

            <button
              style={styles.finalBtn}
              onClick={() => navigate("/games/final-test")}
            >
              Start Test →
            </button>
          </div>
        </div>
      </div>

      <style>{css}</style>
    </div>
  );
};

export default GamesHome;


/* ================= STYLES ================= */

const styles = {
  page: {
    minHeight: "100vh",
    padding: "60px 30px",
    background: "radial-gradient(circle at top, #3b0a6d, #12001a)",
    color: "#fff",
  },

  heading: {
    textAlign: "center",
    fontSize: "38px",
    fontWeight: "800",
    marginBottom: "8px",
  },

  subText: {
    textAlign: "center",
    marginBottom: "56px",
    fontSize: "16px",
    opacity: 0.85,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "30px",
  },

  card: {
    height: "220px",
    borderRadius: "22px",
    padding: "22px",
    boxShadow:
      "0 18px 40px rgba(0,0,0,0.55), inset 0 0 0 1px rgba(255,255,255,0.12)",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    opacity: 0,
    transform: "translateY(30px)",
    animation: "cardEnter 0.6s ease forwards",
  },

  cardContent: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },

  cardBtn: {
    alignSelf: "flex-start",
    padding: "10px 18px",
    borderRadius: "12px",
    border: "none",
    background: "#ffffff",
    color: "#000",
    fontWeight: "700",
    cursor: "pointer",
  },

  finalCard: {
    backgroundColor: "#0B0B0B",
    border: "2px solid #FFD700",
  },

  finalBtn: {
    alignSelf: "flex-start",
    padding: "12px 20px",
    borderRadius: "12px",
    border: "none",
    background: "#FFD700",
    color: "#000",
    fontWeight: "800",
    cursor: "pointer",
  },

  badge: {
    background: "#FFD700",
    color: "#000",
    padding: "6px 14px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "800",
    width: "fit-content",
  },
};

/* ================= ANIMATIONS ================= */

const css = `
@keyframes cardEnter {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.game-card:hover {
  transform: translateY(-10px) scale(1.03);
  box-shadow:
    0 30px 60px rgba(0,0,0,0.7),
    inset 0 0 0 1px rgba(255,255,255,0.2);
}

.game-card:hover button {
  transform: translateX(6px);
}

.final-card:hover {
  box-shadow:
    0 35px 70px rgba(255,215,0,0.35),
    inset 0 0 0 1px rgba(255,215,0,0.4);
}
`;
