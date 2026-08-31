/**
 * GET /api/foto?file=<nama file>
 *
 * PERMUKAAN SERANGAN PATH TRAVERSAL — endpoint penyaji foto siswa dari folder
 * data/foto di server.
 *
 * Mode RENTAN: nama file dari query string langsung digabung dengan
 *              path.join(FOTO_DIR, file) TANPA validasi. Payload seperti
 *              ?file=..\..\package.json dapat membaca file di luar folder foto.
 *
 * Mode AMAN  (perbaikan Path Traversal):
 *   1) Validasi nama file: harus nama sederhana (basename) — tanpa "../",
 *      tanpa path absolut, tanpa file tersembunyi (dotfile).
 *   2) Whitelist ekstensi gambar saja.
 *   3) Pembatasan direktori: hasil resolve harus berada di dalam FOTO_DIR.
 *   4) Kegagalan dibalas 400/404 tanpa membocorkan detail path server.
 */
import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import { SECURE_MODE } from "@/lib/config";

export const dynamic = "force-dynamic";

const FOTO_DIR = path.join(process.cwd(), "data", "foto");

const MIME = {
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

function balasError(status, pesanAman) {
  const pesan = SECURE_MODE
    ? pesanAman
    : pesanAman + (status >= 500 ? ` (detail: path server bocor di log/eksepsi)` : "");
  return new NextResponse(pesan, {
    status,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

export async function GET(request) {
  const file = request.nextUrl.searchParams.get("file") ?? "";

  let filePath;

  if (SECURE_MODE) {
    /* ✅ VERSI AMAN — perbaikan Path Traversal */

    // 1) Validasi nama file: tidak boleh mengandung pemisah direktori, "..",
    //    atau diawali titik (dotfile).
    const nama = path.basename(file);
    if (
      !file ||
      nama !== file || // berarti input memuat ../, ..\, atau absolute path
      file.includes("..") ||
      nama.startsWith(".")
    ) {
      return balasError(400, "Nama file tidak diizinkan.");
    }

    // 2) Whitelist ekstensi gambar.
    const ext = path.extname(nama).toLowerCase();
    if (!MIME[ext]) {
      return balasError(400, "Format file tidak diizinkan.");
    }

    // 3) Pembatasan direktori: pastikan hasil resolve tetap di dalam FOTO_DIR.
    const resolved = path.resolve(FOTO_DIR, nama);
    if (!resolved.startsWith(FOTO_DIR + path.sep)) {
      return balasError(400, "Nama file tidak diizinkan.");
    }

    filePath = resolved;
  } else {
    /* ⚠️ VERSI RENTAN — input pengguna dipakai langsung dalam pembentukan path. */
    filePath = path.join(FOTO_DIR, file);
  }

  try {
    const data = await fs.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    return new NextResponse(data, {
      status: 200,
      headers: {
        "Content-Type": MIME[ext] || "application/octet-stream",
        "Cache-Control": "public, max-age=60",
      },
    });
  } catch {
    return balasError(
      404,
      SECURE_MODE
        ? "File tidak ditemukan."
        : `File tidak ditemukan: ${filePath}` // ⚠️ mode rentan membocorkan path server
    );
  }
}
