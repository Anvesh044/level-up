import { createContext, useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { picaScripts } from "./picaScripts";

const PicaContext = createContext();
export const usePica = () => useContext(PicaContext);

export default function PicaProvider({ children }) {
  const location = useLocation();

  const [message, setMessage] = useState("");
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [emotion, setEmotion] = useState("idle"); // 👈 NEW

  useEffect(() => {
    const path = location.pathname;

    const script =
      picaScripts[path] ||
      Object.entries(picaScripts).find(([key]) =>
        path.startsWith(key)
      )?.[1];

    if (!script) return;

    /* 👋 LOGIN INTRO WITH WAVE */
    if (path === "/login" && script.intro) {
      setEmotion("wave");
      setMessage(script.intro);
      if (voiceEnabled) speak(script.voiceIntro);

      const timer = setTimeout(() => {
        setEmotion("happy");
        setMessage(script.text);
        if (voiceEnabled) speak(script.voice);
      }, 1500);

      return () => clearTimeout(timer);
    }

    /* 🧠 EMOTION BY PAGE TYPE */
    if (path.includes("quiz")) {
      setEmotion("thinking");
    } else if (path.includes("game")) {
      setEmotion("excited");
    } else {
      setEmotion("happy");
    }

    setMessage(script.text);
    if (voiceEnabled) speak(script.voice);

  }, [location.pathname]);

  const speak = (text) => {
    if (!window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1.1;
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  };

  return (
    <PicaContext.Provider
      value={{
        message,
        emotion,          // 👈 exposed to UI
        voiceEnabled,
        setVoiceEnabled,
        speak,
      }}
    >
      {children}
    </PicaContext.Provider>
  );
}
