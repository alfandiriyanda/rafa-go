/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, HelpCircle, MessageCircle } from 'lucide-react';

interface FaqItem {
  q: string;
  a: string;
}

const FAQS: FaqItem[] = [
  {
    q: 'Apakah saya harus mendaftar akun atau login untuk menyewa sepeda?',
    a: 'Tidak sama sekali! Di RAFA GO, konsumen dapat langsung memilih sepeda, mengisi nama dan nomor WhatsApp saja, lalu melakukan pembayaran. Tidak ada registrasi akun yang membuang waktu Anda.',
  },
  {
    q: 'Bagaimana cara melakukan pembayaran sewa?',
    a: 'Kami menerima pembayaran transfer manual ke rekening resmi kami: QRIS Standar Nasional (bisa dari BCA, Mandiri, BRI, GoPay, OVO, ShopeePay), E-Wallet DANA (0876653342 a.n. Fadel), dan SeaBank (65243745251832 a.n. Padel). Setelah transfer, cukup unggah foto bukti transfer di website.',
  },
  {
    q: 'Apa yang harus saya bawa saat mengambil sepeda di stasiun?',
    a: 'Cukup bawa 1 buah Kartu Identitas Fisik Asli yang masih berlaku (KTP / SIM / Paspor) untuk dititipkan sementara kepada petugas kasir kami selama Anda gowes, serta tunjukkan kode booking (misal: RG-261109-7842) di layar HP Anda.',
  },
  {
    q: 'Apakah saya mendapatkan helm dan kunci pengaman?',
    a: 'Ya, setiap penyewaan unit sepeda di RAFA GO sudah mendapatkan fasilitas peminjaman 1 helm keselamatan standar SNI dan 1 gembok kabel baja secara gratis tanpa biaya tambahan.',
  },
  {
    q: 'Bagaimana jika saya terlambat mengembalikan sepeda?',
    a: 'Kami memberikan toleransi keterlambatan selama 10 menit secara gratis. Jika terlambat lebih dari 10 menit, dikenakan denda flat Rp10.000 / jam per sepeda, yang dibulatkan ke bawah setiap 30 menit (Rp5.000 per 30 menit). Denda diselesaikan saat serah terima pengembalian.',
  },
  {
    q: 'Bisakah saya menyewa lebih dari satu sepeda sekaligus?',
    a: 'Bisa! Anda dapat memasukkan beberapa sepeda ke dalam keranjang sewa (misal: City Bike untuk santai dan MTB untuk teman Anda) dan menyewanya sekaligus dalam satu transaksi.',
  },
];

export const FaqSection: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section className="py-16 bg-[#FAFDFE] border-t border-[#E2EBF0]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-xl mx-auto"
        >
          <span className="text-xs font-bold text-[#4FC3C8] uppercase tracking-wider bg-[#EBF9FA] px-3 py-1 rounded-full border border-[#4FC3C8]/30">
            Pertanyaan Populer
          </span>
          <h2 className="font-heading text-3xl font-extrabold text-[#12202F] mt-2">
            Pertanyaan yang Sering Diajukan (FAQ)
          </h2>
          <p className="text-xs sm:text-sm text-[#5B7083] mt-1">
            Jawaban lengkap seputar cara sewa, pembayaran, dan kebijakan operasional RAFA GO di CitraRaya City Jambi.
          </p>
        </motion.div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: idx * 0.05 }}
                className={`bg-white rounded-2xl border transition-all shadow-xs overflow-hidden ${
                  isOpen ? 'border-[#4FC3C8]/70 shadow-md ring-2 ring-[#4FC3C8]/10' : 'border-[#E2EBF0] hover:border-slate-300'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/70 transition-colors"
                >
                  <span className={`font-heading font-bold text-sm transition-colors ${isOpen ? 'text-[#00696D]' : 'text-[#12202F]'}`}>
                    {faq.q}
                  </span>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="p-1 rounded-full bg-slate-100 shrink-0"
                  >
                    <ChevronDown className="w-4 h-4 text-[#00696D]" />
                  </motion.div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 pt-1 text-xs text-[#5B7083] leading-relaxed border-t border-slate-100">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Live Help Card */}
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
          className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E2EBF0] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EBF9FA] text-[#00696D] flex items-center justify-center shrink-0">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#12202F]">Punya pertanyaan lain yang belum terjawab?</p>
              <p className="text-[11px] text-[#5B7083]">Tim layanan pelanggan kami siap membantu via WhatsApp setiap hari pk 08.00 - 22.00 WIB.</p>
            </div>
          </div>
          <motion.a
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            href="https://wa.me/62876653342?text=Halo%20Admin%20RAFA%20GO%2C%20saya%20ingin%20tanya%20seputar%20sewa%20sepeda"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-[#EBF9FA] text-[#00696D] hover:bg-[#D4F3F5] text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Tanya via WhatsApp</span>
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
};
