import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "@/lib/query";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LanguageProvider } from "@/components/LanguageProvider";

export const metadata: Metadata = {
  title: "Bùi Gia Uy | Fullstack / Backend Engineer",
  description:
    "Build production-ready web systems with clean architecture and real constraints. NestJS, PostgreSQL, Redis, Next.js, Docker.",
  keywords: [
    "fullstack engineer",
    "backend engineer",
    "NestJS",
    "PostgreSQL",
    "Redis",
    "Next.js",
    "Docker",
    "software engineer",
    "web developer",
  ],
  authors: [{ name: "Bùi Gia Uy" }],
  openGraph: {
    title: "Bùi Gia Uy | Fullstack / Backend Engineer",
    description:
      "Build production-ready web systems with clean architecture and real constraints.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ThemeProvider>
          <LanguageProvider>
            <QueryProvider>{children}</QueryProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
