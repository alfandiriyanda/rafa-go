-- ========================================================
-- SKEMA DATABASE SUPABASE POSTGRESQL — RAFA GO RENTAL
-- Sistem Rental Sepeda Per Jam (V1 Production Ready)
-- ========================================================

-- 1. Ekstensi untuk Anti Double-Booking
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- 2. Tabel Armada Sepeda (50 Unit)
CREATE TABLE IF NOT EXISTS public.bikes (
    id TEXT PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    category_slug VARCHAR(50) NOT NULL,
    category_name VARCHAR(100) NOT NULL,
    hourly_rate INTEGER NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'tersedia', -- 'tersedia', 'disewa', 'perawatan', 'nonaktif'
    frame_size VARCHAR(50),
    gears VARCHAR(100),
    brakes VARCHAR(100),
    color VARCHAR(50),
    image TEXT,
    qr_token VARCHAR(100) NOT NULL UNIQUE,
    total_rentals INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabel Pemesanan (Konsumen Tanpa Login)
CREATE TABLE IF NOT EXISTS public.bookings (
    id TEXT PRIMARY KEY,
    booking_code VARCHAR(30) NOT NULL UNIQUE, -- RG-YYMMDD-XXXX
    public_token VARCHAR(100) NOT NULL UNIQUE,
    customer_name VARCHAR(150) NOT NULL,
    customer_whatsapp VARCHAR(50) NOT NULL,
    customer_notes TEXT,
    booking_date DATE NOT NULL,
    start_time VARCHAR(10) NOT NULL,
    duration_hours NUMERIC(4,1) NOT NULL,
    end_time VARCHAR(10) NOT NULL,
    base_amount INTEGER NOT NULL,
    unique_nominal_code INTEGER NOT NULL,
    total_amount INTEGER NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'menunggu_pembayaran',
    payment_expires_at TIMESTAMPTZ NOT NULL,
    rental_started_at TIMESTAMPTZ,
    rental_customer_photo TEXT,
    rental_returned_at TIMESTAMPTZ,
    return_condition VARCHAR(30),
    damage_fee INTEGER DEFAULT 0,
    late_fee INTEGER DEFAULT 0,
    total_paid_final INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabel Item Sepeda per Pesanan (Dengan Constraint Anti Double-Booking)
CREATE TABLE IF NOT EXISTS public.booking_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id TEXT REFERENCES public.bookings(id) ON DELETE CASCADE,
    bike_id TEXT REFERENCES public.bikes(id) ON DELETE RESTRICT,
    bike_code VARCHAR(20) NOT NULL,
    bike_name VARCHAR(100) NOT NULL,
    hourly_rate INTEGER NOT NULL,
    rentang TSTZRANGE NOT NULL,
    status VARCHAR(30) DEFAULT 'confirmed',
    CONSTRAINT no_overlapping_bookings EXCLUDE USING gist (
        bike_id WITH =,
        rentang WITH &&
    ) WHERE (status IN ('holding', 'confirmed', 'active'))
);

-- 5. Tabel Bukti Pembayaran Manual
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id TEXT REFERENCES public.bookings(id) ON DELETE CASCADE,
    method VARCHAR(30) NOT NULL, -- 'qris', 'dana', 'seabank', 'tunai'
    sender_bank VARCHAR(100),
    sender_account_name VARCHAR(150),
    transfer_time VARCHAR(50),
    nominal_paid INTEGER NOT NULL,
    receipt_image TEXT,
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    verified_at TIMESTAMPTZ,
    verified_by VARCHAR(100),
    rejection_reason TEXT
);

-- 6. Tabel Titik Pindai QR Sepeda (GPS Snapshot)
CREATE TABLE IF NOT EXISTS public.qr_scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bike_id TEXT REFERENCES public.bikes(id) ON DELETE CASCADE,
    bike_code VARCHAR(20) NOT NULL,
    booking_code VARCHAR(30),
    scanned_at TIMESTAMPTZ DEFAULT NOW(),
    lat NUMERIC(10, 6) NOT NULL,
    lng NUMERIC(10, 6) NOT NULL,
    address TEXT,
    scanner_role VARCHAR(30) NOT NULL
);

-- 7. Tabel Audit Log (Append-Only)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp VARCHAR(50) NOT NULL,
    actor VARCHAR(100) NOT NULL,
    role VARCHAR(30) NOT NULL,
    action VARCHAR(100) NOT NULL,
    details TEXT NOT NULL,
    booking_code VARCHAR(30),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS)
ALTER TABLE public.bikes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy RLS Operasional RAFA GO (Klien Web & Kasir)
DROP POLICY IF EXISTS "Anon dapat melihat sepeda aktif" ON public.bikes;
DROP POLICY IF EXISTS "Anon dapat melihat booking dengan token" ON public.bookings;

CREATE POLICY "Anon dapat mengelola sepeda" ON public.bikes FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon dapat mengelola booking" ON public.bookings FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon dapat mengelola booking items" ON public.booking_items FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon dapat mengelola pembayaran" ON public.payments FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon dapat mengelola scan qr" ON public.qr_scans FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon dapat mengelola audit logs" ON public.audit_logs FOR ALL TO anon USING (true) WITH CHECK (true);

