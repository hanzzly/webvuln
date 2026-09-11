/**
 * generate-photos.js — Membuat foto placeholder SVG (avatar inisial) untuk
 * seluruh siswa + foto kelas ke folder data/foto.
 * Jalankan: npm run foto
 */
import fs from "node:fs/promises";
import path from "node:path";

const PALET = ["#315a86", "#4f6f8f", "#3f6b63", "#765c4d", "#58647a", "#44647c"];

function initials(nama) {
  return nama
    .split(/\s+/)
    .slice(0, 2)
    .map((k) => k[0])
    .join("")
    .toUpperCase();
}

function avatarSvg(nama, panggilan, warna) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="480" viewBox="0 0 480 480">
  <rect width="480" height="480" fill="#eef2f6"/>
  <rect x="36" y="36" width="408" height="408" rx="18" fill="#ffffff" stroke="#d8e0e8" stroke-width="2"/>
  <circle cx="240" cy="204" r="112" fill="${warna}"/>
  <text x="240" y="244" font-family="Arial, sans-serif" font-size="112" font-weight="700"
        fill="#ffffff" text-anchor="middle" letter-spacing="2">${initials(nama)}</text>
  <text x="240" y="354" font-family="Arial, sans-serif" font-size="30" font-weight="600" fill="#1f2937"
        text-anchor="middle">${panggilan}</text>
  <text x="240" y="397" font-family="Arial, sans-serif" font-size="20" fill="#64748b"
        text-anchor="middle">XI TKJ 3</text>
</svg>`;
}

function kelasSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="640" viewBox="0 0 1200 640">
  <rect width="1200" height="640" fill="#eaf0f7"/>
  <rect x="44" y="44" width="1112" height="552" rx="24" fill="#ffffff" stroke="#d6dee8" stroke-width="2"/>
  <circle cx="600" cy="236" r="66" fill="#dbe7f5"/>
  <circle cx="600" cy="211" r="25" fill="#315a86"/>
  <path d="M548 286c7-35 26-54 52-54s45 19 52 54" fill="#315a86"/>
  <text x="600" y="378" font-family="Arial, sans-serif" font-size="52" font-weight="700"
        fill="#172033" text-anchor="middle">Foto Kelas XI TKJ 3</text>
  <text x="600" y="431" font-family="Arial, sans-serif" font-size="24" fill="#667085"
        text-anchor="middle">Tambahkan foto kelas pada berkas ini</text>
  <rect x="520" y="480" width="160" height="5" rx="2.5" fill="#1d4ed8"/>
</svg>`;
}

async function main() {
  const rootDir = process.cwd();
  const dir = path.join(rootDir, "data", "foto");
  await fs.mkdir(dir, { recursive: true });

  const data = JSON.parse(await fs.readFile(path.join(rootDir, "database", "siswa-data.json"), "utf8"));
  let i = 0;
  for (const s of data.siswa) {
    const warna = PALET[i % PALET.length];
    await fs.writeFile(path.join(dir, s.foto), avatarSvg(s.nama_lengkap, s.nama_panggilan, warna));
    i++;
  }
  await fs.writeFile(path.join(dir, "foto-kelas.svg"), kelasSvg());
  console.log(`✓ ${i + 1} foto SVG dibuat di data/foto/`);
}

main().catch((err) => {
  console.error("Gagal membuat foto:", err.message);
  process.exit(1);
});
