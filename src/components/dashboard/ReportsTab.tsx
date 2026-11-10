/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useRental } from '../../lib/context/RentalContext';
import {
  FileSpreadsheet,
  Printer,
  TrendingUp,
  Download,
  Shield,
  Clock,
  History,
} from 'lucide-react';

export const ReportsTab: React.FC = () => {
  const { bookings, auditLogs, categories } = useRental();

  // Financial statistics
  const confirmedBookings = bookings.filter(
    (b) => b.status === 'terkonfirmasi' || b.status === 'sedang_disewa' || b.status === 'selesai'
  );

  const totalRevenue = confirmedBookings.reduce(
    (sum, b) => sum + (b.totalPaidFinal || b.totalAmount || 0),
    0
  );

  const totalLateFees = confirmedBookings.reduce((sum, b) => sum + (b.lateFee || 0), 0);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Kode Booking', 'Penyewa', 'WhatsApp', 'Tanggal', 'Durasi (Jam)', 'Total Bayar (Rp)', 'Status'];
    const rows = bookings.map((b) => [
      b.bookingCode,
      `"${b.customer.name}"`,
      `"${b.customer.whatsapp}"`,
      b.bookingDate,
      b.durationHours,
      b.totalPaidFinal || b.totalAmount,
      b.status,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan-RAFA-GO-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E2EBF0] shadow-xs">
        <div>
          <h2 className="font-heading font-bold text-xl text-[#12202F]">
            Laporan Keuangan & Audit Log Aktivitas
          </h2>
          <p className="text-xs text-[#5B7083] mt-0.5">
            Laporan operasional harian dan rekam jejak aktivitas staf/owner yang tidak dapat diubah (append-only).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-xl btn-primary text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor CSV</span>
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Laporan</span>
          </button>
        </div>
      </div>

      {/* Financial Metrics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-[#E2EBF0] space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Total Omzet Terverifikasi
          </span>
          <div className="font-heading font-black text-2xl text-[#12202F]">
            Rp{totalRevenue.toLocaleString('id-ID')}
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold">
            Dari {confirmedBookings.length} transaksi sewa
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E2EBF0] space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Total Denda Keterlambatan
          </span>
          <div className="font-heading font-black text-2xl text-amber-700">
            Rp{totalLateFees.toLocaleString('id-ID')}
          </div>
          <span className="text-[11px] text-slate-400">
            Tarif Rp10k/jam, toleransi 10 menit
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E2EBF0] space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Rata-rata Durasi Sewa
          </span>
          <div className="font-heading font-black text-2xl text-[#12202F]">
            1.8 Jam
          </div>
          <span className="text-[11px] text-[#4FC3C8] font-semibold">
            Paling populer: City Bike & E-Bike
          </span>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-3xl border border-[#E2EBF0] p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-heading font-bold text-base text-[#12202F] flex items-center gap-2">
            <History className="w-4 h-4 text-[#4FC3C8]" />
            <span>Audit Log Transaksi & Keamanan (Append-Only)</span>
          </h3>
          <span className="text-xs text-slate-400">{auditLogs.length} Aktivitas Tercatat</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#12202F]">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Waktu (WIB)</th>
                <th className="px-4 py-3">Aktor & Role</th>
                <th className="px-4 py-3">Aksi</th>
                <th className="px-4 py-3">Rincian Log</th>
                <th className="px-4 py-3">Ref. Pesanan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-2.5 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    <span
                      className={`font-semibold px-2 py-0.5 rounded text-[10px] ${
                        log.role === 'owner'
                          ? 'bg-purple-100 text-purple-900 font-bold'
                          : log.role === 'admin'
                          ? 'bg-blue-100 text-blue-900 font-bold'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {log.actor}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-bold text-[#12202F] whitespace-nowrap">
                    {log.action}
                  </td>
                  <td className="px-4 py-2.5 text-slate-600 max-w-md">
                    {log.details}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-slate-500">
                    {log.bookingCode || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
