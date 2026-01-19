import { useEffect, useState } from "react";
import levels from "../../data/wordhuntLevels.json";
import { doc, updateDoc, increment } from "firebase/firestore";
import { db } from "../../services/firebase";
import { useAuth } from "../../context/useAuth";

/* 8 STRAIGHT DIRECTIONS */
const directions = [
  [0, 1], [0, -1], [1, 0], [-1, 0],
  [1, 1], [-1, -1], [1, -1], [-1, 1],
];

const WordHunt = () => {
  const { currentUser } = useAuth();

  const [level, setLevel] = useState("easy");
  const [unlocked, setUnlocked] = useState({
    easy: true,
    medium: false,
    hard: false,
  });

  const [grid, setGrid] = useState([]);
  const [foundWords, setFoundWords] = useState([]);
  const [selected, setSelected] = useState([]);
  const [direction, setDirection] = useState(null);
  const [message, setMessage] = useState(" Are you ready? Let’s start!");
  const [levelCompleted, setLevelCompleted] = useState(false);
  const [xpAdded, setXpAdded] = useState(false);

  // ⭐ XP POPUP
  const [showXpPopup, setShowXpPopup] = useState(false);
  const [xpGained, setXpGained] = useState(0);

  const levelData = levels[level];
  const currentWord = selected.map(l => l.letter).join("");

  /* ---------- XP PER LEVEL ---------- */
  const getXpForLevel = () => {
    if (level === "easy") return 10;
    if (level === "medium") return 15;
    return 20;
  };

  /* ---------- PROGRESS ---------- */
  const progress = Math.round(
    (foundWords.length / levelData.words.length) * 100
  );

  /* ---------- GRID GENERATION ---------- */
  const generateGrid = () => {
    const size = levelData.size;
    const grid = Array(size).fill(null).map(() => Array(size).fill(""));

    const placeWord = (word) => {
      for (let attempt = 0; attempt < 300; attempt++) {
        const [dx, dy] = directions[Math.floor(Math.random() * directions.length)];
        const r = Math.floor(Math.random() * size);
        const c = Math.floor(Math.random() * size);

        let fits = true;
        for (let i = 0; i < word.length; i++) {
          const nr = r + i * dx;
          const nc = c + i * dy;
          if (
            nr < 0 || nc < 0 ||
            nr >= size || nc >= size ||
            (grid[nr][nc] && grid[nr][nc] !== word[i])
          ) {
            fits = false;
            break;
          }
        }
        if (!fits) continue;

        for (let i = 0; i < word.length; i++) {
          grid[r + i * dx][c + i * dy] = word[i];
        }
        return;
      }
    };

    levelData.words.forEach(placeWord);

    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (!grid[i][j]) {
          grid[i][j] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
        }
      }
    }

    setGrid(grid);
  };

  useEffect(() => {
    generateGrid();
    setFoundWords([]);
    setSelected([]);
    setDirection(null);
    setLevelCompleted(false);
    setXpAdded(false);
    setMessage(" Find the words shown on the right!");
  }, [level]);

  /* ---------- CELL SELECT ---------- */
  const selectCell = (r, c) => {
    if (selected.some(s => s.r === r && s.c === c)) return;

    const last = selected[selected.length - 1];

    if (!last) {
      setSelected([{ r, c, letter: grid[r][c] }]);
      return;
    }

    const dx = r - last.r;
    const dy = c - last.c;

    if (Math.abs(dx) > 1 || Math.abs(dy) > 1) return;

    const newDir = [Math.sign(dx), Math.sign(dy)];

    if (!direction) setDirection(newDir);
    else if (direction[0] !== newDir[0] || direction[1] !== newDir[1]) return;

    setSelected([...selected, { r, c, letter: grid[r][c] }]);
  };

  /* ---------- CHECK WORD ---------- */
  const checkWord = () => {
    if (levelData.words.includes(currentWord) && !foundWords.includes(currentWord)) {
      setFoundWords([...foundWords, currentWord]);
      setMessage(` Excellent! "${currentWord}" found`);
    } else {
      setMessage("❌ Invalid word. Try again!");
    }
    setSelected([]);
    setDirection(null);
  };

  /* ---------- LEVEL COMPLETE ---------- */
  useEffect(() => {
    if (
      foundWords.length === levelData.words.length &&
      !levelCompleted &&
      !xpAdded
    ) {
      setLevelCompleted(true);

      const xp = getXpForLevel();
      setMessage(`🎉 Level completed! +${xp} XP`);

      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        updateDoc(userRef, { xp: increment(xp) });
      }

      setXpGained(xp);
      setShowXpPopup(true);
      setTimeout(() => setShowXpPopup(false), 2000);
      setXpAdded(true);

      setUnlocked(prev => {
        if (level === "easy") return { ...prev, medium: true };
        if (level === "medium") return { ...prev, hard: true };
        return prev;
      });
    }
  }, [foundWords]);

  /* ---------- UI ---------- */
  return (
    <div style={styles.page}>
      <h2 style={styles.heading}> Word Hunt</h2>

      <div style={styles.coachBox}>
        <div style={styles.coachAvatar}>🤖</div>
        <div style={styles.coachMsg}>{message}</div>
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
              filter: unlocked[lvl] ? "none" : "blur(1px)",
            }}
            onClick={() => setLevel(lvl)}
          >
            {lvl.toUpperCase()}
          </button>
        ))}
      </div>

      {/* PROGRESS */}
      <div style={styles.progressWrap}>
        <div
          style={{
            ...styles.progressFill,
            width: `${progress}%`,
          }}
        />
      </div>

      <div style={styles.gameArea}>
        <div
          style={{
            ...styles.grid,
            gridTemplateColumns: `repeat(${levelData.size}, 42px)`,
          }}
        >
          {grid.map((row, r) =>
            row.map((letter, c) => (
              <div
                key={`${r}-${c}`}
                style={{
                  ...styles.cell,
                  background: selected.some(s => s.r === r && s.c === c)
                    ? "#ffd166"
                    : "#fff",
                }}
                onClick={() => selectCell(r, c)}
              >
                {letter}
              </div>
            ))
          )}
        </div>

        <div style={styles.panel}>
          <h4>Words to Find</h4>
          <ul>
            {levelData.words.map(w => (
              <li
                key={w}
                style={{
                  textDecoration: foundWords.includes(w)
                    ? "line-through"
                    : "none",
                }}
              >
                {w}
              </li>
            ))}
          </ul>

          <p><strong>{currentWord || "—"}</strong></p>

          <button onClick={checkWord} style={styles.checkBtn}>
            Check Word
          </button>
        </div>
      </div>

      {/* XP POPUP */}
      {showXpPopup && (
        <div style={styles.xpPopup}>⭐ +{xpGained} XP</div>
      )}
    </div>
  );
};

export default WordHunt;

/* ---------- STYLES ---------- */

const styles = {
  page: {
    minHeight: "100vh",
    padding: "40px",
    background: "linear-gradient(135deg,#240046,#5a189a)",
    color: "#fff",
  },
  heading: { textAlign: "center", fontSize: "36px" },
  coachBox: { display: "flex", justifyContent: "center", gap: "16px", marginBottom: "20px" },
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
    maxWidth: "340px",
  },
  levelRow: { display: "flex", justifyContent: "center", gap: "10px", marginBottom: "20px" },
  levelBtn: { padding: "10px 18px", borderRadius: "20px", border: "none", fontWeight: "700" },
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
  gameArea: { display: "flex", justifyContent: "center", gap: "40px", flexWrap: "wrap" },
  grid: { display: "grid", gap: "6px" },
  cell: {
    width: "42px",
    height: "42px",
    borderRadius: "8px",
    color: "#000",
    fontWeight: "800",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
  },
  panel: {
    background: "#fff",
    color: "#000",
    padding: "20px",
    borderRadius: "14px",
    width: "220px",
  },
  checkBtn: {
    marginTop: "10px",
    width: "100%",
    padding: "10px",
    borderRadius: "10px",
    border: "none",
    background: "#06d6a0",
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
