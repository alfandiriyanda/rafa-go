/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

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
        <div className="text-center max-w-xl mx-auto">
          <span className="text-xs font-bold text-[#4FC3C8] uppercase tracking-wider bg-[#EBF9FA] px-3 py-1 rounded-full border border-[#4FC3C8]/30">
            Pertanyaan Populer
          </span>
          <h2 className="font-heading text-3xl font-extrabold text-[#12202F] mt-2">
            Pertanyaan yang Sering Diajukan (FAQ)
          </h2>
          <p className="text-xs sm:text-sm text-[#5B7083] mt-1">
            Jawaban lengkap seputar cara sewa, pembayaran, dan kebijakan operasional RAFA GO.
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-[#E2EBF0] overflow-hidden transition-all shadow-xs"
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <span className="font-heading font-bold text-sm text-[#12202F]">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#4FC3C8] shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-[#5B7083] leading-relaxed border-t border-slate-100">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
