/**
 * lib/siswa.js — Semua akses data siswa & komentar.
 *
 * File ini berisi DUA versi implementasi untuk setiap fungsi:
 *   ⚠️  VERSI RENTAN  (SECURE_MODE=0) — untuk praktikum menemukan & menganalisis kerentanan
 *   ✅ VERSI AMAN     (SECURE_MODE=1) — perbaikan: parameterized query / prepared statement,
 *                                        validasi & sanitasi input, output encoding
 *
 * Dokumentasi lengkap: docs/ANALISIS-KEAMANAN.md
 */
import { getPool } from "./db";
import { SECURE_MODE } from "./config";

const KOLOM = `id, nama_lengkap, nama_panggilan, kelas, keahlian, skill, minat_hobi,
  cita_cita, deskripsi, foto`;

/* ------------------------------------------------------------------ */
/* Statistik                                                           */
/* ------------------------------------------------------------------ */

export async function countSiswa() {
  const [rows] = await getPool().query("SELECT COUNT(*) AS total FROM siswa");
  return rows[0].total;
}

export async function countKeahlian() {
  const [rows] = await getPool().query(
    "SELECT COUNT(DISTINCT keahlian) AS total FROM siswa"
  );
  return rows[0].total;
}

/* ------------------------------------------------------------------ */
/* Daftar & pencarian siswa                                            */
/* ------------------------------------------------------------------ */

export async function getAllSiswa() {
  const [rows] = await getPool().query(
    `SELECT ${KOLOM} FROM siswa ORDER BY id`
  );
  return rows;
}

/**
 * Pencarian siswa berdasarkan kata kunci — PERMUKAAN SERANGAN SQL INJECTION #1.
 * Dipakai oleh: halaman /siswa?q=... dan API GET /api/siswa/search?q=...
 */
export async function cariSiswa(kataKunci) {
  const q = String(kataKunci ?? "");

  if (SECURE_MODE) {
    /* ✅ VERSI AMAN — parameterized query (prepared statement).
     * Input pengguna HANYA dikirim sebagai nilai parameter (?), tidak pernah
     * digabung ke string SQL, jadi tidak bisa mengubah struktur query. */
    const like = `%${q}%`;
    const [rows] = await getPool().execute(
      `SELECT ${KOLOM} FROM siswa
       WHERE nama_lengkap LIKE ? OR nama_panggilan LIKE ? OR keahlian LIKE ?
       ORDER BY id`,
      [like, like, like]
    );
    return rows;
  }

  /* ⚠️ VERSI RENTAN — input pengguna digabung langsung (string concatenation)
   * ke dalam query SQL. Payload seperti  ' OR 1=1 -- -  dapat mengubah
   * struktur query → SQL Injection. */
  const sql = `SELECT ${KOLOM} FROM siswa
    WHERE nama_lengkap LIKE '%${q}%' OR nama_panggilan LIKE '%${q}%' OR keahlian LIKE '%${q}%'
    ORDER BY id`;
  const [rows] = await getPool().query(sql);
  return rows;
}

/* ------------------------------------------------------------------ */
/* Detail siswa — PERMUKAAN SERANGAN SQL INJECTION #2                  */
/* Dipakai oleh: halaman profil /siswa/[id]                            */
/* ------------------------------------------------------------------ */

export async function getSiswaById(id) {
  if (SECURE_MODE) {
    /* ✅ VERSI AMAN — id dipaksa jadi angka lalu dikirim sebagai parameter. */
    const [rows] = await getPool().execute(
      `SELECT ${KOLOM} FROM siswa WHERE id = ? LIMIT 1`,
      [Number(id)]
    );
    return rows[0] ?? null;
  }

  /* ⚠️ VERSI RENTAN — id dari URL digabung langsung ke query. */
  const sql = `SELECT ${KOLOM} FROM siswa WHERE id = '${id}' LIMIT 1`;
  const [rows] = await getPool().query(sql);
  return rows[0] ?? null;
}

/* ------------------------------------------------------------------ */
/* Komentar / buku tamu — PERMUKAAN SERANGAN XSS (stored)              */
/* Dipakai oleh: halaman profil + API /api/komentar                    */
/* ------------------------------------------------------------------ */

export async function getKomentar(siswaId) {
  if (SECURE_MODE) {
    /* ✅ VERSI AMAN — siswa_id divalidasi sebagai bilangan bulat. */
    const id = Number.parseInt(siswaId, 10);
    if (!Number.isInteger(id) || id < 1) return [];
    const [rows] = await getPool().execute(
      `SELECT id, siswa_id, penulis, isi, created_at
       FROM komentar WHERE siswa_id = ? ORDER BY created_at DESC, id DESC`,
      [id]
    );
    return rows;
  }

  /* ⚠️ VERSI RENTAN — nilai langsung digabung ke query. */
  const sql = `SELECT id, siswa_id, penulis, isi, created_at
    FROM komentar WHERE siswa_id = ${siswaId} ORDER BY created_at DESC, id DESC`;
  const [rows] = await getPool().query(sql);
  return rows;
}

export async function tambahKomentar({ siswaId, siswa_id, penulis, isi }) {
  const idRaw = siswaId ?? siswa_id;

  if (SECURE_MODE) {
    /* ✅ VERSI AMAN — pertahanan berlapis:
     * 1) Validasi input: panjang wajar, tipe data benar.
     * 2) Sanitasi: HTML tidak diizinkan di komentar → semua tag dihapus
     *    (jika suatu saat perlu rich-text, gunakan library sanitasi seperti
     *    DOMPurify, JANGAN regex buatan sendiri).
     * 3) Parameterized query untuk menyimpan ke database.
     * 4) Output encoding: di sisi tampilan komentar dirender sebagai TEKS
     *    (React otomatis meng-escape), bukan HTML mentah. */
    const id = Number.parseInt(idRaw, 10);
    const nama = String(penulis ?? "").trim();
    const teks = String(isi ?? "").trim();

    if (!Number.isInteger(id) || id < 1) throw new Error("siswa_id tidak valid");
    if (!nama || nama.length > 100) throw new Error("Nama wajib diisi (maks. 100 karakter)");
    if (!teks || teks.length > 500) throw new Error("Komentar wajib diisi (maks. 500 karakter)");

    const tanpaTag = teks.replace(/<[^>]*>/g, ""); // komentar tidak boleh berisi HTML

    const [hasil] = await getPool().execute(
      "INSERT INTO komentar (siswa_id, penulis, isi) VALUES (?, ?, ?)",
      [id, nama, tanpaTag]
    );
    return { id: hasil.insertId, siswa_id: id, penulis: nama, isi: tanpaTag };
  }

  /* ⚠️ VERSI RENTAN — dua kerentanan sekaligus:
   * 1) TANPA validasi/sanitasi: isi komentar apa pun (termasuk <script>,
   *    <img onerror=...>) disimpan mentah → Stored XSS saat ditampilkan lagi.
   * 2) Query juga digabung dengan string → bisa SQL Injection. */
  const sql = `INSERT INTO komentar (siswa_id, penulis, isi)
    VALUES (${idRaw}, '${penulis}', '${isi}')`;
  const [hasil] = await getPool().query(sql);
  return { id: hasil.insertId, siswa_id: Number(siswaId), penulis, isi };
}
