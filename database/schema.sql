-- ============================================================
-- Database untuk Website Profil Kelas XI TKJ 3
-- Praktikum Keamanan Aplikasi Web (SQLi, XSS, Path Traversal)
-- Dijalankan otomatis oleh: npm run db:init
-- ============================================================

CREATE DATABASE IF NOT EXISTS db_kelas_xitkj3 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- User khusus aplikasi (bukan root)
CREATE USER IF NOT EXISTS 'kelas_user'@'localhost' IDENTIFIED BY 'kelas_pass';
CREATE USER IF NOT EXISTS 'kelas_user'@'127.0.0.1' IDENTIFIED BY 'kelas_pass';
GRANT SELECT, INSERT, UPDATE, DELETE ON db_kelas_xitkj3.* TO 'kelas_user'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON db_kelas_xitkj3.* TO 'kelas_user'@'127.0.0.1';
FLUSH PRIVILEGES;

USE db_kelas_xitkj3;

DROP TABLE IF EXISTS komentar;
DROP TABLE IF EXISTS siswa;
DROP TABLE IF EXISTS users;

-- Tabel siswa profil kelas
CREATE TABLE siswa (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  nama_lengkap   VARCHAR(120) NOT NULL,
  nama_panggilan VARCHAR(60)  NOT NULL,
  kelas          VARCHAR(30)  NOT NULL DEFAULT 'XI TKJ 3',
  keahlian       VARCHAR(150) NOT NULL,
  skill          TEXT,
  minat_hobi     TEXT,
  cita_cita      VARCHAR(200),
  deskripsi      TEXT,
  foto           VARCHAR(200)
) ENGINE=InnoDB;

-- Tabel komentar / buku tamu (permukaan serangan XSS)
CREATE TABLE komentar (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  siswa_id   INT NOT NULL,
  penulis    VARCHAR(100) NOT NULL,
  isi        TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (siswa_id) REFERENCES siswa(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Tabel akun guru (TARGET demo dampak SQL Injection: kredensial bocor lewat UNION)
CREATE TABLE users (
  id       INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(60) NOT NULL,
  password VARCHAR(120) NOT NULL, -- sengaja plaintext untuk demo laboratorium
  nama     VARCHAR(120),
  role     VARCHAR(30)
) ENGINE=InnoDB;
