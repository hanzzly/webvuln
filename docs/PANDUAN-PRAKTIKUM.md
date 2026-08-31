# 🧪 Panduan Praktikum — Laboratorium Keamanan Web XI TKJ 3

> Lembar kerja kelompok (2 orang). Ikuti sesi secara berurutan. Setiap sesi:
> **serang → amati → analisis → perbaiki → verifikasi.**
> Jalankan semua perintah di komputer kelompok sendiri (localhost).

## Persiapan (± 10 menit)

```bash
# 1. Nyalakan MariaDB XAMPP (atau service MariaDB milikmu), lalu:
npm install
cp .env.example .env        # Windows: copy .env.example .env
npm run db:init             # buat database + 24 siswa contoh
npm run foto                # buat foto placeholder SVG
npm run dev                 # versi RENTAN aktif (badge ⚠️ di pojok kanan atas)
```

Buka <http://localhost:3000>. Pastikan navbar menampilkan **⚠️ MODE RENTAN**.
Ganti mode: ubah `SECURE_MODE=1` di `.env` (atau `npm run dev:aman`) lalu restart.

---

## Sesi 1 — SQL Injection (fitur pencarian)

**Tugas kelompok:**

1. **Temukan** fitur yang mengambil data dari database berdasarkan input pengguna.
   Petunjuk: kotak pencarian di halaman *Daftar Siswa* + endpoint `GET /api/siswa/search?q=`.
2. Buktikan kerentanannya dengan payload berikut (via kotak pencarian atau curl):

   | Payload | Efek yang diamati |
   |---|---|
   | `%' OR '1'='1` atau `' OR 1=1 -- -` | Semua 24 siswa muncul meski kata kunci tidak cocok |
   | `' UNION SELECT 1, username, '-', 'XI TKJ 3', password, '', '', '', 'kredensial guru', '' FROM users-- -` | Kartu `admin / admin123` & `guru.tkj / guru456` muncul di hasil — kredensial guru bocor |
   | `'` | Pesan error MariaDB bocor ke layar/respons API |

3. **Jelaskan penyebabnya**: pada `lib/siswa.js` (fungsi `cariSiswa`), input `q`
   digabung langsung ke string SQL. Kutipan dari pengguna mengubah **struktur** query.
4. **Jelaskan dampaknya**: kebocoran data siswa, pencurian kredensial tabel lain
   (UNION), error-based info leak; pada DB nyata bisa berujung modifikasi data.
5. **Perbaiki**: buka `lib/siswa.js`, bandingkan cabang `SECURE_MODE` — ubah query
   versi rentan menjadi prepared statement seperti cabang aman. Restart server
   (`SECURE_MODE=1`) dan ulangi ketiga payload → semuanya harus kembali 0 hasil.

> 💡 Pertanyaan refleksi: mengapa `path.join` pada Sesi 3 dan `LIKE '%${q}%'` pada
> sesi ini punya pola masalah yang sama?

---

## Sesi 2 — Stored XSS (komentar profil)

1. **Temukan** fitur yang menyimpan input pengguna lalu menampilkannya kembali:
   *Komentar / Buku Tamu* di halaman profil (`/siswa/1`).
2. **Serang**: isi komentar dengan:

   ```html
   <img src=x onerror=alert(1)>
   ```

   Kirim → dialog alert muncul, dan **muncul lagi setiap kali halaman dibuka**
   (payload tersimpan permanen di database → *Stored XSS*).
3. **Eksperimen lanjutan**:
   - `<img src=x onerror=alert(document.cookie)>` — cookie halaman bisa dibaca.
   - Coba `<script>alert(1)</script>` — mengapa TIDAK jalan? (innerHTML tidak
     mengeksekusi `<script>`, tetapi event handler tetap jalan.)
   - Payload berisi tanda kutip `'` justru memicu **error SQL** — temukan kenapa
     (lihat `tambahKomentar()` di `lib/siswa.js`).
4. **Jelaskan penyebabnya**: input disimpan mentah tanpa validasi/sanitasi, lalu
   dirender dengan `dangerouslySetInnerHTML` tanpa output encoding.
5. **Jelaskan risikonya**: pencurian sesi, phishing pada halaman resmi, defacement,
   penyebaran ke semua pengunjung profil.
6. **Perbaiki** (lihat `components/CommentSection.js` + `lib/siswa.js`):
   validasi panjang → hapus tag HTML → prepared statement → render sebagai teks.
   Ulangi payload di mode aman → payload tampil sebagai teks, tidak dieksekusi.

---

## Sesi 3 — Path Traversal (penyaji foto)

1. **Temukan** endpoint yang menampilkan file berdasarkan input: foto siswa & foto
   kelas dimuat lewat `GET /api/foto?file=<nama>`.
2. **Serang** (via browser URL atau curl):

   ```bash
   curl "http://localhost:3000/api/foto?file=..%5C..%5C.env"        # isi .env bocor!
   curl "http://localhost:3000/api/foto?file=..%5C..%5Cpackage.json"
   ```

   `%5C` = `\`. Di browser, coba `http://localhost:3000/api/foto?file=..\..\package.json`.
3. **Jelaskan penyebabnya**: `app/api/foto/route.js` membentuk path dengan
   `path.join(FOTO_DIR, file)` tanpa pembatasan; `../` keluar dari folder foto.
4. **Jelaskan risikonya terhadap file server**: kredensial, source code, file di
   luar project pada drive yang sama, hingga berkas sistem.
5. **Perbaiki** (lihat `app/api/foto/route.js` versi aman): validasi `basename`,
   tolak `..`/path absolut/dotfile, whitelist ekstensi gambar, batasi dengan
   `path.resolve` + `startsWith(FOTO_DIR)`, dan pesan error generik.
   Ulangi payload di mode aman → HTTP 400, foto sah tetap tampil.

---

## Laporan Kelompok (dikumpulkan)

Untuk **setiap** kerentanan, jawab dalam `docs/` atau dokumen laporan kelompok:

- [ ] Di bagian mana kerentanan itu berada (endpoint + file + baris kode)?
- [ ] Apa penyebabnya (sertakan potongan kode rentan)?
- [ ] Apa dampaknya (sertakan bukti screenshot payload berhasil)?
- [ ] Bagaimana perbaikannya (sertakan potongan kode setelah diperbaiki)?
- [ ] Bukti bahwa setelah diperbaiki serangan gagal (screenshot mode aman).

Referensi jawaban lengkap: [ANALISIS-KEAMANAN.md](./ANALISIS-KEAMANAN.md)
*(jangan dibuka sebelum mencoba sendiri!)*

## Aturan main

- Uji **hanya** di localhost kelompok sendiri.
- Setelah praktikum, jalankan `npm run db:init` untuk membersihkan payload dari database.
- Jangan pernah menyalin teknik ini ke sistem/website milik orang lain — ilegal (UU ITE).
