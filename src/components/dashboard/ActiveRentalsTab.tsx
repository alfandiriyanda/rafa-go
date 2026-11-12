/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
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
  Upload,
  X,
  Plus,
  Eye,
  AlertCircle,
} from 'lucide-react';
import { ReturnBikeModal } from './ReturnBikeModal';

export const ActiveRentalsTab: React.FC = () => {
  const { bookings, startRental, updateRentalPhoto, cancelBooking } = useRental();

  const [filterType, setFilterType] = useState<'all' | 'active' | 'ready'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [returnModalBooking, setReturnModalBooking] = useState<Booking | null>(null);

  // Live real-time clock updating every second
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Photo modal state
  const [photoModalBooking, setPhotoModalBooking] = useState<Booking | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [photoMode, setPhotoMode] = useState<'start' | 'update'>('start');
  const [zoomedPhoto, setZoomedPhoto] = useState<string | null>(null);

  // Cancellation modal state
  const [cancelModalBooking, setCancelModalBooking] = useState<Booking | null>(null);
  const [cancelReasonText, setCancelReasonText] = useState('Dibatalkan oleh staf di pos operasional');

  // Relevant bookings: terkonfirmasi (ready to start) or sedang_disewa (currently riding)
  const relevantBookings = bookings
    .filter((b) => {
      if (filterType === 'ready') return b.status === 'terkonfirmasi';
      if (filterType === 'active') return b.status === 'sedang_disewa';
      return b.status === 'terkonfirmasi' || b.status === 'sedang_disewa';
    })
    .filter((b) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        b.bookingCode.toLowerCase().includes(q) ||
        b.customer.name.toLowerCase().includes(q) ||
        b.items.some((i) => i.bikeCode.toLowerCase().includes(q))
      );
    });

  // Calculate live countdown timer
  const getTimerInfo = (booking: Booking) => {
    if (!booking.rentalStartedAt) return null;
    const startMs = new Date(booking.rentalStartedAt).getTime();
    const durationMs = booking.durationHours * 60 * 60 * 1000;
    const endMs = startMs + durationMs;
    const diffMs = endMs - currentTime.getTime();

    if (diffMs > 0) {
      const totalSec = Math.floor(diffMs / 1000);
      const hours = Math.floor(totalSec / 3600);
      const minutes = Math.floor((totalSec % 3600) / 60);
      const seconds = totalSec % 60;
      return {
        isOverdue: false,
        formatted: `${hours > 0 ? `${hours}j ` : ''}${minutes}m ${seconds}s`,
        lateFee: 0,
        excessMinutes: 0,
      };
    } else {
      const excessMinutes = Math.abs(Math.floor(diffMs / (60 * 1000)));
      let lateFee = 0;
      if (excessMinutes > 10) {
        const halfHours = Math.floor(excessMinutes / 30);
        lateFee = halfHours * 5000 * booking.items.length;
      }
      return {
        isOverdue: true,
        formatted: `+${excessMinutes} mnt`,
        lateFee,
        excessMinutes,
      };
    }
  };

  const handleOpenPhotoModal = (booking: Booking, mode: 'start' | 'update') => {
    setPhotoModalBooking(booking);
    setPhotoMode(mode);
    setPhotoPreview(booking.rentalCustomerPhoto || '');
  };

  const handleFilePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setPhotoPreview(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSavePhotoAndAction = () => {
    if (!photoModalBooking) return;
    const finalPhoto =
      photoPreview ||
      'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?auto=format&fit=crop&w=600&q=80';

    if (photoMode === 'start') {
      startRental(photoModalBooking.bookingCode, finalPhoto);
    } else {
      updateRentalPhoto(photoModalBooking.bookingCode, finalPhoto);
    }
    setPhotoModalBooking(null);
    setPhotoPreview('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E2EBF0] shadow-xs">
        <div>
          <h2 className="font-heading font-bold text-xl text-[#12202F]">
            Penyewaan Aktif &amp; Serah Terima Sepeda
          </h2>
          <p className="text-xs text-[#5B7083] mt-0.5">
            Pantau hitung mundur durasi sewa secara realtime, dokumentasikan foto serah terima, dan proses pengembalian unit.
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
            const timer = isRiding ? getTimerInfo(b) : null;

            return (
              <div
                key={b.id}
                className={`bg-white rounded-3xl border p-5 space-y-4 shadow-xs flex flex-col justify-between transition-all ${
                  timer?.isOverdue
                    ? 'border-rose-400 ring-2 ring-rose-100'
                    : isRiding
                    ? 'border-[#4FC3C8]/60 ring-2 ring-cyan-50'
                    : 'border-[#E2EBF0]'
                }`}
              >
                <div className="space-y-3">
                  {/* Header Row */}
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs px-2.5 py-0.5 rounded bg-slate-100 text-[#12202F]">
                      {b.bookingCode}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        timer?.isOverdue
                          ? 'bg-rose-100 text-rose-800 animate-pulse'
                          : isRiding
                          ? 'bg-[#EBF9FA] text-[#12202F] border border-[#4FC3C8]'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {timer?.isOverdue ? 'Terlambat!' : isRiding ? 'Sedang Gowes' : 'Siap Diambil'}
                    </span>
                  </div>

                  {/* Customer Info */}
                  <div>
                    <h4 className="font-heading font-bold text-sm text-[#12202F]">
                      {b.customer.name}
                    </h4>
                    <p className="text-xs text-[#5B7083]">{b.customer.whatsapp}</p>
                  </div>

                  {/* Catatan Konsumen (Item 5) */}
                  {b.customer.notes && (
                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/90 text-xs">
                      <span className="font-bold text-amber-900 block text-[10px] uppercase tracking-wider mb-0.5">
                        Catatan Konsumen:
                      </span>
                      <p className="text-amber-800 font-medium italic">"{b.customer.notes}"</p>
                    </div>
                  )}

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

                  {/* Realtime Countdown Timer (Item 2) */}
                  {isRiding && timer && (
                    <div
                      className={`p-3.5 rounded-2xl border transition-all ${
                        timer.isOverdue
                          ? 'bg-rose-50 border-rose-300'
                          : 'bg-emerald-50/70 border-emerald-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`text-xs font-bold flex items-center gap-1.5 ${
                            timer.isOverdue ? 'text-rose-900' : 'text-emerald-900'
                          }`}
                        >
                          <Clock className="w-4 h-4" />
                          <span>{timer.isOverdue ? 'Waktu Habis:' : 'Sisa Waktu Gowes:'}</span>
                        </span>
                        <span
                          className={`font-mono font-black text-sm ${
                            timer.isOverdue ? 'text-rose-700' : 'text-emerald-700'
                          }`}
                        >
                          {timer.formatted}
                        </span>
                      </div>

                      {timer.isOverdue ? (
                        <div className="text-[11px] text-rose-800 space-y-0.5 pt-1 border-t border-rose-200">
                          {timer.excessMinutes <= 10 ? (
                            <p className="font-semibold text-amber-800">
                              *Dalam masa toleransi 10 menit (Belum kena denda).
                            </p>
                          ) : (
                            <p className="font-bold text-rose-700">
                              Estimasi Denda: Rp{timer.lateFee.toLocaleString('id-ID')} ({timer.excessMinutes} mnt lewat batas)
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-[10px] text-emerald-800 font-medium">
                          Batas kembali: {b.endTime} WIB (Tepat waktu)
                        </p>
                      )}
                    </div>
                  )}

                  {!isRiding && (
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Rencana Jadwal:</span>
                        <span className="font-bold text-[#12202F]">
                          {b.startTime} – {b.endTime} WIB ({b.durationHours} Jam)
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Customer Photo with Zoom & Edit Option (Item 7) */}
                  {b.rentalCustomerPhoto && (
                    <div className="space-y-1.5">
                      <div
                        onClick={() => setZoomedPhoto(b.rentalCustomerPhoto || null)}
                        className="relative aspect-16/9 rounded-xl overflow-hidden border border-slate-200 cursor-pointer group"
                      >
                        <img
                          src={b.rentalCustomerPhoto}
                          alt="Foto Serah Terima"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1.5">
                          <Eye className="w-4 h-4" />
                          <span>Perbesar Foto</span>
                        </div>
                        <span className="absolute bottom-1.5 left-1.5 bg-[#12202F]/80 text-white text-[9px] font-medium px-2 py-0.5 rounded backdrop-blur-xs">
                          Foto Serah Terima Konsumen
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleOpenPhotoModal(b, 'update')}
                        className="text-[11px] font-semibold text-slate-500 hover:text-[#12202F] flex items-center gap-1 cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Ganti / Unggah Ulang Foto</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="pt-2 space-y-2">
                  {isRiding ? (
                    <div className="space-y-1.5">
                      <button
                        onClick={() => setReturnModalBooking(b)}
                        className="w-full py-2.5 rounded-xl btn-primary text-xs font-bold transition-all cursor-pointer shadow-sm text-center flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Proses Pengembalian Sepeda</span>
                      </button>
                      <button
                        onClick={() => setCancelModalBooking(b)}
                        className="w-full py-1.5 px-2 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-700 text-[11px] font-semibold transition-colors cursor-pointer text-center"
                      >
                        Batalkan Sewa Ini
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="p-2.5 rounded-xl bg-cyan-50 border border-cyan-200 text-[11px] text-cyan-900 flex items-center gap-1.5">
                        <IdCard className="w-4 h-4 text-cyan-700 shrink-0" />
                        <span>Tahan KTP fisik & ambil 1 foto konsumen dengan sepeda</span>
                      </div>
                      <button
                        onClick={() => handleOpenPhotoModal(b, 'start')}
                        className="w-full py-2.5 rounded-xl bg-[#12202F] text-white hover:bg-slate-800 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <Camera className="w-4 h-4 text-[#4FC3C8]" />
                        <span>Mulai Sewa (Unggah Foto & Tahan KTP)</span>
                      </button>
                      <button
                        onClick={() => setCancelModalBooking(b)}
                        className="w-full py-1.5 px-2 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-700 text-[11px] font-semibold transition-colors cursor-pointer text-center"
                      >
                        Batalkan Pesanan Ini
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Return Modal (Item 2) */}
      {returnModalBooking && (
        <ReturnBikeModal
          booking={returnModalBooking}
          onClose={() => setReturnModalBooking(null)}
        />
      )}

      {/* Upload/Camera Photo Modal (Item 7) */}
      {photoModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#12202F]/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-heading font-bold text-base text-[#12202F]">
                  {photoMode === 'start' ? 'Foto Serah Terima & Mulai Sewa' : 'Ganti Foto Serah Terima'}
                </h3>
                <p className="text-xs text-slate-500">
                  Pesanan: {photoModalBooking.bookingCode} ({photoModalBooking.customer.name})
                </p>
              </div>
              <button
                onClick={() => setPhotoModalBooking(null)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="relative aspect-16/9 bg-slate-100 rounded-2xl overflow-hidden border-2 border-dashed border-slate-300 flex items-center justify-center">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Preview Serah Terima"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-4 text-slate-400 space-y-1">
                    <Camera className="w-8 h-8 mx-auto text-slate-300" />
                    <p className="text-xs font-semibold">Belum ada foto yang dipilih</p>
                    <p className="text-[10px]">Pilih foto konsumen berdiri bersama unit sepeda yang disewa</p>
                  </div>
                )}
              </div>

              {/* Upload or Camera button */}
              <label className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-[#4FC3C8] bg-cyan-50/50 hover:bg-cyan-50 text-[#12202F] cursor-pointer transition-all">
                <Upload className="w-4 h-4 text-[#4FC3C8]" />
                <span className="text-xs font-bold">Ambil Foto / Pilih dari Galeri</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFilePhotoSelect}
                  className="hidden"
                />
              </label>

              {photoMode === 'start' && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <IdCard className="w-4 h-4 text-amber-700" />
                    <span>Periksa & Tahan KTP Fisik:</span>
                  </p>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    Pastikan KTP fisik asli atas nama <strong>{photoModalBooking.customer.name}</strong> sudah disimpan di laci kasir sebelum menyerahkan kunci dan sepeda.
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setPhotoModalBooking(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSavePhotoAndAction}
                className="flex-1 py-2.5 rounded-xl btn-primary text-xs font-bold cursor-pointer shadow-sm"
              >
                {photoMode === 'start' ? 'Simpan Foto & Mulai Sewa' : 'Simpan Perubahan Foto'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Zoom Photo Modal */}
      {zoomedPhoto && (
        <div
          onClick={() => setZoomedPhoto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm cursor-pointer"
        >
          <div className="relative max-w-2xl w-full bg-white rounded-3xl overflow-hidden p-2 shadow-2xl">
            <img
              src={zoomedPhoto}
              alt="Foto Detail"
              className="w-full max-h-[80vh] object-contain rounded-2xl"
            />
            <p className="text-center text-xs font-semibold text-slate-600 py-2">
              Klik di mana saja untuk menutup
            </p>
          </div>
        </div>
      )}

      {/* Cancel Order Modal (Item 6) */}
      {cancelModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#12202F]/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-2.5 text-rose-600">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="font-heading font-bold text-base text-[#12202F]">
                Konfirmasi Batalkan Sewa
              </h3>
            </div>
            <p className="text-xs text-slate-600">
              Apakah Anda yakin ingin membatalkan transaksi sewa{' '}
              <strong className="text-[#12202F] font-mono">{cancelModalBooking.bookingCode}</strong> a.n.{' '}
              <strong>{cancelModalBooking.customer.name}</strong>? Unit sepeda yang disewa akan otomatis kembali berstatus <strong>Tersedia</strong>.
            </p>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Alasan Pembatalan:
              </label>
              <input
                type="text"
                value={cancelReasonText}
                onChange={(e) => setCancelReasonText(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-[#12202F]"
                placeholder="Alasan pembatalan..."
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCancelModalBooking(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer hover:bg-slate-200"
              >
                Kembali
              </button>
              <button
                type="button"
                onClick={() => {
                  cancelBooking(cancelModalBooking.bookingCode, cancelReasonText, 'admin');
                  setCancelModalBooking(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 cursor-pointer shadow-xs"
              >
                Ya, Batalkan Sewa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
