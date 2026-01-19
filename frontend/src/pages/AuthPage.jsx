import { Link } from "react-router-dom";
import i18n from "i18next";
import { useTranslation } from "react-i18next";
import "./AuthPage.css";

const AuthPage = () => {
  const { t } = useTranslation();

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("lang", lang);
  };

  return (
    <div className="auth-container">

      {/* 🌍 LANGUAGE DROPDOWN (TOP RIGHT) */}
      <div className="language-switcher">
        <select
          value={i18n.language}
          onChange={(e) => changeLanguage(e.target.value)}
        >
          <option value="en">English</option>
          <option value="hi">हिन्दी</option>
          <option value="kn">ಕನ್ನಡ</option>
          <option value="ta">தமிழ்</option>
          <option value="te">తెలుగు</option>
          <option value="mr">मराठी</option>
        </select>
      </div>

      <div className="auth-card">
        <h1 className="auth-title">🚀 {t("appName")}</h1>

        <p className="auth-subtitle">
          {t("taglineShort")}
        </p>

        <p className="auth-tagline">
          {t("taglineLong")}
        </p>

        <div className="auth-buttons">
          <Link to="/signup-student">
            <button className="auth-btn primary">
              🎓 {t("signupStudent")}
            </button>
          </Link>

          <Link to="/signup-teacher">
            <button className="auth-btn secondary">
              🧑‍🏫 {t("signupTeacher")}
            </button>
          </Link>

          <Link to="/login">
            <button className="auth-btn link">
              🔐 {t("loginExisting")}
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
