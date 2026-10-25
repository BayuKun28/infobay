export const defaultProfileData = {
  biodata: {
    name: "Bayu Prastyo",
    nickname: "baydev",
    aliases: ["baydev", "bayukun", "masbay", "Mas Bay", "BayuKun28"],
    title: "Developer / Web Programmer",
    role: "Full-Stack Web & Mobile Engineer",
    email: "bayukundev@gmail.com",
    phone: "08991907216",
    location: "Yogyakarta / Karanganyar, Indonesia",
    avatar: "/images/avatar.png",
    statusBadge: "Available for Work & Collaboration",
    experienceYears: "7+",
    completedProjects: "25+",
    hero_headline: "Full-Stack Web Developer & Solutions Architect",
    hero_subheadline: "Merancang dan membangun aplikasi web tangguh, scalable, berkinerja tinggi dengan Laravel, PostgreSQL, React, dan arsitektur modern.",
    role_badge: "AVAILABLE FOR WORK & CONTRACTS",
    experience_years_text: "7+ Tahun",
    projects_completed_text: "30+ Proyek",
    cv_file_url: "/storage/resumes/jSS4AeCO7WVzXjkkorCHq4g96fqKV2eVwySarAth.pdf",
    marquee_items: [
      "LARAVEL 13",
      "POSTGRESQL 17",
      "REACTJS VITE",
      "TAILWIND CSS",
      "MATERIAL UI",
      "DOCKER HOMELAB",
      "REST API ARCHITECTURE",
      "LINUX DEBIAN",
      "SYSTEM AUTOMATION"
    ],
    about: "Hi there, Bayu Prastyo here 👋 Selamat datang di website portofolio saya! Saya seorang Programmer profesional dengan fokus mendalam pada pembuatan dan pengembangan aplikasi web & mobile modern yang tangguh, aman, dan berkinerja tinggi. Saya memiliki pengalaman panjang dalam ekosistem web modern (React, Next.js, Laravel, PostgreSQL, Docker) serta senantiasa antusias berbagi dan belajar bersama komunitas pengembang.",
    socials: {
      github: "https://github.com/BayuKun28",
      facebook: "https://www.facebook.com/bhayou.bluedevil/",
      twitter: "https://x.com/namedbay33",
      instagram: "https://www.instagram.com/bayukun_28/",
    }
  },
  services: [
    {
      id: 1,
      title: "Web Design",
      category: "UI/UX & Prototypes",
      description: "Merancang antarmuka pengguna yang unik, intuitif, berkarakter kuat, dan responsif di seluruh perangkat dengan sentuhan modern.",
      icon: "/icons/services/web-design.svg",
      color: "bg-neo-yellow",
      tag: "CREATIVE & UI"
    },
    {
      id: 2,
      title: "Web Development",
      category: "Full-Stack Apps",
      description: "Membangun aplikasi web skala produksi yang cepat, modular, dan handal menggunakan React, Vite, Tailwind CSS, dan Laravel.",
      icon: "/icons/services/web-development.svg",
      color: "bg-neo-mint",
      tag: "CORE EXPERTISE"
    },
    {
      id: 3,
      title: "Mobile Apps",
      category: "Android & Cross-Platform",
      description: "Pengembangan aplikasi mobile fungsional dengan antarmuka yang bersih, sinkronisasi data real-time, dan performa mulus.",
      icon: "/icons/services/mobile-apps.svg",
      color: "bg-neo-pink",
      tag: "MOBILE DEV"
    },
    {
      id: 4,
      title: "Backend & Systems",
      category: "API & Databases",
      description: "Arsitektur RESTful API yang aman, optimasi query PostgreSQL, autentikasi Sanctum/JWT, dan integrasi server Linux.",
      icon: "/icons/services/backend.svg",
      color: "bg-neo-cyan",
      tag: "INFRA & DATA"
    }
  ],
  skills: [
    { name: "Web Application (Full-Stack)", percentage: 90, color: "bg-neo-yellow", badge: "EXPERT" },
    { name: "Web Design & UI/UX", percentage: 85, color: "bg-neo-mint", badge: "ADVANCED" },
    { name: "Graphic Design & Branding", percentage: 85, color: "bg-neo-pink", badge: "ADVANCED" },
    { name: "Mobile Application", percentage: 80, color: "bg-neo-cyan", badge: "PROFICIENT" },
    { name: "PostgreSQL & Database Architecture", percentage: 88, color: "bg-neo-lilac", badge: "EXPERT" },
    { name: "Linux Server & DevOps Deployment", percentage: 82, color: "bg-neo-yellow-light", badge: "ADVANCED" }
  ],
  techStack: [
    "ReactJS", "Next.js", "Vite", "Tailwind CSS", "JavaScript (ES6+)", "PHP 8.4", 
    "Laravel", "PostgreSQL", "RESTful API", "Sanctum Auth", "Docker", "Git", "Linux Debian"
  ],
  education: [
    {
      title: "SMKN 02 KARANGANYAR",
      period: "2016 — 2019",
      field: "Teknik Komputer dan Jaringan / Rekayasa Perangkat Lunak",
      description: "Fokus pada dasar-dasar jaringan komputer, perakitan hardware, logika algoritma, dan dasar pemrograman web.",
      badge: "FORMAL EDUCATION"
    }
  ],
  experience: [
    {
      title: "ANALTA KOMPUTER",
      period: "2018 — 2018",
      role: "Teknisi Komputer & Jaringan",
      description: "Instalasi perangkat keras, pemeliharaan sistem komputer klien, perbaikan sistem operasi, dan konfigurasi jaringan lokal.",
      badge: "EARLY CAREER"
    },
    {
      title: "PT GLOBAL INTERMEDIA NUSANTARA",
      period: "2019 — Sekarang",
      role: "Senior Web Programmer",
      description: "Memimpin dan mengembangkan beragam sistem informasi skala korporat & instansi pemerintahan daerah (Sistem Penjaminan Kredit Daerah, GIS Desa Pintar, CMS Portal Berita, E-Sewa, E-Pensiun). Mengoptimalkan arsitektur database relasional dan backend API handal.",
      badge: "7+ YEARS"
    }
  ],
  portfolios: [
    {
      id: 1,
      title: "Jamkrida Jatim",
      category: "Web Development",
      image: "https://baydev.my.id/assets/backend/images/portofolio/1757684189.png",
      link: "#",
      featured: true,
      description: "Sistem informasi manajemen penjaminan kredit untuk PT Jamkrida Jatim dengan integrasi data transaksi keuangan yang komprehensif."
    },
    {
      id: 2,
      title: "Jamkrida Bali",
      category: "Web Development",
      image: "https://baydev.my.id/assets/backend/images/portofolio/1757684201.png",
      link: "#",
      featured: true,
      description: "Portal digital dan aplikasi penjaminan kredit daerah Bali dengan modul monitoring portofolio perbankan mitra."
    },
    {
      id: 3,
      title: "GIS DESA PINTAR",
      category: "Web Development",
      image: "https://baydev.my.id/assets/backend/images/portofolio/1757684297.png",
      link: "#",
      featured: true,
      description: "Sistem Informasi Geografis (GIS) pemetaan aset, tata ruang desa, dan demografi penduduk berbasis peta digital interaktif."
    },
    {
      id: 4,
      title: "CMS PORTAL",
      category: "Web Development",
      image: "https://baydev.my.id/assets/backend/images/portofolio/1757684308.png",
      link: "#",
      featured: false,
      description: "Content Management System modular untuk publikasi berita, artikel, dan integrasi media sosial multi-user."
    },
    {
      id: 5,
      title: "CMS SIKAP",
      category: "Web Development",
      image: "https://baydev.my.id/assets/backend/images/portofolio/1757684320.png",
      link: "#",
      featured: false,
      description: "Sistem informasi kepengurusan dan administrasi kepegawaian dengan audit log terinci dan kontrol hak akses granular."
    },
    {
      id: 6,
      title: "E-SEWA",
      category: "Web Development",
      image: "https://baydev.my.id/assets/backend/images/portofolio/1757684331.png",
      link: "#",
      featured: true,
      description: "Platform digital pengelolaan sewa aset daerah dengan billing otomatis, tanda tangan elektronik, dan pelaporan keuangan."
    },
    {
      id: 7,
      title: "Login Management",
      category: "Mobile Development",
      image: "https://baydev.my.id/assets/backend/images/portofolio/1757684343.png",
      link: "#",
      featured: false,
      description: "Aplikasi mobile manajemen otentikasi multi-faktor dan single sign-on (SSO) untuk otorisasi karyawan aman."
    },
    {
      id: 8,
      title: "KASKOS",
      category: "Mobile Development",
      image: "https://baydev.my.id/assets/backend/images/portofolio/1757684352.png",
      link: "#",
      featured: true,
      description: "Aplikasi mobile pembukuan pengeluaran kos-kosan & pencatatan keuangan pribadi dengan grafik pengeluaran bulanan."
    },
    {
      id: 9,
      title: "Gallery App",
      category: "Mobile Development",
      image: "https://baydev.my.id/assets/backend/images/portofolio/1757684363.png",
      link: "#",
      featured: false,
      description: "Aplikasi galeri visual mobile dengan fitur kurasi album foto berkecepatan tinggi dan kompresi lokal cerdas."
    },
    {
      id: 10,
      title: "To do task",
      category: "Mobile Development",
      image: "https://baydev.my.id/assets/backend/images/portofolio/1757684373.png",
      link: "#",
      featured: false,
      description: "Aplikasi produktivitas mobile harian dengan pengingat waktu, kategori prioritas kanban, dan sinkronisasi offline."
    },
    {
      id: 11,
      title: "Undangan Online",
      category: "Mobile Development",
      image: "https://baydev.my.id/assets/backend/images/portofolio/1757921841.png",
      link: "#",
      featured: false,
      description: "Aplikasi undangan digital interaktif dengan RSVP online, amplop digital, dan ucapan selamat real-time."
    },
    {
      id: 12,
      title: "KASKOS WEB",
      category: "Web Development",
      image: "https://baydev.my.id/assets/backend/images/portofolio/1757921680.png",
      link: "https://kaskos.bayukun.my.id/dashboard",
      featured: true,
      description: "Versi dashboard web untuk ekosistem Kaskos. Menghubungkan penghuni kos dengan pemilik secara terpusat."
    },
    {
      id: 13,
      title: "POS KELONTONG",
      category: "Web Development",
      image: "https://baydev.my.id/assets/backend/images/portofolio/1757921852.png",
      link: "#",
      featured: false,
      description: "Point of Sales (POS) kasir toko kelontong berbasis web dengan barcode scanner, stok barang otomatis, dan cetak struk thermal."
    },
    {
      id: 14,
      title: "E-TPQ WHATSAPP BLAST",
      category: "Web Development",
      image: "https://baydev.my.id/assets/backend/images/portofolio/1757921861.png",
      link: "#",
      featured: false,
      description: "Sistem administrasi santri TPQ terintegrasi gateway WhatsApp untuk pengiriman laporan nilai dan absensi otomatis kepada wali santri."
    },
    {
      id: 15,
      title: "E-PENSIUN",
      category: "Web Development",
      image: "https://baydev.my.id/assets/backend/images/portofolio/1757921947.png",
      link: "#",
      featured: true,
      description: "Aplikasi rekapitulasi pensiun pegawai instansi pemerintahan dengan verifikasi berkas digital dan proyeksi dana tunjangan."
    }
  ],
  testimonials: [
    {
      id: 1,
      client_name: "Hendra Wijaya",
      client_title: "Project Director",
      company: "PT Global Intermedia Nusantara",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      content: "Bayu memiliki pemahaman teknis backend dan frontend yang sangat solid. Proyek portal pemerintahan dan sistem GIS diselesaikan dengan efisien, rapi, dan berkinerja tinggi.",
      rating: 5,
      order_index: 1,
      is_active: true
    },
    {
      id: 2,
      client_name: "Siti Rahmawati",
      client_title: "Product Owner",
      company: "Jamkrida Jawa Timur",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80",
      content: "Kerja sama luar biasa dalam pembangunan sistem penjaminan online. Sistem stabil, aman, dan integrasi database berjalan tanpa kendala.",
      rating: 5,
      order_index: 2,
      is_active: true
    },
    {
      id: 3,
      client_name: "Ketut Ardana",
      client_title: "IT Consultant",
      company: "Jamkrida Bali",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
      content: "Responsif, komunikatif, dan sangat cepat mengatasi tantangan integrasi API kompleks. Sangat direkomendasikan untuk pengembangan sistem skala enterprise.",
      rating: 5,
      order_index: 3,
      is_active: true
    }
  ],
  certifications: [
    {
      id: 1,
      title: "Laravel Certified Developer",
      issuer: "Laravel LLC",
      issue_date: "2023",
      expiration_date: "Lifetime",
      credential_id: "LARA-CERT-8849",
      credential_url: "https://laravel.com",
      badge_image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/laravel/laravel-original.svg",
      order_index: 1,
      is_active: true
    },
    {
      id: 2,
      title: "PostgreSQL Database Specialist",
      issuer: "PostgreSQL Professional Community",
      issue_date: "2022",
      expiration_date: "Lifetime",
      credential_id: "PG-DBA-2022-771",
      credential_url: "https://www.postgresql.org",
      badge_image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg",
      order_index: 2,
      is_active: true
    },
    {
      id: 3,
      title: "React Frontend Developer Specialist",
      issuer: "Meta / Coursera",
      issue_date: "2023",
      expiration_date: "Lifetime",
      credential_id: "META-FRONT-9921",
      credential_url: "https://www.coursera.org",
      badge_image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
      order_index: 3,
      is_active: true
    }
  ]
};
