"use client";

/**
 * CommentSection — form + daftar komentar pada halaman profil siswa.
 *
 * PERMUKAAN SERANGAN XSS (stored):
 * - Mode RENTAN (aman=false): isi komentar yang tersimpan di database
 *   dirender sebagai HTML mentah via dangerouslySetInnerHTML → payload
 *   seperti <img src=x onerror=alert('XSS')> akan dieksekusi browser.
 * - Mode AMAN (aman=true): komentar dirender sebagai TEKS — React otomatis
 *   melakukan output encoding, sehingga payload tampil apa adanya, tidak
 *   dieksekusi.
 */
import { useEffect, useState } from "react";

export default function CommentSection({ siswaId, aman }) {
  const [komentar, setKomentar] = useState([]);
  const [penulis, setPenulis] = useState("");
  const [isi, setIsi] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  async function muat() {
    try {
      const res = await fetch(`/api/komentar?siswa_id=${encodeURIComponent(siswaId)}`);
      const json = await res.json();
      setKomentar(json.data ?? []);
    } catch {
      setKomentar([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    muat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siswaId]);

  async function kirim(e) {
    e.preventDefault();
    setStatus("Mengirim…");
    try {
      const res = await fetch("/api/komentar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siswa_id: siswaId, penulis, isi }),
      });
      const json = await res.json();
      if (!res.ok) {
        setStatus(json.error || "Gagal mengirim komentar.");
        return;
      }
      setPenulis("");
      setIsi("");
      setStatus("Komentar berhasil dikirim.");
      await muat();
    } catch {
      setStatus("Gagal mengirim komentar.");
    }
  }

  return (
    <section
      aria-labelledby="judul-komentar"
      className="card-shadow mt-10 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6"
    >
      <header>
        <h2 id="judul-komentar" className="text-xl font-bold text-[var(--foreground)]">
          Komentar dan Buku Tamu
        </h2>
        <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
          Tinggalkan pesan atau kesan untuk siswa ini.
        </p>
      </header>

      {!aman && (
        <aside
          aria-label="Informasi mode praktikum"
          className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950"
        >
          <p>
            <strong>Mode praktikum (rentan).</strong> Input komentar tidak divalidasi atau
            disanitasi dan ditampilkan kembali sebagai HTML. Coba payload XSS berikut:
          </p>
          <code className="mt-2 block w-fit max-w-full overflow-x-auto rounded-md border border-amber-200 bg-white px-2 py-1 font-mono text-xs text-slate-800">
            &lt;img src=x onerror=alert(&apos;XSS&apos;)&gt;
          </code>
        </aside>
      )}
      {aman && (
        <aside
          aria-label="Informasi mode aman"
          className="mt-5 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-950"
        >
          <strong>Mode aman.</strong> Input divalidasi dan disanitasi di server, lalu output
          di-encode sebagai teks sehingga payload XSS tidak dieksekusi.
        </aside>
      )}

      <form onSubmit={kirim} className="mt-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-[15rem_minmax(0,1fr)]">
          <label className="block text-sm font-semibold text-[var(--foreground)]">
            Nama
            <input
              type="text"
              name="penulis"
              autoComplete="name"
              placeholder="Nama kamu"
              value={penulis}
              onChange={(e) => setPenulis(e.target.value)}
              className="mt-2 w-full rounded-lg border border-[var(--border)] bg-white px-3.5 py-2.5 text-sm font-normal text-[var(--foreground)] outline-none placeholder:text-slate-400 focus:border-[var(--primary)] focus:ring-2 focus:ring-blue-100"
              required
            />
          </label>
          <label className="block text-sm font-semibold text-[var(--foreground)]">
            Komentar
            <textarea
              name="isi"
              placeholder="Tulis komentar"
              value={isi}
              onChange={(e) => setIsi(e.target.value)}
              rows={3}
              className="mt-2 w-full resize-y rounded-lg border border-[var(--border)] bg-white px-3.5 py-2.5 text-sm font-normal text-[var(--foreground)] outline-none placeholder:text-slate-400 focus:border-[var(--primary)] focus:ring-2 focus:ring-blue-100"
              required
            />
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            className="rounded-lg bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--primary-dark)]"
          >
            Kirim Komentar
          </button>
          {status && (
            <span role="status" aria-live="polite" className="text-sm text-[var(--muted)]">
              {status}
            </span>
          )}
        </div>
      </form>

      <div className="mt-7 border-t border-[var(--border)] pt-6">
        <h3 className="text-sm font-semibold text-[var(--foreground)]">
          Komentar ({komentar.length})
        </h3>

        {loading && <p className="mt-4 text-sm text-[var(--muted)]">Memuat komentar…</p>}
        {!loading && komentar.length === 0 && (
          <p className="mt-4 rounded-lg border border-dashed border-[var(--border)] bg-slate-50 p-5 text-center text-sm text-[var(--muted)]">
            Belum ada komentar. Jadilah yang pertama.
          </p>
        )}

        {komentar.length > 0 && (
          <div className="mt-4 space-y-3">
            {komentar.map((k) => (
              <article
                key={k.id}
                className="rounded-lg border border-[var(--border)] bg-slate-50 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-[var(--primary)]">
                    {String(k.penulis ?? "")}
                  </p>
                  <time className="text-xs text-[var(--muted)]">
                    {k.created_at ? new Date(k.created_at).toLocaleString("id-ID") : ""}
                  </time>
                </div>
                {aman ? (
                  <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-[var(--foreground)]">
                    {String(k.isi ?? "")}
                  </p>
                ) : (
                  /* MODE RENTAN: HTML mentah dari input pengguna dirender langsung */
                  <div
                    className="mt-2 break-words text-sm leading-6 text-[var(--foreground)] [&_code]:break-all [&_img]:max-w-full"
                    dangerouslySetInnerHTML={{ __html: String(k.isi ?? "") }}
                  />
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
