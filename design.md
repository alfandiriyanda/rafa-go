# DESIGN.md — Hourly Bike Rental Website (consumer site + staff dashboard)

Upload this file to Google Stitch as the project design system. Every page prompt in this package says "follow the uploaded DESIGN.md"; anything stated here applies to all pages.

## 1. Overview

An hourly bicycle rental website for tourists and locals, plus an operations dashboard for counter staff and the owner. The consumer side needs no account: visitors pick a bike, book with name and WhatsApp number, pay by manual transfer or QRIS and upload proof, then follow the order through a booking code.

Personality: bright, friendly, trustworthy, quick. A clean outdoor-leisure product, not a tech startup. Light theme only (counter staff work in daylight; visitors use phones outdoors).

Reference translation (from the supplied reference screen). Keep these traits faithfully:
- Wide rounded banner with a soft aqua gradient, sparse white dot "snow" sparkles, a pale lighter circle swelling from the bottom-left, and a large cut-out photo overlapping the right edge.
- Navbar with center text links where the active link has a short dark underline, plus one outlined pill and one filled aqua pill on the right.
- Two small rounded-square icon buttons at the far left of the landing navbar (one slate, one aqua).
- White cards with very large radius and soft diffuse shadows; tall rounded photo cards with the caption sitting on a gradient at the bottom.
- A stacked list of pill-shaped items graded from pale aqua through mid aqua and slate blue to dark slate, with the last one white.
- Small sticker-style cards with a round "×" badge on the top-left corner.
- Info cards: round icon badge on the left, bold title, two lines of small text.
- A faint line-art sketch (here: a bicycle) as page background watermark at very low opacity.
- Small decorative heart in the reference becomes a small coral dot or spark; do not draw hearts.

Adaptations required by the product (do not copy blindly):
- No Log in / Sign up. The right-side pills are "Cek Pesanan" (outlined) and "Sewa Sekarang" (filled aqua).
- The reference character art is replaced by real bicycle and cyclist photography.
- Lorem ipsum is never used; all copy is real Indonesian text.

## 2. Logo rules (strict)

- The brand logo is an uploaded image asset that already contains the brand name. Always place that image; never retype, restyle, redraw or add the brand name as live text anywhere (no wordmark beside it, no title text, no footer brand line, no alt-text-looking caption).
- Landing page: logo sits inside the hero banner at the top-left corner, small (about 90–110 px wide on desktop, 80 px on mobile), exactly where the reference places its logo.
- All other consumer pages: logo at the top-left of the navbar, about 44 px high.
- Dashboard: logo at the top of the sidebar, about 40 px high; collapsed sidebar uses the same image cropped to its mark only if the asset provides it, otherwise keep the full image at a smaller size.
- Keep clear space around the logo equal to its height / 2. Never place it on a busy photo area.

## 3. Color

| Token | Hex | Use |
| --- | --- | --- |
| aqua-500 | #4FC3C8 | Primary filled buttons, active chips, key accents |
| aqua-300 | #8DDDE1 | Hero gradient start, hover tints |
| aqua-200 | #BFEAEC | Pill list tint 2, soft borders |
| aqua-100 | #DDF4F5 | Info chips, selected rows |
| aqua-50 | #F3FBFB | Page background |
| hero-end | #3DB0BA | Hero gradient end (bottom-right) |
| teal-700 | #17727C | Links, active text on light, icons on white (5.3:1) |
| slate-500 | #4E7592 | Pill list tint 4 (white text) |
| slate-800 | #3E4C5E | Pill list tint 5 (white text) |
| ink | #12202F | Headings, primary text, text on aqua buttons |
| ink-soft | #2B3E52 | Body text |
| muted | #5B6B7A | Captions, helper text |
| line | #D5E7E9 | Hairlines, input borders |
| surface | #FFFFFF | Cards, sheets |
| coral-500 | #FF6F8E | Tiny accent only: "Populer" dot, notification dot, sparkle |
| coral-100 | #FFE3E9 | Tag background with ink text |
| success | #1F8F63 on #DDF5EA | Approved, Tersedia, Lunas |
| warning | #9A6200 on #FFF0D1 | Menunggu, hampir habis, perawatan |
| danger | #B8333F on #FDE4E6 | Ditolak, terlambat, rusak |

Rules:
- Text on aqua-500 buttons is ink (dark), never white. White text is allowed only on slate-500, slate-800 and the hero-end side of the gradient when text is large and bold.
- Body text contrast at least 4.5:1, large text at least 3:1. Tint secondary text from ink, never neutral gray.
- Status is always color plus label plus icon, never color alone.
- Coral covers under 3% of any screen.

Hero gradient: linear from aqua-300 (top-left) to hero-end (bottom-right), with a lighter translucent circle (white at 25%) bleeding off the bottom-left.

## 4. Typography

- Headings, buttons, nav, numbers: Poppins (500, 600, 700).
- Body, forms, tables, long reading text (policies, FAQ answers): Open Sans (400, 600).
- Tabular numerals on prices, timers, tables and booking codes.

| Role | Size / weight |
| --- | --- |
| Hero title | 44–56 px / 700, tracking -0.02em; 32 px on mobile |
| Page title | 32 px / 700 |
| Section title | 24 px / 600 (small trailing chevron allowed, like "Artwork >") |
| Card title | 16–18 px / 600 |
| Body | 16 px / 400, line-height 1.55, max measure 70ch |
| Caption | 13–14 px / 400 |
| Button | 15 px / 600 |

No gradient text. Emphasis comes from weight and size. No kicker or eyebrow label above headings.

## 5. Shape, elevation, spacing

- Radius: hero 28 px, cards 24 px, photo cards 22 px, inputs 14 px, buttons and chips fully round (999 px), icon buttons 14 px squares.
- Shadow (cards): `0 10px 28px rgba(36, 92, 110, 0.10)` plus `0 1px 2px rgba(36, 92, 110, 0.06)`. Always offset and softly blurred; no hard block shadows, no colored glows.
- Spacing scale 4, 8, 12, 16, 24, 32, 48, 72. Card padding 20–24. Gap between cards 16–20. Section gap 48 desktop, 32 mobile. More space above a heading than below it.
- Page content width 1200 px on desktop, 16 px side gutters on mobile (360 px minimum).
- No nested cards. A card never contains another bordered card; use dividers or tinted areas inside.

## 6. Components

Consumer navbar: sticky, white at 92% opacity with a soft bottom shadow, 72 px high. Left: logo image (inner pages) or the two rounded-square icon buttons (landing: slate "Keranjang Sewa", aqua "WhatsApp"). Center links: Beranda, Katalog, Cara Sewa, Harga, FAQ, Lokasi, in Poppins 15 px; active link has a 2 px ink underline about 24 px wide. Right: outlined pill "Cek Pesanan" (ink border 1.5 px) and filled aqua pill "Sewa Sekarang". Mobile: logo left, "Sewa Sekarang" pill and a menu button right; links move into a bottom-sheet menu.

Buttons: primary = aqua-500 fill, ink text, 48 px high, pill. Secondary = white fill, ink 1.5 px border. Tertiary = text with 2 px ink underline (like "Read More" in the reference). Destructive = danger text on danger tint. Hover raises brightness slightly and lifts 1 px; focus shows a 3 px teal-700 ring with 2 px offset; disabled is 45% opacity with no shadow; loading shows an inline spinner and keeps width.

Cards: white, radius 24, soft shadow. Photo cards: tall (about 3:4), photo fills, caption sits on a bottom gradient (ink at 55% to transparent) with white text. Sticker cards: small white card with a round aqua "×" badge overlapping the top-left corner.

Pill list: stacked full-width pills, 44 px high, search-style leading icon, tints stepping from aqua-100, aqua-200, aqua-500, slate-500, slate-800, then white with ink border. Text color follows the contrast rule.

Info card: white card, round icon badge (aqua-100 fill, teal-700 stroke icon) at left, title 16 px/600, two lines of caption.

Status chips: pill, 28 px high, tinted background, icon plus label. Bike: Tersedia, Sedang Disewa, Dipesan, Perawatan. Order: Menunggu Pembayaran, Menunggu Verifikasi, Terkonfirmasi, Sedang Disewa, Selesai, Dikembalikan, Kedaluwarsa, Dibatalkan, Tidak Datang. Payment: Belum Dibayar, Menunggu Verifikasi, Disetujui, Ditolak.

Forms: visible label above field, helper text below, error text next to the field in danger color with an icon. 52 px high inputs, radius 14, line border, teal-700 focus ring. Phone field has a fixed "+62" prefix. Never placeholder-only labels.

Upload dropzone: dashed aqua-300 border, aqua-50 fill, camera icon button, preview thumbnail with replace and remove, file hint text.

Tables (dashboard): 48 px rows, sticky header with aqua-50 fill, tabular numerals, hover row tint aqua-100, row actions as icon buttons with tooltips, bulk-select checkbox column, pagination bottom-right. On mobile each row becomes a stacked card.

Dashboard shell: left sidebar 264 px, white, radius 24 on the inner edge, logo at top, grouped menu (Operasional: Ringkasan, Pesanan, Walk-in, Verifikasi Pembayaran, Penyewaan Aktif, Pengembalian; Armada: Sepeda, Kategori, Perawatan, Tracking Center; Bisnis: Konsumen, Laporan, Notifikasi; Admin: Pengguna, Audit Log, Pengaturan). Active item = aqua-100 pill with teal-700 text and filled icon. Top bar: search field, bell with coral dot, role chip (Owner or Admin), avatar menu. Content area on aqua-50. Mobile: sidebar becomes a drawer plus a bottom bar with Ringkasan, Pesanan, Verifikasi, Sewa, Lainnya.

Icons: one outline icon set (Lucide style), 1.75 px stroke, 20–24 px, rounded caps. No emoji, no mixed styles.

Toasts and banners: white card, status icon, one sentence naming the result or the problem plus the next step.

## 7. Imagery

- Real photography: bicycles shot in daylight on clean backgrounds for the catalogue (consistent 4:5 crop), lifestyle photos of riders on promenades and parks for hero and gallery. Hero uses a cut-out rider with bike overlapping the banner edge on the right.
- Placeholder bikes must look like plausible city, mountain, folding, kids and electric bicycles, never generic gray boxes.
- Maps use a clean light OpenStreetMap-style tile look with aqua markers.
- Page background: faint line-art bicycle sketch at 4–6% opacity, large, cropped by the viewport edge, behind content only.

## 8. Motion

One authored moment per page: hero banner dots softly drifting and the cut-out rider easing in (400–600 ms, exponential ease-out). Elsewhere only functional motion: hover lift 150 ms, sheet and drawer slide 250 ms, countdown ticking, skeleton shimmer. Respect reduced-motion by removing drift and slide effects.

## 9. Accessibility and responsiveness

- Design for 360, 768, 1024 and 1440 px. No horizontal page scroll.
- Tap targets at least 44 × 44 px, 8 px minimum between targets.
- Visible focus on everything interactive; logical tab order.
- Every screen provides loading (skeleton), empty, error and offline states.

## 10. Anti-AI-slop rules

Avoid:
- Purple/indigo gradients, neon glows, glassmorphism as decoration, gradient text.
- Rows of identical icon + title + paragraph cards as page structure; hero-metric blocks (huge number, tiny label).
- Eyebrow labels above headings; decorative section numbers (numbers appear only where order matters, such as the four rental steps).
- Lorem ipsum, "John Doe", "Acme", fake five-star walls, stock handshake photos, emoji icons.
- Fake brand names, extra taglines, or any retyped brand text next to the logo.
- Hard offset shadows, colored left borders on cards, nested cards, sparklines used as filler.

Prefer:
- Specific Indonesian copy with real details: "Rp15.000/jam", "Buka sampai 21.00 WIB", "Tunjukkan kode booking ke petugas".
- Realistic data: plausible bike names (e.g., Polygon, United, Pacific style models described generically as "Sepeda Gunung 26"), varied order statuses, uneven numbers.
- Controls named by their action ("Kirim Bukti Pembayaran", "Mulai Sewa", "Kembalikan Sepeda").
- Errors that name the problem and the recovery.

## 11. Voice and copy

Indonesian, short sentences, friendly but plain ("Pesanan kamu menunggu verifikasi. Biasanya selesai dalam 15 menit."). Use "kamu" on consumer pages, neutral imperative on dashboard. Currency format "Rp15.000", time format "14.30 WIB", date "8 Nov 2026".

## 12. Page inventory

Consumer (no login): Landing, Katalog, Detail Sepeda, Form Pemesanan, Pembayaran, Cek Pesanan, Perpanjang Sewa, Scan QR, Unggah Dokumentasi, Kebijakan.
Dashboard (login): Login, Ringkasan, Pesanan, Walk-in, Verifikasi Pembayaran, Penyewaan Aktif, Pengembalian, Sepeda, Kategori, Konsumen, Perawatan, Tracking Center, Laporan, Notifikasi, Pengguna, Audit Log, Pengaturan.
