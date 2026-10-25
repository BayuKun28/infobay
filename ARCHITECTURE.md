# INFOBAY v2.0 - ARSITEKTUR & PETA STRUKTUR DIREKTORI PROYEK

Dokumen ini memetakan arsitektur sistem, struktur folder modular, serta fungsi teknis tiap komponen dalam repositori `/home/bay/infobay/`.

---

## 1. Top-Level / Root Directory (`/home/bay/infobay/`)

```
infobay/
├── .env                  # Single Source of Truth konfigurasi lingkungan (Backend, DB, Frontend, Ports)
├── .env.example          # Template konfigurasi aman untuk staging/production
├── .gitignore            # Aturan proteksi git standar enterprise (ignore .env, dist, vendor, cache)
├── profile_seed_data.json# Sumber data profil awal riil baydev.my.id (biodata, portofolio, skills)
├── RULES.md              # Aturan teknis pengembangan, styling Neubrutalism, dan WCAG AAA
├── ARCHITECTURE.md       # Dokumentasi cetak biru arsitektur sistem
├── backend/              # Framework Laravel 13 REST API & PostgreSQL 17 (Port 8000)
└── frontend/             # Single Page Application React 18, Vite & Tailwind CSS (Port 9000)
```

---

## 2. Backend Architecture (`/home/bay/infobay/backend/`)

Menggunakan **Laravel 13**, **PHP 8.4**, dan **PostgreSQL 17.11** dengan otentikasi **Laravel Sanctum**.

```
backend/
├── .env -> ../.env       # Symbolic link ke konfigurasi terpusat di root
├── app/
│   ├── Http/Controllers/Api/V1/
│   │   ├── AuthController.php            # Otentikasi Sanctum (login, logout, me, profile)
│   │   ├── BiodataController.php         # Profil, customizer hero, upload CV PDF, socials, marquee
│   │   ├── CertificationController.php   # Public list & Protected Admin CRUD sertifikasi
│   │   ├── EducationController.php       # Public list & Protected Admin CRUD riwayat pendidikan
│   │   ├── ExperienceController.php      # Public list & Protected Admin CRUD pengalaman kerja
│   │   ├── MessageController.php         # Public form kontak & Protected Admin Inbox management
│   │   ├── PortfolioController.php       # Public showcase (filtering) & Protected Admin CRUD
│   │   ├── ServiceController.php         # Public list & Protected Admin CRUD layanan
│   │   ├── SkillController.php           # Public list & Protected Admin CRUD keahlian
│   │   └── TestimonialController.php     # Public list & Protected Admin CRUD ulasan klien
│   └── Models/
│       ├── Biodata.php                   # Model profil biodata (casts JSON arrays)
│       ├── Certification.php             # Model lisensi & sertifikasi
│       ├── Education.php                 # Model pendidikan
│       ├── Experience.php                # Model pengalaman kerja
│       ├── Message.php                   # Model pesan kontak
│       ├── Portfolio.php                 # Model portofolio proyek
│       ├── Service.php                   # Model penawaran layanan
│       ├── Skill.php                     # Model kompetensi utama
│       ├── Testimonial.php               # Model ulasan testimoni klien
│       └── User.php                      # Model otentikasi administrator
├── database/
│   ├── migrations/                       # 13 berkas migrasi skema database PostgreSQL
│   └── seeders/
│       └── DatabaseSeeder.php            # Importer seed otomatis dari profile_seed_data.json
├── routes/
│   └── api.php                           # Routing API V1 (Public & Sanctum Protected Admin)
└── tests/Feature/
    ├── ApiEndpointsTest.php              # Pengujian otomatis endpoint publik & auth awal
    ├── EducationExperienceApiTest.php    # Pengujian CRUD pendidikan & pengalaman
    ├── HeroTestimonialCertificationTest.php # Pengujian hero, CV upload, marquee, testimoni, sertifikasi
    └── MessageApiTest.php                # Pengujian formulir kontak, spam guard, & inbox
```

---

## 3. Frontend Architecture (`/home/bay/infobay/frontend/`)

Menggunakan **React 18**, **Vite 5**, **Tailwind CSS (Neubrutalism Authentic)**, dan **Material-UI (MUI)**.

```
frontend/
├── .env -> ../.env       # Symbolic link ke konfigurasi terpusat di root
├── vite.config.js        # Konfigurasi Vite (Port 9000, envDir: '../', reverse proxy /api & /storage)
├── src/
│   ├── components/
│   │   ├── ui/                           # Reusable Atomic Components (Neubrutalism Design)
│   │   │   ├── Badge.jsx                 # Chip label kontras tinggi dengan border tebal
│   │   │   ├── Button.jsx                # Tombol Neubrutalism dengan hard shadow offset
│   │   │   ├── Card.jsx                  # Kontainer kartu berkarakter border 3-4px
│   │   │   ├── Input.jsx                 # Kolom isian teks & textarea terstandarisasi
│   │   │   ├── Modal.jsx                 # Dialog modal responsif
│   │   │   ├── Tooltip.jsx               # Petunjuk hover akseleratif
│   │   │   └── index.js                  # Barrel export atomics
│   │   ├── layout/                       # Tata Letak Navigasi & Shell
│   │   │   ├── Navbar.jsx                # Header publik dengan indikator ketersediaan kerja
│   │   │   ├── Footer.jsx                # Footer resmi, copyright, & tombol kembali ke atas
│   │   │   ├── SidebarDrawer.jsx         # Sidebar admin navigasi adaptif
│   │   │   └── index.js                  # Barrel export layout
│   │   ├── portfolio/                    # Modul Portofolio Terfokus
│   │   │   ├── ContactForm.jsx           # Form kontak publik dengan validasi & anti-spam
│   │   │   ├── PortfolioDetailModal.jsx  # Dialog pratinjau detail proyek & link demo
│   │   │   ├── PortfolioFilter.jsx       # Filter kategori Neubrutalism tabs
│   │   │   ├── PortfolioGrid.jsx         # Grid portofolio dengan lazy image fallback
│   │   │   └── index.js                  # Barrel export portfolio
│   │   ├── admin/                        # Panel Admin Enterprise (Material-UI)
│   │   │   ├── AdminLayout.jsx           # Kerangka dashboard admin & switch tema Dark/Light
│   │   │   ├── AdminLogin.jsx            # Formulir login admin terproteksi
│   │   │   ├── AdminProfileModal.jsx     # Dialog perbaruan akun & kata sandi
│   │   │   ├── BiodataManager.jsx        # Pengelola profil, customizer hero, CV PDF, & marquee
│   │   │   ├── CertificationManager.jsx  # CRUD sertifikasi & upload badge
│   │   │   ├── ConfirmDialog.jsx         # Dialog konfirmasi aksi destruktif
│   │   │   ├── DashboardOverview.jsx     # Statistik ringkasan analitik sistem
│   │   │   ├── DataTable.jsx             # Tabel data universal dengan pagination
│   │   │   ├── ExperienceEducationManager.jsx # CRUD riwayat karier & studi
│   │   │   ├── MessageManager.jsx        # Inbox pesan masuk & filter baca/belum dibaca
│   │   │   ├── PortfolioManager.jsx      # CRUD portofolio & upload gambar lokal
│   │   │   ├── ServicesSkillsManager.jsx # CRUD layanan & editor tag tech stack
│   │   │   ├── StatCard.jsx              # Kartu metrik ringkas
│   │   │   ├── TestimonialManager.jsx    # CRUD ulasan klien & rating bintang
│   │   │   └── index.js                  # Barrel export admin
│   │   └── common/
│   │       ├── ErrorBoundary.jsx         # Penangkap runtime exception
│   │       └── NeubrutalismPagination.jsx# Navigasi pagination proporsional mandiri
│   ├── hooks/                            # Custom React Hooks
│   │   ├── useAuth.js                    # State sesi login & autentikasi
│   │   ├── useFetch.js                   # Abstraksi request asinkronus dengan cache
│   │   ├── useTheme.js                   # Pengatur preferensi Dark / Light mode
│   │   └── index.js                      # Barrel export hooks
│   ├── services/
│   │   └── api.js                        # Abstraksi apiClient Axios terintegrasi VITE_API_URL
│   ├── constants/
│   │   └── index.js                      # Konstanta global (URL, palet Neubrutalism, paginasi)
│   ├── utils/
│   │   ├── formatters.js                 # Helper format tanggal & teks
│   │   ├── storage.js                    # Resolver URL penyimpanan media dinamis
│   │   └── index.js                      # Barrel export utils
│   ├── pages/
│   │   ├── PublicPortfolio.jsx           # Tampilan tunggal portofolio publik
│   │   └── AdminPage.jsx                 # Gerbang masuk halaman administrasi
│   ├── App.jsx                           # Router utama aplikasi (`/` dan `/admin`)
│   └── main.jsx                          # Entry point Vite & DOM bootstrap
```

---

## 4. Keamanan & Kebijakan Lingkungan

1. **Pemisahan Kredensial**: File `.env` dikecualikan secara mutlak dari git tracking melalui `.gitignore`.
2. **Sanctum Middleware**: Semua rute pengelolaan admin pada rute `/api/v1/admin/*` dijamin menolak akses tanpa Bearer Token (`HTTP 401 Unauthorized`).
3. **Validasi File**: Berkas CV dibatasi hanya format PDF dengan ukuran maksimal 10MB.
4. **Zero Technical Leaks**: Tampilan publik bebas dari eksposur port lokal, nama agen, atau path internal server.
