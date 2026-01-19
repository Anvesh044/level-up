import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../services/firebase";

const StudentDashboard = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  // ---------------- UI STATE ----------------
  const [showProfile, setShowProfile] = useState(false);
  const [openTeacherChat, setOpenTeacherChat] = useState(false);
  const [chatText, setChatText] = useState("");
  const [messages, setMessages] = useState([]);

  // ---------------- FIRESTORE DATA ----------------
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(1);
  const [teacherId, setTeacherId] = useState(null);

  // ---------------- DERIVED LEVEL ----------------
  const getLevel = (xp) => {
    if (xp < 100) return "Beginner";
    if (xp < 250) return "Intermediate";
    return "Advanced";
  };

  const level = getLevel(xp);

  // ---------------- XP PROGRESS ----------------
  const getXpProgress = () => {
    if (xp < 100) return (xp / 100) * 100;
    if (xp < 250) return ((xp - 100) / 150) * 100;
    return 100;
  };

  // ---------------- USER NAME ----------------
  const userName = currentUser?.email
    ? currentUser.email.split("@")[0]
    : "Learner";

  // ---------------- NEW vs RETURNING ----------------
  const isNewUser =
    currentUser?.metadata?.creationTime ===
    currentUser?.metadata?.lastSignInTime;

  // ---------------- FIRESTORE INIT + STREAK LOGIC ----------------
  useEffect(() => {
    if (!currentUser) return;

    const initUser = async () => {
      const userRef = doc(db, "users", currentUser.uid);
      const snap = await getDoc(userRef);
      const today = new Date().toDateString();

      if (!snap.exists()) {
        await setDoc(userRef, {
          email: currentUser.email,
          xp: 0,
          streak: 1,
          role: "student",
          teacherId: null,
          gameAccess: {
            choiceQuest: true,
            flashShop: true,
            sentenceShuffle: true,
            wordHunt: true,
            sketchMatch: false,
            echoSpeak: false,
            decisionLab: false,
            quickBurst: true,
            popLogic: false,
            outputOracle: true,
            bugScope: true,
            mindWave: false,
          },
          lastActiveDate: today,
          createdAt: serverTimestamp(),
        });

        setXp(0);
        setStreak(1);
      } else {
        const data = snap.data();
        setXp(data.xp ?? 0);
        setTeacherId(data.teacherId ?? null);

        let newStreak = data.streak ?? 1;
        if (data.lastActiveDate !== today) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);

          newStreak =
            data.lastActiveDate === yesterday.toDateString()
              ? newStreak + 1
              : 1;

          await updateDoc(userRef, {
            streak: newStreak,
            lastActiveDate: today,
          });
        }

        setStreak(newStreak);
      }
    };

    initUser();
  }, [currentUser]);

  // ---------------- CHAT LISTENER ----------------
  useEffect(() => {
    if (!openTeacherChat || !teacherId || !currentUser) return;

    const chatId = `${currentUser.uid}_${teacherId}`;

    const q = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return () => unsub();
  }, [openTeacherChat, teacherId, currentUser]);

  // ---------------- SEND MESSAGE ----------------
  const sendMessage = async () => {
    if (!chatText.trim() || !teacherId) return;

    const chatId = `${currentUser.uid}_${teacherId}`;

    // Ensure parent chat doc exists
    await setDoc(
      doc(db, "chats", chatId),
      {
        studentId: currentUser.uid,
        teacherId,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    await addDoc(collection(db, "chats", chatId, "messages"), {
      senderId: currentUser.uid,
      text: chatText,
      createdAt: serverTimestamp(),
    });

    setChatText("");
  };

  return (
    <div style={styles.page}>
      {/* ---------------- TOP BAR ---------------- */}
      <div style={styles.topBar}>
        <h2 style={styles.logo}>LEVELUP!</h2>

        <div style={{ position: "relative" }}>
          <div
            style={styles.profileIcon}
            onClick={() => setShowProfile(!showProfile)}
          >
            👤
          </div>

          {showProfile && (
            <div style={styles.profileDropdown}>
              <p>
                <strong>{userName}</strong>
              </p>
              <p style={styles.smallText}>{currentUser?.email}</p>
              <button style={styles.logoutBtn} onClick={logout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ---------------- WELCOME ---------------- */}
      <div style={styles.welcomeCard}>
        <h3>
          {isNewUser
            ? `Welcome, ${userName} 👋`
            : `Welcome back, ${userName} 🔥`}
        </h3>

        <p>
          {isNewUser
            ? "Let’s start your learning journey 🚀"
            : "Let’s continue your learning journey"}
        </p>

        <div style={styles.statsRow}>
          <span>🔥 Streak: {streak} day(s)</span>
          <span>⭐ XP: {xp}</span>
          <span>🎯 Level: {level}</span>
        </div>

        <div style={styles.progressWrap}>
          <div style={styles.progressTrack}>
            <div
              style={{
                ...styles.progressFill,
                width: `${getXpProgress()}%`,
              }}
            />
          </div>
        </div>

        <p style={styles.motivation}>
          Consistency beats intensity. Show up today!
        </p>
      </div>

      {/* ---------------- ACTION CARDS ---------------- */}
      <div style={styles.cardRow}>
        <div style={styles.actionCard}>
          <h3>🎮 Gamified Learning</h3>
          <p>
            Learn through games with Easy, Medium & Hard levels. Earn XP as you
            progress.
          </p>
          <button
            style={styles.primaryBtn}
            onClick={() => navigate("/games")}
          >
            Start Playing →
          </button>
        </div>

        <div style={styles.actionCard}>
          <h3>🧠 Quiz Platform</h3>
          <p>
            Participate in Room Code quizzes and AI-powered NLP quizzes to earn
            big XP.
          </p>
          <button
            style={styles.primaryBtn}
            onClick={() => navigate("/quizzes")}
          >
            Take a Quiz →
          </button>
        </div>
      </div>

      {/* ---------------- LIBRARY ---------------- */}
      <div style={styles.libraryCard}>
        <h3>📚 E-Learning Library</h3>
        <p>Access subject-wise PDFs, notes, and learning resources.</p>
        <button
          style={styles.secondaryBtn}
          onClick={() => navigate("/student/library")}
        >
          Open Library →
        </button>
      </div>

           {/* ---------------- FLOATING BOTS ---------------- */}

      {/* 🤖 AI ASSISTANT BOT (NAVIGATES TO NEW PAGE) */}
      <div
        style={styles.aiChat}
        onClick={() => navigate("/ai-assistant")}
        title="AI Assistant"
      >
        🤖
      </div>

      {/* 👨‍🏫 TEACHER CHAT BOT */}
      {teacherId && (
        <div
          style={styles.teacherChat}
          onClick={() => setOpenTeacherChat(true)}
          title="Chat with Teacher"
        >
          👨‍🏫
        </div>
      )}

      {/* ---------------- TEACHER CHAT WINDOW ---------------- */}
      {openTeacherChat && (
        <div style={styles.chatBox}>
          <div style={styles.chatHeader}>
            <strong>Chat with Teacher</strong>
            <span onClick={() => setOpenTeacherChat(false)}>✖</span>
          </div>

          <div style={styles.chatBody}>
            {messages.map((m) => (
              <div
                key={m.id}
                style={{
                  ...styles.chatMsg,
                  alignSelf:
                    m.senderId === currentUser.uid
                      ? "flex-end"
                      : "flex-start",
                  background:
                    m.senderId === currentUser.uid ? "#7f3fbf" : "#eee",
                  color:
                    m.senderId === currentUser.uid ? "#fff" : "#000",
                }}
              >
                {m.text}
              </div>
            ))}
          </div>

          <div style={styles.chatInput}>
            <input
              value={chatText}
              onChange={(e) => setChatText(e.target.value)}
              placeholder="Type message..."
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}

    </div>
  );
};

export default StudentDashboard;

/* ====================== STYLES ====================== */
const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #5b2b82, #7f3fbf)",
    padding: "20px",
    color: "#fff",
    fontFamily: "Arial, sans-serif",
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logo: { margin: 0, fontWeight: "bold" },
  profileIcon: {
    cursor: "pointer",
    fontSize: "22px",
    background: "#fff",
    color: "#5b2b82",
    borderRadius: "50%",
    padding: "8px",
  },
  profileDropdown: {
    position: "absolute",
    right: 0,
    top: "40px",
    background: "#fff",
    color: "#333",
    padding: "12px",
    borderRadius: "8px",
    width: "200px",
  },
  logoutBtn: {
    marginTop: "10px",
    width: "100%",
    padding: "8px",
    border: "none",
    borderRadius: "6px",
    background: "#5b2b82",
    color: "#fff",
    cursor: "pointer",
  },
  smallText: { fontSize: "12px", color: "#555" },
  welcomeCard: {
    marginTop: "20px",
    background: "rgba(255,255,255,0.15)",
    padding: "20px",
    borderRadius: "12px",
  },
  statsRow: {
    display: "flex",
    gap: "20px",
    marginTop: "10px",
    flexWrap: "wrap",
  },
  progressWrap: { marginTop: "14px" },
  progressTrack: {
    width: "100%",
    height: "10px",
    background: "rgba(255,255,255,0.3)",
    borderRadius: "10px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    background: "linear-gradient(90deg, #ffd166, #06d6a0)",
    borderRadius: "10px",
  },
  motivation: { marginTop: "10px", fontStyle: "italic" },
  cardRow: {
    display: "flex",
    gap: "20px",
    marginTop: "30px",
    flexWrap: "wrap",
  },
  actionCard: {
    flex: 1,
    minWidth: "260px",
    background: "#fff",
    color: "#333",
    padding: "20px",
    borderRadius: "12px",
  },
  primaryBtn: {
    marginTop: "10px",
    padding: "10px",
    width: "100%",
    background: "#7f3fbf",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  libraryCard: {
    marginTop: "30px",
    background: "#fff",
    color: "#333",
    padding: "20px",
    borderRadius: "12px",
  },
  secondaryBtn: {
    marginTop: "10px",
    padding: "10px",
    background: "#5b2b82",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  aiChat: {
  position: "fixed",
  bottom: "30px",
  right: "30px",
  width: "56px",
  height: "56px",
  borderRadius: "50%",
  background: "#7f3fbf",
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "26px",
  cursor: "pointer",
  zIndex: 1000,
},

teacherChat: {
  position: "fixed",
  bottom: "100px", // 👈 IMPORTANT (STACKED ABOVE AI)
  right: "30px",
  width: "56px",
  height: "56px",
  borderRadius: "50%",
  background: "#ff9800",
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "26px",
  cursor: "pointer",
  zIndex: 1000,
},

  chatBox: {
    position: "fixed",
    bottom: "130px",
    right: "20px",
    width: "320px",
    height: "420px",
    background: "#fff",
    borderRadius: "14px",
    display: "flex",
    flexDirection: "column",
    zIndex: 9999,
  },
  chatHeader: {
    padding: "10px",
    borderBottom: "1px solid #ddd",
    display: "flex",
    justifyContent: "space-between",
    color: "#000",
  },
  chatBody: {
    flex: 1,
    padding: "10px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    overflowY: "auto",
  },
  chatMsg: {
    padding: "8px 12px",
    borderRadius: "12px",
    maxWidth: "75%",
  },
  chatInput: {
    display: "flex",
    gap: "8px",
    padding: "10px",
  },
};
