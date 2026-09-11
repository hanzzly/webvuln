/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { countSiswa, countKeahlian } from "@/lib/siswa";
import { KELAS, SCHOOL_NAME, DESKRIPSI_KELAS, SECURE_MODE } from "@/lib/config";

export const dynamic = "force-dynamic";

const KERENTANAN = [
  {
    nomor: "01",
    nama: "SQL Injection",
    ringkas: "Mempelajari keamanan input pada pencarian dan query database.",
    href: "/praktikum#a-sql-injection",
  },
  {
    nomor: "02",
    nama: "Cross-Site Scripting (XSS)",
    ringkas: "Menguji validasi, sanitasi, dan output pada fitur komentar.",
    href: "/praktikum#b-cross-site-scripting-xss",
  },
  {
    nomor: "03",
    nama: "Path Traversal",
    ringkas: "Memahami pembatasan direktori saat aplikasi menyajikan berkas.",
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
    <div className="page-shell py-10 sm:py-14">
      <section className="grid items-center gap-9 lg:grid-cols-[0.92fr_1.08fr] lg:gap-14">
        <div className="max-w-xl">
          <p className="eyebrow">Profil kelas</p>
          <h1 className="mt-4 text-balance text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            Selamat datang di kelas {KELAS}
          </h1>
          <p className="mt-4 text-base font-semibold text-blue-700">
            Student Profile &amp; Class Portfolio
          </p>
          <p className="mt-3 leading-7 text-slate-600">{DESKRIPSI_KELAS}</p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/siswa"
              className="rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-800"
            >
              Lihat daftar siswa
            </Link>
            <Link
              href="/praktikum"
              className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-50"
            >
              Buka praktikum
            </Link>
          </div>

          <dl className="mt-9 grid max-w-lg grid-cols-3 border-y border-slate-200 py-4">
            <div className="flex flex-col pr-3">
              <dt className="order-2 mt-0.5 text-xs text-slate-500">Siswa</dt>
              <dd className="order-1 text-2xl font-bold text-slate-950">{jumlahSiswa}</dd>
            </div>
            <div className="flex flex-col border-l border-slate-200 px-4">
              <dt className="order-2 mt-0.5 text-xs text-slate-500">Bidang keahlian</dt>
              <dd className="order-1 text-2xl font-bold text-slate-950">{jumlahKeahlian}</dd>
            </div>
            <div className="flex flex-col border-l border-slate-200 pl-4">
              <dt className="order-2 mt-0.5 text-xs text-slate-500">Materi keamanan</dt>
              <dd className="order-1 text-2xl font-bold text-slate-950">3</dd>
            </div>
          </dl>
        </div>

        <figure className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 card-shadow">
          <img
            src="/api/foto?file=foto-kelas.svg"
            alt={`Foto kelas ${KELAS}`}
            width={1200}
            height={640}
            className="aspect-[16/9] w-full rounded-xl object-cover"
          />
          <figcaption className="flex items-center justify-between gap-4 px-3 py-3 text-sm">
            <span className="font-medium text-slate-700">Keluarga besar {KELAS}</span>
            <span className="text-right text-slate-500">{SCHOOL_NAME}</span>
          </figcaption>
        </figure>
      </section>

      <section className="mt-16 grid gap-6 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 lg:grid-cols-[0.35fr_0.65fr] lg:gap-12">
        <div>
          <p className="eyebrow">Tentang kami</p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-950">
            Belajar dan berkembang bersama
          </h2>
        </div>
        <div>
          <p className="leading-7 text-slate-600">
            {KELAS} adalah kelas Teknik Komputer &amp; Jaringan yang beranggotakan {jumlahSiswa} siswa.
            Kami mempelajari administrasi jaringan dan server, keamanan siber, pengembangan web,
            perangkat keras, serta Internet of Things.
          </p>
          <p className="mt-3 leading-7 text-slate-600">
            Website ini menjadi profil kelas sekaligus laboratorium keamanan aplikasi web. Melalui
            mode praktikum, siswa dapat memahami cara menemukan dan memperbaiki kerentanan secara
            langsung.
          </p>
          {!SECURE_MODE && (
            <div className="mt-5 flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <span
                aria-hidden="true"
                className="mt-1 h-2 w-2 shrink-0 rounded-full bg-amber-500"
              />
              <p>
                Aplikasi sedang berjalan dalam <strong>mode rentan</strong> untuk praktikum lokal.
                Lihat{" "}
                <Link
                  href="/praktikum#mengganti-mode"
                  className="font-semibold underline underline-offset-2"
                >
                  panduan mengganti mode
                </Link>{" "}
                sebelum memublikasikan website.
              </p>
            </div>
          )}
          {SECURE_MODE && (
            <div className="mt-5 flex gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
              <span
                aria-hidden="true"
                className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-500"
              />
              <p>
                Aplikasi berjalan dalam <strong>mode aman</strong>. Validasi dan perlindungan input
                untuk seluruh materi praktikum sedang aktif.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="mt-16">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Praktikum</p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-950">
              Materi keamanan web
            </h2>
            <p className="mt-2 max-w-2xl text-slate-600">
              Tiga studi kasus yang dianalisis dari versi rentan hingga versi yang telah diperbaiki.
            </p>
          </div>
          <Link href="/praktikum" className="text-sm font-semibold text-blue-700 hover:text-blue-900">
            Lihat panduan lengkap <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="mt-6 grid overflow-hidden rounded-2xl border border-slate-200 bg-white sm:grid-cols-3">
          {KERENTANAN.map((k, index) => (
            <Link
              key={k.nama}
              href={k.href}
              className={`group p-6 transition-colors hover:bg-slate-50 ${index > 0 ? "border-t border-slate-200 sm:border-l sm:border-t-0" : ""}`}
            >
              <span className="text-xs font-bold tracking-widest text-blue-700">{k.nomor}</span>
              <h3 className="mt-4 font-bold text-slate-900 group-hover:text-blue-800">{k.nama}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{k.ringkas}</p>
              <span className="mt-5 inline-block text-sm font-semibold text-slate-700">
                Pelajari materi <span aria-hidden="true">→</span>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
