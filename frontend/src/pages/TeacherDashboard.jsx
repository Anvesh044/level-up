import { useEffect, useState } from "react";
import { useAuth } from "../context/useAuth";
import { getStudentsOfTeacher, getUserRole } from "../services/api";
import { useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../services/firebase";

/* 📊 CHARTS */
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const TeacherDashboard = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [institution, setInstitution] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [loading, setLoading] = useState(true);

  /* 💬 CHAT STATE */
  const [openChat, setOpenChat] = useState(false);
  const [messages, setMessages] = useState([]);
  const [chatText, setChatText] = useState("");

  const teacherName = currentUser?.email?.split("@")[0] || "Teacher";

  /* ---------------- TOGGLE GAME ---------------- */
  const toggleGame = async (firebaseUid, gameKey, value) => {
    const ref = doc(db, "users", firebaseUid);
    await updateDoc(ref, { [`gameAccess.${gameKey}`]: value });

    setStudents((prev) =>
      prev.map((s) =>
        s.firebaseUid === firebaseUid
          ? { ...s, gameAccess: { ...s.gameAccess, [gameKey]: value } }
          : s
      )
    );

    if (selectedStudent?.firebaseUid === firebaseUid) {
      setSelectedStudent((prev) => ({
        ...prev,
        gameAccess: { ...prev.gameAccess, [gameKey]: value },
      }));
    }
  };

  /* ---------------- INIT ---------------- */
  useEffect(() => {
    if (!currentUser) return navigate("/login");

    const init = async () => {
      const roleRes = await getUserRole(currentUser.uid);
      if (roleRes.data.role !== "teacher") return logout();

      const res = await getStudentsOfTeacher(currentUser.uid);
      setInstitution(res.data.institution);

      const enriched = await Promise.all(
        res.data.students.map(async (s) => {
          const snap = await getDoc(doc(db, "users", s.firebaseUid));
          return {
            ...s,
            gameAccess: snap.exists() ? snap.data().gameAccess || {} : {},
            xp: snap.data()?.xp || 0,
          };
        })
      );

      setStudents(enriched);
      setLoading(false);
    };

    init();
  }, [currentUser]);

  /* ---------------- CHAT LISTENER ---------------- */
  useEffect(() => {
    if (!openChat || !selectedStudent) return;

    const chatId = `${selectedStudent.firebaseUid}_${currentUser.uid}`;
    const q = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return () => unsub();
  }, [openChat, selectedStudent]);

  /* ---------------- SEND MESSAGE ---------------- */
  const sendMessage = async () => {
    if (!chatText.trim() || !selectedStudent) return;

    const chatId = `${selectedStudent.firebaseUid}_${currentUser.uid}`;
    await addDoc(collection(db, "chats", chatId, "messages"), {
      senderId: currentUser.uid,
      text: chatText,
      createdAt: serverTimestamp(),
    });

    setChatText("");
  };

  /* 📊 DERIVED DATA */
  const performanceData = students.map((s) => ({
    name: s.name,
    xp: s.xp || 0,
  }));

  const gameStats = selectedStudent
    ? Object.entries(selectedStudent.gameAccess).map(([g, v]) => ({
        name: g,
        value: v ? 1 : 0,
      }))
    : [];

  if (loading) return <p style={styles.center}>Loading...</p>;

  return (
    <div style={styles.page}>
      {/* TOP BAR */}
      <div style={styles.topBar}>
        <h2>LEVELUP — Teacher</h2>
        <div style={{ position: "relative" }}>
          <div
            style={styles.profileIcon}
            onClick={() => setShowProfile(!showProfile)}
          >
            👨‍🏫
          </div>
          {showProfile && (
            <div style={styles.profileDropdown}>
              <strong>{teacherName}</strong>
              <p style={styles.muted}>{currentUser.email}</p>
              <button style={styles.logoutBtn} onClick={logout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* BANNER */}
      <div style={styles.banner}>
        <h3>Welcome back, {teacherName}</h3>
        <p>{institution} • {students.length} students</p>
      </div>

      {/* PERFORMANCE */}
      <div style={styles.panel}>
        <h4 style={styles.panelTitle}>Student Performance</h4>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={performanceData} margin={{ left: -20 }}>
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#ddd", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#ddd", fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                background: "#1f2937",
                border: "none",
                borderRadius: "8px",
                color: "#fff",
              }}
            />
            <Bar
              dataKey="xp"
              fill="#a78bfa"
              radius={[6, 6, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* MAIN GRID */}
      <div style={styles.mainGrid}>
        {/* STUDENT LIST */}
        <div style={styles.leftPanel}>
          <h4>Students</h4>
          <div style={styles.studentList}>
            {students.map((s, i) => (
              <div
                key={s.firebaseUid}
                style={styles.studentRow}
                onClick={() => setSelectedStudent(s)}
              >
                <span>{i + 1}</span>
                <strong>{s.name}</strong>
                <span>{s.xp} XP</span>
              </div>
            ))}
          </div>
        </div>

        {/* DETAILS */}
        <div style={styles.rightPanel}>
          {selectedStudent ? (
            <>
              <h4>{selectedStudent.name}</h4>

              <div style={styles.detailGrid}>
                <div style={styles.statBox}>
                  <p>Total XP</p>
                  <h2>{selectedStudent.xp}</h2>
                </div>

                <div style={styles.statBox}>
                  <p>Game Access</p>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie
                        data={gameStats}
                        dataKey="value"
                        innerRadius={40}
                        outerRadius={60}
                      >
                        {gameStats.map((_, i) => (
                          <Cell
                            key={i}
                            fill={gameStats[i].value ? "#22c55e" : "#e5e7eb"}
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <h4>Game Access Control</h4>
              <div style={styles.gameGrid}>
                {Object.entries(selectedStudent.gameAccess).map(
                  ([game, allowed]) => (
                    <label key={game} style={styles.toggle}>
                      <input
                        type="checkbox"
                        checked={allowed}
                        onChange={(e) =>
                          toggleGame(
                            selectedStudent.firebaseUid,
                            game,
                            e.target.checked
                          )
                        }
                      />
                      {game}
                    </label>
                  )
                )}
              </div>
            </>
          ) : (
            <p style={styles.muted}>Select a student to view details</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;

/* ================= STYLES ================= */

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg,#4c1d95,#6d28d9)",
    padding: "24px",
    color: "#fff",
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "16px",
  },
  profileIcon: {
    background: "#fff",
    color: "#4c1d95",
    padding: "8px",
    borderRadius: "50%",
    cursor: "pointer",
  },
  profileDropdown: {
    position: "absolute",
    right: 0,
    top: "40px",
    background: "#fff",
    color: "#000",
    padding: "12px",
    borderRadius: "10px",
    minWidth: "180px",
  },
  logoutBtn: {
    marginTop: "8px",
    width: "100%",
  },
  banner: {
    background: "rgba(255,255,255,0.12)",
    padding: "20px",
    borderRadius: "16px",
    marginBottom: "24px",
  },
  panel: {
    background: "rgba(255,255,255,0.12)",
    borderRadius: "16px",
    padding: "20px",
    marginBottom: "28px",
  },
  panelTitle: {
    marginBottom: "12px",
  },
  mainGrid: {
    display: "grid",
    gridTemplateColumns: "320px 1fr",
    gap: "24px",
  },
  leftPanel: {
    background: "rgba(255,255,255,0.12)",
    borderRadius: "16px",
    padding: "16px",
  },
  studentList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginTop: "12px",
  },
  studentRow: {
    display: "grid",
    gridTemplateColumns: "30px 1fr 60px",
    background: "#ede9fe",
    color: "#000",
    padding: "10px",
    borderRadius: "10px",
    cursor: "pointer",
    alignItems: "center",
  },
  rightPanel: {
    background: "#fff",
    color: "#000",
    borderRadius: "16px",
    padding: "20px",
  },
  detailGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
    marginBottom: "20px",
  },
  statBox: {
    background: "#f5f3ff",
    borderRadius: "14px",
    padding: "16px",
    textAlign: "center",
  },
  gameGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4,1fr)",
    gap: "10px",
  },
  toggle: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "0.9rem",
  },
  muted: {
    opacity: 0.7,
    fontSize: "0.9rem",
  },
  center: {
    textAlign: "center",
    padding: "40px",
  },
};
