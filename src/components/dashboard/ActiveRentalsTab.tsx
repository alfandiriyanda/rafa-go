/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useRental } from '../../lib/context/RentalContext';
import { Booking } from '../../types/rental';
import {
  Bike,
  Clock,
  Camera,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  IdCard,
  User,
  Phone,
  Search,
} from 'lucide-react';
import { ReturnBikeModal } from './ReturnBikeModal';

export const ActiveRentalsTab: React.FC = () => {
  const { bookings, startRental } = useRental();

  const [filterType, setFilterType] = useState<'all' | 'active' | 'ready'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [returnModalBooking, setReturnModalBooking] = useState<Booking | null>(null);

  // Relevant bookings: terkonfirmasi (ready to start) or sedang_disewa (currently riding)
  const relevantBookings = bookings.filter((b) => {
    if (filterType === 'ready') return b.status === 'terkonfirmasi';
    if (filterType === 'active') return b.status === 'sedang_disewa';
    return b.status === 'terkonfirmasi' || b.status === 'sedang_disewa';
  }).filter((b) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      b.bookingCode.toLowerCase().includes(q) ||
      b.customer.name.toLowerCase().includes(q) ||
      b.items.some((i) => i.bikeCode.toLowerCase().includes(q))
    );
  });

  const handleStartRental = (booking: Booking) => {
    // 1 photo documentation of customer on bike
    const demoPhoto =
      'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?auto=format&fit=crop&w=600&q=80';
    startRental(booking.bookingCode, demoPhoto);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E2EBF0] shadow-xs">
        <div>
          <h2 className="font-heading font-bold text-xl text-[#12202F]">
            Penyewaan Aktif & Serah Terima Sepeda
          </h2>
          <p className="text-xs text-[#5B7083] mt-0.5">
            Dokumentasikan 1 foto konsumen saat mulai sewa, tahan KTP fisik, dan pantau durasi jalan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
              filterType === 'all'
                ? 'bg-[#12202F] text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua ({relevantBookings.length})
          </button>
          <button
            onClick={() => setFilterType('active')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
              filterType === 'active'
                ? 'bg-[#12202F] text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Sedang di Jalan ({bookings.filter((b) => b.status === 'sedang_disewa').length})
          </button>
          <button
            onClick={() => setFilterType('ready')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
              filterType === 'ready'
                ? 'bg-[#12202F] text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Siap Diambil ({bookings.filter((b) => b.status === 'terkonfirmasi').length})
          </button>
        </div>
      </div>

      {/* Search Filter */}
      <div className="bg-white p-3.5 rounded-2xl border border-[#E2EBF0] flex items-center gap-2 shadow-xs">
        <Search className="w-4 h-4 text-slate-400 ml-2" />
        <input
          type="text"
          placeholder="Cari kode booking, nama penyewa, atau nomor unit sepeda..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-xs text-[#12202F] focus:outline-none"
        />
      </div>

      {/* Bookings Grid */}
      {relevantBookings.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-3xl border border-[#E2EBF0] text-slate-400 space-y-2">
          <Bike className="w-10 h-10 mx-auto text-slate-300" />
          <h3 className="font-heading font-bold text-base text-[#12202F]">
            Tidak Ada Transaksi Aktif
          </h3>
          <p className="text-xs text-[#5B7083]">
            Tidak ada sepeda yang sedang keluar sewa atau menunggu diambil saat ini.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {relevantBookings.map((b) => {
            const isRiding = b.status === 'sedang_disewa';

            return (
              <div
                key={b.id}
                className="bg-white rounded-3xl border border-[#E2EBF0] p-5 space-y-4 shadow-xs flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs px-2.5 py-0.5 rounded bg-slate-100 text-[#12202F]">
                      {b.bookingCode}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        isRiding
                          ? 'bg-[#EBF9FA] text-[#12202F] border border-[#4FC3C8] animate-pulse'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {isRiding ? 'Sedang Gowes' : 'Siap Diambil'}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-heading font-bold text-sm text-[#12202F]">
                      {b.customer.name}
                    </h4>
                    <p className="text-xs text-[#5B7083]">{b.customer.whatsapp}</p>
                  </div>

                  {/* Bikes List */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Unit Sepeda ({b.items.length}):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {b.items.map((item) => (
                        <span
                          key={item.bikeId}
                          className="px-2 py-0.5 rounded-md bg-slate-100 text-[#12202F] text-xs font-semibold"
                        >
                          {item.bikeCode} • {item.bikeName}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Schedule */}
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Jadwal:</span>
                      <span className="font-bold text-[#12202F]">
                        {b.startTime} – {b.endTime} WIB ({b.durationHours} Jam)
                      </span>
                    </div>
                    {isRiding && (
                      <div className="flex justify-between text-amber-700 font-semibold pt-1 border-t border-slate-200">
                        <span>Batas Pengembalian:</span>
                        <span>{b.endTime} WIB</span>
                      </div>
                    )}
                  </div>

                  {/* Customer Photo if started */}
                  {b.rentalCustomerPhoto && (
                    <div className="relative aspect-16/9 rounded-xl overflow-hidden border border-slate-200">
                      <img
                        src={b.rentalCustomerPhoto}
                        alt="Foto Konsumen"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-1.5 left-1.5 bg-[#12202F]/80 text-white text-[9px] font-medium px-2 py-0.5 rounded backdrop-blur-xs">
                        Foto Serah Terima Sepeda
                      </span>
                    </div>
                  )}
                </div>

                {/* Bottom Action */}
                <div className="pt-2">
                  {isRiding ? (
                    <button
                      onClick={() => setReturnModalBooking(b)}
                      className="w-full py-2.5 rounded-xl btn-primary text-xs font-bold transition-colors cursor-pointer shadow-sm text-center"
                    >
                      Proses Pengembalian Sepeda
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <div className="p-2.5 rounded-xl bg-cyan-50 border border-cyan-200 text-[11px] text-cyan-900 flex items-center gap-1.5">
                        <IdCard className="w-4 h-4 text-cyan-700 shrink-0" />
                        <span>Wajib tahan KTP fisik & ambil 1 foto penyewa</span>
                      </div>
                      <button
                        onClick={() => handleStartRental(b)}
                        className="w-full py-2.5 rounded-xl bg-[#12202F] text-white hover:bg-slate-800 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <Camera className="w-4 h-4 text-[#4FC3C8]" />
                        <span>Mulai Sewa (Ambil Foto & Tahan KTP)</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Return Modal */}
      {returnModalBooking && (
        <ReturnBikeModal
          booking={returnModalBooking}
          onClose={() => setReturnModalBooking(null)}
        />
      )}
    </div>
  );
};
