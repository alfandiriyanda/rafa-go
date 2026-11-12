/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useRental } from '../../lib/context/RentalContext';
import { X, Check, Shield, MapPin, Bike as BikeIcon, Plus, ShoppingBag } from 'lucide-react';

export const BikeDetailModal: React.FC = () => {
  const { selectedBikeForDetail, setSelectedBikeForDetail, cart, addToCart, removeFromCart, navigateTo } = useRental();

  if (!selectedBikeForDetail) return null;

  const bike = selectedBikeForDetail;
  const inCart = cart.some((item) => item.bike.id === bike.id);
  const isAvailable = bike.status === 'tersedia';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop Fade */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSelectedBikeForDetail(null)}
          className="fixed inset-0 bg-[#12202F]/75 backdrop-blur-xs"
        />

        {/* Modal Window Zoom/Spring Entrance */}
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 16 }}
          transition={{ type: 'spring', stiffness: 420, damping: 28 }}
          className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#E2EBF0] relative z-10"
        >
          {/* Close Button with spin hover */}
          <motion.button
            whileHover={{ rotate: 90, scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => setSelectedBikeForDetail(null)}
            className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white/90 shadow-md flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </motion.button>

          {/* Hero Image */}
          <div className="relative aspect-16/9 bg-slate-100 overflow-hidden rounded-t-3xl">
            <img
              src={bike.image}
              alt={bike.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 flex gap-2">
              <span className="px-3 py-1 rounded-md bg-[#12202F] text-white text-xs font-bold uppercase tracking-wider">
                {bike.code}
              </span>
              <span className="px-3 py-1 rounded-md bg-[#4FC3C8] text-[#12202F] text-xs font-bold">
                {bike.categoryName}
              </span>
            </div>

            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-white bg-[#12202F]/80 backdrop-blur-xs px-3.5 py-2 rounded-xl">
              <span>Status: <strong className="capitalize">{bike.status}</strong></span>
              <span>Total Sewa: {bike.totalRentals} kali</span>
            </div>
          </div>

          {/* Content Body */}
          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <h2 className="font-heading text-2xl font-bold text-[#12202F]">
                  {bike.name}
                </h2>
                <p className="text-xs text-[#5B7083] mt-0.5">
                  Kode QR: <span className="font-mono font-semibold">{bike.qrToken}</span>
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-[#5B7083]">Tarif Sewa:</span>
                <div className="font-heading font-black text-2xl text-[#12202F]">
                  Rp{bike.hourlyRate.toLocaleString('id-ID')}
                  <span className="text-xs font-normal text-[#5B7083]"> / jam</span>
                </div>
              </div>
            </div>

            {/* Specifications Grid - Unique Rental Character */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-[#12202F] uppercase tracking-wider">
                Karakter &amp; Keunggulan Rental
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-cyan-50/60 border border-cyan-100 space-y-0.5">
                  <span className="text-[#4FC3C8] font-bold block text-[10px] uppercase tracking-wider">
                    Tipe Karakter Gowes
                  </span>
                  <span className="font-bold text-[#12202F] text-sm">
                    {bike.rideType || 'Santai & Keliling Danau CRC'}
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Posisi tegak ergonomis, sangat nyaman untuk rekreasi dan keliling santai.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-0.5">
                  <span className="text-emerald-700 font-bold block text-[10px] uppercase tracking-wider">
                    Kondisi Fisik Unit
                  </span>
                  <span className="font-bold text-[#12202F] text-sm">
                    {bike.condition || '100% Siap Gowes (Rantai & Ban Prima)'}
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Telah melalui pengecekan harian dan servis rutin oleh mekanik pos RAFA GO.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-0.5 sm:col-span-2">
                  <span className="text-slate-500 font-bold block text-[10px] uppercase tracking-wider">
                    Aksesoris Bawaan Gratis (Termasuk)
                  </span>
                  <span className="font-bold text-[#12202F]">
                    {bike.accessories || 'Helm Standar SNI + Gembok Baja Berkunci + Keranjang Depan'}
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Size Frame: {bike.frameSize} • Warna: {bike.color} • Dilengkapi QR Code Tracker
                  </p>
                </div>
              </div>
            </div>

            {/* Location status */}
            {bike.currentLocation && (
              <div className="p-3.5 rounded-xl bg-[#EBF9FA] border border-[#4FC3C8]/30 flex items-start gap-3 text-xs text-[#12202F]">
                <MapPin className="w-4 h-4 text-[#4FC3C8] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Lokasi Terakhir Sepeda:</p>
                  <p className="text-[#5B7083]">{bike.currentLocation.address} ({bike.currentLocation.lastUpdated})</p>
                </div>
              </div>
            )}

            {/* Action CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              {isAvailable ? (
                <>
                  {inCart ? (
                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      onClick={() => removeFromCart(bike.id)}
                      className="flex-1 py-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                    >
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>Sudah di Keranjang (Hapus)</span>
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => addToCart(bike)}
                      className="flex-1 py-3.5 rounded-xl btn-primary text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Tambah ke Keranjang</span>
                    </motion.button>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => {
                      if (!inCart) addToCart(bike);
                      setSelectedBikeForDetail(null);
                      navigateTo('pesan');
                    }}
                    className="py-3.5 px-6 rounded-xl bg-[#12202F] text-white text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-md"
                  >
                    <ShoppingBag className="w-4 h-4 text-[#4FC3C8]" />
                    <span>Langsung Sewa Sekarang</span>
                  </motion.button>
                </>
              ) : (
                <div className="w-full py-3.5 text-center bg-slate-100 rounded-xl text-slate-500 text-xs font-semibold">
                  Sepeda ini sedang {bike.status}. Silakan pilih unit lain di katalog.
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
