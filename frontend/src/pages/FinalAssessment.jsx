import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import questions from "../data/questions.json";
import { enableProctoring } from "../utils/proctoring";


export default function FinalAssessment() {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({});
  const [violations, setViolations] = useState(0);

  useEffect(() => {
    const cleanup = enableProctoring(() => {
      setViolations(v => v + 1);
      if (violations >= 2) {
        alert("Disqualified");
        navigate("/student-dashboard");
      }
    });
    return cleanup;
  }, [violations]);

  const submit = () => {
    let score = 0;
    Object.values(questions).flat().forEach(q => {
      if (answers[q.id] === q.answer) score++;
    });
    localStorage.setItem("finalScore", score);
    navigate("/certificate");
  };

  const render = (list) =>
    list.map(q => (
      <div key={q.id}>
        <p>{q.q}</p>
        {q.options.map((op, i) => (
          <label key={i}>
            <input
              type="radio"
              name={q.id}
              onChange={() => setAnswers({ ...answers, [q.id]: i })}
            />
            {op}
          </label>
        ))}
      </div>
    ));

  return (
    <div className="exam-container">
      <h2>Assessment</h2>
      {render(questions.sectionA)}
      {render(questions.sectionB)}
      {render(questions.sectionC)}
      <button onClick={submit}>Submit</button>
    </div>
  );
}
