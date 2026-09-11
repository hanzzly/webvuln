/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

export default function StudentCard({ s }) {
  return (
    <article className="card-shadow overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
      <div className="bg-slate-100">
        <img
          src={`/api/foto?file=${encodeURIComponent(s.foto)}`}
          alt={`Foto ${s.nama_lengkap}`}
          width={480}
          height={480}
          className="aspect-square w-full object-cover"
        />
      </div>
      <div className="p-5">
        <h3 className="truncate text-base font-bold text-[var(--foreground)]">
          {s.nama_lengkap}
        </h3>
        <p className="mt-1 truncate text-sm text-[var(--muted)]">{s.keahlian}</p>
        <Link
          href={`/siswa/${s.id}`}
          className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--primary-dark)]"
        >
          Lihat Profil
        </Link>
      </div>
    </article>
  );
}
