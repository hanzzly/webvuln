import Link from "next/link";
import { KELAS, MODE_LABEL, SECURE_MODE } from "@/lib/config";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-slate-100">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 text-sm">
            TKJ
          </span>
          {KELAS}
        </Link>

        <div className="flex flex-wrap items-center gap-1 text-sm sm:gap-3">
          <Link href="/" className="rounded-md px-2 py-1 text-slate-300 transition hover:bg-slate-800 hover:text-white">
            Beranda
          </Link>
          <Link href="/siswa" className="rounded-md px-2 py-1 text-slate-300 transition hover:bg-slate-800 hover:text-white">
            Daftar Siswa
          </Link>
          <Link href="/praktikum" className="rounded-md px-2 py-1 text-slate-300 transition hover:bg-slate-800 hover:text-white">
            Praktikum
          </Link>
          {SECURE_MODE ? (
            <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
              {MODE_LABEL}
            </span>
          ) : (
            <span className="rounded-full border border-rose-500/40 bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-400">
              {MODE_LABEL}
            </span>
          )}
        </div>
      </nav>
    </header>
  );
}
