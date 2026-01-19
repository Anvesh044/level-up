import React, { useEffect, useState } from "react";

const CATEGORY_MAP = {
  "Computer Science": 18,
  Mathematics: 19,
  Science: 17,
  "General Knowledge": 9,
};

const TOTAL_TIME = 15;

const TriviaQuiz = () => {
  // USER CONTROLS
  const [amount, setAmount] = useState(5);
  const [category, setCategory] = useState(18);
  const [difficulty, setDifficulty] = useState("");

  // QUIZ STATE
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);

  // TIMER
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [totalTime, setTotalTime] = useState(0);

  // FLAGS
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizEnded, setQuizEnded] = useState(false);
  const [disabled, setDisabled] = useState(false);

  /* ================= TIMER ================= */
  useEffect(() => {
    if (!quizStarted || quizEnded || !questions.length) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === 1) {
          handleAnswer(null);
          return TOTAL_TIME;
        }
        return prev - 1;
      });
      setTotalTime((t) => t + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [quizStarted, quizEnded, currentIndex]);

  /* ================= OPTIONS (STABLE) ================= */
  useEffect(() => {
    if (!questions.length) return;

    const q = questions[currentIndex];
    const shuffled = [...q.incorrect_answers, q.correct_answer].sort(
      () => Math.random() - 0.5
    );

    setOptions(shuffled);
  }, [currentIndex, questions]);

  /* ================= FETCH ================= */
  const startQuiz = async () => {
    setQuizStarted(false);
    setQuizEnded(false);

    let url = `https://opentdb.com/api.php?amount=${amount}&category=${category}&type=multiple`;
    if (difficulty) url += `&difficulty=${difficulty}`;

    const res = await fetch(url);
    const data = await res.json();

    if (data.response_code !== 0) {
      alert("Not enough questions available");
      return;
    }

    setQuestions(data.results);
    setCurrentIndex(0);
    setScore(0);
    setAnswers([]);
    setTimeLeft(TOTAL_TIME);
    setTotalTime(0);
    setSelected(null);
    setDisabled(false);

    setQuizStarted(true);
  };

  /* ================= ANSWER ================= */
  const handleAnswer = (option) => {
    if (disabled) return;

    setDisabled(true);
    setSelected(option);

    const q = questions[currentIndex];
    const correct = q.correct_answer;
    const isCorrect = option === correct;

    if (isCorrect) setScore((s) => s + 1);

    setAnswers((prev) => [
      ...prev,
      { question: q.question, selected: option, correct, isCorrect },
    ]);

    setTimeout(() => {
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex((i) => i + 1);
        setTimeLeft(TOTAL_TIME);
        setSelected(null);
        setDisabled(false);
      } else {
        setQuizEnded(true);
      }
    }, 900);
  };

  /* ================= START SCREEN ================= */
  if (!quizStarted) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <h1>🧠 Trivia Quiz</h1>

          <div style={styles.formRow}>
            <label>Questions</label>
            <input type="number" min="1" max="20" value={amount}
              onChange={(e) => setAmount(e.target.value)} />
          </div>

          <div style={styles.formRow}>
            <label>Topic</label>
            <select onChange={(e) => setCategory(Number(e.target.value))}>
              {Object.entries(CATEGORY_MAP).map(([name, id]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </select>
          </div>

          <div style={styles.formRow}>
            <label>Difficulty</label>
            <select onChange={(e) => setDifficulty(e.target.value)}>
              <option value="">Any</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <button style={styles.startBtn} onClick={startQuiz}>
            🚀 Start Quiz
          </button>
        </div>
      </div>
    );
  }

  /* ================= RESULT ================= */
  if (quizEnded) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <h1>📊 Quiz Summary</h1>
          <p>Score: <strong>{score}</strong> / {questions.length}</p>
          <p>⏱ Time Taken: {totalTime}s</p>

          <hr />

          {answers.map((a, i) => (
            <div key={i} style={styles.resultCard}>
              <p dangerouslySetInnerHTML={{ __html: a.question }} />
              <p>
                Your Answer:{" "}
                <span style={{ color: a.isCorrect ? "#22c55e" : "#ef4444" }}>
                  {a.selected || "No Answer"}
                </span>
              </p>
              {!a.isCorrect && (
                <p style={{ color: "#38bdf8" }}>
                  Correct: {a.correct}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ================= QUESTION ================= */
  const currentQ = questions[currentIndex];
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const progress = (timeLeft / TOTAL_TIME) * circumference;

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2>
          Question {currentIndex + 1} / {questions.length}
        </h2>

        {/* TIMER */}
        <svg width="120" height="120">
          <circle cx="60" cy="60" r={radius} stroke="#334155" strokeWidth="8" fill="none" />
          <circle
            cx="60" cy="60" r={radius}
            stroke="#22c55e" strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            strokeLinecap="round"
          />
          <text x="50%" y="54%" textAnchor="middle" fill="#fff" fontSize="20">
            {timeLeft}
          </text>
        </svg>

        <h3 dangerouslySetInnerHTML={{ __html: currentQ.question }} />

        {options.map((opt) => (
          <button
            key={opt}
            disabled={disabled}
            onClick={() => handleAnswer(opt)}
            style={{
              ...styles.optionBtn,
              background:
                selected === opt
                  ? opt === currentQ.correct_answer
                    ? "#22c55e"
                    : "#ef4444"
                  : "#1e293b",
            }}
          >
            <span dangerouslySetInnerHTML={{ __html: opt }} />
          </button>
        ))}
      </div>
    </div>
  );
};

/* ================= STYLES ================= */

const styles = {
  page: {
    minHeight: "100vh",
    background: "radial-gradient(circle at top,#1e293b,#020617)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "30px",
    color: "#fff",
  },
  card: {
    width: "100%",
    maxWidth: "700px",
    background: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(10px)",
    borderRadius: "20px",
    padding: "30px",
    textAlign: "center",
  },
  formRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "14px",
    gap: "10px",
  },
  startBtn: {
    marginTop: "20px",
    padding: "14px",
    width: "100%",
    borderRadius: "14px",
    fontSize: "18px",
    fontWeight: "bold",
    border: "none",
    background: "#22c55e",
    cursor: "pointer",
  },
  optionBtn: {
    display: "block",
    width: "100%",
    margin: "10px 0",
    padding: "14px",
    borderRadius: "14px",
    border: "none",
    color: "#fff",
    fontSize: "16px",
    cursor: "pointer",
  },
  resultCard: {
    background: "rgba(255,255,255,0.1)",
    padding: "14px",
    borderRadius: "12px",
    marginBottom: "12px",
  },
};

export default TriviaQuiz;
