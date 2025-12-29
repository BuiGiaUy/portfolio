"use client";

import React from "react";
import { useLanguage } from "./LanguageProvider";

export const LanguageToggle: React.FC = () => {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      className="navbar-toggle"
      aria-label={`Switch to ${language === "en" ? "Vietnamese" : "English"}`}
    >
      {language === "en" ? "VI" : "EN"}
    </button>
  );
};
