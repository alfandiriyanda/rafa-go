/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Booking } from '../../types/rental';
import {
  Printer,
  X,
  CheckCircle2,
  Share2,
  Bike,
  Clock,
  ShieldCheck,
  MapPin,
  Calendar,
} from 'lucide-react';

interface PrintableReceiptModalProps {
  booking: Booking;
  onClose: () => void;
}

export const PrintableReceiptModal: React.FC<PrintableReceiptModalProps> = ({
  booking,
  onClose,
}) => {
  const isPaid =
    booking.status === 'terkonfirmasi' ||
    booking.status === 'sedang_disewa' ||
    booking.status === 'selesai';

  const handlePrint = () => {
    // Add print mode class so @media print in index.css isolates the receipt
    document.body.classList.add('print-receipt-mode');
    window.print();
    // Remove class on return
    setTimeout(() => {
      document.body.classList.remove('print-receipt-mode');
    }, 1000);
  };

  const handleShareWhatsApp = () => {
    const text = `*STRUK RESMI RAFA GO*
Kode Booking: ${booking.bookingCode}
Nama: ${booking.customer.name}
Sepeda: ${booking.items.map((i) => `${i.bikeCode} (${i.bikeName})`).join(', ')}
Jadwal: ${booking.bookingDate} (${booking.startTime} - ${booking.endTime} WIB)
Durasi: ${booking.durationHours} Jam
Total Bayar: Rp${booking.totalAmount.toLocaleString('id-ID')}
Status: ${isPaid ? 'LUNAS / TERKONFIRMASI' : 'MENUNGGU VERIFIKASI'}
Titik Ambil: Stasiun RAFA GO Ruko Boulevard CitraRaya City Jambi.`;

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#12202F]/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in zoom-in-95">
        {/* Top Control Bar (Hidden on print) */}
        <div className="no-print flex items-center justify-between p-4 bg-[#12202F] text-white">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-[#4FC3C8]" />
            <span className="font-heading font-bold text-sm">Struk Pembayaran Digital</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-[#4FC3C8] hover:bg-[#3bb1b6] text-[#12202F] text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Receipt Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 bg-white">
          {/* Printable Receipt Container (Targeted by #printable-receipt in index.css) */}
          <div
            id="printable-receipt"
            className="border border-dashed border-slate-300 rounded-2xl p-6 sm:p-7 space-y-5 bg-white text-[#12202F]"
          >
            {/* Header Brand */}
            <div className="text-center space-y-1 pb-4 border-b border-slate-200">
              <div className="flex items-center justify-center gap-1.5">
                <Bike className="w-5 h-5 text-[#4FC3C8]" />
                <span className="font-heading font-black text-2xl text-[#12202F] tracking-tight">
                  RAFA<span className="text-[#4FC3C8]">GO</span>
                </span>
              </div>
              <p className="text-xs font-bold text-[#12202F]">
                RENTAL SEPEDA CITRARAYA CITY JAMBI
              </p>
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto leading-tight">
                Ruko Boulevard CitraRaya City Blok A-08, Mendalo Darat, Jambi
                <br />
                WhatsApp: 0822-8000-7890 • IG: @rafago.jambi
              </p>
            </div>

            {/* Official Badge & Booking Info */}
            <div className="flex items-center justify-between text-xs py-1">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">
                  Kode Transaksi:
                </span>
                <span className="font-mono font-black text-sm text-[#12202F]">
                  {booking.bookingCode}
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">
                  Status Bayar:
                </span>
                <span
                  className={`inline-flex items-center gap-1 font-bold text-xs px-2 py-0.5 rounded-full ${
                    isPaid
                      ? 'bg-emerald-100 text-emerald-800'
                      : booking.status === 'dibatalkan'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>
                    {isPaid
                      ? 'LUNAS (TERVERIFIKASI)'
                      : booking.status === 'dibatalkan'
                      ? 'DIBATALKAN'
                      : 'MENUNGGU VERIFIKASI'}
                  </span>
                </span>
              </div>
            </div>

            {/* Customer & Time metadata */}
            <div className="bg-slate-50 rounded-xl p-3.5 text-xs space-y-1.5 border border-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-500">Nama Penyewa:</span>
                <span className="font-bold text-[#12202F]">{booking.customer.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">No. WhatsApp:</span>
                <span className="font-mono text-slate-700">{booking.customer.whatsapp}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tanggal Sewa:</span>
                <span className="font-medium text-slate-800">{booking.bookingDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Jadwal Jam:</span>
                <span className="font-bold text-slate-800">
                  {booking.startTime} – {booking.endTime} WIB ({booking.durationHours} Jam)
                </span>
              </div>
              {booking.customer.notes && (
                <div className="pt-1 border-t border-slate-200">
                  <span className="text-slate-400 text-[10px] block font-bold">Catatan Konsumen:</span>
                  <span className="italic text-slate-600">"{booking.customer.notes}"</span>
                </div>
              )}
            </div>

            {/* Items Table */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Rincian Unit Sepeda:
              </span>
              <div className="divide-y divide-slate-100 text-xs">
                {booking.items.map((item, idx) => (
                  <div key={idx} className="py-2 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-[11px] bg-slate-100 px-1.5 py-0.2 rounded text-[#12202F]">
                          {item.bikeCode}
                        </span>
                        <span className="font-semibold text-slate-800">{item.bikeName}</span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {item.categoryName} • Rp{item.hourlyRate.toLocaleString('id-ID')}/jam
                      </span>
                    </div>
                    <div className="text-right font-bold text-slate-800">
                      Rp{(item.hourlyRate * booking.durationHours).toLocaleString('id-ID')}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Summary */}
            <div className="pt-3 border-t border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal Sewa ({booking.durationHours} Jam):</span>
                <span>Rp{booking.baseAmount.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Kode Unik Transaksi:</span>
                <span className="font-mono">+{booking.uniqueNominalCode}</span>
              </div>
              {booking.lateFee ? (
                <div className="flex justify-between text-rose-600 font-semibold">
                  <span>Denda Keterlambatan:</span>
                  <span>+Rp{booking.lateFee.toLocaleString('id-ID')}</span>
                </div>
              ) : null}
              {booking.damageFee ? (
                <div className="flex justify-between text-rose-600 font-semibold">
                  <span>Biaya Perbaikan / Lecet:</span>
                  <span>+Rp{booking.damageFee.toLocaleString('id-ID')}</span>
                </div>
              ) : null}
              <div className="flex justify-between items-baseline pt-2 border-t border-slate-200 text-base font-bold text-[#12202F]">
                <span>Total Pembayaran:</span>
                <span className="font-heading font-black text-lg text-[#12202F]">
                  Rp{(booking.totalPaidFinal || booking.totalAmount).toLocaleString('id-ID')}
                </span>
              </div>
              {booking.paymentProof && (
                <div className="text-[11px] text-slate-500 text-right">
                  Metode: <strong className="uppercase">{booking.paymentProof.method}</strong> ({booking.paymentProof.senderBank} a.n. {booking.paymentProof.senderAccountName})
                </div>
              )}
            </div>

            {/* Official Seal / Signature Stamp */}
            <div className="pt-4 border-t border-dashed border-slate-300 flex items-center justify-between text-[11px] text-slate-500">
              <div className="space-y-0.5">
                <p className="font-bold text-slate-700">Ketentuan Penting:</p>
                <p>• KTP fisik diserahkan saat ambil unit.</p>
                <p>• Toleransi kembali 10 menit gratis.</p>
                <p>• Gowes hanya di area CitraRaya City.</p>
              </div>
              <div className="text-center border-2 border-[#4FC3C8] text-[#12202F] px-3 py-1.5 rounded-xl font-bold text-[10px] uppercase tracking-wider rotate-[-2deg] bg-cyan-50/50">
                RAFA GO VERIFIED
                <span className="block text-[8px] font-normal text-slate-600">
                  {booking.paymentVerifiedAt ? 'TERVERIFIKASI SISTEM' : 'STRUK ELEKTRONIK'}
                </span>
              </div>
            </div>

            {/* Footer Notice */}
            <p className="text-center text-[10px] text-slate-400 pt-2">
              Terima kasih telah menyewa di RAFA GO. Selamat menikmati gowes di CitraRaya City Jambi!
            </p>
          </div>
        </div>

        {/* Bottom Action Footer (Hidden on print) */}
        <div className="no-print p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            onClick={handleShareWhatsApp}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-xs"
          >
            <Share2 className="w-4 h-4" />
            <span>Bagikan ke WhatsApp</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2.5 rounded-xl bg-[#4FC3C8] hover:bg-[#3bb1b6] text-[#12202F] text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Nota</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
