import Link from "next/link";
import StudentCard from "@/components/StudentCard";
import { getAllSiswa, cariSiswa } from "@/lib/siswa";
import { SECURE_MODE, KELAS } from "@/lib/config";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Daftar Siswa",
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
    <div className="page-shell py-10 sm:py-14">
      <header className="max-w-2xl">
        <p className="eyebrow">Anggota kelas</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
          Daftar Siswa
        </h1>
        <p className="mt-3 leading-7 text-slate-600">
          Kenali siswa-siswa {KELAS} beserta keahlian, minat, dan profil lengkap mereka.
        </p>
      </header>

      {/* FITUR PENCARIAN — permukaan serangan SQL Injection */}
      <section aria-labelledby="judul-pencarian" className="mt-8 max-w-3xl">
        <h2 id="judul-pencarian" className="sr-only">Pencarian siswa</h2>
        <form
          action="/siswa"
          method="GET"
          className="rounded-xl border border-slate-200 bg-white p-4 card-shadow"
        >
          <label htmlFor="cari-siswa" className="text-sm font-semibold text-slate-800">
            Cari siswa berdasarkan nama
          </label>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <input
              id="cari-siswa"
              type="search"
              name="q"
              defaultValue={kata}
              placeholder="Cari nama siswa…"
              className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />
            <button
              type="submit"
              className="rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-800"
            >
              Search
            </button>
          </div>
        </form>
      </section>

      {/* HASIL */}
      <section aria-labelledby="judul-hasil" className="mt-10">
        <h2 id="judul-hasil" className="sr-only">Hasil pencarian</h2>
        {!error && (
          <p className="mb-5 text-sm text-slate-600">
            {kata ? (
              SECURE_MODE ? (
                <>
                  Hasil untuk <strong className="text-slate-900">&ldquo;{kata}&rdquo;</strong> · {hasil.length} siswa
                </>
              ) : (
                /* ⚠️ Mode rentan: Reflected XSS — parameter q dari URL dirender mentah */
                <span
                  dangerouslySetInnerHTML={{
                    __html: `Hasil untuk &ldquo;<strong>${kata}</strong>&rdquo; · ${hasil.length} siswa`,
                  }}
                />
              )
            ) : (
              <>Menampilkan semua siswa · {hasil.length} orang</>
            )}
          </p>
        )}

        {error &&
          (SECURE_MODE ? (
            <p className="rounded-lg border border-red-200 bg-red-50 p-5 text-sm text-red-800">
              Terjadi kesalahan pada server. Coba kata kunci lain.
            </p>
          ) : (
            /* Mode rentan: membocorkan pesan error database mentah */
            <div className="rounded-lg border border-red-200 bg-red-50 p-5">
              <p className="text-sm font-semibold text-red-900">
                Database Error:
              </p>
              <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-all rounded-lg bg-slate-900 p-4 font-mono text-xs leading-5 text-red-100">
                {error.message}
              </pre>
            </div>
          ))}

        {!error && hasil.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-600">
            {SECURE_MODE ? (
              <p>Tidak ada siswa yang cocok dengan kata kunci <strong>{kata}</strong>.</p>
            ) : (
              <p
                dangerouslySetInnerHTML={{
                  __html: `Tidak ada siswa yang cocok dengan kata kunci: <strong>${kata}</strong>`,
                }}
              />
            )}
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {hasil.map((s) => (
            <StudentCard key={s.id} s={s} />
          ))}
        </div>
      </section>
    </div>
  );
}
