"use client";

import React from "react";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageToggle } from "./LanguageToggle";
import { useLanguage } from "./LanguageProvider";
import { translations } from "@/lib/translations";

export const Navbar: React.FC = () => {
  const { language } = useLanguage();
  const t = translations[language];

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const navbarHeight = 80; // Height of fixed navbar
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - navbarHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Brand/Logo */}
        <button
          onClick={() => scrollToSection("home")}
          className="navbar-brand"
          aria-label="Go to home"
        >
          {t.nav.brand}
        </button>

        {/* Right Side: Navigation Links + Toggles */}
        <div className="navbar-right">
          {/* Navigation Links */}
          <div className="navbar-links">
            <button
              onClick={() => scrollToSection("home")}
              className="navbar-link"
            >
              {t.nav.home}
            </button>
            <span className="navbar-separator">·</span>
            <button
              onClick={() => scrollToSection("about")}
              className="navbar-link"
            >
              {t.nav.about}
            </button>
            <span className="navbar-separator">·</span>
            <button
              onClick={() => scrollToSection("skills")}
              className="navbar-link"
            >
              {t.nav.skills}
            </button>
            <span className="navbar-separator">·</span>
            <button
              onClick={() => scrollToSection("projects")}
              className="navbar-link"
            >
              {t.nav.projects}
            </button>
            <span className="navbar-separator">·</span>
            <button
              onClick={() => scrollToSection("experience")}
              className="navbar-link"
            >
              {t.nav.experience}
            </button>
            <span className="navbar-separator">·</span>
            <button
              onClick={() => scrollToSection("contact")}
              className="navbar-link"
            >
              {t.nav.contact}
            </button>
          </div>

          {/* Toggles */}
          <div className="navbar-toggles">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
};
