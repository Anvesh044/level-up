import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebase";
import { registerUser } from "../services/api";
import { useNavigate } from "react-router-dom";
import "./SignupTeacher.css"; // ✅ ONLY UI CHANGE

const SignupTeacher = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    institution: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { name, email, password, confirmPassword, institution } = formData;

    if (!name || !email || !password || !confirmPassword || !institution) {
      alert("Please fill all fields");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      await registerUser({
        firebaseUid: user.uid,
        role: "teacher",
        name,
        institution,
      });

      alert("🎉 Teacher registered successfully!");
      navigate("/login");
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <form className="signup-card" onSubmit={handleSignup}>
        <h2 className="signup-title">🧑‍🏫 Teacher Signup</h2>
        <p className="signup-subtitle">Guide students and track progress</p>

        <input
          className="signup-input"
          name="name"
          placeholder="Full Name"
          onChange={handleChange}
        />

        <input
          className="signup-input"
          name="email"
          placeholder="Email"
          onChange={handleChange}
        />

        <input
          className="signup-input"
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
        />

        <input
          className="signup-input"
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          onChange={handleChange}
        />

        <input
          className="signup-input"
          name="institution"
          placeholder="Institution Name"
          onChange={handleChange}
        />

        <button className="signup-btn" disabled={loading}>
          {loading ? "Creating Account..." : "Signup as Teacher"}
        </button>
      </form>
    </div>
  );
};

export default SignupTeacher;
