import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { KELAS, SCHOOL_NAME } from "@/lib/config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "XI TKJ 3 — Student Profile & Class Portfolio",
  description:
    "Website profil kelas XI TKJ 3: daftar siswa, keahlian, minat, dan laboratorium praktikum keamanan aplikasi web (SQL Injection, XSS, Path Traversal).",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-950 text-slate-200 min-h-screen flex flex-col`}
      >
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-slate-800/80 py-6">
          <div className="mx-auto max-w-6xl px-4 text-center text-sm text-slate-500">
            <p className="font-semibold text-slate-400">
              {KELAS} — {SCHOOL_NAME}
            </p>
            <p className="mt-1">
              Media praktikum keamanan aplikasi web: SQL Injection • XSS • Path Traversal
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
