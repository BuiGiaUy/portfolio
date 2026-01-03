"use client";

import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { useLanguage } from "@/components/LanguageProvider";

export default function ProjectNotFound() {
  const { language } = useLanguage();

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center pt-20">
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[var(--neutral-800)] flex items-center justify-center">
            <span className="text-2xl">🔍</span>
          </div>
          <h1 className="text-2xl font-semibold mb-3 text-[var(--neutral-200)]">
            {language === "vi" ? "Không tìm thấy dự án" : "Project not found"}
          </h1>
          <p className="text-[var(--neutral-500)] mb-6">
            {language === "vi"
              ? "Dự án này có thể đã bị xóa hoặc không tồn tại"
              : "This project may have been removed or doesn't exist"}
          </p>
          <Link
            href="/"
            className="px-5 py-2.5 bg-[var(--accent-primary)] text-white rounded-lg hover:opacity-90 transition-all hover:scale-105 inline-block"
          >
            {language === "vi" ? "← Quay lại trang chủ" : "← Back to home"}
          </Link>
        </div>
      </div>
    </>
  );
}
