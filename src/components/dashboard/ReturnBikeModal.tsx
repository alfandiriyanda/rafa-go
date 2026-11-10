/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useRental } from '../../lib/context/RentalContext';
import { Booking } from '../../types/rental';
import {
  X,
  Clock,
  AlertTriangle,
  CheckCircle2,
  IdCard,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ReturnBikeModalProps {
  booking: Booking;
  onClose: () => void;
}

export const ReturnBikeModal: React.FC<ReturnBikeModalProps> = ({ booking, onClose }) => {
  const { returnBike } = useRental();

  const [condition, setCondition] = useState<'baik' | 'lecet_ringan' | 'rusak_berat'>('baik');
  const [damageFee, setDamageFee] = useState<number>(0);
  const [ktpReturned, setKtpReturned] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Compute late fee estimate
  const now = new Date();
  let estimatedLateFee = 0;
  let excessMinutes = 0;

  if (booking.rentalStartedAt) {
    const scheduledMinutes = booking.durationHours * 60;
    const started = new Date(booking.rentalStartedAt).getTime();
    const actualMinutesElapsed = Math.floor((now.getTime() - started) / (60 * 1000));
    excessMinutes = actualMinutesElapsed - scheduledMinutes;

    if (excessMinutes > 10) {
      const halfHours = Math.floor(excessMinutes / 30);
      estimatedLateFee = halfHours * 5000 * booking.items.length;
    }
  }

  const handleCompleteReturn = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!ktpReturned) {
      setErrorMsg('Harap pastikan KTP fisik asli penyewa telah dikembalikan sebelum menyelesaikan.');
      return;
    }

    setIsSubmitting(true);
    const res = returnBike(booking.bookingCode, condition, damageFee);
    setIsSubmitting(false);

    if (res.success) {
      try {
        confetti({
          particleCount: 70,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (err) {}
      onClose();
    } else {
      setErrorMsg('Gagal memproses pengembalian sepeda.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#12202F]/70 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-[#E2EBF0] space-y-5 animate-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-heading font-bold text-lg text-[#12202F]">
              Proses Pengembalian Sepeda
            </h3>
            <p className="text-xs text-[#5B7083]">Kode: {booking.bookingCode}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleCompleteReturn} className="space-y-4 text-xs">
          {/* Customer & Bikes list */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500">Penyewa:</span>
              <span className="font-bold text-[#12202F]">{booking.customer.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Sepeda ({booking.items.length} unit):</span>
              <span className="font-bold text-[#12202F]">
                {booking.items.map((i) => i.bikeCode).join(', ')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Jadwal Sewa:</span>
              <span>
                {booking.startTime} – {booking.endTime} WIB ({booking.durationHours} Jam)
              </span>
            </div>
          </div>

          {/* Late fee calculation breakdown */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-950 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Kalkulasi Keterlambatan:</span>
              </span>
              <span className="font-heading font-black text-sm text-amber-950">
                {estimatedLateFee > 0
                  ? `Denda: Rp${estimatedLateFee.toLocaleString('id-ID')}`
                  : 'Tepat Waktu (Tidak Ada Denda)'}
              </span>
            </div>
            <p className="text-[11px] text-amber-900 leading-relaxed">
              *Toleransi 10 menit gratis. Jika lebih dari 10 menit, denda flat Rp10.000/jam dibulatkan per 30 menit (Rp5.000/30 min/unit).
            </p>
          </div>

          {/* Condition Selector */}
          <div>
            <label className="block font-bold text-[#12202F] mb-1.5">
              Pemeriksaan Kondisi Sepeda:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setCondition('baik');
                  setDamageFee(0);
                }}
                className={`p-2.5 rounded-xl border text-center font-semibold cursor-pointer ${
                  condition === 'baik'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                Mulus / Baik
              </button>

              <button
                type="button"
                onClick={() => {
                  setCondition('lecet_ringan');
                  setDamageFee(0);
                }}
                className={`p-2.5 rounded-xl border text-center font-semibold cursor-pointer ${
                  condition === 'lecet_ringan'
                    ? 'bg-amber-50 border-amber-500 text-amber-900 font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                Lecet Ringan (Wajar)
              </button>

              <button
                type="button"
                onClick={() => {
                  setCondition('rusak_berat');
                  setDamageFee(35000);
                }}
                className={`p-2.5 rounded-xl border text-center font-semibold cursor-pointer ${
                  condition === 'rusak_berat'
                    ? 'bg-rose-50 border-rose-500 text-rose-900 font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                Rusak Berat
              </button>
            </div>
          </div>

          {/* Damage Fee input if damaged */}
          {condition === 'rusak_berat' && (
            <div>
              <label className="block font-bold text-rose-900 mb-1">
                Biaya Perbaikan Komponen Rusak (Rp):
              </label>
              <input
                type="number"
                step="5000"
                value={damageFee}
                onChange={(e) => setDamageFee(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl border border-rose-300 focus:ring-2 focus:ring-rose-500 bg-rose-50/40 text-xs text-rose-950 font-bold"
              />
              <p className="text-[10px] text-slate-400 mt-0.5">
                Unit sepeda akan otomatis berstatus <em>Perawatan</em> setelah dikembalikan.
              </p>
            </div>
          )}

          {/* KTP Physical Return Checklist */}
          <div className="p-3.5 rounded-2xl bg-cyan-50/70 border border-cyan-200">
            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-cyan-950">
              <input
                type="checkbox"
                required
                checked={ktpReturned}
                onChange={(e) => setKtpReturned(e.target.checked)}
                className="w-4 h-4 rounded text-[#4FC3C8] focus:ring-[#4FC3C8] mt-0.5 shrink-0"
              />
              <span>
                <strong>Konfirmasi Serah Terima KTP Fisik:</strong> KTP / kartu identitas asli penyewa telah dikembalikan utuh dan lengkap kepada {booking.customer.name}.
              </span>
            </label>
          </div>

          {/* Summary Total */}
          <div className="pt-2 border-t border-slate-100 flex justify-between items-baseline text-sm">
            <span className="font-bold text-[#12202F]">Tambahan yang Harus Diterima:</span>
            <span className="font-heading font-black text-lg text-[#12202F]">
              Rp{(estimatedLateFee + damageFee).toLocaleString('id-ID')}
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 rounded-xl btn-primary text-xs font-bold cursor-pointer shadow-md"
            >
              {isSubmitting ? 'Menyimpan...' : 'Selesaikan Pengembalian'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
