"use client";

import React from "react";
import { ProjectsGrid } from "@/components/ProjectsGrid";
import { Navbar } from "@/components/Navbar";
import { useLanguage } from "@/components/LanguageProvider";
import { translations } from "@/lib/translations";
import { useProjects } from "@/services/project.service";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useHomePageLogic } from "@/hooks/useHomePageLogic";

export default function Home() {
  const { language } = useLanguage();
  const t = translations[language];
  const { projects, isLoading, error, refetch } = useProjects();
  const { handleProjectView, scrollToSection } = useHomePageLogic();

  // Fade-in on scroll animation
  useScrollAnimation();

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center animate-slide-up">
          <p className="text-lg mb-4" style={{ color: "var(--neutral-400)" }}>
            {error.message}
          </p>
          <button onClick={() => refetch()} className="btn-glow">
            {t.error.tryAgain}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* ==================== HERO SECTION ==================== */}
      <section
        id="home"
        className="min-h-screen flex flex-col justify-center container-custom relative overflow-hidden"
      >
        {/* Gradient Blobs */}
        <div
          className="gradient-blob animate-float"
          style={{
            width: "600px",
            height: "600px",
            background:
              "radial-gradient(circle, rgba(13, 148, 136, 0.15) 0%, transparent 70%)",
            top: "-300px",
            left: "-200px",
          }}
        />
        <div
          className="gradient-blob animate-float"
          style={{
            width: "500px",
            height: "500px",
            background:
              "radial-gradient(circle, rgba(129, 140, 248, 0.1) 0%, transparent 70%)",
            bottom: "-200px",
            right: "-100px",
            animationDelay: "1s",
          }}
        />

        <div className="grid md:grid-cols-2 gap-12 items-center relative z-10">
          <div className="animate-slide-up">
            {/* Badge */}
            <div className="hero-badge">
              <span className="hero-badge-dot"></span>
              {language === "vi" ? "Sẵn sàng làm việc" : "Available for work"}
            </div>

            {/* Name with gradient */}
            <h1 className="hero-name">
              <span className="gradient-text-animated">{t.hero.name}</span>
            </h1>

            {/* Role */}
            <p className="hero-role animation-delay-100 animate-fade-in">
              {t.hero.role}
            </p>

            {/* Description */}
            <p className="hero-description animation-delay-200 animate-fade-in">
              {t.hero.tagline} {t.hero.taglineSecond}
            </p>

            {/* Tech Stack */}
            <div className="tech-stack mb-8 animation-delay-300 animate-fade-in">
              {t.hero.techStack.map((tech, index) => (
                <React.Fragment key={tech}>
                  {index > 0 && <span className="tech-separator">·</span>}
                  <span className="tech-item">{tech}</span>
                </React.Fragment>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 animation-delay-400 animate-fade-in">
              <button
                onClick={() => scrollToSection("projects")}
                className="btn-glow"
              >
                {t.hero.cta}
              </button>
              <a
                href="/CV-Bui-Gia-Uy.pdf"
                download
                className="btn-outline-premium"
              >
                {t.hero.downloadCV}
              </a>
              <a href="#contact" className="btn-outline-premium">
                {t.hero.contactMe}
              </a>
            </div>
          </div>

          {/* Avatar */}
          <div className="flex justify-center md:justify-end animate-slide-up animation-delay-200">
            <div className="avatar-container floating">
              <img
                src="images/avatar.jpg"
                alt={t.hero.name}
                width={500}
                height={500}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ==================== ABOUT SECTION ==================== */}
      <section id="about" className="section container-custom scroll-reveal">
        <h2 className="section-title-premium">{t.about.title}</h2>

        <div className="max-w-3xl mt-8 space-y-6 fade-in">
          <p
            className="text-lg leading-relaxed"
            style={{ color: "var(--neutral-400)" }}
          >
            {t.about.text1}
          </p>
          <p
            className="text-lg leading-relaxed"
            style={{ color: "var(--neutral-400)" }}
          >
            {t.about.text2}
          </p>
          <p
            className="text-lg leading-relaxed"
            style={{ color: "var(--neutral-400)" }}
          >
            {t.about.text3}
          </p>
        </div>
      </section>

      {/* ==================== SKILLS SECTION ==================== */}
      <section id="skills" className="section container-custom scroll-reveal">
        <h2 className="section-title-premium">{t.skills.title}</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12 fade-in">
          {/* Backend */}
          <div className="skill-card">
            <div className="skill-card-title">
              <span className="skill-card-icon">⚙️</span>
              {t.skills.backend.title}
            </div>
            <ul className="skill-card-items">
              {t.skills.backend.items.map((item, index) => (
                <li key={index} className="skill-card-item">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Frontend */}
          <div className="skill-card">
            <div className="skill-card-title">
              <span className="skill-card-icon">🎨</span>
              {t.skills.frontend.title}
            </div>
            <ul className="skill-card-items">
              {t.skills.frontend.items.map((item, index) => (
                <li key={index} className="skill-card-item">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Mobile */}
          <div className="skill-card">
            <div className="skill-card-title">
              <span className="skill-card-icon">📱</span>
              {t.skills.mobile.title}
            </div>
            <ul className="skill-card-items">
              {t.skills.mobile.items.map((item, index) => (
                <li key={index} className="skill-card-item">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Database */}
          <div className="skill-card">
            <div className="skill-card-title">
              <span className="skill-card-icon">🗄️</span>
              {t.skills.database.title}
            </div>
            <ul className="skill-card-items">
              {t.skills.database.items.map((item, index) => (
                <li key={index} className="skill-card-item">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* DevOps */}
          <div className="skill-card">
            <div className="skill-card-title">
              <span className="skill-card-icon">🚀</span>
              {t.skills.devops.title}
            </div>
            <ul className="skill-card-items">
              {t.skills.devops.items.map((item, index) => (
                <li key={index} className="skill-card-item">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ==================== PROJECTS SECTION ==================== */}
      <section id="projects" className="section container-custom scroll-reveal">
        <h2 className="section-title-premium">{t.projects.title}</h2>
        <p
          className="section-subtitle mt-2 mb-12"
          style={{ color: "var(--neutral-500)" }}
        >
          {t.projects.subtitle}
        </p>

        <ProjectsGrid
          projects={projects}
          isLoading={isLoading}
          skeletonCount={6}
          onProjectView={handleProjectView}
        />
      </section>

      {/* ==================== EXPERIENCE SECTION ==================== */}
      <section
        id="experience"
        className="section container-custom scroll-reveal"
      >
        <h2 className="section-title-premium">{t.experience.title}</h2>

        <div className="max-w-3xl mt-12 fade-in">
          <div className="timeline">
            <div className="timeline-item">
              <div className="timeline-dot"></div>
              <p className="timeline-date">{t.experience.job.period}</p>
              <h3 className="timeline-role">{t.experience.job.title}</h3>
              <p className="timeline-company">{t.experience.job.company}</p>

              <ul className="timeline-responsibilities">
                {t.experience.job.responsibilities.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="max-w-3xl mt-12 fade-in">
          <div className="timeline">
            <div className="timeline-item">
              <div className="timeline-dot"></div>
              <p className="timeline-date">{t.experience.job_2.period}</p>
              <h3 className="timeline-role">{t.experience.job_2.title}</h3>
              <p className="timeline-company">{t.experience.job_2.company}</p>

              <ul className="timeline-responsibilities">
                {t.experience.job_2.responsibilities.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== CONTACT SECTION ==================== */}
      <section id="contact" className="section container-custom scroll-reveal">
        <div className="contact-cta fade-in">
          <h2 className="contact-title">{t.contact.title}</h2>
          <p className="contact-subtitle">
            {language === "vi"
              ? "Hãy kết nối với tôi qua các kênh bên dưới"
              : "Let's connect through the channels below"}
          </p>

          <div className="contact-buttons">
            <a
              href="https://github.com/BuiGiaUy"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-glow"
            >
              {t.contact.github}
            </a>
            <a
              href="/CV-Bui-Gia-Uy.pdf"
              download
              className="btn-outline-premium"
            >
              {t.contact.cv}
            </a>
            <a
              href="https://www.linkedin.com/in/uy-gia/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline-premium"
            >
              {t.contact.linkedin}
            </a>
          </div>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer className="footer-premium container-custom">
        <div className="footer-links">
          <a
            href="https://github.com/BuiGiaUy"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            GitHub
          </a>
          <a
            href="https://www.linkedin.com/in/uy-gia/"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            LinkedIn
          </a>
          <a
            href="mailto:giauy0987@gmail.com"
            className="footer-link"
            aria-label="Send email to Bui Gia Uy"
          >
            Email
          </a>
        </div>
        <p className="footer-copyright">{t.footer.copyright}</p>
      </footer>
    </div>
  );
}
