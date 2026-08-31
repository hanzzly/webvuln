/**
 * API Komentar / buku tamu — PERMUKAAN SERANGAN XSS (stored).
 *
 * GET  /api/komentar?siswa_id=<id>  → daftar komentar siswa tersebut
 * POST /api/komentar  body JSON: { "siswa_id": <id>, "penulis": "...", "isi": "..." }
 *
 * Mode RENTAN: isi komentar disimpan mentah tanpa validasi/sanitasi, lalu
 *              ditampilkan kembali sebagai HTML (dangerouslySetInnerHTML)
 *              → Stored XSS.
 * Mode AMAN  : validasi panjang + sanitasi tag HTML + parameterized query,
 *              dan di sisi tampilan dirender sebagai teks biasa.
 */
import { NextResponse } from "next/server";
import { getKomentar, tambahKomentar } from "@/lib/siswa";
import { SECURE_MODE } from "@/lib/config";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const siswaId = request.nextUrl.searchParams.get("siswa_id") ?? "";
  try {
    const data = await getKomentar(siswaId);
    return NextResponse.json({ mode: SECURE_MODE ? "aman" : "rentan", data });
  } catch (err) {
    return NextResponse.json(
      { error: SECURE_MODE ? "Terjadi kesalahan pada server." : err.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body harus JSON." }, { status: 400 });
  }

  try {
    const hasil = await tambahKomentar(body);
    return NextResponse.json({ ok: true, data: hasil }, { status: 201 });
  } catch (err) {
    if (SECURE_MODE) {
      /* ✅ Mode aman: validasi gagal → pesan ringkas; error internal hanya di log. */
      const validasi = [
        "siswa_id tidak valid",
        "Nama wajib diisi (maks. 100 karakter)",
        "Komentar wajib diisi (maks. 500 karakter)",
      ];
      if (validasi.includes(err.message)) {
        return NextResponse.json({ error: err.message }, { status: 400 });
      }
      console.error("[api/komentar] error:", err.message);
      return NextResponse.json(
        { error: "Terjadi kesalahan pada server." },
        { status: 500 }
      );
    }
    /* ⚠️ Mode rentan: error SQL ikut bocor ke klien. */
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
