# PANDUAN ARSITEKTUR & ATURAN MAIN PROYEK "INFOBAY"
*Dokumen resmi orkestrasi multi-agen (LUHUT, JOKOWI, PRABOWO, GIBRAN)*

---

## 1. Ringkasan Proyek
- **Nama Proyek:** infobay
- **Deskripsi:** Website Portofolio Dinamis dengan Admin Panel untuk Bayu Prastyo (`baydev`).
- **Lokasi Direktori:** `/home/bay/infobay/`
  - Frontend: `/home/bay/infobay/frontend/`
  - Backend: `/home/bay/infobay/backend/`
- **Domain & Port:**
  - Halaman Aplikasi Utama (Frontend): Port `9000` (terhubung ke Cloudflare Tunnel: `info.baydev.my.id`).
  - Backend API: Port `8000` (dengan reverse-proxy Vite di port 9000 atau direct CORS `http://localhost:9000`).

---

## 2. Tech Stack & Environment
- **Frontend:** ReactJS (Vite / React 18+), Tailwind CSS (Halaman Publik), Material-UI / MUI (Admin Panel), Lucide / React Icons / Axios.
- **Backend:** Laravel 11 / 12 (PHP 8.4), Laravel Sanctum untuk Auth, RESTful API.
- **Database:** PostgreSQL 17 (Database: `infobay`, Port: `5432`).
- **Runtime:**
  - Node.js: `v20.19.2` | npm: `9.2.0`
  - PHP: `8.4.27` | Composer: `2.8.8`
  - PostgreSQL: `17`

---

## 3. Konfigurasi Database PostgreSQL
Kredensial database lokal telah dibuat dan aktif:
```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=infobay
DB_USERNAME=infobay_user
DB_PASSWORD=InfobaySecure2026!
```

---

## 4. Aturan Desain & Styling (STRICT RULES)

### A. Halaman Publik (Portofolio) — Gaya Neubrutalism (Tailwind CSS)
> [!IMPORTANT]
> **DILARANG MENGGUNAKAN DESAIN AI SLOP GENERIK!**
> (Dilarang menggunakan shadow abu-abu blur lembut khas template AI, gradasi ungu/biru generik, border radius super membulat tanpa karakter).

**Karakteristik Neubrutalism yang Wajib Diterapkan:**
1. **Borders:** Border hitam tegas dan solid (`border-2 border-black` hingga `border-4 border-black`).
2. **Hard Shadows (No Blur):** Bayangan solid offset tanpa blur.
   - Contoh kelas Tailwind atau ekstensi konfigurasi:
     - `shadow-[4px_4px_0px_0px_#000]`
     - `shadow-[6px_6px_0px_0px_#000]`
     - `shadow-[8px_8px_0px_0px_#000]`
     - Hover effect: `hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_#000]`
3. **Palet Warna Kontras & Berani:**
   - Backgrounds: Kuning pop (`#FFDE59` / `#FFE17D`), Neo Mint (`#98D8AA` / `#A8E6CF`), Coral Pink (`#FF8080` / `#FF8B8B`), Cyan/Sky (`#54BAB9` / `#A0E7E5`), Lilac (`#D8B4F8`), Off-white (`#F8F9FA` / `#FFFDF0`).
4. **Tipografi & Komponen:**
   - Font heading tebal, punchy, badge dengan tag solid dan border hitam.
   - Kartu portofolio bertingkat dengan border tebal, tag kategori kontras, gambar berbingkai garis hitam tebal.

### B. Admin Panel — Clean Enterprise (Material-UI / MUI)
- Menggunakan pustaka resmi `@mui/material`, `@mui/icons-material`, `@emotion/react`, `@emotion/styled`.
- Tata letak profesional: Sidebar/Drawer navigasi, AppBar header, Data Tables / Cards untuk CRUD, Dialog konfirmasi hapus/edit, Snackbar notifikasi.
- Modul Admin:
  1. Login Admin (Autentikasi API Sanctum).
  2. Manajemen Biodata (Profil, About, Kontak, Media Sosial).
  3. Manajemen Portofolio (Tambah, Edit, Hapus data portofolio, upload/link gambar).
  4. Manajemen Layanan (Services) & Keahlian (Skills).

---

## 5. Sumber Data Awal (Data Seeding)
Referensi data profil riil Bayu Prastyo telah di-scrape dari `https://baydev.my.id/dashboard` dan tersimpan di:
👉 **[`/home/bay/infobay/profile_seed_data.json`](file:///home/bay/infobay/profile_seed_data.json)**

Data tersebut mencakup:
- **Biodata:** Bayu Prastyo, Developer, email `bayukundev@gmail.com`, telepon `08991907216`, lokasi Yogyakarta / Karanganyar.
- **15 Item Portofolio:** Jamkrida Jatim, Jamkrida Bali, GIS Desa Pintar, CMS Portal, CMS SIKAP, E-Sewa, Login Management, dll.
- **Services:** Web Design, Web Development, Mobile Apps, Backend.
- **Skills:** Web Design (80%), Graphic Design (70%), Web Application (90%), Mobile Application (70%).
- **Education & Experience:** SMKN 02 Karanganyar, Analta Komputer, PT Global Intermedia Nusantara.

---

## 6. Pembagian Tugas & Tanggung Jawab Tim

### JOKOWI (Backend Engineer)
- **Folder Kerja:** `/home/bay/infobay/backend/`
- **Tugas:**
  1. Inisialisasi proyek Laravel di `infobay/backend/`.
  2. Setup `.env` dengan kredensial PostgreSQL (`infobay` / `infobay_user`).
  3. Buat database migrations:
     - `biodatas` (name, title, email, phone, location, avatar, about, github, facebook, twitter, instagram).
     - `portfolios` (title, category, image, link, description).
     - `services` (title, description, icon).
     - `skills` (name, percentage).
     - `admins` / default Laravel `users` (Admin Auth).
  4. Buat Database Seeder membaca data dari `/home/bay/infobay/profile_seed_data.json`.
  5. Buat RESTful API Controllers & Routes (`/api/v1/...`):
     - Public: `GET /api/v1/biodata`, `GET /api/v1/portfolios`, `GET /api/v1/services`, `GET /api/v1/skills`.
     - Auth: `POST /api/v1/auth/login`, `POST /api/v1/auth/logout`, `GET /api/v1/auth/me`.
     - Admin CRUD: Protected routes untuk portofolio, biodata, services, skills.
  6. Setiap selesai endpoint, laporkan ke Telegram via `python3 bot.py "[JOKOWI]: <pesan>"`.
  7. Update status tugas di `kanban.json` menjadi `QA-Review` jika selesai.

### PRABOWO (Frontend Engineer)
- **Folder Kerja:** `/home/bay/infobay/frontend/`
- **Tugas:**
  1. Inisialisasi ReactJS (Vite) di `infobay/frontend/`.
  2. Konfigurasi Tailwind CSS untuk gaya Neubrutalism (custom shadow, borders, palette).
  3. Install & konfigurasi Material-UI (`@mui/material`) khusus route `/admin`.
  4. Bangun Halaman Publik: Hero, About, Services, Skills, Interactive Portfolio Filter, Contact.
  5. Bangun Halaman Admin Panel: Login, Dashboard Overview, Portofolio Manager (DataGrid/Table, Form Modal Create/Edit, Delete), Biodata Manager.
  6. Integrasikan dengan API Backend JOKOWI (`http://localhost:8000/api/v1`).
  7. Konfigurasi Vite server agar berjalan di **port 9000** (`vite --port 9000 --host 0.0.0.0`).
  8. Laporkan progres ke Telegram via `python3 bot.py "[PRABOWO]: <pesan>"`.
  9. Update status di `kanban.json` menjadi `QA-Review`.

### GIBRAN (QA & Auditor)
- **Tugas:**
  1. Validasi Arsitektur & Desain: Pastikan Halaman Publik benar-benar menerapkan gaya Neubrutalism otentik (bukan AI Slop generik).
  2. Pastikan Admin Panel murni menggunakan Material-UI yang rapi dan responsif.
  3. Test fungsionalitas CRUD Portofolio dan Autentikasi Admin.
  4. Uji konektivitas database PostgreSQL dan port `9000`.
  5. Jika ada bug atau inkonsistensi desain, ubah status Kanban kembali ke `In-Progress` dengan catatan revisi detail.
  6. Jika lulus uji, ubah status Kanban menjadi `Done` dan laporkan audit ke Telegram via `python3 bot.py "[GIBRAN]: <pesan>"`.

### LUHUT (DevOps & Monitor)
- Memantau alur kerja seluruh agen di `kanban.json`.
- Memastikan service backend dan frontend aktif di port yang ditentukan.
- Mengirimkan rangkuman kelulusan proyek ke Telegram ketika semua tugas `Done`.

---

## 7. Aturan Mutlak Pendelegasian Tugas & Tracking Kanban (MANDATORY PROTOCOL)

> [!IMPORTANT]
> **TIDAK ADA PEKERJAAN ATAU DELEGASI YANG TIDAK TERCATAT DI KANBAN.JSON!**
> Setiap instruksi baru, perubahan requirement, refactoring, perbaikan bug, atau penugasan fitur ke agen (JOKOWI, PRABOWO, GIBRAN, atau LUHUT) **WAJIB dicatat terlebih dahulu ke dalam file `/home/bay/kanban.json`** agar siklus pekerjaan ter-track secara transparan dan akuntabel.

### Protokol Delegasi Tugas:
1. **Pencatatan Task Sebelum Eksekusi:**
   Setiap delegasi tugas baru harus memiliki entri objek task di `kanban.json` dengan atribut:
   - `id`: Kode identifikasi unik (`TASK-BE-xx`, `TASK-FE-xx`, `TASK-QA-xx`, `TASK-REV-xx`).
   - `assignee`: Agen yang ditugaskan (`JOKOWI`, `PRABOWO`, `GIBRAN`, `LUHUT`).
   - `title`: Judul ringkas, spesifik, dan actionable.
   - `skills_required`: Daftar skill terkait yang relevan.
   - `description`: Uraian teknis tugas secara detail.
   - `status`: Status aktif pekerjaan (`To-Do`, `In-Progress`, `QA-Review`, `Done`).
   - `target_dir`: Path direktori kode yang menjadi fokus pengerjaan.
   - `notes`: Catatan implementasi, log teknis, atau keputusan arsitektur.
   - `qa_review`: Evaluasi audit kualitas dan verifikasi dari GIBRAN.

2. **Siklus Status Kanban:**
   `To-Do` ➔ `In-Progress` ➔ `QA-Review` (diverifikasi GIBRAN) ➔ `Done`.
   Jika ada kegagalan fungsi atau desain tidak ramah UI/UX, status dikembalikan ke `In-Progress`.

3. **Notifikasi Sinkronisasi Telegram:**
   Setiap penambahan task baru ke Kanban atau transisi status signifikan, agen penanggung jawab atau LUHUT **wajib mengirimkan notifikasi ringkas ke Telegram via `bot.py`**.

4. **Standar Aksesibilitas & UI/UX Admin Panel:**
   - Seluruh teks, label input, placeholder, tombol aksi, dan ikon **WAJIB memiliki kontras tinggi yang jelas (high-visibility)** baik pada Mode Terang (Light Mode) maupun Mode Gelap (Dark Mode).
   - Dilarang keras menggunakan teks abu-abu pudar di atas background abu-abu gelap/terang yang menyulitkan pembacaan pengguna.
   - Tombol aksi (Edit, Hapus, Link, Tambah) harus memiliki affordance visual yang tegas (warna jelas, batas border / background tint yang mudah ditekan pada mobile & desktop).

---

## 8. Standar Deployment Server Produksi (Gold Standard Architecture)

> [!IMPORTANT]
> Seluruh lingkungan hosting Infobay (Server Utama 145 & Server Standby 146) wajib beroperasi mengikuti standar produksi berikut:

1. **Penyajian Frontend Statis (Nginx):**
   - Disajikan langsung dari direktori hasil build `frontend/dist/` di Port 80 dan Port 9000.
   - Mengaktifkan kompresi Gzip dan *caching headers* (`1y immutable` untuk `/assets/`).
   - Dev server (`npm run dev`) HANYA diizinkan menyala saat sprint kanban belum selesai. Sebelum penutupan sprint, wajib `npm run build` dan mematikan proses dev.

2. **Backend API FastCGI (PHP-FPM Ondemand Pool):**
   - API Laravel (`/api`) diproses langsung via soket Unix FastCGI PHP-FPM (`/run/php/php8.4-fpm-infobay.sock` di .145, `php8.3-fpm-infobay.sock` di .146).
   - Pool berjalan di bawah user aplikasi (`bay` di .145, `masbay` di .146) dengan mode `pm = ondemand` (0 MB idle RAM saat tidak ada request).
   - Dilarang menggunakan `php artisan serve` di lingkungan hosting web.

3. **Penyajian Media Statis Direct Storage:**
   - Berkas upload di `/storage/` disajikan langsung oleh Nginx dari direktori `backend/storage/app/public/` tanpa menyalakan interpreter PHP.

4. **Hardening Lingkungan & Optimasi Cache:**
   - File `.env` wajib berstatus `APP_ENV=production` dan `APP_DEBUG=false`.
   - Nginx menerapkan header proteksi keamanan HTTP (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`) dan menyembunyikan versi software (`server_tokens off`, sembunyikan `X-Powered-By`).
   - Setelah setiap pembaruan kode atau database, wajib menjalankan: `php artisan config:cache && php artisan route:cache && php artisan view:cache` dan reload PHP-FPM.

5. **Otomatisasi Backup Database:**
   - Database PostgreSQL di-backup harian otomatis pada pukul 02:00 WIB via `/home/bay/scripts/backup_infobay_db.sh` dengan retensi rotasi 7 hari.

---

## 9. Protokol Efisiensi Multi-Agen & Fast-Track Delegation

1. **Delegasi Cepat LUHUT (< 15 Detik)**:
   - Saat menerima instruksi tugas baru dari Mas Bay, LUHUT WAJIB menyelesaikan pencatatan ke `kanban.json`, pengiriman sinyal `tmux send-keys` ke pelaksana, dan laporan ke Telegram dalam **maksimal 1–2 turn**.
   - Dilarang mengaudit kode implementasi (`.jsx`, `.php`, dll.), dilarang membaca konfigurasi internal agen lain, dan dilarang monitoring loop terhadap agen lain sebelum delegasi.
   - Segera masuk ke mode STANDBY PASIF setelah delegasi selesai.

2. **Mode Standby Pasif untuk Pelaksana & QA (Anti-Active Polling)**:
   - PRABOWO, JOKOWI, dan GIBRAN dilarang keras melakukan loop polling aktif (`sleep && tail kanban.json`, `tmux capture-pane`, dll.) saat idle.
   - Saat startup dan saat tugas selesai, agen WAJIB menghentikan pemanggilan tool dan menunggu pasif di terminal hingga menerima teks instruksi berikutnya dari `tmux send-keys`.

3. **Integritas Anti-Premature**:
   - Status `Done` hanya boleh disematkan oleh GIBRAN setelah audit fungsionalitas, keamanan, dan kompilasi build lulus 100%.
   - Sesi agen hanya boleh dinonaktifkan (auto-sleep) setelah seluruh tugas di `kanban.json` berstatus `Done` dan jeda aman (cooldown) minimal 3 menit terpenuhi tanpa tugas baru.
