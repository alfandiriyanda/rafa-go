# Roadmap — RAFA GO

> **Deadline klien: 30 hari.** Rilis bertahap: V1 (fitur inti) dalam 30 hari, V2 (fitur lengkap) menyusul.
> Developer solo. Supabase Free, Vercel Free, Cloudflare Free.
> Tanggal mulai: disesuaikan saat project init.

---

## V1 — Rilis Inti (30 Hari)

Fitur minimum agar bisnis bisa beroperasi: konsumen bisa pesan & bayar, admin bisa verifikasi & kelola sewa.

### Minggu 1 — Setup & Fondasi

| Hari | Deliverable |
|---|---|
| 1–2 | Project init: Next.js + Tailwind + Supabase local, repo Git, Tailwind config (design tokens) |
| 3–4 | Database schema: semua tabel core, exclusion constraint, RLS, views, seed data |
| 5–6 | Auth: login admin/owner, role middleware, base layout (consumer + dashboard shell) |
| 7 | Base UI components: Button, Input, Card, StatusChip, Navbar, Sidebar, dll |

**Exit**: `pnpm dev` jalan, login dashboard works, seed data visible.

### Minggu 2 — Landing & Katalog

| Hari | Deliverable |
|---|---|
| 8–9 | Landing page: hero, keunggulan, cara sewa, harga, FAQ, lokasi |
| 10–11 | Katalog: daftar sepeda, filter (kategori, harga, ketersediaan), pencarian |
| 12–13 | Detail sepeda: galeri, spesifikasi, harga, status, rekomendasi, CTA sewa |
| 14 | SEO: meta tags, OG, schema.org, sitemap |

**Exit**: Landing + katalog live di staging.

### Minggu 3 — Pemesanan & Pembayaran

| Hari | Deliverable |
|---|---|
| 15–16 | Keranjang sewa + form pemesanan + cek ketersediaan + kode booking |
| 17–18 | Halaman pembayaran: rekening (Dana/SeaBank), kode unik nominal, upload bukti |
| 19–20 | Cek Pesanan: lookup via token/kode, status real-time, countdown, pembatalan |
| 21 | Edge Functions: create-booking, lookup-order, upload-payment, auto-expire (cron) |

**Exit**: Booking online → upload bukti → lihat status → pembatalan berhasil.

### Minggu 4 — Dashboard & Go-Live

| Hari | Deliverable |
|---|---|
| 22–23 | Dashboard: ringkasan, daftar pesanan, walk-in, verifikasi pembayaran (setuju/tolak) |
| 24–25 | Penyewaan: mulai sewa (+ 1 foto), countdown, pengembalian, denda (Rp10k/jam bulatkan ke bawah per 30 menit) |
| 26 | Manajemen sepeda: CRUD, foto, kategori, status |
| 27 | QR Code: generate + download + halaman scan (wajib saat mulai sewa) |
| 28 | Testing: alur sewa penuh (online + walk-in), security check RLS |
| 29 | Deploy production: Vercel + Supabase, domain rafago.com, input data sepeda (50 unit) |
| 30 | UAT + pelatihan admin (3 orang) + go-live |

**Exit**: Satu simulasi sewa penuh berhasil di production. Admin terlatih.

---

### V1 Scope — Apa yang Masuk & Tidak

| Masuk V1 ✅ | Ditunda ke V2 ❌ |
|---|---|
| Landing page | Perpanjangan sewa |
| Katalog + detail + filter | Tracking Center (peta) |
| Form pemesanan + ketersediaan | Dokumentasi kondisi sepeda (galeri before/after) |
| Pembayaran (Dana, SeaBank, kode unik) | Laporan + ekspor PDF/Excel |
| Cek Pesanan + countdown | Perawatan sepeda |
| Pembatalan + refund policy | Notifikasi dashboard (bell icon) |
| Auto-expire pesanan | Audit log |
| Dashboard ringkasan sederhana | Manajemen konsumen (daftar, blokir, gabung) |
| Verifikasi pembayaran | Manajemen pengguna + 2FA |
| Walk-in | Pengaturan website (CMS konten) |
| Mulai sewa + pengembalian + denda | PWA offline mode |
| Manajemen sepeda + kategori CRUD | Invoice PDF |
| QR Code generate + scan dasar | Template pesan WhatsApp |
| Login dashboard (admin/owner) | Kebijakan halaman (syarat sewa) |
| 1 foto konsumen di sepeda | Kalender penyewaan |

---

## V2 — Fitur Lengkap (Minggu 5–10)

Setelah V1 live dan stabil, tambahkan fitur yang ditunda:

### Minggu 5–6
- Perpanjangan sewa (konsumen + admin)
- Tracking Center (Leaflet + peta scan)
- Dokumentasi kondisi sepeda (galeri per transaksi)
- Kebijakan & syarat sewa halaman

### Minggu 7–8
- Laporan + ekspor PDF/Excel
- Perawatan sepeda (jadwal, status, pengingat)
- Manajemen konsumen (daftar, riwayat, blokir)
- Notifikasi dashboard (bell + Realtime)

### Minggu 9–10
- Audit log
- Manajemen pengguna + 2FA owner
- Pengaturan website (CMS: konten landing, FAQ, testimoni, galeri)
- Template pesan WhatsApp (wa.me auto-fill)
- PWA (manifest, service worker, offline)
- Invoice PDF
- Kalender penyewaan
- QA lengkap + performance optimization

---

## Post-Launch (Backlog)

| Fitur | Effort | Trigger |
|---|---|---|
| WhatsApp API otomatis | Medium | Owner bersedia bayar |
| Payment gateway (Midtrans/Xendit) | Medium | Volume tinggi |
| Multi-cabang | Large | Bisnis ekspansi |
| Voucher / loyalitas | Medium | Retensi konsumen |
| Aplikasi native | Large | PWA tidak cukup |
| Multi-bahasa (EN) | Small | Wisatawan asing |
| GPS real-time | Large | Risiko kehilangan |

---

## Keputusan Bisnis Final

| Parameter | Nilai |
|---|---|
| Durasi minimum | 1 jam |
| Pembulatan durasi | Per 30 menit |
| Harga paket | Tidak ada |
| Toleransi keterlambatan | 10 menit |
| Denda | Rp10.000/jam, bulatkan ke bawah per 30 menit |
| Refund | 100% (>24j) / 50% (2–24j) / 0% (<2j) |
| No-show | 3 jam setelah jam mulai |
| Batas waktu bayar | 30 menit |
| Pesan mendadak | Boleh (<1 jam) |
| Kode unik nominal | Ya |
| Rekening | Dana (0876653342 a.n. Fadel), SeaBank (65243745251832 a.n. Padel) |
| Identitas | Tidak (KTP ditahan fisik offline) |
| Foto kondisi | 1 foto: konsumen di atas sepeda |
| WhatsApp | Manual (wa.me) |
| Jam operasional | Sen–Jum 14–20, Sab 15–00, Min 08–18 |
| Melewati tutup | Tidak boleh |
| Penyangga antar-sewa | 15 menit |
| Maks sepeda/transaksi | Tidak dibatasi |
| Kerusakan | Admin tetapkan saat pengembalian |
| Kehilangan | Ganti 100% |
| QR scan | Wajib saat mulai sewa |
| Armada | 50 unit, 5 kategori |
| Admin | 3 orang |
| Domain | rafago.com |
| Bahasa | Indonesia saja |
| Hosting | Supabase Free + Vercel Free |
