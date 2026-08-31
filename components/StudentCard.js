/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

export default function StudentCard({ s }) {
  return (
    <div className="group overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-lg transition hover:-translate-y-1 hover:border-cyan-600/60 hover:shadow-cyan-900/30">
      <div className="overflow-hidden">
        <img
          src={`/api/foto?file=${encodeURIComponent(s.foto)}`}
          alt={`Foto ${s.nama_lengkap}`}
          width={480}
          height={480}
          className="aspect-square w-full object-cover transition duration-300 group-hover:scale-105"
        />
      </div>
      <div className="space-y-2 p-4">
        <h3 className="truncate text-lg font-bold text-slate-100">{s.nama_lengkap}</h3>
        <p className="truncate text-sm text-cyan-400">{s.keahlian}</p>
        <Link
          href={`/siswa/${s.id}`}
          className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:from-cyan-500 hover:to-blue-500"
        >
          Lihat Profil →
        </Link>
      </div>
    </div>
  );
}
