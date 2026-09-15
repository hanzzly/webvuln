"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const STATS = [
  { value: 36, suffix: "", label: "Teman sekelas" },
  { value: 12, suffix: "+", label: "Proyek kolaborasi" },
  { value: 8, suffix: "", label: "Kompetensi utama" },
  { value: 100, suffix: "%", label: "Semangat belajar" },
];

const PROGRAMS = [
  { number: "01", icon: "⌁", title: "Jaringan Komputer", text: "Merancang, memasang, dan merawat jaringan yang stabil untuk kebutuhan nyata.", className: "masonry-tall card-blue" },
  { number: "02", icon: "</>", title: "Web Development", text: "Mengubah gagasan menjadi situs yang responsif, rapi, dan mudah digunakan.", className: "card-vanilla" },
  { number: "03", icon: "◎", title: "Administrasi Server", text: "Mengelola layanan, pengguna, penyimpanan, dan keamanan server dasar.", className: "card-pink" },
  { number: "04", icon: "⚡", title: "Cyber Security", text: "Belajar mengenali risiko digital dan membangun kebiasaan berinternet yang aman.", className: "masonry-tall card-chalk" },
  { number: "05", icon: "◌", title: "Internet of Things", text: "Menghubungkan sensor dan perangkat untuk menyelesaikan masalah di sekitar kita.", className: "card-rose" },
  { number: "06", icon: "✦", title: "Proyek Kreatif", text: "Melatih komunikasi, dokumentasi, dan kerja tim melalui karya lintas pelajaran.", className: "card-vanilla" },
];

const PLANS = [
  { name: "Ruang Belajar", price: "Gratis", note: "Untuk semua warga kelas", features: ["Ringkasan materi", "Jadwal piket & agenda", "Galeri karya kelas"] },
  { name: "Lab Kolaborasi", price: "Inti", note: "Program unggulan kelas", featured: true, features: ["Semua fasilitas belajar", "Praktik lab mingguan", "Mentoring teman sebaya", "Portofolio proyek"] },
  { name: "Partner Karya", price: "Terbuka", note: "Untuk sekolah & komunitas", features: ["Kolaborasi proyek", "Kunjungan dan berbagi ilmu", "Publikasi karya bersama"] },
];

const FAQS = [
  { question: "Apa itu jurusan Teknik Komputer dan Jaringan?", answer: "TKJ adalah bidang keahlian yang mempelajari perakitan komputer, jaringan, server, layanan digital, serta dasar keamanan siber. Pembelajarannya memadukan teori dengan banyak praktik langsung." },
  { question: "Apakah siswa harus sudah bisa coding?", answer: "Tidak. Kami belajar dari dasar dan bertumbuh bersama melalui latihan bertahap, diskusi, serta proyek kelompok. Rasa ingin tahu dan kemauan mencoba jauh lebih penting." },
  { question: "Kegiatan apa yang paling sering dilakukan XI TKJ 3?", answer: "Selain pelajaran kelas, kami rutin melakukan praktik jaringan, konfigurasi server, pengembangan web, presentasi proyek, piket lab, dan kegiatan kebersamaan kelas." },
  { question: "Bagaimana cara mengajak XI TKJ 3 berkolaborasi?", answer: "Silakan kirim pesan melalui formulir kontak di bawah. Ceritakan bentuk kegiatan, waktu, dan hasil yang diharapkan agar kami dapat membahasnya bersama wali kelas." },
];

function Reveal({ children, className = "", delay = 0 }) {
  const ref = useRef(null);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        element.classList.add("is-visible");
        observer.unobserve(element);
      }
    }, { threshold: 0.12 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return <div ref={ref} className={`reveal ${className}`} style={{ "--reveal-delay": `${delay}ms` }}>{children}</div>;
}

function Counter({ value, suffix }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    let frame;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      const start = performance.now();
      const animate = (now) => {
        const progress = Math.min((now - start) / 1300, 1);
        setCount(Math.round(value * (1 - Math.pow(1 - progress, 3))));
        if (progress < 1) frame = requestAnimationFrame(animate);
      };
      frame = requestAnimationFrame(animate);
      observer.disconnect();
    }, { threshold: 0.6 });
    observer.observe(element);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
  }, [value]);
  return <span ref={ref}>{count}{suffix}</span>;
}

function ContactForm() {
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const nextErrors = {};
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const message = String(data.get("message") || "").trim();
    if (name.length < 3) nextErrors.name = "Tulis nama minimal 3 karakter.";
    if (!/^\S+@\S+\.\S+$/.test(email)) nextErrors.email = "Masukkan alamat email yang valid.";
    if (message.length < 15) nextErrors.message = "Ceritakan kebutuhanmu minimal 15 karakter.";
    setErrors(nextErrors);
    setSubmitted(false);
    if (Object.keys(nextErrors).length === 0) {
      setSubmitted(true);
      event.currentTarget.reset();
    }
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>
      <div className="form-row">
        <label>
          Nama lengkap
          <input name="name" type="text" placeholder="Nama kamu" aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "name-error" : undefined} />
          {errors.name && <span className="field-error" id="name-error">{errors.name}</span>}
        </label>
        <label>
          Alamat email
          <input name="email" type="email" placeholder="nama@email.com" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "email-error" : undefined} />
          {errors.email && <span className="field-error" id="email-error">{errors.email}</span>}
        </label>
      </div>
      <label>
        Topik pesan
        <select name="topic" defaultValue="Kolaborasi proyek">
          <option>Kolaborasi proyek</option><option>Informasi kelas</option><option>Kunjungan sekolah</option><option>Lainnya</option>
        </select>
      </label>
      <label>
        Pesan
        <textarea name="message" rows="5" placeholder="Ceritakan ide atau kebutuhanmu..." aria-invalid={Boolean(errors.message)} aria-describedby={errors.message ? "message-error" : undefined} />
        {errors.message && <span className="field-error" id="message-error">{errors.message}</span>}
      </label>
      <div className="form-action">
        <button type="submit" className="button button-dark">Kirim pesan <span aria-hidden="true">↗</span></button>
        <p className="form-note">Kami biasanya merespons dalam 1–2 hari sekolah.</p>
      </div>
      {submitted && <p className="success-message" role="status">Terima kasih! Pesanmu sudah siap kami tindak lanjuti.</p>}
    </form>
  );
}

export default function Home() {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <>
      <section id="beranda" className="hero section-shell">
        <div className="hero-copy">
          <Reveal>
            <p className="kicker"><span>✦</span> Ruang tumbuh bersama</p>
            <h1>Belajar hari ini,<br /><em>merakit masa depan.</em></h1>
            <p className="hero-lead">Selamat datang di rumah digital <strong>XI TKJ 3</strong>—tempat rasa ingin tahu, kabel jaringan, dan ide-ide baik bertemu.</p>
            <div className="hero-actions">
              <a href="#tentang" className="button button-dark">Kenali kelas kami <span aria-hidden="true">↓</span></a>
              <a href="#program" className="text-link">Jelajahi program <span aria-hidden="true">↗</span></a>
            </div>
          </Reveal>
          <Reveal className="hero-note" delay={160}><span className="scribble-arrow" aria-hidden="true">↝</span><span>Berani mencoba.<br />Siap berkembang.</span></Reveal>
        </div>
        <Reveal className="hero-visual" delay={100}>
          <div className="tape tape-one" aria-hidden="true" /><div className="tape tape-two" aria-hidden="true" />
          <span className="doodle doodle-star" aria-hidden="true">✦</span><span className="doodle doodle-loop" aria-hidden="true">⌁</span>
          <Image src="/images/hero-xi-tkj-3.webp" alt="Ilustrasi siswa XI TKJ 3 berkolaborasi mengerjakan proyek jaringan komputer" width={1448} height={1086} priority sizes="(max-width: 820px) 92vw, 54vw" />
          <div className="hero-stamp"><strong>XI</strong><span>TKJ 3</span><small>2026</small></div>
        </Reveal>
      </section>

      <section className="stats-band" aria-label="Statistik kelas">
        <div className="section-shell stats-grid">
          {STATS.map((stat, index) => <Reveal key={stat.label} className="stat-item" delay={index * 90}><strong><Counter value={stat.value} suffix={stat.suffix} /></strong><span>{stat.label}</span></Reveal>)}
        </div>
      </section>

      <section id="tentang" className="about section-pad">
        <div className="section-shell about-grid">
          <Reveal className="about-heading"><p className="section-label">01 / Tentang kami</p><h2>Lebih dari sekadar<br /><em>satu kelas.</em></h2></Reveal>
          <Reveal className="about-copy" delay={100}>
            <p className="big-copy">Kami adalah kumpulan kepala yang suka penasaran, tangan yang tak takut mencoba, dan hati yang selalu siap membantu.</p>
            <p>Di XI TKJ 3, teknologi bukan cuma soal layar dan kabel. Ini tentang cara kami memecahkan masalah, saling menguatkan, dan menciptakan sesuatu yang bermanfaat.</p>
            <div className="signature">tumbuh • terhubung • berdampak</div>
          </Reveal>
        </div>
      </section>

      <section id="program" className="program section-pad">
        <div className="section-shell">
          <Reveal className="section-intro">
            <div><p className="section-label">02 / Yang kami pelajari</p><h2>Keterampilan untuk<br /><em>dunia yang terhubung.</em></h2></div>
            <p>Dari kabel pertama hingga layanan digital yang berjalan—kami belajar lewat praktik, refleksi, dan kerja sama.</p>
          </Reveal>
          <div className="masonry-grid">
            {PROGRAMS.map((program, index) => (
              <Reveal className={`program-card ${program.className}`} delay={(index % 3) * 100} key={program.title}>
                <div className="card-top"><span>{program.number}</span><i aria-hidden="true">{program.icon}</i></div>
                <div><h3>{program.title}</h3><p>{program.text}</p></div><span className="card-arrow" aria-hidden="true">↗</span>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="kegiatan" className="story section-pad">
        <div className="section-shell story-grid">
          <Reveal className="story-board"><div className="chalk-label">Catatan kelas</div><p className="chalk-big">“Hebat itu bukan<br />selalu paling bisa,<br />tapi selalu mau<br /><em>belajar lagi.</em>”</p><div className="chalk-doodles" aria-hidden="true">✦　↗　⌁</div></Reveal>
          <div className="story-copy">
            <Reveal><p className="section-label">03 / Cara kami bertumbuh</p><h2>Proses kecil,<br /><em>cerita besar.</em></h2></Reveal>
            <div className="timeline">
              {[["01", "Amati", "Mencari tahu persoalan di sekitar sekolah dan kehidupan sehari-hari."], ["02", "Rancang", "Menyusun solusi sederhana, membagi peran, lalu menyiapkan alat."], ["03", "Coba", "Menguji, mencatat kegagalan, memperbaiki, dan berani mencoba lagi."], ["04", "Bagikan", "Mempresentasikan karya agar pengetahuan bisa tumbuh bersama."]].map((item, index) => (
                <Reveal className="timeline-item" delay={index * 80} key={item[0]}><span>{item[0]}</span><div><h3>{item[1]}</h3><p>{item[2]}</p></div></Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="ruang-belajar" className="pricing section-pad">
        <div className="section-shell">
          <Reveal className="center-heading"><p className="section-label">04 / Ruang belajar</p><h2>Akses untuk <em>semua.</em></h2><p>Belajar terbaik terjadi saat sumber daya, dukungan, dan kesempatan dibagikan.</p></Reveal>
          <div className="pricing-grid">
            {PLANS.map((plan, index) => (
              <Reveal className={`price-card ${plan.featured ? "featured" : ""}`} delay={index * 100} key={plan.name}>
                {plan.featured && <span className="popular-tag">Paling aktif</span>}
                <p className="price-name">{plan.name}</p><h3>{plan.price}</h3><p className="price-note">{plan.note}</p>
                <ul>{plan.features.map((feature) => <li key={feature}><span>✓</span>{feature}</li>)}</ul>
                <a href="#kontak" className={`button ${plan.featured ? "button-pink" : "button-outline"}`}>Mulai terhubung</a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="faq section-pad">
        <div className="section-shell faq-grid">
          <Reveal className="faq-heading"><p className="section-label">05 / Sering ditanyakan</p><h2>Masih<br /><em>penasaran?</em></h2><p>Mungkin jawabannya sudah kami tulis di sini. Jika belum, kirimkan pesan saja.</p></Reveal>
          <div className="accordion">
            {FAQS.map((item, index) => {
              const isOpen = openFaq === index;
              return (
                <Reveal className={`faq-item ${isOpen ? "open" : ""}`} delay={index * 70} key={item.question}>
                  <button type="button" aria-expanded={isOpen} aria-controls={`faq-panel-${index}`} onClick={() => setOpenFaq(isOpen ? -1 : index)}><span>{String(index + 1).padStart(2, "0")}</span><strong>{item.question}</strong><i aria-hidden="true">{isOpen ? "−" : "+"}</i></button>
                  <div id={`faq-panel-${index}`} className="faq-answer" aria-hidden={!isOpen}><p>{item.answer}</p></div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section id="kontak" className="contact section-pad">
        <div className="section-shell contact-grid">
          <Reveal className="contact-copy"><p className="section-label light">06 / Mari terhubung</p><h2>Punya ide?<br /><em>Ngobrol, yuk.</em></h2><p>Kami terbuka untuk kolaborasi, berbagi pengalaman, atau sekadar bertukar cerita tentang dunia teknologi.</p><div className="contact-details"><a href="mailto:xitkj3@sekolah.sch.id">xitkj3@sekolah.sch.id</a><span>Senin—Jumat · 07.00—15.00 WIB</span></div></Reveal>
          <Reveal className="form-card" delay={100}><ContactForm /></Reveal>
        </div>
      </section>
    </>
  );
}
