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
        setStatus(`❌ ${json.error || "Gagal mengirim komentar."}`);
        return;
      }
      setPenulis("");
      setIsi("");
      setStatus("✅ Komentar terkirim.");
      await muat();
    } catch {
      setStatus("❌ Gagal mengirim komentar.");
    }
  }

  return (
    <section className="mt-10 rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <h2 className="text-xl font-bold text-slate-100">💬 Komentar / Buku Tamu</h2>
      <p className="mt-1 text-sm text-slate-400">
        Tinggalkan pesan atau kesan untuk siswa ini.
      </p>

      {!aman && (
        <div className="mt-4 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-sm text-rose-300">
          ⚠️ <b>Mode praktikum:</b> input komentar <b>tidak divalidasi/disanitize</b> dan
          ditampilkan kembali sebagai HTML — coba masukkan payload XSS, mis.{" "}
          <code className="rounded bg-slate-950 px-1.5 py-0.5 font-mono text-xs text-rose-200">
            &lt;img src=x onerror=alert(&apos;XSS&apos;)&gt;
          </code>
        </div>
      )}
      {aman && (
        <div className="mt-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-300">
          🔒 <b>Mode aman:</b> input divalidasi &amp; disanitize di server, dan output
          di-encode (dirender sebagai teks) sehingga payload XSS tidak dieksekusi.
        </div>
      )}

      <form onSubmit={kirim} className="mt-5 space-y-3">
        <div className="grid gap-3 sm:grid-cols-[240px_1fr]">
          <input
            type="text"
            placeholder="Nama kamu"
            value={penulis}
            onChange={(e) => setPenulis(e.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 outline-none transition focus:border-cyan-500"
            required
          />
          <input
            type="text"
            placeholder="Tulis komentar…"
            value={isi}
            onChange={(e) => setIsi(e.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 outline-none transition focus:border-cyan-500"
            required
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:from-cyan-500 hover:to-blue-500"
          >
            Kirim Komentar
          </button>
          {status && <span className="text-sm text-slate-300">{status}</span>}
        </div>
      </form>

      <div className="mt-6 space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
          {komentar.length} komentar
        </h3>

        {loading && <p className="text-sm text-slate-500">Memuat komentar…</p>}
        {!loading && komentar.length === 0 && (
          <p className="text-sm text-slate-500">Belum ada komentar. Jadilah yang pertama!</p>
        )}

        {komentar.map((k) => (
          <div key={k.id} className="rounded-xl border border-slate-800 bg-slate-950 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-cyan-400">
                {String(k.penulis ?? "")}
              </p>
              <span className="text-xs text-slate-500">
                {k.created_at ? new Date(k.created_at).toLocaleString("id-ID") : ""}
              </span>
            </div>
            {aman ? (
              <p className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-200">
                {String(k.isi ?? "")}
              </p>
            ) : (
              /* ⚠️ MODE RENTAN: HTML mentah dari input pengguna dirender langsung */
              <div
                className="mt-1 break-words text-sm text-slate-200 [&_code]:break-all"
                dangerouslySetInnerHTML={{ __html: String(k.isi ?? "") }}
              />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
