/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { useRental } from '../../lib/context/RentalContext';
import { ArrowRight, Sparkles, MapPin, CheckCircle2, Bike } from 'lucide-react';

export const Hero: React.FC = () => {
  const { navigateTo } = useRental();

  return (
    <section className="relative z-10 w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8" id="beranda">
      {/* Stitch Reference Hero Banner */}
      <div className="relative rounded-[28px] bg-gradient-to-r from-[#8DDDE1] to-[#3DB0BA] overflow-hidden shadow-[0_16px_36px_rgba(36,92,110,0.18)] min-h-[440px] lg:min-h-[480px] flex flex-col lg:flex-row items-center justify-between p-6 sm:p-10 lg:p-12">
        {/* Translucent Swelling Circle Decorative (Bottom Left) */}
        <div
          aria-hidden="true"
          className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-white/25 blur-sm pointer-events-none"
        ></div>

        {/* Floating subtle ambient particles */}
        <div aria-hidden="true" className="absolute top-12 left-1/3 w-2.5 h-2.5 rounded-full bg-white/80 pointer-events-none animate-pulse"></div>
        <div aria-hidden="true" className="absolute top-28 left-1/4 w-1.5 h-1.5 rounded-full bg-white/60 pointer-events-none"></div>
        <div aria-hidden="true" className="absolute bottom-16 left-1/2 w-3 h-3 rounded-full bg-white/70 pointer-events-none animate-pulse"></div>
        <div aria-hidden="true" className="absolute top-8 right-1/4 w-2 h-2 rounded-full bg-white/60 pointer-events-none"></div>

        {/* Left Content Column with Staggered Entrance */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full lg:max-w-[58%] flex flex-col items-start space-y-5"
        >
          {/* Logo Display & Live Status Beacon */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="h-12 w-auto flex items-center">
              <img
                src="/RAFA_GO_Logo.svg"
                alt="RAFA GO Logo"
                className="h-11 w-auto object-contain filter drop-shadow-sm"
              />
            </div>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 400, damping: 25 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 backdrop-blur-xs text-[#12202F] text-xs font-bold shadow-xs border border-white/60"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>50 Unit Ready di CitraRaya</span>
            </motion.div>
          </div>

          {/* Headline & Subcopy */}
          <div className="space-y-3">
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl text-[#2B3E52] tracking-tight leading-[1.15]"
            >
              Sewa Sepeda Per Jam, Tanpa Daftar Akun
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="font-body text-sm sm:text-base text-[#2B3E52]/90 max-w-xl leading-relaxed"
            >
              Pilih sepeda favoritmu, tentukan durasi sewa, dan gowes santai mengitari Danau & Boulevard CitraRaya City Jambi.
            </motion.p>
          </div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-wrap items-center gap-4 pt-1"
          >
            <motion.button
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigateTo('katalog')}
              className="h-12 px-7 inline-flex items-center justify-center rounded-full bg-white text-[#2B3E52] font-heading font-bold text-sm shadow-[0_10px_28px_rgba(36,92,110,0.18)] hover:bg-[#F3FBFB] transition-all cursor-pointer"
            >
              Sewa Sekarang
            </motion.button>
            <motion.button
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigateTo('katalog')}
              className="font-heading font-semibold text-sm text-[#2B3E52] inline-flex items-center gap-1.5 group py-2 cursor-pointer"
            >
              <span className="underline underline-offset-4 decoration-2 decoration-[#2B3E52]">
                Lihat Katalog Sepeda
              </span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </motion.button>
          </motion.div>

          {/* Quick Perks Row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex flex-wrap items-center gap-4 text-xs font-semibold text-[#2B3E52]/80 pt-1"
          >
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#12202F]" />
              Helm & Gembok Gratis
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#12202F]" />
              Toleransi 10 Menit
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#12202F]" />
              Jaminan KTP Fisik
            </span>
          </motion.div>

          {/* Slider Indicator Dashes */}
          <div className="flex items-center gap-2 pt-1">
            <span className="w-8 h-1.5 rounded-full bg-[#2B3E52] transition-all"></span>
            <span className="w-6 h-1.5 rounded-full bg-white/60 hover:bg-white transition-colors cursor-pointer"></span>
            <span className="w-6 h-1.5 rounded-full bg-white/60 hover:bg-white transition-colors cursor-pointer"></span>
          </div>
        </motion.div>

        {/* Right Column: Cyclist Hero Cutout with Bicycle */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full lg:w-[42%] flex justify-center lg:justify-end mt-8 lg:mt-0"
        >
          <motion.div
            whileHover={{ scale: 1.025, rotate: 0.5 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="relative w-full max-w-[340px] sm:max-w-[400px] lg:max-w-none flex items-end justify-center group"
          >
            <img
              src="https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=700&q=80"
              alt="Pengendara Sepeda RAFA GO"
              className="w-auto h-[320px] sm:h-[400px] lg:h-[440px] object-cover rounded-3xl drop-shadow-[0_20px_35px_rgba(0,40,50,0.25)] select-none border-4 border-white/60 transition-transform duration-300"
            />

            {/* Interactive Floating Card Overlay */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.45, duration: 0.5 }}
              className="absolute -bottom-4 -left-4 sm:bottom-4 sm:-left-6 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-white/80 max-w-[210px] hidden sm:flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-[#EBF9FA] text-[#00696D] flex items-center justify-center shrink-0">
                <Bike className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-bold text-[#5B7083] uppercase tracking-wider">Mulai Dari</p>
                <p className="font-heading font-black text-sm text-[#12202F]">Rp20.000 <span className="text-[10px] font-normal text-slate-500">/jam</span></p>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
