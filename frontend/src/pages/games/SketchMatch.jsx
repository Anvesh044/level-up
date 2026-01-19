import { useEffect, useRef, useState } from "react";
import data from "../../data/sketchMatch.json";
import { doc, updateDoc, increment } from "firebase/firestore";
import { db } from "../../services/firebase";
import { useAuth } from "../../context/useAuth";

const SketchMatch = () => {
  const { currentUser } = useAuth();
  const canvasRef = useRef(null);

  // ---------------- LEVEL STATE ----------------
  const [level, setLevel] = useState("easy");
  const [unlocked, setUnlocked] = useState({
    easy: true,
    medium: false,
    hard: false,
  });
  const [index, setIndex] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [xpAdded, setXpAdded] = useState(false);

  // ---------------- UI STATE ----------------
  const [message, setMessage] = useState(" Draw the object shown!");
  const [penColor, setPenColor] = useState("#000000");
  const [penSize, setPenSize] = useState(4);
  const [eraser, setEraser] = useState(false);

  // ⭐ XP POPUP
  const [showXpPopup, setShowXpPopup] = useState(false);
  const [xpGained, setXpGained] = useState(0);

  const item = data[level][index];

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

  /* ---------- CANVAS DRAW ---------- */
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let drawing = false;

    const start = () => (drawing = true);
    const stop = () => {
      drawing = false;
      ctx.beginPath();
    };

    const draw = (e) => {
      if (!drawing) return;
      ctx.lineWidth = penSize;
      ctx.lineCap = "round";
      ctx.strokeStyle = eraser ? "#ffffff" : penColor;
      ctx.lineTo(e.offsetX, e.offsetY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(e.offsetX, e.offsetY);
    };

    canvas.addEventListener("mousedown", start);
    canvas.addEventListener("mouseup", stop);
    canvas.addEventListener("mousemove", draw);

    return () => {
      canvas.removeEventListener("mousedown", start);
      canvas.removeEventListener("mouseup", stop);
      canvas.removeEventListener("mousemove", draw);
    };
  }, [penColor, penSize, eraser]);

  /* ---------- CLEAR CANVAS ---------- */
  const clearCanvas = () => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, 300, 300);
  };

  /* ---------- FAIR EVALUATION ---------- */
  const evaluateDrawing = () => {
    const ctx = canvasRef.current.getContext("2d");
    const imageData = ctx.getImageData(0, 0, 300, 300).data;
    let drawnPixels = 0;

    for (let i = 0; i < imageData.length; i += 4) {
      if (imageData[i + 3] > 0) drawnPixels++;
    }
    return drawnPixels > 5000;
  };

  /* ---------- CHECK DRAWING ---------- */
  const checkDrawing = async () => {
    if (!evaluateDrawing()) {
      setMessage(" Try again! Draw more clearly.");
      return;
    }

    setMessage(`🎉 Nice! That looks like a ${item.label}`);
    clearCanvas();

    if (index + 1 < data[level].length) {
      setIndex(index + 1);
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
  };

  /* ---------- CHANGE LEVEL ---------- */
  const changeLevel = (lvl) => {
    if (!unlocked[lvl]) return;
    setLevel(lvl);
    setIndex(0);
    setCompleted(false);
    setXpAdded(false);
    clearCanvas();
    setMessage(" Draw the object shown!");
  };

  return (
    <div style={styles.page}>
      <h2> Sketch Match</h2>

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
          <h3 style={{ fontSize: "42px" }}>
            Draw this: {item.emoji}
          </h3>
          <p>{item.label}</p>

          {/* TOOLS */}
          <div style={styles.tools}>
            <label>
              🎨
              <input
                type="color"
                value={penColor}
                onChange={(e) => {
                  setPenColor(e.target.value);
                  setEraser(false);
                }}
              />
            </label>

            <label>
              ✏️
              <input
                type="range"
                min="2"
                max="10"
                value={penSize}
                onChange={(e) => setPenSize(e.target.value)}
              />
            </label>

            <button onClick={() => setEraser(true)}>🧽</button>
          </div>

          {/* CANVAS */}
          <canvas
            ref={canvasRef}
            width={300}
            height={300}
            style={styles.canvas}
          />

          <div style={{ marginTop: "12px" }}>
            <button style={styles.btn} onClick={checkDrawing}>
              ✅ Check
            </button>
            <button style={styles.btn} onClick={clearCanvas}>
              🧹 Clear
            </button>
          </div>

          <p>
            {index + 1} / {data[level].length} completed
          </p>
        </>
      )}

      {completed && <p> Move to the next level!</p>}

      {/* XP POPUP */}
      {showXpPopup && (
        <div style={styles.xpPopup}>
          ⭐ +{xpGained} XP
        </div>
      )}
    </div>
  );
};

export default SketchMatch;

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
  tools: {
    display: "flex",
    justifyContent: "center",
    gap: "12px",
    marginBottom: "10px",
  },
  canvas: {
    background: "#fff",
    borderRadius: "12px",
    cursor: "crosshair",
    marginTop: "12px",
  },
  btn: {
    margin: "6px",
    padding: "10px 16px",
    borderRadius: "10px",
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
