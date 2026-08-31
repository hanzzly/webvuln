/**
 * db-init.js — Membuat database, tabel, user aplikasi, dan mengisi data awal.
 * Jalankan: npm run db:init
 * Memakai akun admin (root XAMPP default tanpa password) dari .env:
 *   DB_ADMIN_USER / DB_ADMIN_PASS
 * Data diambil dari database/siswa-data.json (sumber tunggal).
 */
import fs from "node:fs";
import path from "node:path";
import mysql from "mysql2/promise";

const DB_NAME = process.env.DB_NAME || "db_kelas_xitkj3";

async function main() {
  const rootDir = process.cwd();
  const schema = fs.readFileSync(path.join(rootDir, "database", "schema.sql"), "utf8");
  const data = JSON.parse(fs.readFileSync(path.join(rootDir, "database", "siswa-data.json"), "utf8"));

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_ADMIN_USER || "root",
    password: process.env.DB_ADMIN_PASS || "",
    multipleStatements: true,
  });

  console.log("→ Membuat database, user, dan tabel ...");
  await conn.query(schema);

  await conn.changeUser({ database: DB_NAME });

  console.log("→ Reset & isi data siswa ...");
  await conn.query("DELETE FROM komentar");
  await conn.query("DELETE FROM siswa");
  for (const s of data.siswa) {
    await conn.execute(
      `INSERT INTO siswa
        (nama_lengkap, nama_panggilan, kelas, keahlian, skill, minat_hobi, cita_cita, deskripsi, foto)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [s.nama_lengkap, s.nama_panggilan, s.kelas, s.keahlian, s.skill, s.minat_hobi, s.cita_cita, s.deskripsi, s.foto]
    );
  }

  console.log("→ Isi komentar contoh ...");
  const [rows] = await conn.query("SELECT id, nama_lengkap FROM siswa");
  const byName = Object.fromEntries(rows.map((r) => [r.nama_lengkap, r.id]));
  for (const k of data.komentar) {
    const siswaId = byName[k.nama_lengkap];
    if (!siswaId) continue;
    await conn.execute("INSERT INTO komentar (siswa_id, penulis, isi) VALUES (?, ?, ?)", [
      siswaId,
      k.penulis,
      k.isi,
    ]);
  }

  console.log("→ Isi akun guru (target demo SQLi UNION) ...");
  await conn.query("DELETE FROM users");
  for (const u of data.users) {
    await conn.execute("INSERT INTO users (username, password, nama, role) VALUES (?, ?, ?, ?)", [
      u.username,
      u.password,
      u.nama,
      u.role,
    ]);
  }

  const [c] = await conn.query("SELECT COUNT(*) AS n FROM siswa");
  console.log(`✓ Selesai. ${c[0].n} siswa tersimpan di ${DB_NAME}.`);
  await conn.end();
}

main().catch((err) => {
  console.error("Gagal init database:", err.message);
  process.exit(1);
});
