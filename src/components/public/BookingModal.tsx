/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useRental } from '../../lib/context/RentalContext';
import {
  Bike,
  Trash2,
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Plus,
  AlertCircle,
  HelpCircle,
  ShoppingBag,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const BookingModal: React.FC = () => {
  const {
    cart,
    removeFromCart,
    bookingFormState,
    setBookingFormState,
    createBooking,
    navigateTo,
  } = useRental();

  const [customerName, setCustomerName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [antiBotVerified, setAntiBotVerified] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate pricing
  const totalHourlyRate = cart.reduce((sum, item) => sum + item.bike.hourlyRate, 0);
  const estimatedSubtotal = Math.round(totalHourlyRate * bookingFormState.durationHours);

  // Operational hours check
  const isTimeValid = () => {
    const [h] = bookingFormState.startTime.split(':').map(Number);
    // Rough check: 08:00 to 22:00
    return h >= 8 && h <= 23;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (cart.length === 0) {
      setErrorMsg('Keranjang sewa Anda masih kosong. Silakan pilih minimal 1 sepeda dari katalog.');
      return;
    }

    if (!customerName.trim()) {
      setErrorMsg('Mohon isi nama lengkap Anda.');
      return;
    }

    const cleanWA = whatsappNumber.replace(/\D/g, '');
    if (cleanWA.length < 8) {
      setErrorMsg('Nomor WhatsApp tidak valid. Masukkan nomor yang aktif menerima chat.');
      return;
    }

    if (!agreeTerms) {
      setErrorMsg('Anda harus menyetujui syarat sewa & penahanan KTP fisik.');
      return;
    }

    if (!antiBotVerified) {
      setErrorMsg('Centang verifikasi anti-bot untuk melanjutkan.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Normalize WhatsApp to +62 format
      let formattedWA = cleanWA;
      if (formattedWA.startsWith('0')) {
        formattedWA = '+62' + formattedWA.substring(1);
      } else if (formattedWA.startsWith('62')) {
        formattedWA = '+' + formattedWA;
      } else if (!formattedWA.startsWith('+62')) {
        formattedWA = '+62' + formattedWA;
      }

      const newBooking = createBooking({
        name: customerName.trim(),
        whatsapp: formattedWA,
        notes: customerNotes.trim() || undefined,
        ktpHeldOffline: true,
      });

      // Trigger Confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#4FC3C8', '#12202F', '#3BB1B6', '#F59E0B'],
        });
      } catch (err) {
        // fallback
      }

      setIsSubmitting(false);
      // Navigate to Payment page with booking code
      navigateTo('bayar', { kode: newBooking.bookingCode });
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg('Gagal memproses pesanan: ' + (err.message || 'Terjadi kesalahan sistem.'));
    }
  };

  return (
    <div className="py-10 bg-[#FAFDFE] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Title */}
        <div>
          <span className="text-xs font-bold text-[#4FC3C8] uppercase tracking-wider bg-[#EBF9FA] px-3 py-1 rounded-full border border-[#4FC3C8]/30">
            Formulir Pemesanan
          </span>
          <h1 className="font-heading text-3xl font-extrabold text-[#12202F] mt-2">
            Pemesanan Sewa Sepeda
          </h1>
          <p className="text-xs sm:text-sm text-[#5B7083] mt-1">
            Tanpa perlu registrasi akun. Cukup isi identitas kontak Anda untuk penjemputan unit.
          </p>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Mohon periksa data Anda:</p>
              <p>{errorMsg}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form (7 cols) */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-[#E2EBF0] shadow-xs space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Section 1: Customer Contact */}
              <div className="space-y-4">
                <h2 className="font-heading font-bold text-base text-[#12202F] flex items-center gap-2 border-b border-slate-100 pb-2">
                  <span>1. Data Diri Penyewa</span>
                  <span className="text-[10px] text-slate-400 font-normal">(Untuk verifikasi di konter)</span>
                </h2>

                <div>
                  <label className="block text-xs font-bold text-[#12202F] mb-1.5">
                    Nama Lengkap <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Rian Pratama"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E2EBF0] text-sm text-[#12202F] focus:outline-none focus:ring-2 focus:ring-[#4FC3C8] bg-slate-50/40"
                  />
                  <p className="text-[11px] text-[#5B7083] mt-1">
                    Pastikan nama sesuai dengan KTP / kartu identitas fisik yang akan dititipkan.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#12202F] mb-1.5">
                    Nomor WhatsApp <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#12202F]">
                      +62
                    </span>
                    <input
                      type="tel"
                      required
                      placeholder="812-3456-7890"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-[#E2EBF0] text-sm text-[#12202F] focus:outline-none focus:ring-2 focus:ring-[#4FC3C8] bg-slate-50/40"
                    />
                  </div>
                  <p className="text-[11px] text-[#5B7083] mt-1">
                    Invoice & kode konfirmasi pemesanan akan dikirimkan ke nomor WhatsApp ini.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#12202F] mb-1.5">
                    Catatan Tambahan (Opsional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Contoh: Tolong siapkan helm ukuran L dan setelan sadel agak tinggi."
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E2EBF0] text-sm text-[#12202F] focus:outline-none focus:ring-2 focus:ring-[#4FC3C8] bg-slate-50/40"
                  />
                </div>
              </div>

              {/* Section 2: Rental Schedule */}
              <div className="space-y-4 pt-2">
                <h2 className="font-heading font-bold text-base text-[#12202F] flex items-center gap-2 border-b border-slate-100 pb-2">
                  <span>2. Waktu & Durasi Sewa</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#12202F] mb-1.5">
                      Tanggal
                    </label>
                    <input
                      type="date"
                      value={bookingFormState.date}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) =>
                        setBookingFormState((prev) => ({ ...prev, date: e.target.value }))
                      }
                      className="w-full px-3 py-2 rounded-xl border border-[#E2EBF0] text-xs text-[#12202F] focus:ring-2 focus:ring-[#4FC3C8] bg-slate-50/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#12202F] mb-1.5">
                      Jam Mulai (WIB)
                    </label>
                    <select
                      value={bookingFormState.startTime}
                      onChange={(e) =>
                        setBookingFormState((prev) => ({ ...prev, startTime: e.target.value }))
                      }
                      className="w-full px-3 py-2 rounded-xl border border-[#E2EBF0] text-xs text-[#12202F] focus:ring-2 focus:ring-[#4FC3C8] bg-slate-50/50"
                    >
                      <option value="14:00">14.00 WIB</option>
                      <option value="14:30">14.30 WIB</option>
                      <option value="15:00">15.00 WIB</option>
                      <option value="15:30">15.30 WIB</option>
                      <option value="16:00">16.00 WIB</option>
                      <option value="16:30">16.30 WIB</option>
                      <option value="17:00">17.00 WIB</option>
                      <option value="17:30">17.30 WIB</option>
                      <option value="18:00">18.00 WIB</option>
                      <option value="18:30">18.30 WIB</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#12202F] mb-1.5">
                      Durasi Sewa
                    </label>
                    <select
                      value={bookingFormState.durationHours}
                      onChange={(e) =>
                        setBookingFormState((prev) => ({
                          ...prev,
                          durationHours: parseFloat(e.target.value),
                        }))
                      }
                      className="w-full px-3 py-2 rounded-xl border border-[#E2EBF0] text-xs text-[#12202F] focus:ring-2 focus:ring-[#4FC3C8] bg-slate-50/50"
                    >
                      <option value={1.0}>1.0 Jam (Min.)</option>
                      <option value={1.5}>1.5 Jam</option>
                      <option value={2.0}>2.0 Jam</option>
                      <option value={2.5}>2.5 Jam</option>
                      <option value={3.0}>3.0 Jam</option>
                      <option value={4.0}>4.0 Jam</option>
                    </select>
                    {/* Quick selection chips */}
                    <div className="flex gap-1.5 mt-2">
                      {[1.0, 1.5, 2.0, 3.0].map((hrs) => (
                        <button
                          key={hrs}
                          type="button"
                          onClick={() => setBookingFormState((prev) => ({ ...prev, durationHours: hrs }))}
                          className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer active:scale-95 ${
                            bookingFormState.durationHours === hrs
                              ? 'bg-[#00696D] text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {hrs}j
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                  <span>Perkiraan Selesai Sewa:</span>
                  <span className="font-bold text-[#12202F]">
                    {bookingFormState.startTime} –{' '}
                    {(() => {
                      const [h, m] = bookingFormState.startTime.split(':').map(Number);
                      const total = h * 60 + m + Math.round(bookingFormState.durationHours * 60);
                      const endH = Math.floor(total / 60) % 24;
                      const endM = total % 60;
                      return `${String(endH).padStart(2, '0')}.${String(endM).padStart(2, '0')} WIB`;
                    })()}
                  </span>
                </div>
              </div>

              {/* Section 3: Terms & Anti-bot Checkbox */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#12202F]">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-4 h-4 rounded text-[#4FC3C8] focus:ring-[#4FC3C8] mt-0.5 shrink-0"
                  />
                  <span>
                    Saya menyetujui <strong>Syarat Sewa RAFA GO</strong>: Bersedia menitipkan KTP fisik asli di pos admin, mematuhi denda Rp10.000/jam jika terlambat (toleransi 10 menit), dan menjaga sepeda dengan baik.
                  </span>
                </label>

                {/* Cloudflare Turnstile simulation */}
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between">
                  <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-800">
                    <input
                      type="checkbox"
                      checked={antiBotVerified}
                      onChange={(e) => setAntiBotVerified(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Saya bukan robot (Cloudflare Turnstile Verified)</span>
                  </label>
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                </div>
              </div>

              {/* Submit CTA with micro-interaction */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting || cart.length === 0}
                className="w-full py-4 rounded-xl btn-primary text-sm font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-shadow"
              >
                {isSubmitting ? (
                  <span>Memproses Pesanan...</span>
                ) : (
                  <>
                    <span>Lanjut ke Pembayaran QRIS / Transfer</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </form>
          </div>

          {/* Right Column: Order Summary & Selected Bikes (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white p-6 rounded-3xl border border-[#E2EBF0] shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-heading font-bold text-base text-[#12202F] flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-[#4FC3C8]" />
                  <span>Daftar Sepeda ({cart.length})</span>
                </h3>
                <button
                  onClick={() => navigateTo('katalog')}
                  className="text-xs font-bold text-[#4FC3C8] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Sepeda</span>
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="py-8 text-center text-slate-400 space-y-2">
                  <Bike className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-xs">Belum ada sepeda di keranjang.</p>
                  <button
                    onClick={() => navigateTo('katalog')}
                    className="btn-primary px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Pilih di Katalog
                  </button>
                </div>
              ) : (
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div
                      key={item.bike.id}
                      className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3 relative group"
                    >
                      <img
                        src={item.bike.image}
                        alt={item.bike.name}
                        className="w-14 h-14 rounded-xl object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#12202F] text-white">
                            {item.bike.code}
                          </span>
                          <span className="text-[11px] text-[#5B7083] truncate">
                            {item.bike.categoryName}
                          </span>
                        </div>
                        <h4 className="font-heading font-bold text-xs text-[#12202F] truncate mt-0.5">
                          {item.bike.name}
                        </h4>
                        <p className="text-xs font-bold text-[#4FC3C8]">
                          Rp{item.bike.hourlyRate.toLocaleString('id-ID')}
                          <span className="text-[10px] text-slate-400 font-normal"> / jam</span>
                        </p>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.bike.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Hapus sepeda ini"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Price Calculation breakdown */}
              {cart.length > 0 && (
                <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                  <div className="flex justify-between text-[#5B7083]">
                    <span>Total Tarif per Jam ({cart.length} sepeda):</span>
                    <span>Rp{totalHourlyRate.toLocaleString('id-ID')} / j</span>
                  </div>
                  <div className="flex justify-between text-[#5B7083]">
                    <span>Durasi Sewa:</span>
                    <span>{bookingFormState.durationHours} Jam</span>
                  </div>
                  <div className="flex justify-between text-[#5B7083]">
                    <span>Fasilitas Helm & Gembok:</span>
                    <span className="text-emerald-600 font-semibold">Gratis</span>
                  </div>
                  <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline text-sm">
                    <span className="font-heading font-bold text-[#12202F]">Estimasi Total:</span>
                    <div className="text-right">
                      <span className="font-heading font-black text-xl text-[#12202F]">
                        Rp{estimatedSubtotal.toLocaleString('id-ID')}
                      </span>
                      <p className="text-[10px] text-[#5B7083] font-normal">
                        *Akan ditambah kode unik 3-digit saat pembayaran
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Offline Holding Notice Box */}
            <div className="bg-[#EBF9FA] p-4 rounded-2xl border border-[#4FC3C8]/40 text-xs text-[#12202F] space-y-2">
              <div className="flex items-center gap-2 font-bold text-[#12202F]">
                <ShieldCheck className="w-4 h-4 text-[#4FC3C8]" />
                <span>Slot Sepeda Ditahan 30 Menit</span>
              </div>
              <p className="text-[11px] text-[#5B7083] leading-relaxed">
                Setelah Anda menekan tombol di samping, kode booking unik akan diterbitkan dan unit sepeda akan otomatis dikunci selama 30 menit agar Anda dapat menyelesaikan transfer dengan tenang.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
