/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useRental } from '../../lib/context/RentalContext';
import { Bike, BikeCategorySlug } from '../../types/rental';
import {
  Search,
  SlidersHorizontal,
  Check,
  Plus,
  ArrowRight,
  Eye,
  ShoppingBag,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Bike as BikeIcon,
} from 'lucide-react';

export const BikeCatalog: React.FC = () => {
  const {
    bikes,
    categories,
    cart,
    addToCart,
    removeFromCart,
    navigateTo,
    viewParams,
    setSelectedBikeForDetail,
  } = useRental();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(
    viewParams.category || 'all'
  );
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'tersedia'>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'price-asc' | 'price-desc'>('popular');

  // Filter & Sort
  const filteredBikes = useMemo(() => {
    return bikes
      .filter((bike) => {
        // Category
        if (selectedCategory !== 'all' && bike.categorySlug !== selectedCategory) {
          return false;
        }
        // Availability
        if (availabilityFilter === 'tersedia' && bike.status !== 'tersedia') {
          return false;
        }
        // Search
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matchName = bike.name.toLowerCase().includes(q);
          const matchCode = bike.code.toLowerCase().includes(q);
          const matchCategory = bike.categoryName.toLowerCase().includes(q);
          const matchColor = bike.color.toLowerCase().includes(q);
          if (!matchName && !matchCode && !matchCategory && !matchColor) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.hourlyRate - b.hourlyRate;
        if (sortBy === 'price-desc') return b.hourlyRate - a.hourlyRate;
        // popular
        return b.totalRentals - a.totalRentals;
      });
  }, [bikes, selectedCategory, availabilityFilter, searchTerm, sortBy]);

  const isBikeInCart = (bikeId: string) => cart.some((item) => item.bike.id === bikeId);

  return (
    <div className="py-10 bg-[#FAFDFE] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header & Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E2EBF0] pb-6">
          <div>
            <span className="text-xs font-bold text-[#4FC3C8] uppercase tracking-wider bg-[#EBF9FA] px-3 py-1 rounded-full border border-[#4FC3C8]/30">
              Armada Lengkap
            </span>
            <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-[#12202F] mt-2">
              Katalog 50 Unit Sepeda RAFA GO
            </h1>
            <p className="text-sm text-[#5B7083] mt-1">
              Pilih sepeda sesuai gaya dan kebutuhan gowes Anda. Bebas pilih durasi sewa per jam.
            </p>
          </div>

          {/* Cart Status Indicator */}
          {cart.length > 0 && (
            <div className="bg-white p-3 rounded-2xl border-2 border-[#4FC3C8] shadow-sm flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#EBF9FA] text-[#12202F] flex items-center justify-center font-bold">
                <ShoppingBag className="w-5 h-5 text-[#4FC3C8]" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#12202F]">{cart.length} Sepeda Dipilih</p>
                <p className="text-[11px] text-[#5B7083]">Siap untuk disewa bersamaan</p>
              </div>
              <button
                onClick={() => navigateTo('pesan')}
                className="btn-primary px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer ml-1"
              >
                <span>Lanjut</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E2EBF0] shadow-xs space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Search Input (5 cols) */}
            <div className="md:col-span-5 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari kode sepeda (CB-01), tipe, merk, atau warna..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E2EBF0] text-sm text-[#12202F] focus:outline-none focus:ring-2 focus:ring-[#4FC3C8] bg-slate-50/40"
              />
            </div>

            {/* Availability Filter (3 cols) */}
            <div className="md:col-span-3">
              <select
                value={availabilityFilter}
                onChange={(e) => setAvailabilityFilter(e.target.value as 'all' | 'tersedia')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2EBF0] text-sm text-[#12202F] focus:outline-none focus:ring-2 focus:ring-[#4FC3C8] bg-slate-50/40"
              >
                <option value="all">Semua Status Ketersediaan</option>
                <option value="tersedia">Hanya yang Tersedia Sekarang</option>
              </select>
            </div>

            {/* Sort Dropdown (4 cols) */}
            <div className="md:col-span-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2EBF0] text-sm text-[#12202F] focus:outline-none focus:ring-2 focus:ring-[#4FC3C8] bg-slate-50/40"
              >
                <option value="popular">Urutkan: Paling Populer / Sering Disewa</option>
                <option value="price-asc">Harga: Termurah ke Termahal</option>
                <option value="price-desc">Harga: Termahal ke Termurah</option>
              </select>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`relative px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                selectedCategory === 'all'
                  ? 'text-white'
                  : 'text-[#5B7083] hover:text-[#12202F] bg-slate-100/70 hover:bg-slate-100'
              }`}
            >
              {selectedCategory === 'all' && (
                <motion.span
                  layoutId="catalogActivePill"
                  className="absolute inset-0 bg-[#12202F] rounded-lg shadow-xs"
                  transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                />
              )}
              <span className="relative z-10">Semua Kategori (50)</span>
            </button>
            {categories.map((cat) => {
              const count = bikes.filter((b) => b.categorySlug === cat.slug).length;
              const isSelected = selectedCategory === cat.slug;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`relative px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'text-[#12202F]'
                      : 'text-[#5B7083] hover:text-[#12202F] bg-slate-100/70 hover:bg-slate-100'
                  }`}
                >
                  {isSelected && (
                    <motion.span
                      layoutId="catalogActivePill"
                      className="absolute inset-0 bg-[#4FC3C8] rounded-lg shadow-xs"
                      transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 font-bold">{cat.name}</span>
                  <span className="relative z-10 text-[10px] opacity-75">({count})</span>
                  <span className="relative z-10 text-[10px] opacity-90">• Rp{(cat.hourlyRate / 1000).toFixed(0)}k/j</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-[#5B7083] px-1">
          <span>Menampilkan <strong>{filteredBikes.length}</strong> unit sepeda</span>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-[#4FC3C8] hover:underline font-semibold cursor-pointer"
            >
              Reset pencarian
            </button>
          )}
        </div>

        {/* Bike Grid (50 Items) */}
        {filteredBikes.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#E2EBF0] space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
              <BikeIcon className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-lg text-[#12202F]">Tidak ada sepeda ditemukan</h3>
            <p className="text-xs text-[#5B7083] max-w-md mx-auto">
              Coba ganti kata kunci pencarian atau pilih kategori lain untuk melihat unit sepeda yang siap disewa.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setAvailabilityFilter('all');
              }}
              className="px-4 py-2 rounded-xl bg-slate-100 text-xs font-semibold hover:bg-slate-200 cursor-pointer"
            >
              Tampilkan Semua Sepeda
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBikes.map((bike) => {
              const inCart = isBikeInCart(bike.id);
              const isAvailable = bike.status === 'tersedia';

              return (
                <motion.div
                  key={bike.id}
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="bg-white rounded-2xl border border-[#E2EBF0] overflow-hidden flex flex-col justify-between hover:shadow-xl hover:border-[#4FC3C8]/40 transition-all duration-200 group"
                >
                  {/* Image & Badges */}
                  <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
                    <img
                      src={bike.image}
                      alt={bike.name}
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                      loading="lazy"
                    />

                    {/* Category & Code Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1 items-start">
                      <span className="px-2 py-0.5 rounded-md bg-[#12202F]/90 text-white text-[10px] font-bold tracking-wider uppercase backdrop-blur-xs">
                        {bike.code}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-white/95 text-[#12202F] text-[10px] font-bold shadow-xs">
                        {bike.categoryName}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                      {isAvailable ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500 text-white shadow-xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                          Tersedia
                        </span>
                      ) : bike.status === 'disewa' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500 text-white shadow-xs">
                          Sedang Disewa
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-600 text-white shadow-xs">
                          Perawatan
                        </span>
                      )}
                    </div>

                    {/* Quick Specs Overlay */}
                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] text-white bg-[#12202F]/80 backdrop-blur-xs px-2.5 py-1 rounded-lg">
                      <span>Warna: {bike.color}</span>
                      <span>{bike.frameSize}</span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-heading font-bold text-sm text-[#12202F] line-clamp-1 group-hover:text-[#00696D] transition-colors">
                        {bike.name}
                      </h3>
                      <p className="text-xs text-[#5B7083] mt-0.5">
                        {bike.rideType || 'Santai & Keliling Danau'} • {bike.condition || '100% Siap Gowes'}
                      </p>
                    </div>

                    {/* Price and CTA */}
                    <div className="pt-2 border-t border-slate-100">
                      <div className="flex items-baseline justify-between mb-3">
                        <div>
                          <span className="text-xs text-[#5B7083]">Tarif:</span>
                          <span className="font-heading font-black text-lg text-[#12202F] ml-1">
                            Rp{bike.hourlyRate.toLocaleString('id-ID')}
                          </span>
                          <span className="text-[11px] text-[#5B7083]"> / jam</span>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {bike.totalRentals}x disewa
                        </span>
                      </div>

                      {/* Action Buttons with Micro-interactions */}
                      <div className="grid grid-cols-2 gap-2">
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelectedBikeForDetail(bike)}
                          className="py-2 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#12202F] text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-600" />
                          <span>Detail</span>
                        </motion.button>

                        {isAvailable ? (
                          inCart ? (
                            <motion.button
                              whileTap={{ scale: 0.95 }}
                              onClick={() => removeFromCart(bike.id)}
                              className="py-2 px-2 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-2xs"
                              title="Klik untuk hapus dari keranjang"
                            >
                              <Check className="w-3.5 h-3.5 text-emerald-600 animate-in zoom-in-75" />
                              <span>Di Keranjang</span>
                            </motion.button>
                          ) : (
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => addToCart(bike)}
                              className="py-2 px-2 rounded-xl btn-primary text-xs font-bold flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>+ Sewa</span>
                            </motion.button>
                          )
                        ) : (
                          <button
                            disabled
                            className="py-2 px-2 rounded-xl bg-slate-100 text-slate-400 text-xs font-semibold cursor-not-allowed text-center"
                          >
                            Tidak Tersedia
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Floating Checkout Bar when Cart has items with smooth Spring Animation */}
        <AnimatePresence>
          {cart.length > 0 && (
            <motion.div
              initial={{ y: 80, opacity: 0, x: '-50%' }}
              animate={{ y: 0, opacity: 1, x: '-50%' }}
              exit={{ y: 80, opacity: 0, x: '-50%' }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className="fixed bottom-6 left-1/2 z-30 w-full max-w-xl px-4 pointer-events-auto"
            >
              <div className="bg-[#12202F]/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl border border-slate-700/80 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#4FC3C8] text-[#12202F] flex items-center justify-center font-bold shadow-md">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">
                      {cart.length} Sepeda Siap Dipesan
                    </p>
                    <p className="text-[11px] text-[#4FC3C8] font-mono">
                      {cart.map((i) => i.bike.code).join(', ')}
                    </p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => navigateTo('pesan')}
                  className="btn-primary px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <span>Isi Form Sewa</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
