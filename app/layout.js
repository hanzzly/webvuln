import "./globals.css";
import Navbar from "@/components/Navbar";
import { KELAS, SCHOOL_NAME } from "@/lib/config";

export const metadata = {
  title: {
    default: "XI TKJ 3 — Profil Kelas",
    template: "%s | XI TKJ 3",
  },
  description:
    "Profil digital kelas XI TKJ 3 yang memuat daftar siswa, keahlian, minat, dan praktikum keamanan aplikasi web.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="flex min-h-screen flex-col antialiased">
        <a href="#konten-utama" className="skip-link">
          Lewati ke konten utama
        </a>
        <Navbar />
        <main id="konten-utama" className="flex-1">{children}</main>
        <footer className="mt-16 border-t border-slate-200 bg-white py-8">
          <div className="page-shell flex flex-col gap-2 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-slate-800">{KELAS}</p>
              <p className="mt-0.5">{SCHOOL_NAME}</p>
            </div>
            <p className="max-w-md sm:text-right">
              Profil kelas dan media belajar keamanan aplikasi web.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
