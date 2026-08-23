"use client";

import { useEffect, useState } from "react";
import { getLanguage, setLanguage } from "./LanguageRuntime.js";

export default function LanguageToggle() {
  const [language, setCurrentLanguage] = useState("en");

  useEffect(() => {
    setCurrentLanguage(getLanguage());
    const sync = () => setCurrentLanguage(getLanguage());
    window.addEventListener("fairharvest:language", sync);
    return () => window.removeEventListener("fairharvest:language", sync);
  }, []);

  function choose(nextLanguage) {
    setCurrentLanguage(nextLanguage);
    setLanguage(nextLanguage);
  }

  return (
    <div className="languageToggle" aria-label="Language switcher">
      <button type="button" className={language === "en" ? "active" : ""} onClick={() => choose("en")}>EN</button>
      <button type="button" className={language === "bn" ? "active" : ""} onClick={() => choose("bn")} aria-label="Bangla">BN</button>
    </div>
  );
}
