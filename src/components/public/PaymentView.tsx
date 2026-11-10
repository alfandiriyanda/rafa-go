/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useRental } from '../../lib/context/RentalContext';
import {
  QrCode,
  Wallet,
  Building2,
  Clock,
  Copy,
  Check,
  Upload,
  AlertCircle,
  FileCheck,
  ArrowRight,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const PaymentView: React.FC = () => {
  const { bookings, viewParams, submitPaymentProof, navigateTo } = useRental();

  // Find booking by kode from URL or default to first/latest pending
  const booking =
    bookings.find(
      (b) =>
        b.bookingCode === viewParams.kode ||
        b.publicToken === viewParams.kode ||
        b.bookingCode === viewParams.token
    ) || bookings[0];

  const [activeTab, setActiveTab] = useState<'qris' | 'dana' | 'seabank'>('qris');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Form states
  const [senderBank, setSenderBank] = useState('BCA Mobile');
  const [senderAccountName, setSenderAccountName] = useState(booking?.customer.name || '');
  const [transferTime, setTransferTime] = useState(
    new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
  );
  const [uploadedReceipt, setUploadedReceipt] = useState<string>(
    booking?.paymentProof?.receiptImage || ''
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [timeLeft, setTimeLeft] = useState(1799); // 30 minutes in seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!booking) {
    return (
      <div className="py-20 text-center space-y-4">
        <p className="text-slate-500 text-sm">Pesanan tidak ditemukan.</p>
        <button
          onClick={() => navigateTo('katalog')}
          className="btn-primary px-5 py-2.5 rounded-xl text-xs font-bold"
        >
          Ke Katalog Sepeda
        </button>
      </div>
    );
  }

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedReceipt(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUseDemoReceipt = () => {
    setUploadedReceipt(
      'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80'
    );
  };

  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!senderAccountName.trim()) {
      setErrorMsg('Mohon isi nama pemilik rekening pengirim.');
      return;
    }

    if (!uploadedReceipt) {
      setErrorMsg('Mohon unggah foto / tangkapan layar bukti transfer pembayaran.');
      return;
    }

    setIsSubmitting(true);

    const success = submitPaymentProof(booking.bookingCode, {
      method: activeTab,
      senderBank,
      senderAccountName: senderAccountName.trim(),
      transferTime,
      nominalPaid: booking.totalAmount,
      receiptImage: uploadedReceipt,
      uploadedAt: new Date().toISOString(),
    });

    setIsSubmitting(false);

    if (success) {
      try {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.5 },
        });
      } catch (err) {}
      navigateTo('pesanan', { kode: booking.bookingCode });
    } else {
      setErrorMsg('Gagal menyimpan bukti pembayaran.');
    }
  };

  return (
    <div className="py-10 bg-[#FAFDFE] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Countdown Banner */}
        <div className="bg-[#12202F] text-white p-5 rounded-3xl shadow-lg border border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold border border-amber-400/30">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <p className="text-xs text-slate-300">Selesaikan Pembayaran Dalam:</p>
              <div className="flex items-baseline gap-2">
                <span className="font-heading font-black text-2xl text-amber-300 tracking-wider">
                  {formatCountdown(timeLeft)}
                </span>
                <span className="text-[11px] text-slate-400">(Slot sepeda terkunci 30 menit)</span>
              </div>
            </div>
          </div>

          <div className="text-right sm:border-l sm:border-slate-700 sm:pl-6">
            <span className="text-[11px] text-slate-400">Kode Booking Anda:</span>
            <div className="font-mono font-bold text-lg text-[#4FC3C8] tracking-wider">
              {booking.bookingCode}
            </div>
          </div>
        </div>

        {/* Section Title */}
        <div className="text-center max-w-xl mx-auto">
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#12202F]">
            Pembayaran Manual RAFA GO
          </h1>
          <p className="text-xs sm:text-sm text-[#5B7083] mt-1">
            Silakan transfer tepat sesuai <strong>nominal dengan kode unik 3-digit</strong> agar pesanan Anda diverifikasi otomatis lebih cepat.
          </p>
        </div>

        {/* Big Amount Card with Unique Code Highlight */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#4FC3C8] shadow-md text-center space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-[#4FC3C8] text-[#12202F] text-[10px] font-black uppercase px-4 py-1 rounded-bl-xl tracking-wider">
            Nominal Wajib Pas
          </div>

          <span className="text-xs font-semibold text-[#5B7083] uppercase tracking-wider block">
            Total yang Harus Ditransfer:
          </span>

          <div className="flex items-center justify-center gap-3">
            <span className="font-heading font-black text-3xl sm:text-5xl text-[#12202F] tracking-tight">
              Rp{booking.totalAmount.toLocaleString('id-ID')}
            </span>
            <button
              onClick={() =>
                copyToClipboard(booking.totalAmount.toString(), 'nominal')
              }
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-[#EBF9FA] text-[#12202F] transition-colors cursor-pointer"
              title="Salin nominal transfer"
            >
              {copiedField === 'nominal' ? (
                <Check className="w-5 h-5 text-emerald-600" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
            </button>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Termasuk 3 digit kode unik verifikasi: <strong>+{booking.uniqueNominalCode}</strong>
            </span>
          </div>
        </div>

        {/* Payment Methods Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Account Details / QRIS (6 cols) */}
          <div className="lg:col-span-6 bg-white p-6 sm:p-7 rounded-3xl border border-[#E2EBF0] shadow-xs space-y-5">
            <h2 className="font-heading font-bold text-base text-[#12202F]">
              Pilih Rekening Tujuan Transfer:
            </h2>

            {/* Tab Buttons */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setActiveTab('qris')}
                className={`py-2.5 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 border transition-all cursor-pointer ${
                  activeTab === 'qris'
                    ? 'bg-[#EBF9FA] border-[#4FC3C8] text-[#12202F]'
                    : 'bg-slate-50 border-slate-200 text-[#5B7083] hover:bg-slate-100'
                }`}
              >
                <QrCode className="w-4 h-4 text-[#4FC3C8]" />
                <span>QRIS Resmi</span>
              </button>

              <button
                onClick={() => setActiveTab('dana')}
                className={`py-2.5 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 border transition-all cursor-pointer ${
                  activeTab === 'dana'
                    ? 'bg-[#EBF9FA] border-[#4FC3C8] text-[#12202F]'
                    : 'bg-slate-50 border-slate-200 text-[#5B7083] hover:bg-slate-100'
                }`}
              >
                <Wallet className="w-4 h-4 text-[#4FC3C8]" />
                <span>DANA</span>
              </button>

              <button
                onClick={() => setActiveTab('seabank')}
                className={`py-2.5 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 border transition-all cursor-pointer ${
                  activeTab === 'seabank'
                    ? 'bg-[#EBF9FA] border-[#4FC3C8] text-[#12202F]'
                    : 'bg-slate-50 border-slate-200 text-[#5B7083] hover:bg-slate-100'
                }`}
              >
                <Building2 className="w-4 h-4 text-[#4FC3C8]" />
                <span>SeaBank</span>
              </button>
            </div>

            {/* Tab 1: QRIS Display */}
            {activeTab === 'qris' && (
              <div className="space-y-4 text-center">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 inline-block w-full max-w-xs mx-auto">
                  <img
                    src="/images/qris-rafa-go.jpeg"
                    alt="QRIS Resmi RAFA GO"
                    className="w-full max-w-[260px] mx-auto rounded-xl shadow-xs object-contain"
                  />
                  <div className="mt-3 text-xs text-slate-600">
                    <p className="font-bold text-[#12202F]">NMID: ID1026477851087</p>
                    <p className="text-[10px] text-slate-500">Scan via BCA, Mandiri, BRI, GoPay, OVO, ShopeePay</p>
                  </div>
                </div>

                <div className="text-xs text-slate-500">
                  <a
                    href="/images/qris-rafa-go.jpeg"
                    download="QRIS-RAFA-GO.jpeg"
                    className="text-[#4FC3C8] font-bold hover:underline"
                  >
                    Download Gambar QRIS
                  </a>
                </div>
              </div>
            )}

            {/* Tab 2: DANA */}
            {activeTab === 'dana' && (
              <div className="p-5 rounded-2xl bg-cyan-50/70 border border-cyan-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-cyan-800 font-bold uppercase tracking-wider">
                      E-Wallet DANA
                    </span>
                    <h3 className="font-heading font-black text-2xl text-cyan-950 mt-1">
                      0876-6533-42
                    </h3>
                    <p className="text-xs font-semibold text-cyan-900">
                      Atas Nama: <strong className="text-black">Fadel</strong>
                    </p>
                  </div>

                  <button
                    onClick={() => copyToClipboard('0876653342', 'dana')}
                    className="px-3.5 py-2 rounded-xl bg-cyan-600 text-white text-xs font-bold hover:bg-cyan-700 transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                  >
                    {copiedField === 'dana' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedField === 'dana' ? 'Tersalin' : 'Salin'}</span>
                  </button>
                </div>

                <div className="pt-2 border-t border-cyan-200/80 text-[11px] text-cyan-800">
                  Buka aplikasi DANA → Kirim Uang → Ke Nomor HP: <strong>0876653342</strong>
                </div>
              </div>
            )}

            {/* Tab 3: SeaBank */}
            {activeTab === 'seabank' && (
              <div className="p-5 rounded-2xl bg-sky-50/70 border border-sky-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-sky-800 font-bold uppercase tracking-wider">
                      Bank Digital SeaBank
                    </span>
                    <h3 className="font-heading font-black text-xl text-sky-950 mt-1 font-mono">
                      6524 3745 2518 32
                    </h3>
                    <p className="text-xs font-semibold text-sky-900">
                      Atas Nama: <strong className="text-black">Padel</strong>
                    </p>
                  </div>

                  <button
                    onClick={() => copyToClipboard('65243745251832', 'seabank')}
                    className="px-3.5 py-2 rounded-xl bg-sky-600 text-white text-xs font-bold hover:bg-sky-700 transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                  >
                    {copiedField === 'seabank' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedField === 'seabank' ? 'Tersalin' : 'Salin'}</span>
                  </button>
                </div>

                <div className="pt-2 border-t border-sky-200/80 text-[11px] text-sky-800">
                  Transfer antar bank gratis via BI-FAST atau sesama SeaBank.
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Form Upload Proof (6 cols) */}
          <div className="lg:col-span-6 bg-white p-6 sm:p-7 rounded-3xl border border-[#E2EBF0] shadow-xs space-y-5">
            <div>
              <h2 className="font-heading font-bold text-base text-[#12202F]">
                Konfirmasi & Kirim Bukti Transfer
              </h2>
              <p className="text-xs text-[#5B7083] mt-0.5">
                Admin akan memverifikasi dan menyiapkan sepedamu.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleConfirmPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#12202F] mb-1">
                  Bank / E-Wallet Pengirim
                </label>
                <select
                  value={senderBank}
                  onChange={(e) => setSenderBank(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2EBF0] text-xs text-[#12202F] focus:ring-2 focus:ring-[#4FC3C8] bg-slate-50/50"
                >
                  <option value="BCA Mobile">BCA / BCA Mobile</option>
                  <option value="Mandiri Livin">Mandiri / Livin by Mandiri</option>
                  <option value="BRImo">BRI / BRImo</option>
                  <option value="BNI Mobile">BNI Mobile</option>
                  <option value="DANA">DANA</option>
                  <option value="GoPay">GoPay</option>
                  <option value="OVO">OVO</option>
                  <option value="ShopeePay">ShopeePay</option>
                  <option value="SeaBank">SeaBank</option>
                  <option value="Lainnya">Bank Lain / QRIS Bank Lain</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#12202F] mb-1">
                  Nama Pemilik Rekening Pengirim <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nama akun rekening Anda saat transfer"
                  value={senderAccountName}
                  onChange={(e) => setSenderAccountName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2EBF0] text-xs text-[#12202F] focus:ring-2 focus:ring-[#4FC3C8] bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#12202F] mb-1">
                  Jam Transfer
                </label>
                <input
                  type="text"
                  value={transferTime}
                  onChange={(e) => setTransferTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2EBF0] text-xs text-[#12202F] focus:ring-2 focus:ring-[#4FC3C8] bg-slate-50/50"
                />
              </div>

              {/* Upload Receipt Area */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-[#12202F]">
                    Unggah Bukti Transfer (Screenshot / Foto) <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleUseDemoReceipt}
                    className="text-[10px] text-[#4FC3C8] hover:underline font-bold cursor-pointer"
                  >
                    + Pakai Struk Demo
                  </button>
                </div>

                <div className="border-2 border-dashed border-slate-300 hover:border-[#4FC3C8] rounded-2xl p-4 text-center bg-slate-50/50 transition-colors relative cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />

                  {uploadedReceipt ? (
                    <div className="space-y-2">
                      <img
                        src={uploadedReceipt}
                        alt="Bukti Bayar"
                        className="max-h-36 mx-auto rounded-xl object-contain border border-slate-200 shadow-xs"
                      />
                      <p className="text-[11px] text-emerald-700 font-bold flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Foto Bukti Berhasil Dimuat (Klik untuk ganti)</span>
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1.5 py-2">
                      <Upload className="w-8 h-8 text-slate-400 mx-auto" />
                      <p className="text-xs font-semibold text-[#12202F]">
                        Klik atau Tarik Foto Bukti Transfer ke Sini
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Format JPG, PNG, atau WebP (Maks. 5 MB)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl btn-primary text-xs font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Mengirimkan Bukti...</span>
                ) : (
                  <>
                    <FileCheck className="w-4 h-4" />
                    <span>Kirim Bukti Pembayaran ke Admin</span>
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <a
                  href={`https://wa.me/62876653342?text=Halo%20Admin%20RAFA%20GO%2C%20saya%20sudah%20transfer%20Rp${booking.totalAmount}%20untuk%20kode%20booking%20${booking.bookingCode}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#5B7083] hover:text-[#12202F] inline-flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5 text-[#25D366]" />
                  <span>Atau konfirmasi via WhatsApp jika terkendala</span>
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
