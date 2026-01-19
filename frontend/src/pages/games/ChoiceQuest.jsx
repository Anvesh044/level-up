import { useState } from "react";
import stories from "../../data/storyQuestLevels.json";
import { doc, updateDoc, increment } from "firebase/firestore";
import { db } from "../../services/firebase";
import { useAuth } from "../../context/useAuth";

const StoryQuest = () => {
  const { currentUser } = useAuth();

  const [level, setLevel] = useState("easy");
  const [unlocked, setUnlocked] = useState({
    easy: true,
    medium: false,
    hard: false,
  });

  const [step, setStep] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [message, setMessage] = useState(
    " Read carefully and make the right choice!"
  );
  const [showWarning, setShowWarning] = useState(false);

  const levelData = stories[level];
  const currentStep = levelData.steps[step];

  /* ---------- HANDLE CHOICES ---------- */

  const handlePositive = async () => {
    setShowWarning(false);

    if (step < levelData.steps.length - 1) {
      setMessage(" Good choice! Let’s continue.");
      setStep(step + 1);
    } else {
      setCompleted(true);
      setMessage("🎉 Great job! You made all the right decisions.");

      //  ADD XP (ONLY HERE)
      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        await updateDoc(userRef, { xp: increment(10) });
      }

      //  UNLOCK NEXT LEVEL
      setUnlocked(prev => {
        if (level === "easy") return { ...prev, medium: true };
        if (level === "medium") return { ...prev, hard: true };
        return prev;
      });
    }
  };

  const handleNegative = () => {
    setShowWarning(true);
    setMessage(
      ` That’s not a good choice.\n${currentStep.negativeFeedback}`
    );
  };

  const retryStep = () => {
    setShowWarning(false);
    setMessage(" Think again and choose wisely.");
  };

  const changeLevel = (lvl) => {
    setLevel(lvl);
    setStep(0);
    setCompleted(false);
    setShowWarning(false);
    setMessage(" New story begins. Choose wisely!");
  };

  return (
    <div style={styles.page}>
      <h2 style={styles.heading}> Story Quest</h2>

      {/* MASCOT */}
      <div style={styles.coachBox}>
        <div style={styles.coachAvatar}>🤖</div>
        <div style={styles.coachMsg}>
          {message.split("\n").map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
      </div>

      {/* LEVEL SELECT */}
      <div style={styles.levelRow}>
        {["easy", "medium", "hard"].map(lvl => (
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

      {/* STORY CARD */}
      <div style={styles.storyCard}>
        {!completed ? (
          <>
            {currentStep.image && (
              <img
                src={currentStep.image}
                alt="story"
                style={styles.storyImage}
              />
            )}

            <p style={styles.storyText}>{currentStep.text}</p>

            {!showWarning ? (
              <div style={styles.btnRow}>
                <button
                  style={{ ...styles.choiceBtn, background: "#06d6a0" }}
                  onClick={handlePositive}
                >
                  ✅ {currentStep.positive}
                </button>

                <button
                  style={{ ...styles.choiceBtn, background: "#ef476f" }}
                  onClick={handleNegative}
                >
                   {currentStep.negative}
                </button>
              </div>
            ) : (
              <button
                style={{ ...styles.choiceBtn, background: "#ffd166" }}
                onClick={retryStep}
              >
                🔄 Try Again
              </button>
            )}
          </>
        ) : (
          <div>
            <h3>🎊 Congratulations!</h3>
            <p>{levelData.ending}</p>
            <p><strong>⭐ +10 XP added</strong></p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoryQuest;

/* ================= STYLES (UNCHANGED UI) ================= */

const styles = {
  page: {
    minHeight: "100vh",
    padding: "40px",
    background: "linear-gradient(135deg,#240046,#5a189a)",
    color: "#fff",
  },
  heading: {
    textAlign: "center",
    fontSize: "36px",
    marginBottom: "20px",
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
    maxWidth: "360px",
  },
  levelRow: {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
    marginBottom: "20px",
  },
  levelBtn: {
    padding: "10px 18px",
    borderRadius: "20px",
    border: "none",
    cursor: "pointer",
    fontWeight: "700",
  },
  storyCard: {
    maxWidth: "650px",
    margin: "0 auto",
    background: "#fff",
    color: "#000",
    padding: "30px",
    borderRadius: "18px",
    textAlign: "center",
  },
  storyImage: {
    maxWidth: "100%",
    height: "180px",
    objectFit: "contain",
    marginBottom: "16px",
  },
  storyText: {
    fontSize: "20px",
    marginBottom: "24px",
    fontWeight: "500",
  },
  btnRow: {
    display: "flex",
    gap: "16px",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  choiceBtn: {
    padding: "14px 18px",
    borderRadius: "14px",
    border: "none",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "700",
    color: "#000",
    minWidth: "260px",
  },
};
