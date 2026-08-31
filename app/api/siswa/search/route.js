/**
 * GET /api/siswa/search?q=<kata kunci>
 *
 * PERMUKAAN SERANGAN SQL INJECTION (dipakai juga oleh halaman Daftar Siswa).
 * - Mode RENTAN: kata kunci digabung langsung ke query (lihat lib/siswa.js).
 * - Mode AMAN  : parameterized query.
 */
import { NextResponse } from "next/server";
import { cariSiswa } from "@/lib/siswa";
import { SECURE_MODE } from "@/lib/config";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const q = request.nextUrl.searchParams.get("q") ?? "";

  try {
    const data = await cariSiswa(q);
    return NextResponse.json({
      mode: SECURE_MODE ? "aman" : "rentan",
      query: q,
      jumlah: data.length,
      data,
    });
  } catch (err) {
    if (SECURE_MODE) {
      /* ✅ Mode aman: pesan error internal TIDAK dibocorkan ke klien. */
      console.error("[api/siswa/search] error:", err.message);
      return NextResponse.json(
        { error: "Terjadi kesalahan pada server." },
        { status: 500 }
      );
    }
    /* ⚠️ Mode rentan: detail error database (termasuk potongan SQL) ikut
     * dikirim ke klien → membantu attacker melakukan error-based SQLi. */
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
