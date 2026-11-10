/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useRental } from '../../lib/context/RentalContext';
import { Booking, BookingStatus } from '../../types/rental';
import {
  Search,
  CheckCircle2,
  Clock,
  Bike,
  AlertTriangle,
  QrCode,
  Printer,
  Phone,
  ArrowRight,
  ShieldAlert,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

export const OrderLookupView: React.FC = () => {
  const { bookings, viewParams, extendRental, navigateTo } = useRental();

  const [searchQuery, setSearchQuery] = useState(viewParams.kode || viewParams.token || '');
  const [activeBooking, setActiveBooking] = useState<Booking | null>(() => {
    if (viewParams.kode || viewParams.token) {
      const q = (viewParams.kode || viewParams.token).trim().toUpperCase();
      return (
        bookings.find(
          (b) => b.bookingCode.toUpperCase() === q || b.publicToken.toUpperCase() === q
        ) || null
      );
    }
    // Default to first booking for demo convenience if none specified
    return bookings[0] || null;
  });

  const [extensionModalOpen, setExtensionModalOpen] = useState(false);
  const [extensionHours, setExtensionHours] = useState(1.0);
  const [searchError, setSearchError] = useState('');

  // Handle manual search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError('');
    const clean = searchQuery.trim().toUpperCase();

    if (!clean) {
      setSearchError('Masukkan kode booking (contoh: RG-261109-7842) atau nomor WhatsApp.');
      return;
    }

    const found = bookings.find(
      (b) =>
        b.bookingCode.toUpperCase() === clean ||
        b.publicToken.toUpperCase() === clean ||
        b.customer.whatsapp.includes(clean)
    );

    if (found) {
      setActiveBooking(found);
    } else {
      setSearchError(`Pesanan dengan kode "${searchQuery}" tidak ditemukan. Pastikan format benar.`);
    }
  };

  const statusSteps: { key: BookingStatus; label: string }[] = [
    { key: 'menunggu_pembayaran', label: 'Menunggu Bayar' },
    { key: 'menunggu_verifikasi', label: 'Verifikasi Admin' },
    { key: 'terkonfirmasi', label: 'Terkonfirmasi' },
    { key: 'sedang_disewa', label: 'Sedang Disewa' },
    { key: 'selesai', label: 'Selesai' },
  ];

  const getStepIndex = (status: BookingStatus) => {
    if (status === 'dibatalkan') return -1;
    return statusSteps.findIndex((s) => s.key === status);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="py-10 bg-[#FAFDFE] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Title */}
        <div className="text-center max-w-xl mx-auto">
          <span className="text-xs font-bold text-[#4FC3C8] uppercase tracking-wider bg-[#EBF9FA] px-3 py-1 rounded-full border border-[#4FC3C8]/30">
            Lacak Pesanan
          </span>
          <h1 className="font-heading text-3xl font-extrabold text-[#12202F] mt-2">
            Status Pemesanan Sewa
          </h1>
          <p className="text-xs sm:text-sm text-[#5B7083] mt-1">
            Pantau status verifikasi, sisa waktu gowes, dan akses nota digital secara real-time.
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-[#E2EBF0] shadow-xs">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Masukkan Kode Booking (RG-261109-7842) atau Nomor WhatsApp..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E2EBF0] text-sm text-[#12202F] focus:outline-none focus:ring-2 focus:ring-[#4FC3C8]"
              />
            </div>
            <button
              type="submit"
              className="btn-primary px-6 py-2.5 rounded-xl text-xs font-bold shrink-0 cursor-pointer"
            >
              Cari Pesanan
            </button>
          </form>

          {searchError && (
            <p className="text-xs text-rose-600 mt-2 px-1 font-semibold">{searchError}</p>
          )}

          {/* Quick Demo Pickers */}
          <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 text-[11px]">Coba kode demo:</span>
            {bookings.slice(0, 4).map((b) => (
              <button
                key={b.id}
                onClick={() => {
                  setSearchQuery(b.bookingCode);
                  setActiveBooking(b);
                  setSearchError('');
                }}
                className={`px-2 py-0.5 rounded-md border text-[11px] font-mono font-semibold cursor-pointer ${
                  activeBooking?.bookingCode === b.bookingCode
                    ? 'bg-[#12202F] text-white border-[#12202F]'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {b.bookingCode} ({b.status.replace('_', ' ')})
              </button>
            ))}
          </div>
        </div>

        {/* Active Booking Card */}
        {activeBooking && (
          <div className="bg-white rounded-3xl border border-[#E2EBF0] shadow-sm overflow-hidden space-y-6 p-6 sm:p-8">
            {/* Header with Code and Status Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#5B7083]">Kode Booking:</span>
                  <span className="font-mono font-bold text-lg text-[#12202F]">
                    {activeBooking.bookingCode}
                  </span>
                </div>
                <p className="text-xs text-[#5B7083] mt-0.5">
                  Dipesan pada:{' '}
                  {new Date(activeBooking.createdAt).toLocaleString('id-ID', {
                    timeZone: 'Asia/Jakarta',
                  })}{' '}
                  WIB
                </p>
              </div>

              {/* Status Badge */}
              <div>
                {activeBooking.status === 'menunggu_pembayaran' && (
                  <span className="px-3.5 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-300 text-xs font-bold inline-flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-600" />
                    Menunggu Pembayaran
                  </span>
                )}
                {activeBooking.status === 'menunggu_verifikasi' && (
                  <span className="px-3.5 py-1.5 rounded-xl bg-sky-50 text-sky-800 border border-sky-300 text-xs font-bold inline-flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-sky-600 animate-pulse" />
                    Sedang Diverifikasi Admin
                  </span>
                )}
                {activeBooking.status === 'terkonfirmasi' && (
                  <span className="px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold inline-flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Terkonfirmasi (Siap Diambil)
                  </span>
                )}
                {activeBooking.status === 'sedang_disewa' && (
                  <span className="px-3.5 py-1.5 rounded-xl bg-[#EBF9FA] text-[#12202F] border border-[#4FC3C8] text-xs font-bold inline-flex items-center gap-1.5 animate-pulse">
                    <Bike className="w-4 h-4 text-[#4FC3C8]" />
                    Sepeda Sedang Disewa
                  </span>
                )}
                {activeBooking.status === 'selesai' && (
                  <span className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-800 border border-slate-300 text-xs font-bold inline-flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-slate-600" />
                    Selesai Dikembalikan
                  </span>
                )}
                {activeBooking.status === 'dibatalkan' && (
                  <span className="px-3.5 py-1.5 rounded-xl bg-rose-50 text-rose-800 border border-rose-300 text-xs font-bold inline-flex items-center gap-1.5">
                    Dibatalkan
                  </span>
                )}
              </div>
            </div>

            {/* Stepper Progress Bar */}
            {activeBooking.status !== 'dibatalkan' && (
              <div className="py-2">
                <div className="grid grid-cols-5 gap-2 text-center text-xs">
                  {statusSteps.map((step, idx) => {
                    const currentIdx = getStepIndex(activeBooking.status);
                    const isPassed = idx <= currentIdx;
                    const isCurrent = idx === currentIdx;

                    return (
                      <div key={step.key} className="space-y-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            isCurrent
                              ? 'bg-[#4FC3C8]'
                              : isPassed
                              ? 'bg-[#12202F]'
                              : 'bg-slate-200'
                          }`}
                        />
                        <span
                          className={`text-[11px] block leading-tight ${
                            isCurrent
                              ? 'font-bold text-[#12202F]'
                              : isPassed
                              ? 'font-semibold text-slate-700'
                              : 'text-slate-400'
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* If Rejected: Show Alert with Re-upload button */}
            {activeBooking.rejectionReason && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Pembayaran Ditolak Admin:</p>
                    <p>{activeBooking.rejectionReason}</p>
                  </div>
                </div>
                <button
                  onClick={() => navigateTo('bayar', { kode: activeBooking.bookingCode })}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 shrink-0 cursor-pointer"
                >
                  Unggah Ulang Bukti
                </button>
              </div>
            )}

            {/* If Status is Sedang Disewa: Active Rental Banner with Live Countdown */}
            {activeBooking.status === 'sedang_disewa' && (
              <div className="p-5 rounded-2xl bg-gradient-to-r from-[#12202F] to-[#1e344a] text-white flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#4FC3C8] text-[#12202F] flex items-center justify-center font-bold">
                    <Bike className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-heading font-bold text-base text-white">
                      Selamat Bersepeda!
                    </h4>
                    <p className="text-xs text-slate-300">
                      Waktu berakhir dijadwalkan:{' '}
                      <strong className="text-[#4FC3C8]">{activeBooking.endTime} WIB</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setExtensionModalOpen(true)}
                    className="btn-primary px-4 py-2 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5 shadow-sm"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Perpanjang Sewa</span>
                  </button>

                  <button
                    onClick={() =>
                      navigateTo('s', {
                        token: activeBooking.items[0]?.bikeCode || 'CB-01',
                      })
                    }
                    className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold cursor-pointer flex items-center gap-1.5"
                  >
                    <QrCode className="w-3.5 h-3.5 text-[#4FC3C8]" />
                    <span>Scan QR Sepeda</span>
                  </button>
                </div>
              </div>
            )}

            {/* Order Details Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Box 1: Info Penyewa & Jadwal */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 text-xs">
                <h4 className="font-heading font-bold text-sm text-[#12202F] border-b border-slate-200 pb-2">
                  Data Penyewa & Jadwal
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Nama Penyewa:</span>
                    <span className="font-bold text-[#12202F]">{activeBooking.customer.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">WhatsApp:</span>
                    <span className="font-bold text-[#12202F]">{activeBooking.customer.whatsapp}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tanggal Sewa:</span>
                    <span className="font-bold text-[#12202F]">{activeBooking.bookingDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Waktu:</span>
                    <span className="font-bold text-[#12202F]">
                      {activeBooking.startTime} – {activeBooking.endTime} WIB ({activeBooking.durationHours} Jam)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Jaminan Identitas:</span>
                    <span className="text-emerald-700 font-semibold">KTP Fisik Asli (Di Pos Admin)</span>
                  </div>
                </div>
              </div>

              {/* Box 2: Rincian Pembayaran */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 text-xs">
                <h4 className="font-heading font-bold text-sm text-[#12202F] border-b border-slate-200 pb-2">
                  Rincian Pembayaran
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Biaya Sewa:</span>
                    <span className="font-bold text-[#12202F]">
                      Rp{activeBooking.totalAmount.toLocaleString('id-ID')}
                    </span>
                  </div>
                  {activeBooking.paymentProof && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Metode Bayar:</span>
                        <span className="font-bold text-[#12202F] uppercase">
                          {activeBooking.paymentProof.method}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Rekening Pengirim:</span>
                        <span className="font-semibold text-[#12202F]">
                          {activeBooking.paymentProof.senderBank} a.n.{' '}
                          {activeBooking.paymentProof.senderAccountName}
                        </span>
                      </div>
                    </>
                  )}
                  {activeBooking.lateFee && activeBooking.lateFee > 0 && (
                    <div className="flex justify-between text-amber-700">
                      <span>Denda Keterlambatan:</span>
                      <span className="font-bold">+Rp{activeBooking.lateFee.toLocaleString('id-ID')}</span>
                    </div>
                  )}
                  {activeBooking.damageFee && activeBooking.damageFee > 0 && (
                    <div className="flex justify-between text-rose-700">
                      <span>Biaya Perbaikan Kerusakan:</span>
                      <span className="font-bold">+Rp{activeBooking.damageFee.toLocaleString('id-ID')}</span>
                    </div>
                  )}
                  {activeBooking.totalPaidFinal && (
                    <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-[#12202F]">
                      <span>Total Akhir Selesai:</span>
                      <span className="text-sm">Rp{activeBooking.totalPaidFinal.toLocaleString('id-ID')}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bikes in this Booking */}
            <div className="space-y-3 pt-2">
              <h4 className="font-heading font-bold text-sm text-[#12202F]">
                Daftar Sepeda ({activeBooking.items.length} Unit)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeBooking.items.map((item) => (
                  <div
                    key={item.bikeId}
                    className="p-3.5 rounded-2xl border border-slate-200 bg-white flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#EBF9FA] text-[#12202F] flex items-center justify-center font-bold">
                        <Bike className="w-5 h-5 text-[#4FC3C8]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#12202F] text-white">
                            {item.bikeCode}
                          </span>
                          <span className="text-xs font-bold text-[#12202F]">{item.bikeName}</span>
                        </div>
                        <p className="text-[11px] text-[#5B7083]">{item.categoryName}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#12202F]">
                      Rp{item.hourlyRate.toLocaleString('id-ID')}/j
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex gap-2">
                <button
                  onClick={handlePrint}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-slate-500" />
                  <span>Cetak Nota</span>
                </button>

                {activeBooking.status === 'menunggu_pembayaran' && (
                  <button
                    onClick={() => navigateTo('bayar', { kode: activeBooking.bookingCode })}
                    className="btn-primary px-4 py-2.5 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <span>Bayar Sekarang</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <a
                href={`https://wa.me/62876653342?text=Halo%20Admin%20RAFA%20GO%2C%20saya%20ingin%20tanya%20tentang%20pesanan%20${activeBooking.bookingCode}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#25D366] text-white font-bold hover:bg-[#20ba59] transition-colors cursor-pointer"
              >
                <Phone className="w-4 h-4" />
                <span>Hubungi Admin WhatsApp</span>
              </a>
            </div>
          </div>
        )}

        {/* Extension Modal */}
        {extensionModalOpen && activeBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#12202F]/70 backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <h3 className="font-heading font-bold text-lg text-[#12202F]">
                Perpanjang Waktu Sewa
              </h3>
              <p className="text-xs text-[#5B7083]">
                Gowes masih seru? Tambah durasi sewa sepedamu tanpa perlu mengulang dari awal.
              </p>

              <div>
                <label className="block text-xs font-bold text-[#12202F] mb-1.5">
                  Pilih Tambahan Durasi:
                </label>
                <select
                  value={extensionHours}
                  onChange={(e) => setExtensionHours(parseFloat(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2EBF0] text-sm text-[#12202F]"
                >
                  <option value={0.5}>+30 Menit</option>
                  <option value={1.0}>+1 Jam</option>
                  <option value={1.5}>+1.5 Jam</option>
                  <option value={2.0}>+2 Jam</option>
                </select>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex justify-between">
                <span>Tambahan Biaya:</span>
                <span className="font-bold text-[#12202F]">
                  Rp
                  {(
                    activeBooking.items.reduce((s, i) => s + i.hourlyRate, 0) * extensionHours
                  ).toLocaleString('id-ID')}
                </span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setExtensionModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={() => {
                    extendRental(activeBooking.bookingCode, extensionHours);
                    setExtensionModalOpen(false);
                  }}
                  className="flex-1 py-2.5 rounded-xl btn-primary text-xs font-bold cursor-pointer"
                >
                  Konfirmasi Perpanjang
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
