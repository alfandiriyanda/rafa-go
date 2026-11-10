# Architecture — RAFA GO

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CONSUMERS (No Login)                       │
│                     Mobile browser / PWA / Desktop                   │
└──────────────┬──────────────────────────────────┬───────────────────┘
               │ HTTPS                            │ HTTPS
               ▼                                  ▼
┌──────────────────────────┐    ┌─────────────────────────────────────┐
│   Next.js Frontend       │    │   Supabase Edge Functions           │
│   (Vercel / CF Pages)    │    │   (Server-side consumer actions)    │
│                          │    │                                     │
│  • Landing page          │    │  • create-booking                   │
│  • Katalog & detail      │    │  • lookup-order                     │
│  • Form pemesanan        │    │  • upload-payment-proof             │
│  • Pembayaran            │    │  • request-extension                │
│  • Cek pesanan           │    │  • cancel-booking                   │
│  • Scan QR               │    │  • record-qr-scan                   │
│  • Dashboard admin/owner │    │  • upload-documentation             │
│                          │    │  • expire-bookings (cron)           │
│  Static + SSR + CSR      │    │  • mark-no-show (cron)              │
└──────────┬───────────────┘    │  • late-reminder (cron)             │
           │                    │  • cleanup-retention (cron)         │
           │ supabase-js        └──────────┬──────────────────────────┘
           │ (anon key)                    │ service_role key
           │                               │
           ▼                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        SUPABASE                                     │
│                                                                     │
│  ┌─────────────┐  ┌──────────┐  ┌───────────┐  ┌──────────────┐   │
│  │ PostgreSQL  │  │   Auth   │  │  Storage   │  │  Realtime    │   │
│  │             │  │          │  │            │  │              │   │
│  │ • RLS       │  │ • Email/ │  │ • bike-    │  │ • Dashboard  │   │
│  │ • Exclusion │  │   pass   │  │   photos   │  │   notifs     │   │
│  │   constraint│  │ • TOTP   │  │   (public) │  │ • Order      │   │
│  │ • Functions │  │ • Roles  │  │ • site-    │  │   status     │   │
│  │ • Triggers  │  │   from   │  │   assets   │  │   changes    │   │
│  │ • Views     │  │   profiles│ │   (public) │  │              │   │
│  │             │  │          │  │ • payment- │  │              │   │
│  │             │  │          │  │   proofs   │  │              │   │
│  │             │  │          │  │   (private)│  │              │   │
│  │             │  │          │  │ • docs     │  │              │   │
│  │             │  │          │  │   (private)│  │              │   │
│  └─────────────┘  └──────────┘  └───────────┘  └──────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────┐
│  External Services       │
│  • Cloudflare Turnstile  │
│  • OpenStreetMap tiles   │
│  • WhatsApp (wa.me link) │
│  • Sentry (error track)  │
└──────────────────────────┘
```

## Frontend Architecture

### Route Groups

| Group | Path | Auth | Purpose |
|---|---|---|---|
| `(public)` | `/` | None | Consumer-facing pages |
| `dashboard` | `/dashboard/*` | Supabase Auth (admin/owner) | Staff operations |
| `api` | `/api/*` | Varies | Server-side API routes |

### Rendering Strategy

| Page | Strategy | Reason |
|---|---|---|
| Landing | SSG + ISR (60s) | SEO, performance |
| Katalog | SSG + ISR (30s) | SEO, bike availability updates |
| Detail Sepeda | SSG + ISR (30s) | SEO, per-bike page |
| Form Pemesanan | CSR | Interactive form, real-time availability |
| Pembayaran | CSR | Dynamic content per booking |
| Cek Pesanan | CSR | Real-time status updates |
| Scan QR | CSR | Geolocation API |
| Dashboard | CSR | Real-time data, authenticated |
| Kebijakan | SSG | Static content |

### State Management

- **Server state**: Supabase Realtime subscriptions + React Query (`@tanstack/react-query`) for caching/revalidation
- **Form state**: React Hook Form + Zod resolver
- **Client state**: React context where needed (cart/keranjang sewa in localStorage)
- **URL state**: Next.js searchParams for filters and pagination

## Database Architecture

### Core Tables

```
profiles ──────────────────┐
                           │ actor_id
bike_categories ◄── bikes  │
                     │     ▼
                     │  audit_logs
                     │
              bike_images
              qr_codes ──── qr_scans
                     │
                     ▼
customers ◄── bookings ──── booking_items (exclusion constraint)
                 │
                 ├── payments
                 ├── rentals ──── documentation_files
                 └── notifications

site_settings, faqs, testimonials, gallery_items, payment_accounts
```

### Anti-Double-Booking (Critical)

```sql
-- booking_items table uses exclusion constraint
CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE booking_items
ADD CONSTRAINT no_overlapping_bookings
EXCLUDE USING gist (
    bike_id WITH =,
    rentang WITH &&
)
WHERE (status IN ('holding', 'confirmed', 'active'));
```

This is enforced at the database level. Application-level checks provide UX feedback but the constraint is the safety net.

### RLS Access Pattern

```
Consumer (anon) ──► Edge Function (service_role) ──► Database
                    Validates input, enforces rules,
                    returns only allowed data

Admin/Owner ──► supabase-js (authenticated) ──► Database (RLS)
                RLS checks profiles.role
```

## Storage Architecture

| Bucket | Access | Content | Lifecycle |
|---|---|---|---|
| `bike-photos` | Public | Catalog photos (WebP, compressed) | Manual delete |
| `site-assets` | Public | Logo, gallery, QRIS images | Manual delete |
| `payment-proofs` | Private (signed URL ≤60s) | Payment proof uploads | Per retention policy |
| `documentation` | Private (signed URL ≤60s) | Bike condition photos, ID | 30d (identity), 12mo (condition) |

## Edge Functions

### Consumer Actions (public, rate-limited)

| Function | Trigger | Auth | Key Logic |
|---|---|---|---|
| `create-booking` | POST | Turnstile + rate limit | Validate availability, create booking + items in transaction |
| `lookup-order` | POST | Rate limit (5/15min/IP) | Verify booking code + WhatsApp OR public_token |
| `upload-payment` | POST | Booking token | Validate file, compress, strip EXIF, store |
| `request-extension` | POST | Booking token | Check availability after current end time |
| `cancel-booking` | POST | Booking token | Apply cancellation policy |
| `record-qr-scan` | POST | QR token | Validate active rental, request geolocation |
| `get-upload-url` | POST | Booking token | Generate signed upload URL |

### Scheduled Tasks (cron)

| Function | Schedule | Purpose |
|---|---|---|
| `expire-bookings` | Every 1 min | Expire unpaid bookings past deadline |
| `mark-no-show` | Every 5 min | Mark no-shows past start + tolerance |
| `late-reminder` | Every 1 min | Notify when ≤15min remaining or overdue |
| `maintenance-reminder` | Daily 08:00 | Notify upcoming maintenance |
| `cleanup-retention` | Daily 02:00 | Delete expired personal data |

## Security Layers

```
Layer 1: Cloudflare (DDoS, Turnstile, headers)
Layer 2: Next.js middleware (auth check for /dashboard/*)
Layer 3: Edge Functions (input validation, rate limiting)
Layer 4: Supabase RLS (row-level access control)
Layer 5: PostgreSQL constraints (data integrity)
```

## Performance Targets

| Metric | Target | Strategy |
|---|---|---|
| LCP (Landing, 4G) | ≤2.5s | SSG, image optimization, font preload |
| API response (booking) | ≤1s p95 | Edge Functions, indexed queries |
| CLS | <0.1 | Reserved image dimensions, skeleton UI |
| Lighthouse Mobile | ≥85 | WebP, lazy loading, code splitting |
| Concurrent dashboard users | 10 | Supabase Realtime, connection pooling |
| Daily bookings capacity | 200 | Indexed queries, connection pool |

## Deployment

```
GitHub repo
    │
    ├── Push to main ──► Vercel (auto-deploy frontend)
    │
    └── supabase/ changes ──► Supabase CLI (migrations)
                               supabase db push
```

### Environments

| Env | Frontend | Database | Purpose |
|---|---|---|---|
| Development | localhost:3000 | Local Supabase | Daily development |
| Staging | staging.rafago.id | Supabase staging project | Testing before release |
| Production | rafago.id | Supabase production project | Live |
