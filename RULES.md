# Coding Rules — RAFA GO

## 1. TypeScript

- Strict mode enabled, no `any` type
- Prefer `interface` over `type` for object shapes
- Use discriminated unions for status types
- All Supabase query results must be typed (generate from `supabase gen types`)
- No `as` type assertions unless unavoidable (document why)

```typescript
// ✅ Good — discriminated union for status
interface BookingPending { status: 'pending'; expiresAt: Date }
interface BookingConfirmed { status: 'confirmed'; paidAt: Date }
type Booking = BookingPending | BookingConfirmed;

// ❌ Bad
interface Booking { status: string; expiresAt?: Date; paidAt?: Date }
```

## 2. Components

- Functional components only
- Named exports (default exports only for Next.js pages/layouts)
- Props interface named `{Component}Props`
- Colocate component, test, and story in same directory
- No prop drilling beyond 2 levels — use context or composition

```typescript
// ✅ Good
export interface BikeCardProps {
  bike: Bike;
  onSelect: (id: string) => void;
}

export function BikeCard({ bike, onSelect }: BikeCardProps) { ... }
```

## 3. Styling

- Tailwind CSS only — no inline styles, no CSS modules, no styled-components
- Use `cn()` utility (clsx + tailwind-merge) for conditional classes
- Design tokens from `ui-ux/design.md` mapped to Tailwind config
- Colors: semantic names (`primary`, `surface`, `ink`, `muted`, `success`, `warning`, `danger`)
- No hardcoded hex values in components — always use Tailwind token classes

```typescript
// ✅ Good
<button className={cn("bg-primary text-ink rounded-full px-6 py-3", disabled && "opacity-45")}>

// ❌ Bad
<button style={{ backgroundColor: '#4FC3C8', color: '#12202F' }}>
```

## 4. Data Fetching

- Server components for initial data load (SSG/ISR pages)
- React Query for client-side data with Supabase subscriptions
- Zod validation on all API inputs AND outputs
- All consumer mutations through Edge Functions, never direct Supabase client writes from browser

```typescript
// ✅ Consumer booking — via Edge Function
const { data } = await supabase.functions.invoke('create-booking', { body: bookingData });

// ❌ Never — direct insert from anon client
const { data } = await supabase.from('bookings').insert(bookingData);
```

## 5. Forms

- React Hook Form + Zod resolver
- Visible labels above every field (never placeholder-only)
- Error messages next to the field, in Indonesian
- WhatsApp field: fixed "+62" prefix, validate Indonesian format
- Submit button: show loading spinner, maintain width, disable during submit

## 6. Error Handling

- Every error message names the problem + suggests recovery
- API errors: return structured `{ error: string, code: string }`, never raw exceptions
- Form errors: inline next to field with danger color + icon
- Network errors: show offline banner with retry button
- Never swallow errors silently

```typescript
// ✅ Good error message
"Sepeda Polygon Sierra tidak tersedia pada jam 14.00–16.00. Coba jam lain atau pilih sepeda serupa."

// ❌ Bad
"Terjadi kesalahan. Silakan coba lagi."
```

## 7. Database

- Money: `integer` Rupiah (no float/decimal)
- Timestamps: `timestamptz`, display in WIB
- Booking codes: `RG-YYMMDD-XXXX` (no 0/O/1/I)
- Tokens: `gen_random_bytes(16)` minimum (128 bit)
- Soft delete on bikes (`deleted_at` column)
- All status transitions validated server-side (no invalid jumps)
- Snapshot prices on booking items (price changes don't affect existing orders)

## 8. Security

- RLS on every table, no exceptions
- Role checked from `profiles` table, never from JWT claims
- `service_role` key only in Edge Functions / server environment
- Rate limit: booking creation, order lookup, file upload, QR scan
- File uploads: validate type + size server-side, compress, strip EXIF, UUID filename
- Signed URLs for private storage: ≤60 second expiry
- HTTPS only, HSTS, CSP headers
- Audit log: append-only, records actor, action, before/after values, IP

## 9. Accessibility

- WCAG 2.1 AA baseline
- Contrast: text ≥4.5:1, large text ≥3:1
- All interactive elements have visible focus ring (3px teal-700, 2px offset)
- Tap targets: ≥44×44px, ≥8px spacing between
- Status: always color + label + icon (never color alone)
- Form fields: visible label + helper text + error text
- Keyboard navigation: logical tab order, no focus traps
- Images: meaningful alt text in Indonesian

## 10. Performance

- Images: WebP format, lazy loading, explicit width/height
- Fonts: preload Poppins (600, 700) and Open Sans (400, 600)
- Code split: dynamic imports for dashboard modules
- No layout shift: skeleton UI with reserved dimensions
- Debounce search inputs (300ms)
- Virtualize long lists (>50 items)

## 11. Git & Workflow

- Branch naming: `feat/`, `fix/`, `chore/`, `docs/`
- Commit messages: conventional commits in Indonesian or English
- PR: must pass lint + type check + tests
- Never commit `.env`, `service_role` keys, or personal data
- Database changes: always via versioned migrations, never manual SQL in production

## 12. Copy & Content

- Indonesian language throughout consumer-facing pages
- Use "kamu" (informal) for consumer, neutral imperative for dashboard
- Currency: `Rp15.000` (Rp + dot separator, no space, no decimals)
- Time: `14.30 WIB` (dot separator)
- Date: `8 Nov 2026` (day month year)
- Tabular numerals for prices, timers, codes
- No Lorem ipsum, no fake names, no placeholder data in production
- Button labels = action verbs: "Kirim Bukti", "Mulai Sewa", "Kembalikan Sepeda"
