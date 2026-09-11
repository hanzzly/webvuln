import Link from "next/link";
import { KELAS, MODE_LABEL, SCHOOL_NAME, SECURE_MODE } from "@/lib/config";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <nav
        aria-label="Navigasi utama"
        className="page-shell flex min-h-16 flex-wrap items-center justify-between gap-x-4 py-3 sm:flex-nowrap"
      >
        <Link href="/" className="flex min-w-0 items-center gap-3 text-slate-900">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-blue-700 text-xs font-bold tracking-wide text-white">
            XI
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block text-sm font-bold">{KELAS}</span>
            <span className="block truncate text-xs text-slate-500">{SCHOOL_NAME}</span>
          </span>
        </Link>

        <div className="order-3 mt-3 flex w-full items-center justify-between gap-1 border-t border-slate-100 pt-3 text-sm sm:order-none sm:mt-0 sm:w-auto sm:justify-end sm:border-0 sm:pt-0">
          <Link href="/" className="rounded-md px-3 py-2 font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950">
            Beranda
          </Link>
          <Link href="/siswa" className="rounded-md px-3 py-2 font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950">
            Siswa
          </Link>
          <Link href="/praktikum" className="rounded-md px-3 py-2 font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950">
            Praktikum
          </Link>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold sm:ml-2 ${
            SECURE_MODE
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-amber-200 bg-amber-50 text-amber-800"
          }`}
        >
          <span
            aria-hidden="true"
            className={`h-1.5 w-1.5 rounded-full ${SECURE_MODE ? "bg-emerald-500" : "bg-amber-500"}`}
          />
          {MODE_LABEL}
        </span>
      </nav>
    </header>
  );
}
