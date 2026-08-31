/**
 * Koneksi MariaDB (pool singleton) untuk aplikasi.
 * Kredensial dibaca dari .env (lihat .env.example).
 */
import mysql from "mysql2/promise";

let pool;

export function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST || "127.0.0.1",
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER || "kelas_user",
      password: process.env.DB_PASS || "kelas_pass",
      database: process.env.DB_NAME || "db_kelas_xitkj3",
      waitForConnections: true,
      connectionLimit: 10,
    });
  }
  return pool;
}
