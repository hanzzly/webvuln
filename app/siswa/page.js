import Link from "next/link";
import StudentCard from "@/components/StudentCard";
import { getAllSiswa, cariSiswa } from "@/lib/siswa";
import { SECURE_MODE, KELAS } from "@/lib/config";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Daftar Siswa — XI TKJ 3",
};

export default async function DaftarSiswa({ searchParams }) {
  const params = (await searchParams) ?? {};
  const q = typeof params.q === "string" ? params.q : "";
  const kata = q.trim();

  let hasil = [];
  let error = null;
  try {
    hasil = kata ? await cariSiswa(kata) : await getAllSiswa();
  } catch (err) {
    error = err;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <header className="text-center">
        <h1 className="text-4xl font-extrabold text-slate-100">
          👥 Daftar <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Siswa</span>
        </h1>
        <p className="mt-2 text-slate-400">
          Kenali siswa-siswa {KELAS}: keahlian, minat, dan profil lengkapnya.
        </p>
      </header>

      {/* FITUR PENCARIAN — permukaan serangan SQL Injection */}
      <section className="mx-auto mt-8 max-w-2xl">
        <form action="/siswa" method="GET" className="flex gap-2">
          <input
            type="text"
            name="q"
            defaultValue={kata}
            placeholder="Cari nama siswa…"
            className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 placeholder-slate-500 outline-none transition focus:border-cyan-500"
          />
          <button
            type="submit"
            className="rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-3 font-semibold text-white transition hover:from-cyan-500 hover:to-blue-500"
          >
            🔍 Search
          </button>
        </form>

        {SECURE_MODE ? (
          <p className="mt-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-center text-xs text-emerald-300">
            🔒 Pencarian aman: <b>parameterized query / prepared statement</b> — kata kunci hanya
            diproses sebagai data, tidak bisa memanipulasi SQL.
          </p>
        ) : (
          <p className="mt-3 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-center text-xs text-rose-300">
            ⚠️ <b>Mode praktikum:</b> kata kunci pencarian digabung langsung ke query SQL. Coba
            isi dengan <code className="font-mono">&apos; OR 1=1 -- -</code> untuk melihat SQL
            Injection (detail:{" "}
            <Link href="/praktikum#a-sql-injection" className="underline">
              halaman praktikum
            </Link>
            ).
          </p>
        )}
      </section>

      {/* HASIL */}
      <section className="mt-10">
        {!error && (
          <p className="mb-6 text-sm text-slate-400">
            {kata ? (
              <>
                Hasil pencarian untuk{" "}
                <b className="text-slate-200">&ldquo;{kata}&rdquo;</b>: {hasil.length} siswa ditemukan.
              </>
            ) : (
              <>Menampilkan semua siswa ({hasil.length} orang).</>
            )}
          </p>
        )}

        {error &&
          (SECURE_MODE ? (
            <p className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-6 text-center text-rose-300">
              Terjadi kesalahan pada server. Coba kata kunci lain.
            </p>
          ) : (
            /* ⚠️ Mode rentan: pesan error database ditampilkan — contoh nyata
               kebocoran informasi yang membantu serangan error-based SQLi. */
            <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-6">
              <p className="font-semibold text-rose-300">
                ⚠️ Query database gagal (detail error ikut ditampilkan di mode praktikum):
              </p>
              <pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-all rounded-xl bg-slate-950 p-4 font-mono text-xs text-rose-200">
                {error.message}
              </pre>
            </div>
          ))}

        {!error && hasil.length === 0 && (
          <p className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center text-slate-400">
            Tidak ada siswa yang cocok dengan kata kunci <b>{kata}</b>.
          </p>
        )}

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {hasil.map((s) => (
            <StudentCard key={s.id} s={s} />
          ))}
        </div>
      </section>
    </div>
  );
}
