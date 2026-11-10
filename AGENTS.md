# AGENTS.md — RAFA GO

## Project

RAFA GO: website rental sepeda per jam. Consumer site (no login) + admin/owner dashboard (Supabase Auth). Stack: Next.js + TypeScript + Tailwind + Supabase.

## Setup Commands

```bash
pnpm install                    # Install all dependencies
pnpm dev                        # Start dev server at localhost:3000
pnpm build                      # Production build
pnpm lint                       # ESLint + tsc --noEmit
pnpm test                       # Vitest
pnpm db:migrate                 # Apply Supabase migrations
pnpm db:seed                    # Seed dev data
pnpm db:reset                   # Full reset + migrate + seed
npx supabase gen types typescript --local > src/types/database.ts  # Regenerate DB types
```

## Code Style

- TypeScript strict mode, no `any`
- Functional components only, no class components
- Named exports (no default exports except pages)
- Pnpm as package manager (not npm/yarn)
- Tailwind for all styling — no CSS modules, no styled-components
- Zod for all validation (shared between client and server)
- Use `cn()` utility (clsx + tailwind-merge) for conditional classes

## File Conventions

- Components: PascalCase (`BikeCard.tsx`)
- Utilities/hooks: camelCase (`useBooking.ts`, `formatCurrency.ts`)
- Database migrations: timestamped (`20261108_create_bikes.sql`)
- Types match database table names: `Bike`, `Booking`, `Payment`
- One component per file; colocate tests as `ComponentName.test.tsx`

## Architecture Rules

- Consumer actions (booking, payment upload, QR scan) go through Supabase Edge Functions or RPC, never direct table access from `anon` role
- All money is `integer` Rupiah — never `float`, `decimal`, or `numeric`
- All timestamps are `timestamptz`; display in WIB (`Asia/Jakarta`)
- Anti-double-booking enforced by PostgreSQL exclusion constraint (`tstzrange` on `booking_items`), not app-level checks alone
- RLS on every table; `anon` only reads public views
- Tokens are crypto-random ≥128 bit
- File uploads: client-side compression + EXIF strip before upload, UUID filenames, signed upload URLs
- Audit log is append-only

## Testing

- Vitest + React Testing Library for components
- Test RLS policies with negative scenarios (anon trying admin routes, admin trying owner routes, inactive user)
- Every form: test validation (valid + invalid inputs)
- Booking flow: test double-booking rejection

## Security — Do Not

- Never expose `service_role` key to the browser
- Never trust JWT claims for role; read from `profiles` table
- Never allow `anon` direct INSERT/UPDATE/DELETE on: `bookings`, `payments`, `customers`, `rentals`, `documentation_files`
- Never store original filenames; always UUID
- Never log personal data (names, WhatsApp, identity photos)

## Copy & UX

- All consumer text in Indonesian; use "kamu" (informal)
- Currency format: `Rp15.000` (dot as thousands separator)
- Time: `14.30 WIB`; date: `8 Nov 2026`
- Status displays: always color + label + icon
- Error messages: name the problem + suggest recovery
- Button labels: action verbs ("Kirim Bukti Pembayaran", "Mulai Sewa")

## Key Files

| File | Purpose |
|---|---|
| `PRD.md` | Full product requirements |
| `ARCHITECTURE.md` | System architecture diagram |
| `CLAUDE.md` | Claude Code memory |
| `RULES.md` | Coding standards |
| `TODO.md` | Task tracker |
| `USER-STORIES.md` | User stories + acceptance criteria |
| `ui-ux/design.md` | Visual design system |
| `supabase/migrations/` | Database schema |
