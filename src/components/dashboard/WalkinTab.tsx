/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useRental } from '../../lib/context/RentalContext';
import { Bike } from '../../types/rental';
import {
  UserPlus,
  Bike as BikeIcon,
  Check,
  CreditCard,
  Banknote,
  IdCard,
  Camera,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const WalkinTab: React.FC = () => {
  const { bikes, createBooking, verifyPayment, startRental, updateBikeStatus } = useRental();

  const availableBikes = bikes.filter((b) => b.status === 'tersedia');

  const [selectedBikeIds, setSelectedBikeIds] = useState<string[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [durationHours, setDurationHours] = useState(1.0);
  const [paymentMethod, setPaymentMethod] = useState<'tunai' | 'qris'>('tunai');
  const [ktpHeld, setKtpHeld] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const toggleSelectBike = (id: string) => {
    setSelectedBikeIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectedBikes = availableBikes.filter((b) => selectedBikeIds.includes(b.id));
  const hourlyTotal = selectedBikes.reduce((sum, b) => sum + b.hourlyRate, 0);
  const totalCost = Math.round(hourlyTotal * durationHours);

  const handleWalkinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (selectedBikeIds.length === 0) {
      setErrorMsg('Pilih minimal 1 sepeda yang tersedia di stasiun.');
      return;
    }

    if (!customerName.trim()) {
      setErrorMsg('Nama lengkap penyewa walk-in wajib diisi.');
      return;
    }

    if (!ktpHeld) {
      setErrorMsg('Pastikan kartu identitas fisik (KTP/SIM) asli telah diterima di pos kasir.');
      return;
    }

    // Build booking
    const booking = createBooking({
      name: customerName.trim(),
      whatsapp: whatsappNumber.trim() ? (whatsappNumber.startsWith('+') ? whatsappNumber : '+62' + whatsappNumber.replace(/^0/, '')) : '+6281200000000',
      notes: `Walk-in kasir langsung. Bayar ${paymentMethod.toUpperCase()}.`,
      ktpHeldOffline: true,
    });

    // Auto verify payment since staff took cash/QRIS in front of them
    verifyPayment(booking.bookingCode, true);

    // Auto start rental
    startRental(
      booking.bookingCode,
      'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?auto=format&fit=crop&w=600&q=80'
    );

    // Update bike status
    selectedBikeIds.forEach((id) => updateBikeStatus(id, 'disewa'));

    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch (err) {}

    setIsSuccess(true);
    setSelectedBikeIds([]);
    setCustomerName('');
    setWhatsappNumber('');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-[#E2EBF0] shadow-xs">
        <h2 className="font-heading font-bold text-xl text-[#12202F] flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-[#4FC3C8]" />
          <span>Input Pesanan Walk-in (Di Konter)</span>
        </h2>
        <p className="text-xs text-[#5B7083] mt-0.5">
          Proses sewa cepat untuk pengunjung yang datang langsung ke stasiun tanpa booking online terlebih dahulu.
        </p>
      </div>

      {isSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>
              <strong>Pemesanan Walk-in Berhasil Dibuat & Aktif!</strong> Sepeda langsung berstatus sedang disewa dan KTP fisik tercatat ditahan.
            </span>
          </div>
          <button
            onClick={() => setIsSuccess(false)}
            className="text-xs text-emerald-800 font-bold hover:underline cursor-pointer"
          >
            Tutup
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleWalkinSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Details (6 cols) */}
        <div className="lg:col-span-6 bg-white p-6 sm:p-7 rounded-3xl border border-[#E2EBF0] shadow-xs space-y-5 text-xs">
          <div className="space-y-3">
            <h3 className="font-heading font-bold text-sm text-[#12202F] border-b border-slate-100 pb-2">
              1. Identitas Konsumen
            </h3>

            <div>
              <label className="block font-bold text-[#12202F] mb-1">
                Nama Lengkap Penyewa <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Bpk. Hendra Gunawan"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#4FC3C8] text-xs text-[#12202F]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#12202F] mb-1">
                Nomor WhatsApp (Untuk struk digital)
              </label>
              <input
                type="tel"
                placeholder="0812-xxxx-xxxx"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#4FC3C8] text-xs text-[#12202F]"
              />
            </div>

            <div className="p-3.5 rounded-2xl bg-cyan-50 border border-cyan-200">
              <label className="flex items-start gap-2 cursor-pointer font-bold text-cyan-950">
                <input
                  type="checkbox"
                  required
                  checked={ktpHeld}
                  onChange={(e) => setKtpHeld(e.target.checked)}
                  className="w-4 h-4 rounded text-[#4FC3C8] focus:ring-[#4FC3C8] mt-0.5"
                />
                <span>KTP / SIM Fisik Asli telah diterima & disimpan di pos kasir</span>
              </label>
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h3 className="font-heading font-bold text-sm text-[#12202F] border-b border-slate-100 pb-2">
              2. Durasi & Pembayaran Langsung
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-[#12202F] mb-1">Durasi Sewa</label>
                <select
                  value={durationHours}
                  onChange={(e) => setDurationHours(parseFloat(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs text-[#12202F]"
                >
                  <option value={1.0}>1 Jam</option>
                  <option value={1.5}>1.5 Jam</option>
                  <option value={2.0}>2 Jam</option>
                  <option value={3.0}>3 Jam</option>
                  <option value={4.0}>4 Jam</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#12202F] mb-1">Metode Bayar</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs text-[#12202F]"
                >
                  <option value="tunai">Tunai di Kasir</option>
                  <option value="qris">Scan QRIS Kasir Langsung</option>
                </select>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex justify-between items-baseline">
              <span className="font-bold text-[#12202F]">Total Biaya Walk-in:</span>
              <span className="font-heading font-black text-xl text-[#12202F]">
                Rp{totalCost.toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl btn-primary text-xs font-bold shadow-md cursor-pointer flex items-center justify-center gap-2"
          >
            <Camera className="w-4 h-4" />
            <span>Simpan & Langsung Mulai Sewa</span>
          </button>
        </div>

        {/* Right Column: Pick Available Bikes (6 cols) */}
        <div className="lg:col-span-6 bg-white p-6 sm:p-7 rounded-3xl border border-[#E2EBF0] shadow-xs space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-heading font-bold text-sm text-[#12202F]">
              Pilih Unit Sepeda ({availableBikes.length} Tersedia)
            </h3>
            <span className="text-[#4FC3C8] font-bold">
              {selectedBikeIds.length} unit terpilih
            </span>
          </div>

          <div className="max-h-96 overflow-y-auto space-y-2 pr-1">
            {availableBikes.map((bike) => {
              const isSelected = selectedBikeIds.includes(bike.id);

              return (
                <div
                  key={bike.id}
                  onClick={() => toggleSelectBike(bike.id)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-[#EBF9FA] border-[#4FC3C8] ring-2 ring-[#4FC3C8]/30'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={bike.image}
                      alt={bike.name}
                      className="w-12 h-12 rounded-xl object-cover shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#12202F] text-white">
                          {bike.code}
                        </span>
                        <span className="font-bold text-[#12202F]">{bike.name}</span>
                      </div>
                      <p className="text-[11px] text-[#5B7083]">
                        {bike.categoryName} • {bike.color}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-bold text-[#12202F] block">
                      Rp{bike.hourlyRate.toLocaleString('id-ID')}
                    </span>
                    <span className="text-[10px] text-slate-400">/ jam</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </form>
    </div>
  );
};
