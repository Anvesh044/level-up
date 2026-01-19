# 🚀 LevelUp – Gamified Learning Platform

LevelUp is a **gamified learning and assessment platform** built for students and teachers, combining **learning resources, quizzes, games, AI assistance, analytics, and secure assessments** into one scalable system.

This project was built as part of **HackCrypt Hackathon** 🏆.

---

## 🌟 Key Features

### 👩‍🎓 Student Features
- Secure authentication (Firebase)
- Gamified learning with:
  - Interactive games
  - Quizzes & challenges
- XP-based progression system
- Story-based decision games
- Resource library (E-Library)
- AI assistant (Pica 🐥) with voice guidance
- Final assessment & certificate generation

---

### 🧑‍🏫 Teacher Features
- Student management dashboard
- Performance analytics (charts & stats)
- XP tracking
- Game access control
- Real-time chat with students
- Institutional overview

---

### 🧠 Final Assessment System
- 50 MCQ questions divided into:
  - Section A: 10 questions
  - Section B: 15 questions
  - Section C: 25 questions
- Timer-based exam
- Tab-switch & copy detection
- Screenshot prevention (best-effort client side)
- Camera-based proctoring (browser permissions)
- Auto-evaluation
- Certificate generation on passing score

---

### 🌍 Scalability & Accessibility
- Multi-language support (i18n)
  - English
  - Hindi
  - Kannada
  - Tamil
  - Telugu
  - Marathi
- Language switcher available globally
- Fully responsive UI

---

## 🐥 Pica – AI Mascot
- Appears across the platform as a guide
- Context-aware messages per page
- Voice assistance (Speech Synthesis API)
- Emotion-based animations
- Automatically hidden during exams

---

## 🛠️ Tech Stack

### Frontend
- React + Vite
- React Router
- Context API
- Recharts (analytics)
- i18next (internationalization)

### Backend / Services
- Firebase Authentication
- Firebase Firestore
- Firebase Hosting (optional)

### Utilities
- jsPDF (certificate generation)
- Browser APIs (camera, visibility, speech)

---

## 📂 Project Structure

```text
src/
├─ pages/
│  ├─ AuthPage.jsx
│  ├─ StudentDashboard.jsx
│  ├─ TeacherDashboard.jsx
│  ├─ Instructions.jsx
│  ├─ FinalAssessment.jsx
│  ├─ Certificate.jsx
│
├─ data/
│  ├─ questions.json
│  ├─ storyQuestLevels.json
│
├─ utils/
│  ├─ proctoring.js
│  ├─ certificateGenerator.js
│
├─ pica/
│  ├─ PicaProvider.jsx
│  ├─ PicaMascot.jsx
│
├─ styles/
│  ├─ exam.css
│
├─ context/
│  ├─ useAuth.jsx
│
├─ services/
│  ├─ firebase.js
│  ├─ api.js
