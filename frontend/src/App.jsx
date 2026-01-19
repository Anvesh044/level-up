import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation
} from "react-router-dom";

import { useAuth } from "./context/useAuth";
import "./i18n";

// 🐥 PICA
import PicaProvider from "./pica/PicaProvider";
import PicaMascot from "./pica/PicaMascot";

// Exam Pages
import Instructions from "./pages/Instructions";
import FinalAssessment from "./pages/FinalAssessment";
import Certificate from "./pages/Certificate";

// Auth & Core Pages
import AuthPage from "./pages/AuthPage";
import SignupStudent from "./Auth/SignupStudent";
import SignupTeacher from "./Auth/SignUpTeacher";
import Login from "./Auth/Login";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentLibrary from "./pages/StudentLibrary";
import AIAssistant from "./pages/AIAssistant";

// Main Feature Pages
import GamesHome from "./pages/GamesHome";
import QuizHome from "./pages/QuizHome";

// Quizzes
import RoomCodeQuiz from "./pages/quizzes/RoomCodeQuiz";
import NLPQuiz from "./pages/NLPQuiz";
import CreateRoom from "./pages/quizzes/CreateRoom";
import JoinRoom from "./pages/quizzes/JoinRoom";
import QuizPlay from "./pages/quizzes/QuizPlay";
import Leaderboard from "./pages/quizzes/Leaderboard";

// Games
import ChoiceQuest from "./pages/games/ChoiceQuest";
import FlashShop from "./pages/games/FlashShop";
import SentenceShuffle from "./pages/games/SentenceShuffle";
import WordHunt from "./pages/games/WordHunt";
import SketchMatch from "./pages/games/SketchMatch";
import EchoSpeak from "./pages/games/EchoSpeak";
import DecisionLab from "./pages/games/DecisionLab";
import QuickBurst from "./pages/games/QuickBurst";
import PopLogic from "./pages/games/PopLogic";
import OutputOracle from "./pages/games/OutputOracle";
import BugScope from "./pages/games/BugScope";
import MindWave from "./pages/games/MindWave";
import FinalTest from "./pages/games/FinalTest";

/* 🔐 PROTECTED ROUTE */
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  if (loading) return <div style={{ padding: "30px" }}>Loading...</div>;
  return currentUser ? children : <Navigate to="/" replace />;
};

/* 🧠 ROUTE HANDLER */
const AppRoutes = () => {
  const location = useLocation();

  const examRoutes = [
    "/instructions",
    "/final-assessment",
    "/certificate",
  ];

  const isExamRoute = examRoutes.includes(location.pathname);

  // 🧪 EXAM ROUTES (NO PICA AT ALL)
  if (isExamRoute) {
    return (
      <Routes>
        <Route path="/instructions" element={<ProtectedRoute><Instructions /></ProtectedRoute>} />
        <Route path="/final-assessment" element={<ProtectedRoute><FinalAssessment /></ProtectedRoute>} />
        <Route path="/certificate" element={<ProtectedRoute><Certificate /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  // ✅ NORMAL APP (WITH PICA)
  return (
    <PicaProvider>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup-student" element={<SignupStudent />} />
        <Route path="/signup-teacher" element={<SignupTeacher />} />

        <Route path="/student-dashboard" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
        <Route path="/student/library" element={<ProtectedRoute><StudentLibrary /></ProtectedRoute>} />
        <Route path="/ai-assistant" element={<ProtectedRoute><AIAssistant /></ProtectedRoute>} />
        <Route path="/teacher-dashboard" element={<ProtectedRoute><TeacherDashboard /></ProtectedRoute>} />

        <Route path="/games" element={<ProtectedRoute><GamesHome /></ProtectedRoute>} />
        <Route path="/games/choice-quest" element={<ProtectedRoute><ChoiceQuest /></ProtectedRoute>} />
        <Route path="/games/flash-shop" element={<ProtectedRoute><FlashShop /></ProtectedRoute>} />
        <Route path="/games/sentence-shuffle" element={<ProtectedRoute><SentenceShuffle /></ProtectedRoute>} />
        <Route path="/games/word-hunt" element={<ProtectedRoute><WordHunt /></ProtectedRoute>} />
        <Route path="/games/sketch-match" element={<ProtectedRoute><SketchMatch /></ProtectedRoute>} />
        <Route path="/games/echo-speak" element={<ProtectedRoute><EchoSpeak /></ProtectedRoute>} />
        <Route path="/games/decision-lab" element={<ProtectedRoute><DecisionLab /></ProtectedRoute>} />
        <Route path="/games/quick-burst" element={<ProtectedRoute><QuickBurst /></ProtectedRoute>} />
        <Route path="/games/pop-logic" element={<ProtectedRoute><PopLogic /></ProtectedRoute>} />
        <Route path="/games/output-oracle" element={<ProtectedRoute><OutputOracle /></ProtectedRoute>} />
        <Route path="/games/bug-scope" element={<ProtectedRoute><BugScope /></ProtectedRoute>} />
        <Route path="/games/mind-wave" element={<ProtectedRoute><MindWave /></ProtectedRoute>} />
        <Route path="/games/final-test" element={<ProtectedRoute><FinalTest /></ProtectedRoute>} />

        <Route path="/quizzes" element={<ProtectedRoute><QuizHome /></ProtectedRoute>} />
        <Route path="/quizzes/room-code" element={<ProtectedRoute><RoomCodeQuiz /></ProtectedRoute>} />
        <Route path="/quizzes/nlp" element={<ProtectedRoute><NLPQuiz /></ProtectedRoute>} />
        <Route path="/quizzes/room-code/create" element={<ProtectedRoute><CreateRoom /></ProtectedRoute>} />
        <Route path="/quizzes/room-code/join" element={<ProtectedRoute><JoinRoom /></ProtectedRoute>} />
        <Route path="/quizzes/room-code/play/:roomId" element={<ProtectedRoute><QuizPlay /></ProtectedRoute>} />
        <Route path="/quizzes/room-code/leaderboard/:roomCode" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <PicaMascot />
    </PicaProvider>
  );
};

export default function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}
