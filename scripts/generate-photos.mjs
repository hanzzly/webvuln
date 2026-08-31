/**
 * generate-photos.js — Membuat foto placeholder SVG (avatar inisial) untuk
 * seluruh siswa + foto kelas ke folder data/foto.
 * Jalankan: npm run foto
 */
import fs from "node:fs/promises";
import path from "node:path";

const PALET = [
  ["#0ea5e9", "#6366f1"],
  ["#f43f5e", "#f97316"],
  ["#10b981", "#0ea5e9"],
  ["#8b5cf6", "#ec4899"],
  ["#f59e0b", "#ef4444"],
  ["#06b6d4", "#3b82f6"],
  ["#84cc16", "#10b981"],
  ["#a855f7", "#6366f1"],
  ["#ef4444", "#8b5cf6"],
  ["#14b8a6", "#22c55e"],
  ["#f97316", "#eab308"],
  ["#3b82f6", "#0ea5e9"],
];

function initials(nama) {
  return nama
    .split(/\s+/)
    .slice(0, 2)
    .map((k) => k[0])
    .join("")
    .toUpperCase();
}

function avatarSvg(nama, panggilan, [c1, c2]) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="480" viewBox="0 0 480 480">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${c1}"/>
      <stop offset="1" stop-color="${c2}"/>
    </linearGradient>
  </defs>
  <rect width="480" height="480" fill="url(#g)"/>
  <circle cx="405" cy="75" r="150" fill="#ffffff" opacity="0.10"/>
  <circle cx="55" cy="430" r="120" fill="#0f172a" opacity="0.18"/>
  <circle cx="240" cy="240" r="158" fill="#0f172a" opacity="0.12"/>
  <text x="240" y="278" font-family="'Segoe UI', Arial, sans-serif" font-size="140" font-weight="700"
        fill="#ffffff" text-anchor="middle" letter-spacing="4">${initials(nama)}</text>
  <text x="240" y="352" font-family="'Segoe UI', Arial, sans-serif" font-size="30" fill="#e2e8f0"
        text-anchor="middle">${panggilan}</text>
  <text x="240" y="440" font-family="'Segoe UI', Arial, sans-serif" font-size="22" fill="#e2e8f0"
        text-anchor="middle" opacity="0.85">XI TKJ 3</text>
</svg>`;
}

function kelasSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="640" viewBox="0 0 1200 640">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0f172a"/>
      <stop offset="0.55" stop-color="#1e293b"/>
      <stop offset="1" stop-color="#0e7490"/>
    </linearGradient>
    <linearGradient id="aksen" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#22d3ee"/>
      <stop offset="1" stop-color="#3b82f6"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="640" fill="url(#bg)"/>
  <g stroke="#334155" stroke-width="2" opacity="0.6">
    <line x1="0" y1="80" x2="1200" y2="80"/>
    <line x1="0" y1="560" x2="1200" y2="560"/>
    <line x1="80" y1="0" x2="80" y2="640"/>
    <line x1="1120" y1="0" x2="1120" y2="640"/>
  </g>
  <circle cx="180" cy="120" r="6" fill="#22d3ee"/>
  <circle cx="1020" cy="520" r="6" fill="#3b82f6"/>
  <g transform="translate(600, 250)" text-anchor="middle">
    <text font-family="'Segoe UI', Arial, sans-serif" font-size="26" letter-spacing="10"
          fill="#67e8f9">STUDENT PROFILE &amp; CLASS PORTFOLIO</text>
    <text y="130" font-family="'Segoe UI', Arial, sans-serif" font-size="150" font-weight="800"
          fill="#ffffff">XI TKJ 3</text>
    <rect x="-260" y="185" width="520" height="8" rx="4" fill="url(#aksen)"/>
    <text y="260" font-family="'Segoe UI', Arial, sans-serif" font-size="34" fill="#cbd5e1">
      Teknik Komputer &amp; Jaringan</text>
  </g>
  <g transform="translate(600, 545)" text-anchor="middle">
    <text font-family="'Segoe UI', Arial, sans-serif" font-size="24" fill="#94a3b8">
      💻 🖧 🛡 ⚙ 🌐</text>
  </g>
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
