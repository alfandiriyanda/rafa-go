/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { useRental } from '../../lib/context/RentalContext';
import {
  Bike,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight,
  Shield,
  KeyRound,
  IdCard,
  MapPin,
  Compass,
  ArrowRight,
} from 'lucide-react';

export const ThreeColumnFeatured: React.FC = () => {
  const { bikes, categories, navigateTo, setSelectedBikeForDetail } = useRental();

  // Top featured bikes
  const featuredBikes = bikes.filter((b) => b.code === 'CB-01' || b.code === 'FL-01' || b.code === 'EB-01');

  return (
    <section className="relative z-10 w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* ================= COLUMN 1: Katalog Unggulan (3:4 Photo Cards) ================= */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col space-y-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-bold text-2xl text-[#12202F]">
              Katalog Unggulan
            </h2>
            <button
              onClick={() => navigateTo('katalog')}
              className="text-[#17727C] hover:text-[#12202F] flex items-center font-heading font-semibold text-xs cursor-pointer group transition-colors"
            >
              <span>Semua</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="space-y-6">
            {featuredBikes.slice(0, 2).map((bike) => (
              <motion.div
                key={bike.id}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => setSelectedBikeForDetail(bike)}
                className="group relative rounded-[24px] overflow-hidden aspect-3/4 bg-white shadow-[0_10px_28px_rgba(36,92,110,0.10)] hover:shadow-[0_20px_40px_rgba(36,92,110,0.20)] cursor-pointer border border-[#E2EBF0]"
              >
                <img
                  src={bike.image}
                  alt={bike.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#12202F]/90 via-[#12202F]/35 to-transparent flex flex-col justify-end p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/90 text-white font-semibold text-xs backdrop-blur-xs shadow-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                      {bike.status === 'tersedia' ? 'Tersedia' : 'Sedang Disewa'}
                    </span>
                    <span className="font-heading font-black text-xl text-[#8DDDE1]">
                      Rp{bike.hourlyRate.toLocaleString('id-ID')}
                      <span className="text-xs font-normal text-white/80">/jam</span>
                    </span>
                  </div>
                  <h3 className="font-heading font-bold text-lg leading-tight text-white group-hover:text-[#8DDDE1] transition-colors">
                    {bike.name}
                  </h3>
                  <p className="text-xs text-white/80 mt-1 line-clamp-1">
                    {bike.rideType || 'Santai & Rekreasi'} • {bike.condition || '100% Siap Gowes'} • Termasuk Helm &amp; Gembok
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigateTo('katalog')}
            className="h-12 w-full inline-flex items-center justify-center rounded-full bg-white text-[#12202F] font-heading font-semibold text-xs shadow-sm hover:bg-[#F3FBFB] border border-[#E2EBF0] transition-all cursor-pointer"
          >
            Lihat Semua 50 Sepeda →
          </motion.button>
        </motion.div>

        {/* ================= COLUMN 2: Cari Cepat Kategori & Sticker Cards ================= */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col space-y-6"
        >
          <h2 className="font-heading font-bold text-2xl text-[#12202F]">
            Cari Cepat Kategori
          </h2>

          {/* Stacked Category Pills with interactive hover slides */}
          <div className="flex flex-col space-y-2.5">
            <motion.button
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigateTo('katalog', { category: 'city' })}
              className="h-11 w-full px-5 flex items-center justify-between rounded-full bg-[#DDF4F5] text-[#12202F] font-heading font-semibold text-xs hover:bg-[#BFEAEC] transition-all text-left cursor-pointer group"
            >
              <span className="group-hover:translate-x-1 transition-transform">City & Commuter Bike</span>
              <span className="text-[#5B7083] font-normal flex items-center gap-1">
                15 unit • Rp35k/j
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </span>
            </motion.button>

            <motion.button
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigateTo('katalog', { category: 'lipat' })}
              className="h-11 w-full px-5 flex items-center justify-between rounded-full bg-[#BFEAEC] text-[#12202F] font-heading font-semibold text-xs hover:bg-[#8DDDE1] transition-all text-left cursor-pointer group"
            >
              <span className="group-hover:translate-x-1 transition-transform">Sepeda Lipat (Folding)</span>
              <span className="text-[#12202F]/80 font-normal flex items-center gap-1">
                10 unit • Rp20k/j
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </span>
            </motion.button>

            <motion.button
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigateTo('katalog', { category: 'mtb' })}
              className="h-11 w-full px-5 flex items-center justify-between rounded-full bg-[#4FC3C8] text-[#12202F] font-heading font-bold text-xs shadow-sm hover:brightness-105 transition-all text-left cursor-pointer group"
            >
              <span className="group-hover:translate-x-1 transition-transform">Sepeda Gunung (MTB)</span>
              <span className="text-[#12202F] font-bold flex items-center gap-1">
                12 unit • Rp40k/j
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </span>
            </motion.button>

            <motion.button
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigateTo('katalog', { category: 'listrik' })}
              className="h-11 w-full px-5 flex items-center justify-between rounded-full bg-[#4E7592] text-white font-heading font-semibold text-xs hover:bg-[#4E7592]/90 transition-all text-left cursor-pointer group"
            >
              <span className="group-hover:translate-x-1 transition-transform">Sepeda Listrik (E-Bike)</span>
              <span className="text-white/80 font-normal flex items-center gap-1">
                6 unit • Rp50k/j
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </span>
            </motion.button>

            <motion.button
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigateTo('katalog', { category: 'anak' })}
              className="h-11 w-full px-5 flex items-center justify-between rounded-full bg-[#3E4C5E] text-white font-heading font-semibold text-xs hover:bg-[#3E4C5E]/90 transition-all text-left cursor-pointer group"
            >
              <span className="group-hover:translate-x-1 transition-transform">Sepeda Anak & Balita</span>
              <span className="text-white/80 font-normal flex items-center gap-1">
                7 unit • Rp25k/j
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </span>
            </motion.button>

            <motion.button
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigateTo('katalog')}
              className="h-11 w-full px-5 flex items-center justify-between rounded-full bg-white text-[#12202F] font-heading font-semibold text-xs shadow-sm hover:bg-[#F3FBFB] border border-[#E2EBF0] transition-all text-left cursor-pointer group"
            >
              <span className="group-hover:translate-x-1 transition-transform">Semua Kategori Armada</span>
              <span className="text-[#5B7083] font-normal">50 unit total</span>
            </motion.button>
          </div>

          {/* Sticker-Style Cards with subtle tilt hover */}
          <div className="pt-2 space-y-5">
            {/* Sticker 1: Sewa Rombongan */}
            <motion.div
              whileHover={{ y: -3, rotate: -0.5 }}
              transition={{ duration: 0.2 }}
              className="relative bg-white rounded-[24px] p-6 shadow-[0_10px_28px_rgba(36,92,110,0.08)] hover:shadow-md border border-[#E2EBF0] transition-shadow"
            >
              <div className="absolute -top-3.5 -left-2 w-8 h-8 rounded-full bg-[#4FC3C8] text-[#12202F] flex items-center justify-center shadow-md font-black text-sm">
                %
              </div>
              <h3 className="font-heading font-bold text-base text-[#12202F] mb-1">
                Sewa Rombongan / Keluarga
              </h3>
              <p className="text-xs text-[#5B7083] leading-relaxed">
                Satu transaksi bisa sewa banyak sepeda sekaligus. Cukup 1 KTP penjamin untuk kemudahan Anda dan teman-teman.
              </p>
            </motion.div>

            {/* Sticker 2: Toleransi Denda */}
            <motion.div
              whileHover={{ y: -3, rotate: 0.5 }}
              transition={{ duration: 0.2 }}
              className="relative bg-white rounded-[24px] p-6 shadow-[0_10px_28px_rgba(36,92,110,0.08)] hover:shadow-md border border-[#E2EBF0] transition-shadow"
            >
              <div className="absolute -top-3.5 -left-2 w-8 h-8 rounded-full bg-[#12202F] text-[#4FC3C8] flex items-center justify-center shadow-md font-bold text-xs">
                10m
              </div>
              <h3 className="font-heading font-bold text-base text-[#12202F] mb-1">
                Toleransi Telat 10 Menit Gratis
              </h3>
              <p className="text-xs text-[#5B7083] leading-relaxed">
                Kembalikan sepeda santai tanpa cemas. Denda baru dihitung jika lewat dari batas toleransi wajar.
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* ================= COLUMN 3: Info & Fasilitas Gratis Cards ================= */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col space-y-6"
        >
          <h2 className="font-heading font-bold text-2xl text-[#12202F]">
            Fasilitas Termasuk
          </h2>

          <div className="space-y-4">
            {/* Info Card 1 */}
            <motion.div
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-[24px] p-5 shadow-[0_10px_28px_rgba(36,92,110,0.08)] hover:shadow-md border border-[#E2EBF0] flex items-start gap-4 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#DDF4F5] text-[#17727C] flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                <ShieldCheck className="w-6 h-6 stroke-[1.75]" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-sm text-[#12202F] group-hover:text-[#00696D] transition-colors">
                  Helm SNI & Gembok Gratis
                </h3>
                <p className="text-xs text-[#5B7083] mt-1 leading-relaxed">
                  Setiap unit sudah dilengkapi helm bersih standar dan gembok kunci baja saat mampir kafe.
                </p>
              </div>
            </motion.div>

            {/* Info Card 2 */}
            <motion.div
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-[24px] p-5 shadow-[0_10px_28px_rgba(36,92,110,0.08)] hover:shadow-md border border-[#E2EBF0] flex items-start gap-4 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#DDF4F5] text-[#17727C] flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                <IdCard className="w-6 h-6 stroke-[1.75]" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-sm text-[#12202F] group-hover:text-[#00696D] transition-colors">
                  Jaminan KTP Fisik Offline
                </h3>
                <p className="text-xs text-[#5B7083] mt-1 leading-relaxed">
                  Tidak ada upload foto KTP di website. KTP fisik asli Anda dititipkan aman di konter stasiun.
                </p>
              </div>
            </motion.div>

            {/* Info Card 3 */}
            <motion.div
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-[24px] p-5 shadow-[0_10px_28px_rgba(36,92,110,0.08)] hover:shadow-md border border-[#E2EBF0] flex items-start gap-4 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#DDF4F5] text-[#17727C] flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                <Compass className="w-6 h-6 stroke-[1.75]" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-sm text-[#12202F] group-hover:text-[#00696D] transition-colors">
                  Rute Wisata & Taman Kota
                </h3>
                <p className="text-xs text-[#5B7083] mt-1 leading-relaxed">
                  Stasiun berada di pusat Alun-Alun, terhubung langsung dengan jalur sepeda rindang kota.
                </p>
              </div>
            </motion.div>

            {/* Info Card 4: Quick Contact Box */}
            <motion.div
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
              className="bg-gradient-to-br from-[#12202F] to-[#2B3E52] rounded-[24px] p-6 text-white shadow-lg space-y-3"
            >
              <span className="text-[10px] font-bold text-[#4FC3C8] uppercase tracking-wider">
                Bantuan & Reservasi
              </span>
              <h3 className="font-heading font-bold text-lg text-white">
                Butuh Bantuan Cepat?
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Staf operasional kami siap membantu Anda di pos konter atau via chat WhatsApp resmi.
              </p>
              <motion.a
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                href="https://wa.me/62876653342?text=Halo%20Admin%20RAFA%20GO%2C%20saya%20ingin%20tanya%20sewa%20sepeda"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#4FC3C8] text-[#12202F] text-xs font-heading font-bold hover:bg-[#3BB1B6] transition-colors shadow-sm"
              >
                <span>Chat Admin: 0876-6533-42</span>
              </motion.a>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
