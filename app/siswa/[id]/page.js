/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSiswaById } from "@/lib/siswa";
import { SECURE_MODE } from "@/lib/config";
import CommentSection from "@/components/CommentSection";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { id } = await params;
  try {
    const s = await getSiswaById(id);
    if (s) return { title: `${s.nama_lengkap} — Profil Siswa` };
  } catch {
    // diabaikan: akan jatuh ke halaman not-found
  }
  return { title: "Profil Siswa" };
}

function Baris({ label, children }) {
  return (
    <div className="grid gap-1 border-b border-slate-200 py-3.5 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-5">
      <dt className="text-sm font-medium text-slate-500">
        {label}
      </dt>
      <dd className="min-w-0 text-sm leading-6 text-slate-800">{children}</dd>
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
    <div className="page-shell py-10 sm:py-14">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/siswa"
          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 transition-colors hover:text-blue-900"
        >
          <span aria-hidden="true">←</span> Kembali ke daftar siswa
        </Link>

        <article className="card-shadow mt-6 grid gap-7 rounded-xl border border-slate-200 bg-white p-5 sm:p-7 lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-9">
          <div>
            <img
              src={`/api/foto?file=${encodeURIComponent(s.foto)}`}
              alt={`Foto ${s.nama_lengkap}`}
              width={480}
              height={480}
              className="aspect-square w-full rounded-lg border border-slate-200 bg-slate-100 object-cover"
            />
          </div>

          <div className="min-w-0">
            <p className="eyebrow">Profil siswa</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
              {s.nama_lengkap}
            </h1>
            <p className="mt-2 text-base font-medium text-blue-700">
              {s.keahlian} <span className="text-slate-300" aria-hidden="true">·</span>{" "}
              <span className="text-slate-600">{s.kelas}</span>
            </p>

            <dl className="mt-5 border-t border-slate-200">
              <Baris label="Nama panggilan">{s.nama_panggilan}</Baris>
              <Baris label="Kelas">{s.kelas}</Baris>
              <Baris label="Keahlian">{s.keahlian}</Baris>
              <Baris label="Skill">
                <span className="flex flex-wrap gap-2">
                  {skills.map((sk) => (
                    <span
                      key={sk}
                      className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-800"
                    >
                      {sk}
                    </span>
                  ))}
                </span>
              </Baris>
              <Baris label="Minat / hobi">{s.minat_hobi}</Baris>
              <Baris label="Cita-cita">{s.cita_cita}</Baris>
            </dl>

            <section className="mt-6 rounded-lg bg-slate-50 p-5" aria-labelledby="judul-deskripsi">
              <h2 id="judul-deskripsi" className="text-sm font-semibold text-slate-800">
                Deskripsi singkat
              </h2>
              <p className="mt-2 text-sm leading-7 text-slate-600">{s.deskripsi}</p>
            </section>
          </div>
        </article>

        {/* KOMENTAR — permukaan serangan XSS (stored) */}
        <CommentSection siswaId={s.id} aman={SECURE_MODE} />
      </div>
    </div>
  );
}
