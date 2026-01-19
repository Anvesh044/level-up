import { useNavigate } from "react-router-dom";


export default function Instructions() {
  const navigate = useNavigate();

  return (
    <div className="exam-container">
      <h1>Final Skill Test</h1>
      <p>Camera-based proctored assessment.</p>

      <ul>
        <li>Camera ON required</li>
        <li>Timed test</li>
        <li>Certificate on completion</li>
      </ul>

      <button onClick={() => navigate("/final-assessment")}>
        Start Assessment
      </button>
    </div>
  );
}
