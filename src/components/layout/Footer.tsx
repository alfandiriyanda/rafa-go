/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useRental } from '../../lib/context/RentalContext';
import { Bike, MapPin, Clock, Phone, ShieldCheck, QrCode, Lock } from 'lucide-react';

export const Footer: React.FC = () => {
  const { navigateTo } = useRental();

  return (
    <footer className="bg-[#12202F] text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Col 1: Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#4FC3C8] flex items-center justify-center text-[#12202F] font-black">
                <Bike className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className="font-heading font-black text-2xl text-white tracking-tight">
                RAFA<span className="text-[#4FC3C8]">GO</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Solusi rental sepeda per jam terpercaya di Indonesia. Eksplorasi sudut kota, taman, dan kawasan wisata dengan sepeda berkualitas prima tanpa repot registrasi akun.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#4FC3C8] font-medium pt-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Sepeda Terawat Rutin & Higienis</span>
            </div>
          </div>

          {/* Col 2: Jam Operasional & Lokasi */}
          <div className="space-y-4">
            <h3 className="font-heading font-semibold text-white text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#4FC3C8]" />
              Jam Operasional (WIB)
            </h3>
            <ul className="text-sm space-y-2 text-slate-400">
              <li className="flex justify-between border-b border-slate-800 pb-1.5">
                <span>Senin – Jumat</span>
                <span className="font-semibold text-white">14.00 – 20.00</span>
              </li>
              <li className="flex justify-between border-b border-slate-800 pb-1.5">
                <span>Sabtu (Weekend Malam)</span>
                <span className="font-semibold text-white">15.00 – 00.00</span>
              </li>
              <li className="flex justify-between pb-1">
                <span>Minggu (Car Free Day)</span>
                <span className="font-semibold text-white">08.00 – 18.00</span>
              </li>
            </ul>
            <div className="flex items-start gap-2 pt-2 text-xs text-slate-400">
              <MapPin className="w-4 h-4 text-[#4FC3C8] shrink-0 mt-0.5" />
              <span>Stasiun Pusat: Jl. Merdeka No. 12, Area Alun-Alun Kota</span>
            </div>
          </div>

          {/* Col 3: Rekening Resmi */}
          <div className="space-y-4">
            <h3 className="font-heading font-semibold text-white text-base flex items-center gap-2">
              <QrCode className="w-4 h-4 text-[#4FC3C8]" />
              Rekening & Pembayaran Resmi
            </h3>
            <div className="space-y-2 text-xs">
              <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">QRIS Standar Nasional</span>
                <p className="font-semibold text-white mt-0.5">NMID: ID1026477851087 (RAFA GO)</p>
                <p className="text-[10px] text-slate-400">BCA, Mandiri, BRI, GoPay, OVO, ShopeePay</p>
              </div>
              <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
                <span className="text-[10px] text-[#4FC3C8] uppercase font-bold tracking-wider">DANA (E-Wallet)</span>
                <p className="font-semibold text-white mt-0.5">0876-6533-42</p>
                <p className="text-[10px] text-slate-400">a.n. Fadel</p>
              </div>
              <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
                <span className="text-[10px] text-sky-400 uppercase font-bold tracking-wider">SeaBank</span>
                <p className="font-semibold text-white mt-0.5">6524-3745-2518-32</p>
                <p className="text-[10px] text-slate-400">a.n. Padel</p>
              </div>
            </div>
          </div>

          {/* Col 4: Navigasi Cepat & Bantuan */}
          <div className="space-y-4">
            <h3 className="font-heading font-semibold text-white text-base">
              Bantuan & Navigasi
            </h3>
            <ul className="text-sm space-y-2.5 text-slate-400">
              <li>
                <button
                  onClick={() => navigateTo('katalog')}
                  className="hover:text-[#4FC3C8] transition-colors cursor-pointer"
                >
                  Katalog Sepeda Tersedia
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('pesanan')}
                  className="hover:text-[#4FC3C8] transition-colors cursor-pointer"
                >
                  Cek Status Pesanan Saya
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('kebijakan')}
                  className="hover:text-[#4FC3C8] transition-colors cursor-pointer"
                >
                  Kebijakan Sewa & Denda
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('admin-login')}
                  className="hover:text-[#4FC3C8] transition-colors cursor-pointer font-medium text-slate-400 text-xs inline-flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5 text-[#4FC3C8]" />
                  <span>Akses Petugas &amp; Owner</span>
                </button>
              </li>
            </ul>

            <div className="pt-2">
              <a
                href="https://wa.me/62876653342?text=Halo%20Admin%20RAFA%20GO%2C%20saya%20butuh%20bantuan"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366] text-white text-xs font-bold hover:bg-[#20ba59] transition-all cursor-pointer shadow-md"
              >
                <Phone className="w-4 h-4" />
                Chat WhatsApp Admin
              </a>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 RAFA GO. All rights reserved. Sistem Rental Sepeda Per Jam Indonesia.</p>
          <div className="flex gap-6">
            <button onClick={() => navigateTo('kebijakan')} className="hover:underline cursor-pointer">
              Syarat & Ketentuan
            </button>
            <button onClick={() => navigateTo('kebijakan')} className="hover:underline cursor-pointer">
              Kebijakan Refund
            </button>
            <button onClick={() => navigateTo('kebijakan')} className="hover:underline cursor-pointer">
              Aturan Keterlambatan
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
