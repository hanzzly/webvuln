# 📖 Panduan Pengujian Kerentanan (Black-Box Security Audit Guide)
**Laboratorium Keamanan Aplikasi Web — XI TKJ 3**

Dokumen ini berisi panduan teknis pengujian kerentanan (*security assessment*) pada aplikasi web profil kelas XI TKJ 3 dalam skenario **Black-Box Testing** (pengujian tanpa petunjuk langsung pada antarmuka pengguna).

---

## 🎯 Ringkasan Peta Kerentanan

| No | Jenis Kerentanan | Lokasi / Titik Masukan (Vector) | Metode HTTP | Kategori OWASP |
|:---|:---|:---|:---|:---|
| 1 | **SQL Injection (Error-based & UNION)** | `/siswa?q=` dan `/api/siswa/search?q=` | `GET` | A03:2021 - Injection |
| 2 | **Reflected XSS** | `/siswa?q=` | `GET` | A03:2021 - Injection (XSS) |
| 3 | **Stored XSS** | Form Komentar di `/siswa/[id]` | `POST /api/komentar` | A03:2021 - Injection (XSS) |
| 4 | **Path Traversal / Arbitrary File Read** | `/api/foto?file=` | `GET` | A01:2021 - Broken Access Control |

---

## 1. 💉 SQL Injection (Pencarian Siswa)

### A. Lokasi Endpoint
- **Halaman Web:** `http://localhost:3000/siswa` (Kotak input pencarian)
- **API Langsung:** `http://localhost:3000/api/siswa/search?q=<input>`

### B. Mekanisme Masalah
Pada file `lib/siswa.js`, fungsi `cariSiswa()` menggabungkan string pencarian pengguna secara langsung (konkatenasi) ke dalam query SQL:
```sql
SELECT ... FROM siswa WHERE nama_lengkap LIKE '%${q}%' ...
```

### C. Langkah Analisis & Pengujian
1. **Deteksi Sintaks Error (Fuzzing Karakter Khusus):**
   - Masukkan karakter tanda petik satu `'` pada kolom pencarian.
   - **Hasil:** Aplikasi dalam mode rentan membocorkan pesan galat MariaDB secara eksplisit (`You have an error in your SQL syntax; check the manual...`). Hal ini mengonfirmasi bahwa input pengguna langsung diparsing oleh mesin basis data.
2. **Uji Logika Boolean (Tautologi):**
   - Masukkan kata kunci pembatal filter:
     ```text
     ' OR 1=1 -- -
     ```
     atau
     ```text
     %' OR '1'='1
     ```
   - **Hasil:** Seluruh daftar 32 siswa akan muncul meskipun tidak ada nama yang cocok dengan kata kunci asli.
3. **Ekstraksi Data Lintas Tabel (UNION-Based SQLi):**
   - Tabel `siswa` memiliki 10 kolom data: `id, nama_lengkap, nama_panggilan, kelas, keahlian, skill, minat_hobi, cita_cita, deskripsi, foto`.
   - Masukkan query UNION untuk membaca tabel `users`:
     ```text
     ' UNION SELECT 1, username, 'Guru', 'XI TKJ 3', password, role, nama, '', '', '' FROM users -- -
     ```
   - **Hasil:** Kredensial akun admin dan guru (`admin:admin123`, `guru.tkj:guru456`) terangkat dan tampil sebagai kartu siswa palsu di layar.

### D. Remediasi (Mode Aman)
Gunakan *Parameterized Query* (*Prepared Statement*):
```javascript
const [rows] = await db.execute(
  "SELECT ... FROM siswa WHERE nama_lengkap LIKE ? OR keahlian LIKE ?",
  [`%${q}%`, `%${q}%`]
);
```

---

## 2. ⚡ Reflected XSS (Cross-Site Scripting Terpantul)

### A. Lokasi Endpoint
- **Halaman Web:** `http://localhost:3000/siswa?q=<payload>`

### B. Mekanisme Masalah
Pada file `app/siswa/page.js`, kata kunci pencarian dari parameter `q` dirender langsung ke dalam DOM antarmuka pengguna tanpa sanitasi entitas HTML:
```jsx
<span dangerouslySetInnerHTML={{ __html: `Hasil untuk "${kata}"` }} />
```

### C. Langkah Analisis & Pengujian
1. **Deteksi Pemantulan (Reflection):**
   - Lakukan pencarian dengan teks biasa, amati teks yang muncul pada header hasil: `Hasil untuk "kata_kunci"`.
2. **Injeksi Tag HTML & Skrip:**
   - Masukkan payload uji coba pada URL atau form input:
     ```html
     <img src=x onerror=alert('Reflected-XSS')>
     ```
     atau:
     ```html
     <svg onload=alert(document.domain)>
     ```
   - Akses URL langsung:
     ```text
     http://localhost:3000/siswa?q=%3Cimg+src%3Dx+onerror%3Dalert('Reflected-XSS')%3E
     ```
   - **Hasil:** Kotak dialog alert browser akan segera muncul begitu halaman dimuat karena tag HTML dijalankan oleh browser korban seketika.

### D. Remediasi (Mode Aman)
Gunakan encoding kontekstual teks bawaan React/JSX tanpa `dangerouslySetInnerHTML`:
```jsx
<p>Hasil untuk &ldquo;<strong>{kata}</strong>&rdquo;</p>
```

---

## 3. 💾 Stored XSS (Cross-Site Scripting Tersimpan)

### A. Lokasi Endpoint
- **Halaman Web:** Profil detail siswa di `http://localhost:3000/siswa/1` (Form Komentar dan Buku Tamu)
- **Endpoint Pengiriman:** `POST /api/komentar`
  - Payload JSON: `{"siswa_id": 1, "penulis": "...", "isi": "..."}`

### B. Mekanisme Masalah
1. Backend (`lib/siswa.js` fungsi `tambahKomentar`) tidak menyaring atau membersihkan tag HTML pada saat penyimpanan ke basis data MariaDB.
2. Komponen frontend (`components/CommentSection.js`) merender isi komentar menggunakan `dangerouslySetInnerHTML`:
```jsx
<div dangerouslySetInnerHTML={{ __html: String(k.isi) }} />
```

### C. Langkah Analisis & Pengujian

#### Cara 1: Langsung melalui Form Web di Browser (Tanpa curl / Tanpa API)
1. Buka browser dan kunjungi profil siswa mana saja, misalnya: `http://localhost:3000/siswa/1`.
2. Gulir ke bawah ke bagian **Komentar dan Buku Tamu**.
3. Isi kolom:
   - **Nama:** `Pengunjung`
   - **Komentar:** 
     ```html
     <img src=x onerror=alert('Stored-XSS')>
     ```
4. Klik tombol **Kirim Komentar**.
5. **Hasil:** Form langsung mengirim data ke basis data MariaDB melalui Server Action dan halaman seketika mengeksekusi payload XSS di browser. **Tidak perlu menjalankan curl ataupun membuka terminal.**

#### Cara 2: Melalui API (Opsional / Script Otomasi)
Bagi yang ingin menguji via terminal atau tools otomatis:
```bash
curl -X POST http://localhost:3000/api/komentar \
  -H "Content-Type: application/json" \
  -d '{"siswa_id": 1, "penulis": "attacker", "isi": "<img src=x onerror=alert(1)>"}'
```

#### 💡 Catatan Penting Mengenai Sintaks Payload (Mencegah `SyntaxError`)
Jika menemukan error browser `Uncaught SyntaxError: Invalid or unexpected token`, perhatikan penulisan tanda petik pada atribut HTML:
- ✅ **Sintaks Valid:**
  - `<img src=x onerror=alert(1)>` (menggunakan angka/tanpa spasi)
  - `<img src=x onerror="alert('Halo Dunia')">` (seluruh isi atribut dibungkus tanda petik ganda)
- ❌ **Sintaks Menyebabkan SyntaxError:**
  - `<img src=x onerror=alert("Halo Dunia")>` (karena atribut `onerror` tidak dibungkus petik, spasi dan petik ganda di tengah akan memotong kode JavaScript sebelum ditutup, menyebabkan browser mengeksekusi kode terpotong dan menghasilkan galat sintaks).

### D. Remediasi (Mode Aman)
1. **Sanitasi di Sisi Server:** Hapus tag yang tidak diizinkan sebelum disimpan ke database.
2. **Output Encoding:** Render data teks murni pada komponen React:
```jsx
<p className="whitespace-pre-wrap">{k.isi}</p>
```

---

## 4. 📁 Path Traversal (Arbitrary File Read)

### A. Lokasi Endpoint
- **URL Endpoint:** `http://localhost:3000/api/foto?file=<nama_berkas>`

### B. Mekanisme Masalah
Pada `app/api/foto/route.js`, nilai parameter `file` digabungkan langsung dengan direktori penyimpanan aset lokal menggunakan `path.join`:
```javascript
const FOTO_DIR = path.join(process.cwd(), "data", "foto");
const filePath = path.join(FOTO_DIR, file);
const data = await fs.readFile(filePath);
```
Karakter traversal seperti `../` tidak dinormalisasi atau divalidasi.

### C. Langkah Analisis & Pengujian
1. Perhatikan URL foto profil siswa yang normal:
   ```text
   http://localhost:3000/api/foto?file=siswa-01.svg
   ```
2. Manfaatkan karakter direktori mundur (`../`) untuk keluar dari folder `data/foto/`:
   - Membaca file konfigurasi project:
     ```text
     http://localhost:3000/api/foto?file=../../package.json
     ```
   - Membaca template file env:
     ```text
     http://localhost:3000/api/foto?file=../../.env.example
     ```
   - Membaca data schema SQL:
     ```text
     http://localhost:3000/api/foto?file=../../database/schema.sql
     ```
3. **Hasil:** Isi berkas sensitif dari sistem file server dikirimkan kembali ke browser sebagai respons teks/file biner.

### D. Remediasi (Mode Aman)
Validasi nama berkas dasar (*basename*), batasi ekstensi via whitelist, dan pastikan path yang diselesaikan berada di dalam direktori yang diizinkan:
```javascript
const nama = path.basename(file);
const resolved = path.resolve(FOTO_DIR, nama);
if (!resolved.startsWith(FOTO_DIR + path.sep)) {
  return new NextResponse("Akses ditolak", { status: 400 });
}
```

---

## 🔄 Menguji Perbandingan Mode (Rentan vs Aman)

Untuk memvalidasi bahwa sistem pertahanan berfungsi dengan benar, ubah konfigurasi pada `.env`:

### Mode Rentan (Praktikum):
```env
SECURE_MODE=0
```
Jalankan server:
```bash
npm run dev
```
*Semua skenario pengujian di atas dapat direproduksi.*

---

### Mode Aman (Hasil Remediasi):
```env
SECURE_MODE=1
```
Atau jalankan script otomatis:
```bash
npm run dev:aman
```
*Hasil pengujian:*
- **SQLi:** Karakter `' OR 1=1 -- -` dianggap sebagai pencarian string harfiah (tidak merusak sintaks query).
- **Reflected XSS:** Payload dicetak sebagai teks biasa (`<img src=...>` tampil sebagai teks, bukan elemen HTML aktif).
- **Stored XSS:** Tag dibersihkan di server dan dirender dengan aman.
- **Path Traversal:** Percobaan `../../` dibalas dengan HTTP status `400 Bad Request`.
