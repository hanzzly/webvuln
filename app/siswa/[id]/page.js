/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSiswaById } from "@/lib/siswa";
import { SECURE_MODE, KELAS } from "@/lib/config";
import CommentSection from "@/components/CommentSection";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { id } = await params;
  try {
    const s = await getSiswaById(id);
    if (s) return { title: `${s.nama_lengkap} — Profil Siswa ${KELAS}` };
  } catch {
    // diabaikan: akan jatuh ke halaman not-found
  }
  return { title: `Profil Siswa — ${KELAS}` };
}

function Baris({ label, children }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-slate-800 py-3 sm:flex-row sm:items-center sm:gap-4">
      <span className="w-44 shrink-0 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <span className="text-slate-200">{children}</span>
    </div>
  );
}

export default async function ProfilSiswa({ params }) {
  const { id } = await params;

  let s = null;
  try {
    s = await getSiswaById(id);
  } catch (err) {
    if (!SECURE_MODE) {
      // ⚠️ Mode rentan: id dari URL digabung langsung ke query. Payload non-angka
      // (mis. /siswa/1' OR '1'='1) dapat menyebabkan error SQL di sini.
      console.error("[profil] error query:", err.message);
    }
  }
  if (!s) notFound();

  const skills = String(s.skill || "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <Link href="/siswa" className="text-sm text-cyan-400 transition hover:text-cyan-300">
        ← Kembali ke Daftar Siswa
      </Link>

      <article className="mt-6 grid gap-8 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 lg:grid-cols-[300px_1fr]">
        {/* FOTO */}
        <div>
          <img
            src={`/api/foto?file=${encodeURIComponent(s.foto)}`}
            alt={`Foto ${s.nama_lengkap}`}
            width={480}
            height={480}
            className="w-full rounded-2xl border border-slate-800"
          />
        </div>

        {/* INFORMASI */}
        <div>
          <h1 className="text-3xl font-extrabold text-slate-100">{s.nama_lengkap}</h1>
          <p className="mt-1 text-lg text-cyan-400">
            {s.keahlian} • {s.kelas}
          </p>

          <div className="mt-4">
            <Baris label="Nama Panggilan">{s.nama_panggilan}</Baris>
            <Baris label="Kelas">{s.kelas}</Baris>
            <Baris label="Keahlian">{s.keahlian}</Baris>
            <Baris label="Skill">
              <span className="flex flex-wrap gap-2">
                {skills.map((sk) => (
                  <span
                    key={sk}
                    className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-300"
                  >
                    {sk}
                  </span>
                ))}
              </span>
            </Baris>
            <Baris label="Minat / Hobi">{s.minat_hobi}</Baris>
            <Baris label="Cita-cita">{s.cita_cita}</Baris>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950 p-5">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Deskripsi Singkat
            </h2>
            <p className="mt-2 leading-relaxed text-slate-300">{s.deskripsi}</p>
          </div>
        </div>
      </article>

      {/* KOMENTAR — permukaan serangan XSS (stored) */}
      <CommentSection siswaId={s.id} aman={SECURE_MODE} />
    </div>
  );
}
