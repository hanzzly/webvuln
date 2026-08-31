# XI TKJ 3 — Student Profile & Class Portfolio

> **Judul website:** XI TKJ 3 — Student Profile & Class Portfolio
> **Sekolah:** SMK Bina Teknologi *(ubah lewat `NEXT_PUBLIC_SCHOOL_NAME` di `.env`)*
> Website profil kelas yang sekaligus menjadi **laboratorium praktikum keamanan
> aplikasi web**: SQL Injection, Cross-Site Scripting (XSS), dan Path Traversal.

---

## 1. Apa Itu Website Ini? (Definisi)

Website ini adalah **profil digital kelas XI TKJ 3** (semacam CV online kelas) yang
menampilkan identitas kelas, foto kelas, deskripsi, jumlah siswa, daftar siswa beserta
keahlian dan minatnya, serta halaman profil lengkap setiap siswa.

Sebagai media praktikum keamanan aplikasi web, aplikasi ini dibuat dalam **dua versi
dalam satu codebase**:

| Versi | Cara aktifkan | Kegunaan |
|---|---|---|
| ⚠️ **Versi RENTAN** | `npm run dev` (default) | Sengaja diberi 3 kerentanan untuk dianalisis siswa |
| 🔒 **Versi AMAN** | `npm run dev:aman` atau `SECURE_MODE=1` | Versi yang sudah diperbaiki (parameterized query, sanitasi, validasi path) |

Kedua versi menggunakan database yang sama; yang berbeda hanya cara aplikasi
memperlakukan input pengguna. Badge di pojok kanan atas selalu menunjukkan mode aktif.

## 2. Fitur & Fungsinya

| Fitur | Fungsi |
|---|---|
| **Halaman utama** (`/`) | Menampilkan nama kelas, nama sekolah, foto kelas, deskripsi singkat, jumlah siswa (dihitung dinamis dari database), dan tombol menuju daftar siswa |
| **Daftar siswa** (`/siswa`) | Card berisi foto, nama lengkap, keahlian, dan tombol *Lihat Profil* untuk setiap siswa |
| **Pencarian siswa** (`/siswa?q=…`) | Mencari siswa berdasarkan nama/kata kunci — hasilnya diambil dari database secara dinamis |
| **Profil siswa** (`/siswa/[id]`) | Foto, nama lengkap, nama panggilan, kelas, keahlian, skill, minat/hobi, cita-cita, dan deskripsi singkat |
| **Komentar / buku tamu** | Pengunjung meninggalkan pesan pada profil siswa (tersimpan di database) — sengaja rentan XSS pada versi praktikum |
| **Penyaji foto** (`/api/foto?file=`) | Menyajikan foto siswa/foto kelas dari server — sengaja rentan Path Traversal pada versi praktikum |
| **Halaman praktikum** (`/praktikum`) | Ringkasan ketiga kerentanan: lokasi, penyebab, dampak, payload uji, dan perbaikannya |
| **Dokumentasi** (`docs/`) | Analisis keamanan lengkap + panduan praktikum bertahap untuk kelompok |

## 3. Manfaat (Benefit)

1. **Melatih pengembangan web full-stack nyata**: Next.js + React + Tailwind + MariaDB
   dengan data dinamis (bukan hardcode).
2. **Memahami kerentanan dari sisi penyerang dan pembela**: siswa menemukan celah,
   membuktikan dampaknya, lalu memperbaikinya — bukan sekadar teori.
3. **Membangun kebiasaan coding aman**: parameterized query, validasi & sanitasi input,
   output encoding, pembatasan akses file — pola yang dipakai di industri.
4. **Media presentasi kelas**: profil siswa rapi dan bisa dipublikasikan (versi aman).
5. **Dokumentasi belajar yang dapat dinilai**: laporan analisis + bukti PoC per kelompok.

## 4. Teknologi

- **Next.js 15** (App Router) + **React 19** — JavaScript
- **Tailwind CSS 4** — styling
- **MariaDB** (via `mysql2`) — data siswa, komentar, akun guru
- **Git / GitHub** — version control

## 5. Cara Menjalankan

### Prasyarat

- Node.js 18+ dan npm
- MariaDB berjalan lokal (XAMPP: nyalakan MySQL dari Control Panel)

### Langkah

```bash
npm install
cp .env.example .env      # Windows: copy .env.example .env
npm run db:init           # membuat database db_kelas_xitkj3 + user + 24 siswa contoh
npm run foto              # membuat foto placeholder SVG di data/foto/
npm run dev               # ⚠️ versi RENTAN → http://localhost:3000
# atau
npm run dev:aman          # 🔒 versi AMAN → http://localhost:3000
```

Konfigurasi ada di `.env` (lihat `.env.example`): koneksi database (`DB_*`),
`SECURE_MODE` (0 = rentan, 1 = aman), dan nama sekolah.

### Menjalankan kedua versi sekaligus (demo perbandingan)

```bash
npm run dev            # rentan di port 3000
npm run dev:aman -- -p 3001   # aman di port 3001
```

## 6. Peta Permukaan Serangan

| # | Kerentanan | Endpoint | File inti |
|---|---|---|---|
| A | SQL Injection | `GET /api/siswa/search?q=` • `/siswa?q=` • `/siswa/[id]` | `lib/siswa.js` |
| B | Stored XSS | `POST /api/komentar` • komentar di `/siswa/[id]` | `lib/siswa.js`, `components/CommentSection.js` |
| C | Path Traversal | `GET /api/foto?file=` | `app/api/foto/route.js` |

Payload uji cepat (mode rentan):

```bash
# A. SQL Injection — boolean, union, error
curl -G "http://localhost:3000/api/siswa/search" --data-urlencode "q=' OR 1=1 -- -"
curl -G "http://localhost:3000/api/siswa/search" --data-urlencode "q=' UNION SELECT 1, username, '-', 'XI TKJ 3', password, '', '', '', 'kredensial guru', '' FROM users-- -"
curl -G "http://localhost:3000/api/siswa/search" --data-urlencode "q='"

# B. Stored XSS — kirim lalu buka /siswa/1 di browser (alert muncul)
curl -X POST http://localhost:3000/api/komentar -H "Content-Type: application/json" \
  -d '{"siswa_id":1,"penulis":"attacker","isi":"<img src=x onerror=alert(1)>"}'

# C. Path Traversal — membaca .env di luar folder foto
curl "http://localhost:3000/api/foto?file=..%5C..%5C.env"
```

Analisis lengkap (penyebab, dampak, PoC, perbaikan, verifikasi):
**[docs/ANALISIS-KEAMANAN.md](docs/ANALISIS-KEAMANAN.md)** •
Lembar kerja kelompok: **[docs/PANDUAN-PRAKTIKUM.md](docs/PANDUAN-PRAKTIKUM.md)** •
Ringkasan di dalam website: **/praktikum**

## 7. Struktur Project

```
web-kelas-vuln/
├─ app/
│  ├─ page.js                  # Halaman utama (profil kelas)
│  ├─ siswa/page.js            # Daftar siswa + pencarian (SQLi surface)
│  ├─ siswa/[id]/page.js       # Profil siswa + komentar (XSS surface)
│  ├─ praktikum/page.js        # Ringkasan 3 kerentanan & perbaikan
│  └─ api/
│     ├─ siswa/search/route.js # API pencarian (SQLi surface)
│     ├─ komentar/route.js     # API komentar (XSS surface)
│     └─ foto/route.js         # Penyaji foto (Path Traversal surface)
├─ components/                 # Navbar, StudentCard, CommentSection
├─ lib/
│  ├─ db.js                    # Pool koneksi MariaDB (mysql2)
│  ├─ siswa.js                 # ⚠️/✅ query rentan & aman (berdampingan, berkomentar)
│  └─ config.js                # SECURE_MODE, identitas kelas/sekolah
├─ data/foto/                  # Foto siswa & kelas (dibaca API /api/foto)
├─ database/
│  ├─ schema.sql               # DDL: siswa, komentar, users
│  └─ siswa-data.json          # Data 24 siswa (sumber tunggal seed & foto)
├─ scripts/
│  ├─ db-init.mjs              # npm run db:init
│  └─ generate-photos.mjs      # npm run foto
└─ docs/                       # Analisis keamanan + panduan praktikum
```

## 8. Checklist Hasil Akhir (Deliverables)

- [x] Website profil XI TKJ 3 (halaman utama, daftar siswa, profil, pencarian)
- [x] Source code Next.js (React, Tailwind CSS, MariaDB)
- [x] Versi aplikasi yang sengaja dibuat rentan (`SECURE_MODE=0`)
- [x] Versi aplikasi yang sudah diperbaiki (`SECURE_MODE=1`)
- [x] Dokumentasi analisis SQL Injection, XSS, dan Path Traversal (`docs/`)
- [ ] URL website/demo — jalankan `npm run dev` lalu bagikan `http://localhost:3000`
      (untuk demo publik, deploy versi aman ke Vercel + MariaDB cloud, atau tunnel
      lokal seperti ngrok/cloudflared)

## 9. Menyimpan ke GitHub

```bash
git init            # sudah dilakukan otomatis saat scaffold
git add .
git commit -m "Website profil XI TKJ 3 + laboratorium keamanan web (SQLi, XSS, Path Traversal)"
git branch -M main
git remote add origin https://github.com/<username>/<repo>.git
git push -u origin main
```

> `.env` sengaja tidak di-commit (lihat `.gitignore`); `.env.example` disertakan sebagai
> templat. **Jangan pernah** mendorong kredensial asli ke GitHub.

## 10. Etika Penggunaan

Aplikasi ini adalah **laboratorium berisiko sengaja** — jangan pernah di-hosting publik
dalam mode rentan. Semua pengujian hanya sah terhadap aplikasi milik sendiri di
localhost. Menguji keamanan sistem orang lain tanpa izin adalah tindakan ilegal (UU ITE).
