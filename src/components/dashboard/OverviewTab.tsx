/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useRental } from '../../lib/context/RentalContext';
import {
  Banknote,
  Bike,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Eye,
} from 'lucide-react';

interface OverviewTabProps {
  onSwitchTab: (tab: string) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ onSwitchTab }) => {
  const { bikes, bookings, categories } = useRental();

  // Metrics calculation
  const totalRevenueToday = bookings
    .filter((b) => b.status === 'terkonfirmasi' || b.status === 'sedang_disewa' || b.status === 'selesai')
    .reduce((sum, b) => sum + (b.totalPaidFinal || b.totalAmount || 0), 0);

  const activeRentals = bookings.filter((b) => b.status === 'sedang_disewa');
  const pendingVerifications = bookings.filter((b) => b.status === 'menunggu_verifikasi');

  const availableBikesCount = bikes.filter((b) => b.status === 'tersedia').length;
  const rentedBikesCount = bikes.filter((b) => b.status === 'disewa').length;
  const maintenanceBikesCount = bikes.filter((b) => b.status === 'perawatan').length;

  return (
    <div className="space-y-8">
      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1: Pendapatan Hari Ini */}
        <div className="bg-white p-6 rounded-3xl border border-[#E2EBF0] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5B7083] uppercase tracking-wider">
              Pendapatan Hari Ini
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Banknote className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="font-heading font-black text-2xl sm:text-3xl text-[#12202F]">
              Rp{totalRevenueToday.toLocaleString('id-ID')}
            </div>
            <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Target harian tercapai 82%</span>
            </p>
          </div>
        </div>

        {/* KPI 2: Sewa Aktif */}
        <div className="bg-white p-6 rounded-3xl border border-[#E2EBF0] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5B7083] uppercase tracking-wider">
              Penyewaan Aktif
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#EBF9FA] text-[#12202F] flex items-center justify-center font-bold">
              <Bike className="w-5 h-5 text-[#4FC3C8]" />
            </div>
          </div>
          <div>
            <div className="font-heading font-black text-2xl sm:text-3xl text-[#12202F]">
              {activeRentals.length}{' '}
              <span className="text-sm font-normal text-[#5B7083]">Transaksi ({rentedBikesCount} Sepeda)</span>
            </div>
            <p className="text-[11px] text-[#4FC3C8] font-semibold mt-1">
              Sedang beroperasi di jalanan kota
            </p>
          </div>
        </div>

        {/* KPI 3: Menunggu Verifikasi */}
        <div className="bg-white p-6 rounded-3xl border border-[#E2EBF0] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5B7083] uppercase tracking-wider">
              Perlu Verifikasi
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="font-heading font-black text-2xl sm:text-3xl text-[#12202F]">
              {pendingVerifications.length}{' '}
              <span className="text-sm font-normal text-[#5B7083]">Bukti Transfer</span>
            </div>
            <button
              onClick={() => onSwitchTab('verifikasi')}
              className="text-[11px] text-amber-700 font-bold hover:underline flex items-center gap-1 mt-1 cursor-pointer"
            >
              <span>Periksa antrean transfer →</span>
            </button>
          </div>
        </div>

        {/* KPI 4: Kesiapan Armada (50 Unit) */}
        <div className="bg-white p-6 rounded-3xl border border-[#E2EBF0] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5B7083] uppercase tracking-wider">
              Kesiapan Armada (50)
            </span>
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-[#12202F] flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="font-heading font-black text-2xl sm:text-3xl text-emerald-600">
              {availableBikesCount}{' '}
              <span className="text-sm font-normal text-[#5B7083]">Unit Siap Sewa</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
              <span>{rentedBikesCount} disewa</span>
              <span>•</span>
              <span className="text-amber-600">{maintenanceBikesCount} servis</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Urgent Action Queue & Fleet Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Urgent Action Queue (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-7 rounded-3xl border border-[#E2EBF0] shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-heading font-bold text-base text-[#12202F] flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <span>Antrean Tindakan Cepat</span>
              </h3>
              <p className="text-xs text-[#5B7083]">
                Verifikasi pembayaran masuk dan monitoring batas sewa
              </p>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
              {pendingVerifications.length + activeRentals.length} Tugas
            </span>
          </div>

          {/* Pending Verifications items */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Menunggu Verifikasi Bukti Transfer:
            </h4>
            {pendingVerifications.length === 0 ? (
              <p className="text-xs text-slate-400 py-2 italic">
                Tidak ada pembayaran yang menunggu verifikasi saat ini.
              </p>
            ) : (
              pendingVerifications.map((b) => (
                <div
                  key={b.id}
                  className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-amber-950">
                        {b.bookingCode}
                      </span>
                      <span className="text-xs font-bold text-[#12202F]">{b.customer.name}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {b.items.map((i) => i.bikeCode).join(', ')} • Rp
                      {b.totalAmount.toLocaleString('id-ID')} via {b.paymentProof?.method.toUpperCase()}
                    </p>
                  </div>
                  <button
                    onClick={() => onSwitchTab('verifikasi')}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors cursor-pointer self-start sm:self-auto shadow-xs"
                  >
                    Verifikasi Bukti
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Active Rentals items */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Penyewaan Sedang Berjalan:
            </h4>
            {activeRentals.length === 0 ? (
              <p className="text-xs text-slate-400 py-2 italic">
                Belum ada sepeda yang sedang keluar sewa.
              </p>
            ) : (
              activeRentals.map((b) => (
                <div
                  key={b.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#EBF9FA] text-[#12202F] flex items-center justify-center font-bold">
                      <Bike className="w-4 h-4 text-[#4FC3C8]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-[#12202F]">
                          {b.bookingCode}
                        </span>
                        <span className="text-xs font-bold text-[#12202F]">{b.customer.name}</span>
                      </div>
                      <p className="text-xs text-[#5B7083]">
                        Jadwal: {b.startTime} – {b.endTime} WIB ({b.items.map((i) => i.bikeCode).join(', ')})
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onSwitchTab('sewa')}
                    className="px-4 py-2 rounded-xl bg-[#12202F] text-white text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer self-start sm:self-auto"
                  >
                    Kelola Sewa
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Fleet Breakdown by Category (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-7 rounded-3xl border border-[#E2EBF0] shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-heading font-bold text-base text-[#12202F]">
              Distribusi 50 Unit Armada
            </h3>
            <p className="text-xs text-[#5B7083]">Status ketersediaan per kategori sepeda</p>
          </div>

          <div className="space-y-4">
            {categories.map((cat) => {
              const catBikes = bikes.filter((b) => b.categorySlug === cat.slug);
              const available = catBikes.filter((b) => b.status === 'tersedia').length;
              const rented = catBikes.filter((b) => b.status === 'disewa').length;
              const total = catBikes.length;
              const percentage = Math.round((available / total) * 100);

              return (
                <div key={cat.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-[#12202F]">{cat.name}</span>
                      <span className="text-[10px] text-slate-400 block">
                        Rp{(cat.hourlyRate / 1000).toFixed(0)}k/jam
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-emerald-600">{available} Tersedia</span>
                      <span className="text-[10px] text-slate-400 block">
                        {rented} disewa / {total} total
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="h-2 rounded-full bg-slate-200 overflow-hidden flex">
                    <div
                      className="bg-emerald-500 h-full"
                      style={{ width: `${percentage}%` }}
                    />
                    <div
                      className="bg-amber-400 h-full"
                      style={{ width: `${(rented / total) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => onSwitchTab('sepeda')}
            className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer text-center block"
          >
            Buka Manajemen 50 Sepeda →
          </button>
        </div>
      </div>
    </div>
  );
};
