"use server";

import { tambahKomentar } from "@/lib/siswa";
import { revalidatePath } from "next/cache";

export async function kirimKomentarAction(formData) {
  const siswaId = formData.get("siswa_id");
  const penulis = String(formData.get("penulis") ?? "").trim();
  const isi = String(formData.get("isi") ?? "").trim();

  try {
    await tambahKomentar({ siswaId, penulis, isi });
    revalidatePath(`/siswa/${siswaId}`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

export async function hapusKomentarAction(id, siswaId) {
  try {
    await import("@/lib/siswa").then((m) => m.hapusKomentar(id));
    if (siswaId) revalidatePath(`/siswa/${siswaId}`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

