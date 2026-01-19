import { useLocation } from "react-router-dom";
import { usePica } from "./PicaProvider";
import picaGif from "../assets/pica.gif";
import "./pica.css";

export default function PicaMascot() {
  const location = useLocation();
  const { message, emotion, voiceEnabled, setVoiceEnabled } = usePica();

  // 🚫 ALL ROUTES WHERE PICA MUST NOT APPEAR
  const blockedPrefixes = [
    "/instructions",
    "/final-assessment",
    "/certificate",
    "/games/final-test", // 🔥 THIS WAS MISSING
  ];

  const shouldHide = blockedPrefixes.some((path) =>
    location.pathname.startsWith(path)
  );

  if (shouldHide) return null; // 💥 FULLY REMOVED FROM DOM

  return (
    <div className={`pica-container ${emotion}`}>
      {message && <div className="pica-bubble">{message}</div>}

      <img
        src={picaGif}
        alt="Pica"
        className={`pica-gif ${emotion}`}
        draggable={false}
      />

      <button
        className="pica-voice-btn"
        onClick={() => setVoiceEnabled(!voiceEnabled)}
      >
        {voiceEnabled ? "🔊" : "🔇"}
      </button>
    </div>
  );
}
