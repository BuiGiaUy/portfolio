"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { useLanguage } from "@/components/LanguageProvider";
import { projectService } from "@/services/project.service";
import { Project } from "@/types/project";

interface ProjectDetailContentProps {
  project: Project;
}

export default function ProjectDetailContent({
  project,
}: ProjectDetailContentProps) {
  const router = useRouter();
  const { language } = useLanguage();
  const [isContentVisible, setIsContentVisible] = useState(false);
  const [viewCount, setViewCount] = useState(project.views ?? 0);

  // Increment view count on mount
  useEffect(() => {
    if (project?.id) {
      projectService
        .incrementViews(project.id, "optimistic")
        .then((result) => {
          if (result.views >= 0) {
            setViewCount(result.views);
          }
        })
        .catch((err) => {
          console.error("Failed to increment view:", err);
        });
    }
  }, [project?.id]);

  // Fade in content after component mounts
  useEffect(() => {
    setTimeout(() => setIsContentVisible(true), 100);
  }, []);

  // Parse content sections from markdown-style content
  const parseContent = (content: string) => {
    const sections: {
      title: string;
      content: string;
      type: "text" | "list" | "code";
      icon?: string;
    }[] = [];
    const lines = content.split("\n");
    let currentSection: {
      title: string;
      content: string;
      type: "text" | "list" | "code";
      icon?: string;
    } | null = null;
    let inCodeBlock = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Code block detection
      if (line.startsWith("```")) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          if (currentSection) {
            sections.push(currentSection);
          }
          currentSection = { title: "", content: "", type: "code" };
        } else {
          inCodeBlock = false;
          if (currentSection) {
            sections.push(currentSection);
            currentSection = null;
          }
        }
        continue;
      }

      if (inCodeBlock) {
        if (currentSection) {
          currentSection.content += (currentSection.content ? "\n" : "") + line;
        }
        continue;
      }

      // Section headers (## Title)
      if (line.startsWith("## ")) {
        if (currentSection) {
          sections.push(currentSection);
        }
        const title = line.substring(3).trim();
        // Extract emoji icon if present
        const iconMatch = title.match(/^([🎯🏗️✨🚀📝💡⚙️🔧🎨📊🌟]+)\s*/);
        const icon = iconMatch ? iconMatch[1] : undefined;
        const cleanTitle = icon ? title.substring(icon.length).trim() : title;
        currentSection = { title: cleanTitle, content: "", type: "text", icon };
      }
      // List items
      else if (line.startsWith("- ") || line.startsWith("* ")) {
        if (!currentSection) {
          currentSection = { title: "", content: "", type: "list" };
        }
        if (currentSection.type !== "list") {
          sections.push(currentSection);
          currentSection = { title: "", content: "", type: "list" };
        }
        currentSection.content += (currentSection.content ? "\n" : "") + line;
      }
      // Regular text
      else if (line.trim()) {
        if (!currentSection) {
          currentSection = { title: "", content: "", type: "text" };
        }
        if (currentSection.type === "list") {
          sections.push(currentSection);
          currentSection = { title: "", content: "", type: "text" };
        }
        currentSection.content += (currentSection.content ? "\n" : "") + line;
      }
    }

    if (currentSection) {
      sections.push(currentSection);
    }

    return sections;
  };

  const sections = parseContent(project.content);

  return (
    <>
      <Navbar />
      <div
        className={`min-h-screen bg-[var(--bg-primary)] transition-opacity duration-500 pt-20 ${
          isContentVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Gradient Background */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] opacity-20"
            style={{
              background:
                "radial-gradient(circle, var(--accent-primary) 0%, transparent 70%)",
            }}
          />
          <div
            className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-[100px] opacity-10"
            style={{
              background:
                "radial-gradient(circle, #818cf8 0%, transparent 70%)",
            }}
          />
        </div>

        {/* Header */}
        <div className="relative border-b border-[var(--neutral-800)] backdrop-blur-sm bg-[var(--bg-primary)]/80">
          <div className="container-custom py-8">
            <button
              onClick={() => router.push("/#projects")}
              className="text-sm text-[var(--neutral-400)] hover:text-[var(--neutral-200)] transition-all mb-8 inline-flex items-center gap-2 group"
            >
              <span className="transition-transform group-hover:-translate-x-1">
                ←
              </span>
              <span>
                {language === "vi" ? "Quay lại dự án" : "Back to projects"}
              </span>
            </button>

            {/* Title with subtle gradient */}
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-[var(--neutral-100)] to-[var(--neutral-300)] bg-clip-text text-transparent">
              {project.title}
            </h1>

            {/* Short Description */}
            <p className="text-xl text-[var(--neutral-400)] mb-8 max-w-3xl leading-relaxed">
              {project.shortDescription}
            </p>

            {/* Tech Stack with glass effect */}
            <div className="flex flex-wrap gap-2.5 mb-8">
              {project.techStack.map((tech, index) => (
                <span
                  key={tech}
                  className="px-4 py-2 text-sm font-medium rounded-lg transition-all hover:scale-105 animate-slide-up"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--neutral-800) 0%, var(--neutral-850) 100%)",
                    border: "1px solid var(--neutral-700)",
                    color: "var(--neutral-300)",
                    animationDelay: `${index * 50}ms`,
                  }}
                >
                  {tech}
                </span>
              ))}
            </div>

            {/* Meta Info with icons */}
            <div className="flex flex-wrap items-center gap-6 text-sm">
              {viewCount !== undefined && (
                <div className="flex items-center gap-2 text-[var(--neutral-400)]">
                  <span className="text-lg">👁️</span>
                  <span className="font-medium">
                    {viewCount.toLocaleString()}
                  </span>
                  <span>{language === "vi" ? "lượt xem" : "views"}</span>
                </div>
              )}
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[var(--accent-primary)] hover:underline transition-all hover:gap-3"
                >
                  <span className="text-lg">💻</span>
                  <span>GitHub</span>
                  <span>→</span>
                </a>
              )}
              {project.demoUrl && (
                <a
                  href={project.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[var(--accent-primary)] hover:underline transition-all hover:gap-3"
                >
                  <span className="text-lg">🚀</span>
                  <span>
                    {language === "vi" ? "Demo trực tiếp" : "Live Demo"}
                  </span>
                  <span>→</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative container-custom py-16">
          <div className="max-w-4xl">
            {sections.map((section, index) => (
              <div
                key={index}
                className="mb-16 last:mb-0 animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {section.title && (
                  <div className="flex items-center gap-3 mb-6 group">
                    {section.icon && (
                      <span className="text-3xl transition-transform group-hover:scale-110">
                        {section.icon}
                      </span>
                    )}
                    <h2 className="text-3xl font-bold text-[var(--neutral-100)]">
                      {section.title}
                    </h2>
                  </div>
                )}

                {section.type === "text" && (
                  <div className="prose prose-invert max-w-none">
                    <p className="text-[var(--neutral-400)] text-lg leading-relaxed whitespace-pre-wrap">
                      {section.content}
                    </p>
                  </div>
                )}

                {section.type === "list" && (
                  <ul className="space-y-4">
                    {section.content
                      .split("\n")
                      .filter((item) => item.trim())
                      .map((item, i) => {
                        const text = item.replace(/^[-*]\s+/, "");
                        const boldMatch = text.match(/^\*\*(.+?)\*\*:?\s*/);
                        const label = boldMatch ? boldMatch[1] : null;
                        const content =
                          label && boldMatch
                            ? text.substring(boldMatch[0].length)
                            : text;

                        return (
                          <li key={i} className="flex items-start gap-4 group">
                            <span className="text-[var(--accent-primary)] mt-1.5 text-lg transition-transform group-hover:scale-125">
                              •
                            </span>
                            <div className="flex-1">
                              {label && (
                                <span className="font-semibold text-[var(--neutral-200)]">
                                  {label}:{" "}
                                </span>
                              )}
                              <span className="text-[var(--neutral-400)] text-lg leading-relaxed">
                                {content}
                              </span>
                            </div>
                          </li>
                        );
                      })}
                  </ul>
                )}

                {section.type === "code" && (
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-[var(--accent-primary)] to-[#818cf8] rounded-lg opacity-0 group-hover:opacity-20 transition-opacity blur"></div>
                    <pre className="relative bg-[var(--neutral-900)] border border-[var(--neutral-800)] rounded-lg p-6 overflow-x-auto">
                      <code className="text-sm text-[var(--neutral-300)] font-mono leading-relaxed">
                        {section.content}
                      </code>
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Footer Navigation with card design */}
          <div className="mt-24 pt-12 border-t border-[var(--neutral-800)]">
            <button
              onClick={() => router.push("/#projects")}
              className="group inline-flex items-center gap-3 px-6 py-4 rounded-xl transition-all hover:scale-105"
              style={{
                background:
                  "linear-gradient(135deg, var(--neutral-800) 0%, var(--neutral-850) 100%)",
                border: "1px solid var(--neutral-700)",
              }}
            >
              <span className="text-[var(--accent-primary)] transition-transform group-hover:-translate-x-1">
                ←
              </span>
              <span className="text-[var(--neutral-200)] font-medium">
                {language === "vi" ? "Xem tất cả dự án" : "View all projects"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
