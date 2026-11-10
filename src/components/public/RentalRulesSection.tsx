/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useRental } from '../../lib/context/RentalContext';
import {
  Search,
  CreditCard,
  KeyRound,
  Bike,
  AlertTriangle,
  Clock,
  IdCard,
  ShieldCheck,
  RotateCcw,
  Check,
} from 'lucide-react';

export const RentalRulesSection: React.FC = () => {
  const { categories, navigateTo } = useRental();

  const steps = [
    {
      num: '01',
      icon: <Search className="w-5 h-5 text-[#12202F]" />,
      title: 'Pilih Sepeda & Jadwal',
      desc: 'Buka katalog, pilih jenis sepeda favoritmu, tentukan tanggal, jam mulai, dan durasi sewa (min. 1 jam).',
    },
    {
      num: '02',
      icon: <CreditCard className="w-5 h-5 text-[#12202F]" />,
      title: 'Bayar via QRIS / Transfer',
      desc: 'Transfer sesuai kode unik nominal 3-digit ke QRIS, DANA, atau SeaBank, lalu unggah bukti bayar dalam 30 menit.',
    },
    {
      num: '03',
      icon: <IdCard className="w-5 h-5 text-[#12202F]" />,
      title: 'Titip KTP & Ambil Sepeda',
      desc: 'Datang ke stasiun rental, tunjukkan nomor WA / kode booking. Titipkan KTP fisik asli ke admin untuk jaminan.',
    },
    {
      num: '04',
      icon: <Bike className="w-5 h-5 text-[#12202F]" />,
      title: 'Gowes & Kembalikan',
      desc: 'Nikmati perjalananmu! Scan QR jika diminta, dan kembalikan sepeda tepat waktu untuk mengambil kembali KTP-mu.',
    },
  ];

  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Section 1: Cara Sewa 4 Langkah */}
        <div>
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-[#4FC3C8] uppercase tracking-wider bg-[#EBF9FA] px-3 py-1 rounded-full border border-[#4FC3C8]/30">
              Alur Sangat Simpel
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-[#12202F] mt-3">
              Cara Sewa Sepeda di RAFA GO
            </h2>
            <p className="text-sm text-[#5B7083] mt-2">
              Tidak perlu antre panjang dan tanpa registrasi akun yang rumit.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step) => (
              <div
                key={step.num}
                className="p-6 rounded-2xl bg-[#F4F8FA] border border-[#E2EBF0] hover:border-[#4FC3C8]/50 transition-all hover:-translate-y-1 relative group"
              >
                <div className="w-12 h-12 rounded-xl bg-[#4FC3C8] flex items-center justify-center font-bold text-[#12202F] shadow-sm mb-4">
                  {step.icon}
                </div>
                <span className="absolute top-6 right-6 font-heading font-black text-3xl text-slate-200 group-hover:text-[#4FC3C8]/20 transition-colors">
                  {step.num}
                </span>
                <h3 className="font-heading font-bold text-base text-[#12202F] mb-1.5">
                  {step.title}
                </h3>
                <p className="text-xs text-[#5B7083] leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Daftar Tarif Resmi */}
        <div className="bg-[#FAFDFE] rounded-3xl p-6 sm:p-10 border border-[#E2EBF0]">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold text-[#4FC3C8] uppercase tracking-wider">
                Tarif Transparan
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#12202F] mt-1">
                Pilihan Armada & Biaya Sewa
              </h2>
              <p className="text-xs sm:text-sm text-[#5B7083] mt-1">
                Tarif flat per jam tanpa biaya tersembunyi. Termasuk fasilitas helm & gembok.
              </p>
            </div>
            <button
              onClick={() => navigateTo('katalog')}
              className="btn-primary px-5 py-2.5 rounded-xl text-xs font-bold self-start md:self-auto cursor-pointer"
            >
              Buka Katalog Sepeda
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="bg-white rounded-2xl p-5 border border-[#E2EBF0] flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#EBF9FA] text-[#12202F]">
                      {cat.name}
                    </span>
                  </div>
                  <div className="mb-3">
                    <span className="text-2xl font-heading font-black text-[#12202F]">
                      Rp{(cat.hourlyRate / 1000).toFixed(0)}k
                    </span>
                    <span className="text-xs text-[#5B7083]"> / jam</span>
                  </div>
                  <p className="text-xs text-[#5B7083] mb-4 leading-relaxed">
                    {cat.description}
                  </p>
                  <ul className="text-[11px] space-y-1.5 text-slate-600 mb-4 border-t border-slate-100 pt-3">
                    {cat.features.slice(0, 3).map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-[#4FC3C8] shrink-0" />
                        <span className="truncate">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => navigateTo('katalog', { category: cat.slug })}
                  className="w-full py-2 rounded-lg bg-slate-100 hover:bg-[#EBF9FA] hover:text-[#12202F] text-[#12202F] text-xs font-semibold transition-colors cursor-pointer text-center"
                >
                  Pilih {cat.name}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Kebijakan Sewa, Denda & Refund Penting */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Denda Keterlambatan */}
          <div className="p-6 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-bold text-base text-amber-950">
              Aturan Keterlambatan & Denda
            </h3>
            <ul className="text-xs text-amber-900 space-y-2 leading-relaxed">
              <li>
                • <strong>Toleransi 10 menit:</strong> Keterlambatan di bawah 10 menit tidak dikenakan denda apapun.
              </li>
              <li>
                • <strong>Denda Rp10.000 / jam:</strong> Dibulatkan ke bawah per 30 menit (Rp5.000 per 30 menit per sepeda).
              </li>
              <li>
                • Denda wajib diselesaikan saat serah terima sepeda sebelum KTP fisik dikembalikan.
              </li>
            </ul>
          </div>

          {/* Card 2: Jaminan KTP Fisik */}
          <div className="p-6 rounded-2xl bg-cyan-50/60 border border-cyan-200/80 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-900 flex items-center justify-center font-bold">
              <IdCard className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-bold text-base text-cyan-950">
              Jaminan KTP Fisik Offline
            </h3>
            <ul className="text-xs text-cyan-900 space-y-2 leading-relaxed">
              <li>
                • <strong>Tidak perlu upload KTP:</strong> Kami menjaga privasi data digital Anda.
              </li>
              <li>
                • KTP fisik asli (atau SIM / Paspor) dititipkan langsung ke petugas admin di konter stasiun.
              </li>
              <li>
                • Petugas mengambil 1 foto dokumentasi Anda di atas sepeda sebelum gowes dimulai.
              </li>
            </ul>
          </div>

          {/* Card 3: Kebijakan Pembatalan & Refund */}
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-800 flex items-center justify-center font-bold">
              <RotateCcw className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-bold text-base text-slate-900">
              Ketentuan Pembatalan & Refund
            </h3>
            <ul className="text-xs text-slate-700 space-y-2 leading-relaxed">
              <li>
                • <strong>Lebih dari 24 jam sebelum sewa:</strong> Pengembalian dana 100%.
              </li>
              <li>
                • <strong>2 sampai 24 jam sebelum sewa:</strong> Pengembalian dana 50%.
              </li>
              <li>
                • <strong>Kurang dari 2 jam / No-show:</strong> Tidak dapat dibatalkan / refund 0%.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
