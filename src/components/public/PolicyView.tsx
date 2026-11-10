/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useRental } from '../../lib/context/RentalContext';
import { Shield, Clock, RotateCcw, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';

export const PolicyView: React.FC = () => {
  const { navigateTo } = useRental();

  return (
    <div className="py-12 bg-[#FAFDFE] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold text-[#4FC3C8] uppercase tracking-wider bg-[#EBF9FA] px-3 py-1 rounded-full border border-[#4FC3C8]/30">
            Transparansi & Keamanan
          </span>
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-[#12202F] mt-2">
            Syarat & Ketentuan Sewa RAFA GO
          </h1>
          <p className="text-sm text-[#5B7083] mt-2">
            Harap dibaca sebelum melakukan pemesanan agar aktivitas bersepeda Anda aman dan nyaman.
          </p>
        </div>

        {/* Policy Sections */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E2EBF0] shadow-xs space-y-8 text-sm text-[#12202F] leading-relaxed">
          {/* Section 1: Identitas & Jaminan */}
          <section className="space-y-3">
            <h2 className="font-heading font-bold text-lg text-[#12202F] flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#4FC3C8]" />
              <span>1. Identitas & Jaminan Sewa</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#5B7083]">
              Kami mengutamakan kemudahan tanpa perlu mengunggah scan KTP secara online:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-700">
              <li>Penyewa wajib membawa dan menitipkan <strong>1 buah Kartu Identitas Fisik Asli</strong> (KTP / SIM / Paspor) yang masih berlaku kepada petugas admin di pos stasiun.</li>
              <li>Satu kartu identitas dapat digunakan sebagai jaminan maksimal 2 unit sepeda untuk rombongan/keluarga.</li>
              <li>Petugas akan mengambil <strong>1 lembar foto dokumentasi</strong> penyewa bersama sepeda saat serah terima unit di stasiun.</li>
              <li>Kartu identitas fisik akan dikembalikan utuh dan lengkap setelah sepeda diperiksa saat pengembalian.</li>
            </ul>
          </section>

          {/* Section 2: Durasi, Keterlambatan & Denda */}
          <section className="space-y-3 pt-6 border-t border-slate-100">
            <h2 className="font-heading font-bold text-lg text-[#12202F] flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#4FC3C8]" />
              <span>2. Durasi Sewa, Toleransi & Denda Keterlambatan</span>
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-700">
              <li>Durasi sewa minimal adalah <strong>1 jam</strong> dengan penambahan kelipatan 30 menit.</li>
              <li><strong>Toleransi Keterlambatan:</strong> Diberikan kelonggaran waktu selama <strong>10 menit</strong> tanpa dikenakan denda apapun.</li>
              <li><strong>Tarif Denda:</strong> Keterlambatan melebihi 10 menit dikenakan denda flat <strong>Rp10.000 / jam per sepeda</strong>, yang dibulatkan ke bawah setiap 30 menit (Rp5.000 per 30 menit).</li>
              <li>Penyewa yang ingin menambah durasi di jalan wajib melakukan konfirmasi via menu <em>Perpanjang Sewa</em> di website atau menghubungi WhatsApp admin sebelum jam sewa habis.</li>
            </ul>
          </section>

          {/* Section 3: Pembatalan & Pengembalian Dana (Refund) */}
          <section className="space-y-3 pt-6 border-t border-slate-100">
            <h2 className="font-heading font-bold text-lg text-[#12202F] flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-[#4FC3C8]" />
              <span>3. Kebijakan Pembatalan & Pengembalian Dana</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                <span className="font-heading font-bold text-sm text-emerald-900 block">Refund 100%</span>
                <p className="text-[11px] text-emerald-800 mt-1">Pembatalan dilakukan lebih dari 24 jam sebelum jam mulai sewa.</p>
              </div>
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                <span className="font-heading font-bold text-sm text-amber-900 block">Refund 50%</span>
                <p className="text-[11px] text-amber-800 mt-1">Pembatalan dilakukan antara 2 hingga 24 jam sebelum jam mulai sewa.</p>
              </div>
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200">
                <span className="font-heading font-bold text-sm text-rose-900 block">Refund 0% (Hangus)</span>
                <p className="text-[11px] text-rose-800 mt-1">Pembatalan kurang dari 2 jam sebelum sewa, atau tidak hadir (No-show).</p>
              </div>
            </div>
          </section>

          {/* Section 4: Tanggung Jawab & Kerusakan */}
          <section className="space-y-3 pt-6 border-t border-slate-100">
            <h2 className="font-heading font-bold text-lg text-[#12202F] flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <span>4. Kerusakan, Kehilangan & Aksesori</span>
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-700">
              <li>Penyewa bertanggung jawab penuh atas keutuhan sepeda, helm, dan gembok yang diserahkan.</li>
              <li>Kondisi lecet ringan wajar tidak dikenakan biaya. Kerusakan komponen berat (bengkok frame, velg patah, kabel rem putus karena kelalaian) dikenakan penggantian biaya suku cadang wajar yang ditetapkan admin di lokasi.</li>
              <li>Kehilangan unit sepeda selama masa sewa merupakan tanggung jawab penyewa dan wajib diganti 100% sesuai nilai wajar unit sepeda.</li>
            </ul>
          </section>

          {/* Section 5: Jam Operasional Stasiun */}
          <section className="space-y-3 pt-6 border-t border-slate-100">
            <h2 className="font-heading font-bold text-lg text-[#12202F] flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#4FC3C8]" />
              <span>5. Jam Operasional Stasiun Rental (WIB)</span>
            </h2>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-1.5">
              <p>• <strong>Senin – Jumat:</strong> 14.00 – 20.00 WIB</p>
              <p>• <strong>Sabtu (Weekend):</strong> 15.00 – 00.00 WIB (Tengah Malam)</p>
              <p>• <strong>Minggu (Car Free Day):</strong> 08.00 – 18.00 WIB</p>
              <p className="text-slate-500 text-[11px] pt-1">
                *Penyewaan tidak diperkenankan melewati jam tutup operasional stasiun pada hari yang sama.
              </p>
            </div>
          </section>
        </div>

        {/* CTA Back to Catalog */}
        <div className="text-center">
          <button
            onClick={() => navigateTo('katalog')}
            className="btn-primary px-8 py-3.5 rounded-xl text-xs font-bold cursor-pointer shadow-md"
          >
            Kembali & Pilih Sepeda
          </button>
        </div>
      </div>
    </div>
  );
};
