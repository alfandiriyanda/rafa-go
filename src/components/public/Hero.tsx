/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useRental } from '../../lib/context/RentalContext';
import { ArrowRight, Sparkles } from 'lucide-react';

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

        {/* Snow / Sparkle Accents */}
        <div aria-hidden="true" className="absolute top-12 left-1/3 w-2 h-2 rounded-full bg-white/80 pointer-events-none"></div>
        <div aria-hidden="true" className="absolute top-28 left-1/4 w-1.5 h-1.5 rounded-full bg-white/60 pointer-events-none"></div>
        <div aria-hidden="true" className="absolute bottom-16 left-1/2 w-2.5 h-2.5 rounded-full bg-white/70 pointer-events-none"></div>
        <div aria-hidden="true" className="absolute top-8 right-1/4 w-2 h-2 rounded-full bg-white/60 pointer-events-none"></div>

        {/* Left Content Column */}
        <div className="relative z-10 w-full lg:max-w-[58%] flex flex-col items-start space-y-6">
          {/* Logo Display (top-left inside banner per design.md rules) */}
          <div className="h-14 w-auto flex items-center">
            <img
              src="/RAFA_GO_Logo.svg"
              alt="RAFA GO Logo"
              className="h-12 w-auto object-contain filter drop-shadow-sm"
            />
          </div>

          {/* Headline & Subcopy */}
          <div className="space-y-3">
            <h1 className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl text-[#2B3E52] tracking-tight leading-[1.15]">
              Sewa Sepeda Per Jam, Tanpa Daftar Akun
            </h1>
            <p className="font-body text-sm sm:text-base text-[#2B3E52]/90 max-w-xl leading-relaxed">
              Pilih sepeda favoritmu, isi nama & WhatsApp, lalu gowes santai keliling kota atau pantai.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-1">
            <button
              onClick={() => navigateTo('katalog')}
              className="h-12 px-7 inline-flex items-center justify-center rounded-full bg-white text-[#2B3E52] font-heading font-bold text-sm shadow-[0_10px_28px_rgba(36,92,110,0.15)] hover:bg-[#F3FBFB] hover:scale-[1.02] transition-all cursor-pointer"
            >
              Sewa Sekarang
            </button>
            <button
              onClick={() => navigateTo('katalog')}
              className="font-heading font-semibold text-sm text-[#2B3E52] inline-flex items-center gap-1.5 group py-2 cursor-pointer"
            >
              <span className="underline underline-offset-4 decoration-2 decoration-[#2B3E52]">
                Lihat Katalog
              </span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Slider Indicator Dashes */}
          <div className="flex items-center gap-2 pt-2">
            <span className="w-8 h-1.5 rounded-full bg-[#2B3E52]"></span>
            <span className="w-6 h-1.5 rounded-full bg-white/60"></span>
            <span className="w-6 h-1.5 rounded-full bg-white/60"></span>
          </div>
        </div>

        {/* Right Column: Cyclist Hero Cutout with Bicycle */}
        <div className="relative z-10 w-full lg:w-[42%] flex justify-center lg:justify-end mt-8 lg:mt-0">
          <div className="relative w-full max-w-[340px] sm:max-w-[400px] lg:max-w-none flex items-end justify-center">
            <img
              src="https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=700&q=80"
              alt="Pengendara Sepeda RAFA GO"
              className="w-auto h-[320px] sm:h-[400px] lg:h-[440px] object-cover rounded-3xl drop-shadow-[0_20px_35px_rgba(0,40,50,0.25)] select-none border-4 border-white/60"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
