import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { generateCertificateHTML } from "../utils/certificateGenerator";


export default function Certificate() {
  const navigate = useNavigate();
  const score = Number(localStorage.getItem("finalScore"));

  useEffect(() => {
    if (score < 50) {
      alert("Failed");
      navigate("/student-dashboard");
    }
  }, []);

  return (
    <div className="exam-container">
      <h1>Congratulations</h1>
      <p>Score: {score}</p>
      <button onClick={() => generateCertificateHTML("Student", score)}>
        Download Certificate
      </button>
    </div>
  );
}
