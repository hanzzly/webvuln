import "./globals.css";
import Navbar from "@/components/Navbar";
import Link from "next/link";

export const metadata = {
  title: "XI TKJ 3 — Belajar, Terhubung, Berkarya",
  description:
    "Website kelas XI TKJ 3—ruang belajar, kolaborasi, kegiatan, dan karya siswa Teknik Komputer dan Jaringan.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="flex min-h-screen flex-col antialiased">
        <a href="#konten-utama" className="skip-link">
          Lewati ke konten utama
        </a>
        <Navbar />
        <main id="konten-utama">{children}</main>
        <footer className="site-footer">
          <div className="section-shell footer-grid">
            <div className="footer-about">
              <Link href="/#beranda" className="brand footer-brand">
                <span className="brand-mark">XI</span>
                <span><strong>TKJ 3</strong><small>learn · connect · create</small></span>
              </Link>
              <p>Rumah digital kelas XI TKJ 3 untuk belajar, berbagi, dan merakit masa depan bersama.</p>
            </div>
            <div className="footer-column">
              <h3>Jelajahi</h3>
              <Link href="/#tentang">Tentang kami</Link><Link href="/#program">Program</Link><Link href="/#kegiatan">Kegiatan</Link><Link href="/#faq">FAQ</Link>
            </div>
            <div className="footer-column">
              <h3>Kontak</h3>
              <a href="mailto:xitkj3@sekolah.sch.id">xitkj3@sekolah.sch.id</a><span>Lab Komputer 3</span><span>Senin—Jumat, 07.00—15.00</span>
            </div>
            <div className="footer-column">
              <h3>Ikuti cerita kami</h3>
              <div className="social-links"><a href="#" aria-label="Instagram">ig</a><a href="#" aria-label="YouTube">yt</a><a href="#" aria-label="TikTok">tk</a></div>
              <p className="footer-note">Karya kecil. Cerita besar.</p>
            </div>
          </div>
          <div className="section-shell footer-bottom"><span>© 2026 XI TKJ 3. Dibuat bersama, dengan rasa ingin tahu.</span><Link href="/#beranda">Kembali ke awal ↑</Link></div>
        </footer>
      </body>
    </html>
  );
}
