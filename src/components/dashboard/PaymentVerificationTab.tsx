/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useRental } from '../../lib/context/RentalContext';
import { Booking } from '../../types/rental';
import {
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  AlertTriangle,
  FileCheck,
  Search,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const PaymentVerificationTab: React.FC = () => {
  const { bookings, verifyPayment } = useRental();

  const [inspectBooking, setInspectBooking] = useState<Booking | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReasonCategory, setRejectReasonCategory] = useState('Nominal transfer tidak sesuai');
  const [rejectNotes, setRejectNotes] = useState('');
  const [filterStatus, setFilterStatus] = useState<'needs_verification' | 'waiting_payment' | 'all'>('needs_verification');

  const pendingVerification = bookings.filter((b) => b.status === 'menunggu_verifikasi');
  const waitingPayment = bookings.filter((b) => b.status === 'menunggu_pembayaran');

  const displayBookings =
    filterStatus === 'needs_verification'
      ? pendingVerification
      : filterStatus === 'waiting_payment'
      ? waitingPayment
      : bookings;

  const handleApprove = (booking: Booking) => {
    const success = verifyPayment(booking.bookingCode, true);
    if (success) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch (err) {}
      setInspectBooking(null);
    }
  };

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspectBooking) return;

    const fullReason = `${rejectReasonCategory}. ${rejectNotes.trim()}`.trim();
    verifyPayment(inspectBooking.bookingCode, false, fullReason);
    setRejectModalOpen(false);
    setInspectBooking(null);
  };

  return (
    <div className="space-y-6">
      {/* Tab Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E2EBF0] shadow-xs">
        <div>
          <h2 className="font-heading font-bold text-xl text-[#12202F]">
            Verifikasi Bukti Pembayaran Manual
          </h2>
          <p className="text-xs text-[#5B7083] mt-0.5">
            Cocokkan nominal 3-digit kode unik dan nama pemilik akun pengirim sebelum menyetujui.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFilterStatus('needs_verification')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer flex items-center gap-1.5 ${
              filterStatus === 'needs_verification'
                ? 'bg-[#12202F] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>Sudah Upload Bukti</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                filterStatus === 'needs_verification'
                  ? 'bg-[#4FC3C8] text-[#12202F]'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {pendingVerification.length}
            </span>
          </button>

          <button
            onClick={() => setFilterStatus('waiting_payment')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer flex items-center gap-1.5 ${
              filterStatus === 'waiting_payment'
                ? 'bg-[#12202F] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>Menunggu Transfer</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                filterStatus === 'waiting_payment'
                  ? 'bg-[#4FC3C8] text-[#12202F]'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {waitingPayment.length}
            </span>
          </button>

          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
              filterStatus === 'all'
                ? 'bg-[#12202F] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua Pesanan ({bookings.length})
          </button>
        </div>
      </div>

      {/* Bookings List */}
      {displayBookings.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-3xl border border-[#E2EBF0] text-slate-400 space-y-2">
          <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500" />
          <h3 className="font-heading font-bold text-base text-[#12202F]">
            Tidak Ada Antrean Verifikasi
          </h3>
          <p className="text-xs text-[#5B7083]">
            Semua bukti pembayaran telah diperiksa. Selamat bekerja!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayBookings.map((booking) => {
            const isPending = booking.status === 'menunggu_verifikasi';
            const proof = booking.paymentProof;

            return (
              <div
                key={booking.id}
                className={`bg-white rounded-3xl border p-5 space-y-4 shadow-xs transition-shadow flex flex-col justify-between ${
                  isPending ? 'border-amber-300 ring-2 ring-amber-100' : 'border-[#E2EBF0]'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-slate-100 text-[#12202F]">
                      {booking.bookingCode}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        booking.status === 'menunggu_verifikasi'
                          ? 'bg-amber-100 text-amber-800 animate-pulse'
                          : booking.status === 'menunggu_pembayaran'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {booking.status === 'menunggu_verifikasi'
                        ? 'Perlu Diverifikasi'
                        : booking.status === 'menunggu_pembayaran'
                        ? 'Menunggu Pembayaran'
                        : booking.status === 'sedang_disewa'
                        ? 'Sedang Disewa'
                        : 'Sudah Disetujui'}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-heading font-bold text-sm text-[#12202F]">
                      {booking.customer.name}
                    </h4>
                    <p className="text-xs text-[#5B7083]">{booking.customer.whatsapp}</p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {booking.items.map((i) => i.bikeName).join(', ')} • {booking.durationHours} Jam
                    </p>
                  </div>

                  {/* Payment Details */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Total Nominal:</span>
                      <span className="font-heading font-bold text-[#12202F]">
                        Rp{booking.totalAmount.toLocaleString('id-ID')}
                      </span>
                    </div>
                    {proof ? (
                      <>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Pengirim:</span>
                          <span className="font-semibold text-slate-800">
                            {proof.senderAccountName} ({proof.senderBank})
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Waktu Transfer:</span>
                          <span className="text-slate-700">{proof.transferTime}</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex justify-between text-blue-700 font-medium">
                        <span>Status Bukti:</span>
                        <span>Belum diunggah konsumen</span>
                      </div>
                    )}
                  </div>

                  {/* Receipt Thumbnail */}
                  {proof?.receiptImage && (
                    <div
                      onClick={() => setInspectBooking(booking)}
                      className="relative aspect-16/9 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 cursor-pointer group"
                    >
                      <img
                        src={proof.receiptImage}
                        alt="Bukti Bayar"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1.5">
                        <Eye className="w-4 h-4" />
                        <span>Klik untuk Memperbesar</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-2">
                  {booking.status === 'menunggu_verifikasi' ? (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          setInspectBooking(booking);
                          setRejectModalOpen(true);
                        }}
                        className="py-2.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors cursor-pointer text-center"
                      >
                        Tolak
                      </button>

                      <button
                        onClick={() => handleApprove(booking)}
                        className="py-2.5 px-3 rounded-xl btn-primary text-xs font-bold transition-colors cursor-pointer shadow-xs text-center"
                      >
                        Setujui
                      </button>
                    </div>
                  ) : booking.status === 'menunggu_pembayaran' ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(booking)}
                        className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                        title="Setujui manual jika pembayaran sudah masuk mutasi bank/kasir"
                      >
                        Konfirmasi Lunas (Manual)
                      </button>
                      <button
                        onClick={() => setInspectBooking(booking)}
                        className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                      >
                        Detail
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setInspectBooking(booking)}
                      className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Lihat Rincian
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Inspect Modal with Zoomed Image */}
      {inspectBooking && !rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#12202F]/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-heading font-bold text-lg text-[#12202F]">
                  Pemeriksaan Bukti Transfer
                </h3>
                <p className="text-xs text-[#5B7083]">Kode: {inspectBooking.bookingCode}</p>
              </div>
              <button
                onClick={() => setInspectBooking(null)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {inspectBooking.paymentProof?.receiptImage && (
              <div className="bg-slate-100 p-2 rounded-2xl border border-slate-200">
                <img
                  src={inspectBooking.paymentProof.receiptImage}
                  alt="Zoom Bukti Bayar"
                  className="max-h-80 mx-auto rounded-xl object-contain shadow-xs"
                />
              </div>
            )}

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Nama Penyewa:</span>
                <span className="font-bold text-[#12202F]">{inspectBooking.customer.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">WhatsApp:</span>
                <span className="font-bold text-[#12202F]">{inspectBooking.customer.whatsapp}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Metode & Bank Pengirim:</span>
                <span className="font-semibold text-slate-800">
                  {inspectBooking.paymentProof?.senderBank} a.n.{' '}
                  {inspectBooking.paymentProof?.senderAccountName}
                </span>
              </div>
              <div className="flex justify-between items-baseline pt-2 border-t border-slate-200">
                <span className="font-bold text-[#12202F]">Total Nominal yang Harus Masuk:</span>
                <span className="font-heading font-black text-base text-[#12202F]">
                  Rp{inspectBooking.totalAmount.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {inspectBooking.status === 'menunggu_verifikasi' && (
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setRejectModalOpen(true)}
                  className="flex-1 py-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  Tolak Bukti Bayar
                </button>
                <button
                  onClick={() => handleApprove(inspectBooking)}
                  className="flex-1 py-3 rounded-xl btn-primary text-xs font-bold transition-colors cursor-pointer shadow-md"
                >
                  Setujui & Konfirmasi Pesanan
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectModalOpen && inspectBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#12202F]/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-heading font-bold text-lg text-rose-900">
              Alasan Penolakan Pembayaran
            </h3>
            <p className="text-xs text-[#5B7083]">
              Konsumen akan melihat alasan ini dan dapat mengunggah ulang bukti yang benar.
            </p>

            <form onSubmit={handleRejectSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#12202F] mb-1">
                  Kategori Alasan Penolakan <span className="text-rose-500">*</span>
                </label>
                <select
                  value={rejectReasonCategory}
                  onChange={(e) => setRejectReasonCategory(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs text-[#12202F]"
                >
                  <option value="Nominal transfer tidak sesuai">Nominal transfer tidak sesuai (kurang dari kode unik)</option>
                  <option value="Bukti transfer buram / tidak terbaca">Bukti transfer buram / struk tidak terbaca</option>
                  <option value="Rekening tujuan transfer keliru">Rekening tujuan transfer bukan rekening resmi RAFA GO</option>
                  <option value="Waktu transaksi kedaluwarsa">Waktu transaksi kedaluwarsa (&gt;30 menit)</option>
                  <option value="Lainnya">Alasan Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#12202F] mb-1">
                  Catatan untuk Konsumen (Opsional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Mohon transfer tepat Rp70.142 ke QRIS atau DANA kami."
                  value={rejectNotes}
                  onChange={(e) => setRejectNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-[#12202F]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 cursor-pointer"
                >
                  Kirim Penolakan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
