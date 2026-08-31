/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { countSiswa, countKeahlian } from "@/lib/siswa";
import { KELAS, SCHOOL_NAME, DESKRIPSI_KELAS, SECURE_MODE } from "@/lib/config";

export const dynamic = "force-dynamic";

const KERENTANAN = [
  {
    ikon: "🗄️",
    nama: "SQL Injection",
    ringkas: "Input pencarian digabung langsung ke query SQL.",
    href: "/praktikum#a-sql-injection",
  },
  {
    ikon: "🧨",
    nama: "Cross-Site Scripting (XSS)",
    ringkas: "Komentar ditampilkan kembali tanpa sanitasi.",
    href: "/praktikum#b-cross-site-scripting-xss",
  },
  {
    ikon: "📂",
    nama: "Path Traversal",
    ringkas: "Penyaji foto menerima nama file tanpa pembatasan.",
    href: "/praktikum#c-path-traversal",
  },
];

export default async function Beranda() {
  let jumlahSiswa = 0;
  let jumlahKeahlian = 0;
  try {
    [jumlahSiswa, jumlahKeahlian] = await Promise.all([countSiswa(), countKeahlian()]);
  } catch {
    // Database belum di-init — halaman tetap tampil dengan angka 0.
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      {/* HERO */}
      <section className="grid items-center gap-10 lg:grid-cols-2">
        <div>
          <span className="inline-block rounded-full border border-cyan-500/40 bg-cyan-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-cyan-400">
            {SCHOOL_NAME}
          </span>
          <h1 className="mt-4 bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 bg-clip-text text-6xl font-extrabold tracking-tight text-transparent sm:text-7xl">
            {KELAS}
          </h1>
          <p className="mt-2 text-xl font-semibold text-slate-300">
            Student Profile &amp; Class Portfolio
          </p>
          <p className="mt-4 max-w-xl leading-relaxed text-slate-400">{DESKRIPSI_KELAS}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/siswa"
              className="rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-3 font-semibold text-white shadow-lg shadow-cyan-900/40 transition hover:from-cyan-500 hover:to-blue-500"
            >
              👥 Lihat Daftar Siswa
            </Link>
            <Link
              href="/praktikum"
              className="rounded-xl border border-slate-700 bg-slate-900 px-6 py-3 font-semibold text-slate-200 transition hover:border-cyan-600 hover:text-white"
            >
              🛡️ Halaman Praktikum
            </Link>
          </div>

          {/* STATISTIK (data dinamis dari MariaDB) */}
          <div className="mt-8 grid grid-cols-3 gap-3 sm:max-w-md">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 text-center">
              <p className="text-3xl font-extrabold text-cyan-400">{jumlahSiswa}</p>
              <p className="mt-1 text-xs text-slate-400">Siswa</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 text-center">
              <p className="text-3xl font-extrabold text-sky-400">{jumlahKeahlian}</p>
              <p className="mt-1 text-xs text-slate-400">Bidang Keahlian</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 text-center">
              <p className="text-3xl font-extrabold text-blue-400">3</p>
              <p className="mt-1 text-xs text-slate-400">Kerentanan Dipelajari</p>
            </div>
          </div>
        </div>

        {/* FOTO KELAS (disajikan lewat /api/foto — sama seperti foto siswa) */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-3 shadow-2xl">
          <img
            src="/api/foto?file=foto-kelas.svg"
            alt={`Foto kelas ${KELAS}`}
            width={1200}
            height={640}
            className="w-full rounded-2xl"
          />
          <p className="px-3 py-3 text-center text-sm text-slate-400">
            📸 Keluarga besar {KELAS} — {SCHOOL_NAME}
          </p>
        </div>
      </section>

      {/* TENTANG KELAS */}
      <section className="mt-16 rounded-3xl border border-slate-800 bg-slate-900/60 p-8">
        <h2 className="text-2xl font-bold text-slate-100">Tentang Kelas</h2>
        <p className="mt-3 max-w-3xl leading-relaxed text-slate-400">
          {KELAS} adalah kelas Teknik Komputer &amp; Jaringan yang beranggotakan {jumlahSiswa} siswa
          dengan berbagai bidang keahlian — mulai dari administrasi jaringan &amp; server, keamanan
          siber, pengembangan web, perangkat keras, hingga IoT. Website ini juga berperan sebagai{" "}
          <b className="text-slate-300">laboratorium keamanan aplikasi web</b>: pada mode praktikum,
          beberapa fiturnya sengaja dibuat rentan agar cara kerja dan perbaikan SQL Injection, XSS,
          dan Path Traversal dapat dipelajari langsung.
        </p>
        {!SECURE_MODE && (
          <p className="mt-4 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-sm text-rose-300">
            ⚠️ Aplikasi sedang berjalan dalam <b>MODE RENTAN</b> (versi praktikum). Ganti ke{" "}
            <b>MODE AMAN</b> dengan <code className="font-mono">SECURE_MODE=1</code> — lihat{" "}
            <Link href="/praktikum#mengganti-mode" className="underline">
              panduan
            </Link>
            .
          </p>
        )}
      </section>

      {/* KERENTANAN */}
      <section className="mt-14">
        <h2 className="text-2xl font-bold text-slate-100">Praktikum Keamanan Web</h2>
        <p className="mt-2 text-slate-400">Tiga kerentanan yang dipelajari di website ini:</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {KERENTANAN.map((k) => (
            <Link
              key={k.nama}
              href={k.href}
              className="group rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:-translate-y-1 hover:border-cyan-600/60"
            >
              <p className="text-4xl">{k.ikon}</p>
              <h3 className="mt-3 font-bold text-slate-100 group-hover:text-cyan-400">{k.nama}</h3>
              <p className="mt-1 text-sm text-slate-400">{k.ringkas}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
