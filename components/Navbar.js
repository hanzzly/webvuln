"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const LINKS = [
  ["Tentang", "#tentang"],
  ["Program", "#program"],
  ["Kegiatan", "#kegiatan"],
  ["FAQ", "#faq"],
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 24);
      setShowTop(window.scrollY > 600);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const closeOnResize = () => { if (window.innerWidth > 820) setOpen(false); };
    window.addEventListener("resize", closeOnResize);
    return () => window.removeEventListener("resize", closeOnResize);
  }, []);

  return (
    <>
      <header className={`site-header ${scrolled ? "scrolled" : ""}`}>
        <nav className="section-shell nav-wrap" aria-label="Navigasi utama">
          <Link href="/#beranda" className="brand" onClick={() => setOpen(false)} aria-label="XI TKJ 3 - Beranda">
            <span className="brand-mark">XI</span>
            <span><strong>TKJ 3</strong><small>learn · connect · create</small></span>
          </Link>
          <button className={`menu-toggle ${open ? "open" : ""}`} type="button" aria-label={open ? "Tutup menu" : "Buka menu"} aria-expanded={open} aria-controls="nav-links" onClick={() => setOpen((value) => !value)}>
            <span /><span /><span />
          </button>
          <div id="nav-links" className={`nav-links ${open ? "open" : ""}`}>
            {LINKS.map(([label, href]) => <Link href={`/${href}`} key={label} onClick={() => setOpen(false)}>{label}</Link>)}
            <Link href="/#kontak" className="nav-cta" onClick={() => setOpen(false)}>Hubungi kami <span>↗</span></Link>
          </div>
        </nav>
      </header>
      <button type="button" className={`back-top ${showTop ? "visible" : ""}`} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="Kembali ke atas">↑</button>
    </>
  );
}
