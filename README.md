# README — RAFA GO

Sistem rental sepeda per jam berbasis website untuk wisatawan dan warga lokal.

## Tentang

RAFA GO menggantikan pencatatan manual (WhatsApp, buku catatan, transfer tanpa pelacakan) dengan satu sistem terpadu:
- **Katalog sepeda** dengan ketersediaan real-time
- **Pemesanan online** tanpa perlu membuat akun
- **Pembayaran manual** (transfer/QRIS) dengan verifikasi bukti
- **Pelacakan sepeda** via QR Code + GPS saat dipindai
- **Dokumentasi kondisi** sepeda sebelum & sesudah sewa
- **Dashboard admin/owner** untuk operasional dan laporan

## Tech Stack

| Layer | Teknologi |
|---|---|
| Frontend | Next.js 14+ (App Router), TypeScript, Tailwind CSS |
| Backend | Supabase (PostgreSQL, Auth, Storage, Edge Functions, Realtime) |
| Maps | Leaflet + OpenStreetMap |
| Anti-bot | Cloudflare Turnstile |
| Hosting | Vercel / Cloudflare Pages |
| Validation | Zod |
| Icons | Lucide React |

## Quick Start

### Prerequisites
- Node.js 18+
- pnpm 9+
- Supabase CLI
- Git

### Setup

```bash
# Clone repository
git clone <repo-url>
cd rafa-go

# Install dependencies
pnpm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Start local Supabase
npx supabase start

# Run migrations + seed
pnpm db:migrate
pnpm db:seed

# Start dev server
pnpm dev
```

Buka `http://localhost:3000`

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your-turnstile-key
TURNSTILE_SECRET_KEY=your-turnstile-secret
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Development server |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint + TypeScript check |
| `pnpm test` | Run tests (Vitest) |
| `pnpm db:migrate` | Apply database migrations |
| `pnpm db:seed` | Seed development data |
| `pnpm db:reset` | Full database reset |
| `pnpm db:types` | Regenerate TypeScript types from database |

## Struktur Halaman

### Konsumen (Tanpa Login)
| Halaman | Path | Deskripsi |
|---|---|---|
| Landing | `/` | Homepage + info bisnis |
| Katalog | `/katalog` | Daftar sepeda + filter |
| Detail Sepeda | `/katalog/[slug]` | Info + galeri + sewa |
| Form Pemesanan | `/pesan` | Keranjang + data diri |
| Pembayaran | `/bayar/[kode]` | Rekening/QRIS + upload bukti |
| Cek Pesanan | `/pesanan/[token]` | Status + countdown + aksi |
| Perpanjang | `/perpanjang/[token]` | Tambah durasi sewa |
| Scan QR | `/s/[token]` | Scan sepeda + GPS |
| Kebijakan | `/kebijakan` | Syarat sewa + privasi |

### Dashboard (Login Required)
| Halaman | Path |
|---|---|
| Login | `/dashboard/login` |
| Ringkasan | `/dashboard` |
| Pesanan | `/dashboard/pesanan` |
| Walk-in | `/dashboard/walkin` |
| Verifikasi Pembayaran | `/dashboard/verifikasi` |
| Penyewaan Aktif | `/dashboard/sewa` |
| Pengembalian | `/dashboard/pengembalian` |
| Sepeda | `/dashboard/sepeda` |
| Kategori | `/dashboard/kategori` |
| Konsumen | `/dashboard/konsumen` |
| Perawatan | `/dashboard/perawatan` |
| Tracking Center | `/dashboard/tracking` |
| Laporan | `/dashboard/laporan` |
| Notifikasi | `/dashboard/notifikasi` |
| Pengguna | `/dashboard/pengguna` |
| Audit Log | `/dashboard/audit` |
| Pengaturan | `/dashboard/pengaturan` |

## Dokumentasi

| File | Isi |
|---|---|
| [PRD.md](PRD.md) | Product Requirements Document lengkap |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Arsitektur sistem |
| [RULES.md](RULES.md) | Coding conventions & standards |
| [TODO.md](TODO.md) | Task tracker |
| [ROADMAP.md](ROADMAP.md) | Timeline rilis |
| [USER-STORIES.md](USER-STORIES.md) | User stories + acceptance criteria |
| [CLAUDE.md](CLAUDE.md) | Context untuk Claude Code AI |
| [AGENTS.md](AGENTS.md) | Context untuk AI coding agents |

## Design

UI/UX mockup (27 halaman) ada di folder `ui-ux/`. Design system lengkap di `ui-ux/design.md`.

Palette: aqua-based (`#4FC3C8` primary), tipografi Poppins + Open Sans, mobile-first.

## License

Private — All rights reserved.
