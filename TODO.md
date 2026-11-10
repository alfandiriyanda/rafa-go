# TODO — RAFA GO

> Rilis bertahap: **V1 (30 hari)** fitur inti, **V2** fitur lengkap.
> Status: `[ ]` pending, `[x]` done, `[-]` ditunda ke V2.
> Priority: 🔴 critical (V1), 🟡 V2, 🟢 backlog.

---

## Minggu 1 — Setup & Fondasi

### Project Setup
- [ ] 🔴 Init Next.js 14 + TypeScript + Tailwind CSS + pnpm
- [ ] 🔴 Setup Supabase project (local dev)
- [ ] 🔴 Setup Git repository
- [ ] 🔴 Tailwind config dengan design tokens dari design.md
- [ ] 🔴 ESLint + Prettier config
- [ ] 🔴 Folder structure sesuai ARCHITECTURE.md

### Database
- [ ] 🔴 Schema migration: semua tabel core
- [ ] 🔴 Extension `btree_gist` + exclusion constraint pada `booking_items`
- [ ] 🔴 RLS policies semua tabel
- [ ] 🔴 Public views untuk anon access
- [ ] 🔴 Seed data: 50 sepeda (5 kategori), admin (3 akun), settings, rekening (Dana + SeaBank)

### Auth & Layout
- [ ] 🔴 Supabase Auth (email + password)
- [ ] 🔴 `profiles` table + trigger auto-create
- [ ] 🔴 Role middleware (owner vs admin)
- [ ] 🔴 Consumer layout (navbar, footer)
- [ ] 🔴 Dashboard shell (sidebar, topbar)
- [ ] 🔴 Base UI components (Button, Input, Card, StatusChip, Modal, Toast, Skeleton, dll)

---

## Minggu 2 — Landing & Katalog

- [ ] 🔴 Landing page: hero + keunggulan + cara sewa + harga + FAQ + lokasi
- [ ] 🔴 Katalog: daftar sepeda kartu, filter (kategori, harga, ketersediaan), pencarian debounce
- [ ] 🔴 Detail sepeda: galeri, spesifikasi, harga, status, rekomendasi serupa, CTA "Sewa Sepeda Ini"
- [ ] 🔴 Ketersediaan: filter tanggal + jam → tampilkan sepeda tersedia
- [ ] 🔴 SEO: meta tags, OG image, schema.org LocalBusiness, sitemap.xml
- [ ] 🔴 Responsive: test 360px, 768px, 1024px, 1440px

---

## Minggu 3 — Pemesanan & Pembayaran

### Pemesanan
- [ ] 🔴 Keranjang sewa (localStorage): multi-sepeda, durasi per 30 menit, min 1 jam
- [ ] 🔴 Form pemesanan: nama, WhatsApp (+62), persetujuan syarat
- [ ] 🔴 Cek ketersediaan real-time (client + server validation)
- [ ] 🔴 Kode booking: `RG-YYMMDD-XXXX`
- [ ] 🔴 Cloudflare Turnstile + rate limit + honeypot
- [ ] 🔴 Edge Function: `create-booking`

### Pembayaran
- [ ] 🔴 Halaman pembayaran: Dana + SeaBank info, kode unik nominal, countdown 30 menit
- [ ] 🔴 Form data pengirim: bank/ewallet, nama, nominal, waktu transfer
- [ ] 🔴 Upload bukti: JPG/PNG/WebP/HEIC ≤5MB, compress client-side, strip EXIF
- [ ] 🔴 Edge Function: `upload-payment`

### Cek Pesanan
- [ ] 🔴 Lookup via tautan unik `/pesanan/{token}` atau kode + WhatsApp
- [ ] 🔴 Rate limit: 5x / 15 menit
- [ ] 🔴 Status real-time + countdown sisa waktu sewa
- [ ] 🔴 Pembatalan (sesuai kebijakan refund)
- [ ] 🔴 Edge Function: `lookup-order`, `cancel-booking`

### Otomasi
- [ ] 🔴 Cron: expire pesanan tanpa bukti bayar (30 menit)
- [ ] 🔴 Cron: tandai tidak datang (3 jam setelah jam mulai)

---

## Minggu 4 — Dashboard & Go-Live

### Dashboard
- [ ] 🔴 Login admin/owner
- [ ] 🔴 Ringkasan: jumlah pesanan, sewa aktif, pendapatan hari ini, perlu tindakan
- [ ] 🔴 Daftar pesanan: pencarian, filter, detail
- [ ] 🔴 Walk-in: buat pesanan langsung (pilih sepeda, durasi, nama + WA, catat pembayaran)
- [ ] 🔴 Verifikasi pembayaran: antrean, bukti zoom, data pengirim, setuju/tolak (wajib alasan)
- [ ] 🔴 Penyewaan aktif: mulai sewa (+ 1 foto konsumen di sepeda), countdown, peringatan ≤15 menit
- [ ] 🔴 Pengembalian: catat waktu, kondisi (baik/lecet/rusak), hitung denda (Rp10k/jam, bulatkan ke bawah per 30 menit, toleransi 10 menit), selesaikan

### Sepeda & QR
- [ ] 🔴 Manajemen sepeda: CRUD, foto, kategori, status operasional
- [ ] 🔴 Kategori: CRUD (City Bike, MTB, Lipat, Anak, Listrik)
- [ ] 🔴 QR Code: generate + download PNG/SVG per sepeda
- [ ] 🔴 Halaman scan QR: validasi penyewa + GPS saat mulai sewa

### Go-Live
- [ ] 🔴 Deploy: Vercel + Supabase production + domain rafago.com
- [ ] 🔴 Input data: 50 sepeda, foto, harga (City 35k, MTB 40k, Lipat 20k, Anak 25k, Listrik 50k)
- [ ] 🔴 Jam operasional: Sen–Jum 14–20, Sab 15–00, Min 08–18
- [ ] 🔴 E2E test: alur sewa penuh (online + walk-in)
- [ ] 🔴 Security: RLS verify, rate limits, signed URLs
- [ ] 🔴 UAT + pelatihan 3 admin
- [ ] 🔴 Go-live

---

## V2 — Fitur Lengkap (Setelah V1 Live)

### Minggu 5–6
- [ ] 🟡 Perpanjangan sewa (konsumen + admin)
- [ ] 🟡 Tracking Center: peta Leaflet, titik scan, riwayat, permintaan scan
- [ ] 🟡 Dokumentasi kondisi: galeri sebelum/sesudah per transaksi
- [ ] 🟡 Halaman kebijakan & syarat sewa

### Minggu 7–8
- [ ] 🟡 Laporan: pendapatan, performa sepeda, ekspor PDF/Excel
- [ ] 🟡 Perawatan sepeda: jadwal, status, pengingat
- [ ] 🟡 Manajemen konsumen: daftar, riwayat, blokir, gabung duplikat
- [ ] 🟡 Notifikasi dashboard: bell icon, Supabase Realtime

### Minggu 9–10
- [ ] 🟡 Audit log: read-only, filter
- [ ] 🟡 Manajemen pengguna: kelola admin, 2FA owner
- [ ] 🟡 Pengaturan website: CMS konten landing, FAQ, testimoni, galeri, template WhatsApp
- [ ] 🟡 PWA: manifest, service worker, offline mode
- [ ] 🟡 Invoice PDF
- [ ] 🟡 Kalender penyewaan
- [ ] 🟡 Performance: Lighthouse ≥85

---

## Backlog
- [ ] 🟢 WhatsApp API otomatis
- [ ] 🟢 Payment gateway (Midtrans/Xendit)
- [ ] 🟢 Multi-cabang
- [ ] 🟢 Voucher / loyalitas
- [ ] 🟢 Aplikasi native
- [ ] 🟢 Multi-bahasa (EN)
- [ ] 🟢 GPS real-time tracker
