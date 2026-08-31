/**
 * Konfigurasi global (boleh diimport di server & client — tidak ada modul Node di sini).
 */

// SECURE_MODE=1 → semua fitur memakai versi SUDAH DIPERBAIKI (aman).
// SECURE_MODE=0 → versi RENTAN (sengaja, untuk praktikum).
export const SECURE_MODE = process.env.SECURE_MODE === "1";

export const KELAS = "XI TKJ 3";
export const SCHOOL_NAME = process.env.NEXT_PUBLIC_SCHOOL_NAME || "SMK Bina Teknologi";

export const DESKRIPSI_KELAS =
  "Mengenal lebih dekat siswa-siswa XI TKJ 3: keahlian, minat, dan potensi mereka. " +
  "Kelas ini fokus pada jaringan komputer, server, keamanan siber, dan pengembangan aplikasi web.";

// Label mode untuk badge di UI
export const MODE_LABEL = SECURE_MODE ? "🔒 MODE AMAN" : "⚠️ MODE RENTAN";
