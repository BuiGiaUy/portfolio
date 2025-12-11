import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Developer Portfolio | Creative Projects Showcase",
  description: "Explore my portfolio of web development projects. Full-stack developer specializing in Next.js, TypeScript, and modern web technologies.",
  keywords: ["portfolio", "web developer", "full-stack", "Next.js", "TypeScript", "React"],
  authors: [{ name: "Developer" }],
  openGraph: {
    title: "Developer Portfolio",
    description: "Explore my portfolio of web development projects",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
