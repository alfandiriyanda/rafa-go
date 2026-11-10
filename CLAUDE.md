# RAFA GO — Rental Sepeda Per Jam

## Project Overview

Website rental sepeda per jam untuk wisatawan dan warga lokal di Indonesia. Satu lokasi, satu zona waktu (WIB). Konsumen tanpa login, admin/owner login via Supabase Auth.

## Keputusan Bisnis Final

- **Deadline**: V1 (fitur inti) dalam 30 hari, V2 (lengkap) menyusul
- **Budget**: Gratis (Supabase Free, Vercel Free) — klien bayar VPS + domain saja
- **Domain**: rafago.com
- **Durasi sewa**: per 30 menit, minimum 1 jam, tanpa harga paket
- **Harga**: City Rp35k, MTB Rp40k, Lipat Rp20k, Anak Rp25k, Listrik Rp50k per jam
- **Denda**: Rp10.000/jam, toleransi 10 menit, bulatkan ke bawah per 30 menit
- **Refund**: 100% (>24j) / 50% (2–24j) / 0% (<2j sebelum mulai)
- **No-show**: 3 jam setelah jam mulai
- **Batas bayar**: 30 menit, kode unik nominal aktif
- **Rekening**: Dana (0876653342 a.n. Fadel), SeaBank (65243745251832 a.n. Padel)
- **Identitas**: Tidak upload — KTP ditahan fisik offline oleh petugas
- **Foto kondisi**: 1 foto saja (konsumen di atas sepeda)
- **WhatsApp**: Manual (wa.me link)
- **Jam operasional**: Sen–Jum 14:00–20:00, Sab 15:00–00:00, Min 08:00–18:00
- **Sewa melewati tutup**: Tidak boleh
- **Penyangga antar-sewa**: 15 menit
- **Maks sepeda/transaksi**: Tidak dibatasi
- **Kerusakan**: Admin tetapkan saat pengembalian, kehilangan ganti 100%
- **QR scan**: Wajib saat mulai sewa
- **Armada**: 50 unit, 5 kategori (City Bike, MTB, Lipat, Anak, Listrik), 3 admin
- **Bahasa**: Indonesia saja
- **Backup**: Manual (Supabase Free tier)

## Tech Stack

- **Frontend**: Next.js 14+ (App Router) + TypeScript + Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions, Realtime)
- **Maps**: Leaflet + OpenStreetMap
- **Anti-bot**: Cloudflare Turnstile
- **Hosting**: Vercel / Cloudflare Pages
- **PDF/Excel**: Server-side via Edge Functions
- **Validation**: Zod (client + server)
- **Icons**: Lucide React (outline, 1.75px stroke)

## Key Commands

```bash
pnpm install          # Install dependencies
pnpm dev              # Dev server (localhost:3000)
pnpm build            # Production build
pnpm lint             # ESLint + TypeScript check
pnpm test             # Run tests
pnpm db:migrate       # Run Supabase migrations
pnpm db:seed          # Seed development data
pnpm db:reset         # Reset + re-seed database
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (public)/           # Consumer pages (no login)
│   │   ├── page.tsx        # Landing page
│   │   ├── katalog/        # Catalog + detail
│   │   ├── pesan/          # Booking form
│   │   ├── bayar/          # Payment page
│   │   ├── pesanan/        # Check order (via token)
│   │   ├── perpanjang/     # Extend rental
│   │   ├── s/[token]/      # QR scan page
│   │   └── kebijakan/      # Terms & privacy
│   ├── dashboard/          # Admin/owner (login required)
│   │   ├── ringkasan/      # Dashboard summary
│   │   ├── pesanan/        # Orders
│   │   ├── walkin/         # Walk-in orders
│   │   ├── verifikasi/     # Payment verification
│   │   ├── sewa/           # Active rentals
│   │   ├── pengembalian/   # Returns
│   │   ├── sepeda/         # Bike management
│   │   ├── kategori/       # Categories
│   │   ├── konsumen/       # Customers
│   │   ├── perawatan/      # Maintenance
│   │   ├── tracking/       # Tracking center
│   │   ├── laporan/        # Reports
│   │   ├── notifikasi/     # Notifications
│   │   ├── pengguna/       # User management
│   │   ├── audit/          # Audit log
│   │   └── pengaturan/     # Settings
│   └── api/                # API routes
├── components/
│   ├── ui/                 # Base UI components
│   ├── public/             # Consumer-facing components
│   └── dashboard/          # Dashboard components
├── lib/
│   ├── supabase/           # Supabase client + helpers
│   ├── validations/        # Zod schemas
│   ├── utils/              # Utilities
│   └── constants/          # Constants + config
├── hooks/                  # Custom React hooks
├── types/                  # TypeScript types
└── styles/                 # Global styles + tokens
supabase/
├── migrations/             # SQL migrations (versioned)
├── functions/              # Edge Functions
├── seed.sql                # Development seed data
└── config.toml             # Supabase config
```

## Critical Conventions

### Database
- All money as `integer` (Rupiah, no decimals)
- All timestamps as `timestamptz` (WIB display)
- Anti-double-booking: exclusion constraint with `btree_gist` + `tstzrange` on `booking_items`
- Consumer actions via Edge Functions / RPC `SECURITY DEFINER` — never direct `anon` access to sensitive tables
- Soft delete on `bikes` (has `deleted_at`)
- Audit log: append-only, never update/delete from UI

### Auth & Security
- Consumer: NO login. Identity = nama + WhatsApp per booking
- Dashboard: Supabase Auth, roles from `profiles` table (not JWT claims)
- `service_role` key: server-side only, never in browser
- Tokens (`public_token`, `qr_token`): crypto-random ≥128 bit
- RLS on every table; test with negative scenarios (anon, admin, owner, inactive user)

### Frontend
- Mobile-first, breakpoints: 360, 768, 1024, 1440px
- Fonts: Poppins (headings/buttons/nav), Open Sans (body/forms)
- Primary color: aqua-500 `#4FC3C8`, text on aqua buttons is dark (`#12202F`), not white
- Status always = color + label + icon (never color alone)
- All consumer copy in Indonesian, use "kamu"
- Currency: `Rp15.000` format; time: `14.30 WIB`; date: `8 Nov 2026`
- Every screen: loading (skeleton), empty, error, offline states
- Tap targets ≥44×44px, contrast ≥4.5:1

### Naming
- Booking code: `RG-YYMMDD-XXXX` (no ambiguous chars 0/O/1/I)
- WhatsApp: normalize to +62 format
- Files in Supabase Storage: UUID names, never original filenames

### What NOT to do
- No payment gateway (manual verification only)
- No real-time GPS tracking (QR scan = snapshot only)
- No consumer accounts/login
- No Lorem ipsum, fake data, or emoji as icons
- No gradient text, glassmorphism, neon glows, purple/indigo gradients
- No nested cards

## Reference Documents

- `PRD.md` — Full product requirements (622 lines)
- `ARCHITECTURE.md` — System architecture
- `AGENTS.md` — AI agent instructions
- `RULES.md` — Coding rules and conventions
- `TODO.md` — Current task tracker
- `ROADMAP.md` — Release timeline
- `USER-STORIES.md` — User stories + acceptance criteria
- `ui-ux/design.md` — Visual design system from Stitch
- `ui-ux/` — Exported UI screens (27 pages, HTML + PNG)
- `RAFA_GO_Logo.svg` — Brand logo (vector)
