/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Database,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  RefreshCw,
  UploadCloud,
  Check,
  ShieldCheck,
  Key,
  Globe,
  Terminal,
  Trash2,
} from 'lucide-react';
import {
  getSupabaseCredentials,
  saveSupabaseCredentials,
  clearSupabaseCredentials,
  getSupabaseClient,
} from '../../lib/supabase/client';
import { generateInitialBikes } from '../../lib/data/bikes';

export const SupabaseTab: React.FC = () => {
  const [credentials, setCredentials] = useState(getSupabaseCredentials());
  const [urlInput, setUrlInput] = useState(credentials.url);
  const [keyInput, setKeyInput] = useState(credentials.anonKey);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    tableCount?: number;
  } | null>(null);

  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedEnv, setCopiedEnv] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<string | null>(null);
  const [showFullSql, setShowFullSql] = useState(false);

  useEffect(() => {
    if (credentials.isConfigured) {
      testConnection();
    }
  }, []);

  const testConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const client = getSupabaseClient();
      if (!client) {
        setTestResult({
          success: false,
          message: 'URL atau Anon Key belum diisi dengan format valid.',
        });
        setIsTesting(false);
        return;
      }

      // Test query to bikes table
      const { data, error, count } = await client
        .from('bikes')
        .select('*', { count: 'exact' })
        .limit(5);

      if (error) {
        // Table might not exist yet if SQL hasn't been run
        if (error.code === '42P01' || error.message.includes('relation "public.bikes" does not exist')) {
          setTestResult({
            success: true,
            message:
              'Terkoneksi ke Supabase! Namun tabel "bikes" belum dibuat. Silakan salin & jalankan skrip SQL di SQL Editor Supabase.',
            tableCount: 0,
          });
        } else {
          setTestResult({
            success: false,
            message: `Gagal query: ${error.message} (Kode: ${error.code})`,
          });
        }
      } else {
        setTestResult({
          success: true,
          message: `Berhasil terhubung ke Supabase! Ditemukan ${count ?? data?.length ?? 0} armada sepeda di database cloud.`,
          tableCount: count ?? data?.length ?? 0,
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `Koneksi gagal: ${err.message || 'Cek kembali koneksi internet dan API Key'}`,
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    let finalUrl = urlInput.trim();
    if (finalUrl && !finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      // Auto convert Project ID (e.g. xyz123) to full Supabase URL
      finalUrl = `https://${finalUrl}.supabase.co`;
    }
    const cleanKey = keyInput.trim();
    saveSupabaseCredentials(finalUrl, cleanKey);
    const updated = getSupabaseCredentials();
    setCredentials(updated);
    setTimeout(() => {
      window.location.reload();
    }, 400);
  };

  const handleClear = () => {
    clearSupabaseCredentials();
    setUrlInput('');
    setKeyInput('');
    setCredentials(getSupabaseCredentials());
    setTestResult(null);
    setTimeout(() => {
      window.location.reload();
    }, 400);
  };

  const handleSeedBikes = async () => {
    const client = getSupabaseClient();
    if (!client) {
      alert('Harap hubungkan Supabase terlebih dahulu.');
      return;
    }

    setIsSeeding(true);
    setSeedResult(null);

    try {
      const bikes = generateInitialBikes();
      const payload = bikes.map((b) => ({
        id: b.id,
        code: b.code,
        name: b.name,
        category_slug: b.categorySlug,
        category_name: b.categoryName,
        hourly_rate: b.hourlyRate,
        status: b.status,
        frame_size: b.frameSize,
        gears: b.gears,
        brakes: b.brakes,
        color: b.color,
        image: b.image,
        qr_token: b.qrToken,
        total_rentals: b.totalRentals,
      }));

      const { data, error } = await client.from('bikes').upsert(payload, { onConflict: 'id' });

      if (error) {
        setSeedResult(`Gagal seed: ${error.message}. Pastikan skrip SQL sudah dijalankan di Supabase.`);
      } else {
        setSeedResult(`Sukses! 50 unit armada sepeda telah berhasil diunggah/di-sinkronkan ke Supabase!`);
        testConnection();
      }
    } catch (err: any) {
      setSeedResult(`Terjadi kesalahan: ${err.message}`);
    } finally {
      setIsSeeding(false);
    }
  };

  const sqlCode = `-- ========================================================
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
    status VARCHAR(30) NOT NULL DEFAULT 'tersedia',
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
    booking_code VARCHAR(30) NOT NULL UNIQUE,
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

-- 4. Item Sepeda per Pesanan (Anti Double-Booking Constraint)
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
    method VARCHAR(30) NOT NULL,
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

-- RLS & Kebijakan Akses
ALTER TABLE public.bikes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anon dapat melihat sepeda" ON public.bikes;
DROP POLICY IF EXISTS "Anon dapat melihat booking dengan token" ON public.bookings;

CREATE POLICY "Anon dapat mengelola sepeda" ON public.bikes FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon dapat mengelola booking" ON public.bookings FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon dapat mengelola booking items" ON public.booking_items FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon dapat mengelola pembayaran" ON public.payments FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon dapat mengelola scan qr" ON public.qr_scans FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon dapat mengelola audit logs" ON public.audit_logs FOR ALL TO anon USING (true) WITH CHECK (true);
`;

  const copyToClipboard = (text: string, type: 'sql' | 'env') => {
    navigator.clipboard.writeText(text);
    if (type === 'sql') {
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2500);
    } else {
      setCopiedEnv(true);
      setTimeout(() => setCopiedEnv(false), 2500);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Banner Intro */}
      <div className="bg-gradient-to-r from-[#12202F] to-[#1E3A52] rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-[#4FC3C8] opacity-10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-xs font-semibold text-emerald-300">
              <Database className="w-3.5 h-3.5" />
              Supabase PostgreSQL Ready
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Integrasi Database Supabase
            </h2>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Sistem RAFA GO dirancang penuh untuk bekerja dengan <span className="text-[#4FC3C8] font-bold">Supabase</span>. 
              Saat ini website berjalan dalam mode hybrid: otomatis menyimpan ke browser (Offline-first) dan dapat langsung tersambung ke cloud Supabase hanya dengan memasukkan URL & Anon Key di bawah ini!
            </p>
          </div>

          <div className="shrink-0 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 text-center min-w-[200px]">
            <p className="text-xs uppercase tracking-wider text-slate-300 font-semibold mb-1">Status Database</p>
            {credentials.isConfigured ? (
              <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold text-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                Supabase Terhubung
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 text-amber-300 font-bold text-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                Mode Lokal (Aktif)
              </div>
            )}
            <p className="text-[11px] text-slate-400 mt-1">
              {credentials.isConfigured ? 'Sinkronisasi Cloud Aktif' : 'Penyimpanan Browser (Aman)'}
            </p>
          </div>
        </div>
      </div>

      {/* Grid: 2 Kolom (Konfigurasi & Petunjuk Singkat) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Kolom Kiri: Form Kredensial & Uji Koneksi */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#4FC3C8]/15 text-[#248287] flex items-center justify-center">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Kredensial API Supabase</h3>
                  <p className="text-xs text-slate-500">Dapatkan dari menu Project Settings &gt; API di dashboard Supabase</p>
                </div>
              </div>
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#248287] hover:underline"
              >
                Buka Supabase <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <form onSubmit={handleSaveCredentials} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-slate-400" />
                    Project ID atau URL Supabase
                  </label>
                  <span className="text-[11px] text-slate-400">Bisa ketik ID saja (misal: ovhsdlk...)</span>
                </div>
                <input
                  type="text"
                  placeholder="Contoh: ovhsdlkxms atau https://ovhsdlkxms.supabase.co"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4FC3C8] transition-all font-mono"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                    Supabase API Key (Anon / Public Key)
                  </label>
                  <span className="text-[11px] text-slate-400">Kunci API publik (eyJ...)</span>
                </div>
                <textarea
                  rows={3}
                  placeholder="Tempelkan API Key Supabase Anda di sini (eyJhbGciOiJIUzI1Ni...)"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4FC3C8] transition-all font-mono"
                  required
                />
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#4FC3C8] text-[#12202F] font-bold text-sm rounded-xl hover:bg-[#3db0ba] transition-all shadow-sm flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Simpan & Hubungkan
                </button>

                {credentials.isConfigured && (
                  <button
                    type="button"
                    onClick={testConnection}
                    disabled={isTesting}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition-all flex items-center gap-2"
                  >
                    <RefreshCw className={`w-4 h-4 ${isTesting ? 'animate-spin text-[#248287]' : ''}`} />
                    {isTesting ? 'Menguji...' : 'Uji Koneksi'}
                  </button>
                )}

                {credentials.isConfigured && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="px-3.5 py-2.5 text-rose-600 hover:bg-rose-50 text-xs font-semibold rounded-xl transition-all ml-auto flex items-center gap-1.5"
                    title="Hapus Kredensial dari browser dan kembali ke mode lokal"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Reset
                  </button>
                )}
              </div>
            </form>

            {/* Test Connection Output Box */}
            {testResult && (
              <div
                className={`p-4 rounded-xl border text-sm flex items-start gap-3 ${
                  testResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-semibold">{testResult.success ? 'Koneksi Berhasil' : 'Periksa Kembali'}</p>
                  <p className="text-xs mt-0.5 leading-relaxed">{testResult.message}</p>
                </div>
              </div>
            )}
          </div>

          {/* Seed Armada ke Supabase */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Seed 50 Armada Sepeda ke Cloud</h3>
                  <p className="text-xs text-slate-500">Unggah otomatis master data 50 unit sepeda RAFA GO ke tabel `public.bikes`</p>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Setelah Anda menjalankan skrip SQL di Supabase, Anda dapat mengklik tombol ini untuk langsung mengisi 50 unit sepeda lengkap dengan kategori (City Bike, MTB, Lipat, Anak, Listrik), harga sewa, dan token QR uniknya.
            </p>

            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={handleSeedBikes}
                disabled={isSeeding || !credentials.isConfigured}
                className="px-4 py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-sm"
              >
                <UploadCloud className={`w-4 h-4 ${isSeeding ? 'animate-bounce' : ''}`} />
                {isSeeding ? 'Mengunggah 50 Sepeda...' : 'Unggah 50 Sepeda ke Supabase'}
              </button>

              {!credentials.isConfigured && (
                <span className="text-xs text-amber-600 font-medium">
                  Hubungkan URL & Key di atas terlebih dahulu.
                </span>
              )}
            </div>

            {seedResult && (
              <div
                className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
                  seedResult.includes('Sukses')
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                {seedResult}
              </div>
            )}
          </div>
        </div>

        {/* Kolom Kanan: 4 Langkah Cepat Setup Supabase */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-5">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Terminal className="w-5 h-5 text-[#248287]" />
              Panduan 4 Langkah Menghubungkan
            </h3>

            <div className="space-y-4 text-xs">
              {/* Step 1 */}
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                  1
                </span>
                <div>
                  <p className="font-bold text-slate-800">Buat Proyek di Supabase</p>
                  <p className="text-slate-500 mt-0.5">
                    Kunjungi <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-[#248287] font-semibold underline">supabase.com</a>, daftar gratis, lalu klik <strong>New Project</strong> (beri nama: <em>rafa-go-rental</em>).
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                  2
                </span>
                <div>
                  <p className="font-bold text-slate-800">Buka SQL Editor &amp; Jalankan Skrip</p>
                  <p className="text-slate-500 mt-0.5">
                    Klik menu <strong>SQL Editor</strong> di dashboard Supabase Anda, klik <strong>New Query</strong>, lalu salin dan tempel skrip SQL di bawah ini, kemudian klik <strong>Run</strong>.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                  3
                </span>
                <div>
                  <p className="font-bold text-slate-800">Salin URL &amp; Anon Key</p>
                  <p className="text-slate-500 mt-0.5">
                    Masuk ke menu <strong>Project Settings &gt; API</strong>. Salin <strong>Project URL</strong> dan <strong>anon/public key</strong>.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                  4
                </span>
                <div>
                  <p className="font-bold text-slate-800">Simpan di RAFA GO</p>
                  <p className="text-slate-500 mt-0.5">
                    Tempelkan URL &amp; Key pada form di sebelah kiri, lalu klik <strong>Simpan &amp; Hubungkan</strong>. Selesai!
                  </p>
                </div>
              </div>
            </div>

            {/* Tombol Salin SQL */}
            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => copyToClipboard(sqlCode, 'sql')}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                {copiedSql ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">Skrip SQL Berhasil Disalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-[#4FC3C8]" />
                    Salin Skrip SQL (`supabase_schema.sql`)
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() =>
                  copyToClipboard(
                    `VITE_SUPABASE_URL=${credentials.url || 'https://xyzcompany.supabase.co'}\nVITE_SUPABASE_ANON_KEY=${credentials.anonKey || 'eyJhbGciOi...'}\n`,
                    'env'
                  )
                }
                className="w-full py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {copiedEnv ? (
                  <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" /> Konfigurasi .env Disalin!
                  </span>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" /> Salin Format .env File
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SQL Preview Box */}
      <div className="bg-[#12202F] rounded-2xl p-6 text-white border border-slate-800 shadow-md">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-[#4FC3C8]" />
            <h4 className="text-sm font-bold tracking-tight text-white">
              Pratinjau Skrip SQL Lengkap (`supabase_schema.sql`)
            </h4>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFullSql(!showFullSql)}
              className="text-xs text-slate-400 hover:text-white transition-colors underline"
            >
              {showFullSql ? 'Kecilkan' : 'Tampilkan Penuh'}
            </button>
            <button
              onClick={() => copyToClipboard(sqlCode, 'sql')}
              className="px-3 py-1.5 bg-[#4FC3C8] text-[#12202F] rounded-lg text-xs font-bold hover:bg-[#3db0ba] transition-all flex items-center gap-1.5"
            >
              {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedSql ? 'Tersalin' : 'Salin SQL'}
            </button>
          </div>
        </div>

        <pre
          className={`font-mono text-xs text-emerald-300 overflow-x-auto p-4 bg-slate-950/60 rounded-xl leading-relaxed transition-all ${
            showFullSql ? 'max-h-[600px]' : 'max-h-56'
          }`}
        >
          {sqlCode}
        </pre>
      </div>
    </div>
  );
};
