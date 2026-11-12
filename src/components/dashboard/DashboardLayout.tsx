/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useRental } from '../../lib/context/RentalContext';
import {
  LayoutDashboard,
  CheckSquare,
  Bike,
  UserPlus,
  Compass,
  FileBarChart,
  ArrowLeft,
  UserCog,
  ShieldCheck,
  Clock,
  Sparkles,
  LogOut,
} from 'lucide-react';
import { OverviewTab } from './OverviewTab';
import { PaymentVerificationTab } from './PaymentVerificationTab';
import { ActiveRentalsTab } from './ActiveRentalsTab';
import { WalkinTab } from './WalkinTab';
import { BikesManagementTab } from './BikesManagementTab';
import { TrackingCenterTab } from './TrackingCenterTab';
import { ReportsTab } from './ReportsTab';

export const DashboardLayout: React.FC = () => {
  const { userRole, setUserRole, navigateTo, bookings, logoutAdmin, bikes } = useRental();
  const [activeTab, setActiveTab] = useState<string>('overview');

  const pendingVerificationCount = bookings.filter((b) => b.status === 'menunggu_verifikasi').length;
  const activeRentalsCount = bookings.filter((b) => b.status === 'sedang_disewa').length;

  const tabs = [
    { id: 'overview', label: 'Ringkasan', icon: <LayoutDashboard className="w-4 h-4" /> },
    {
      id: 'verifikasi',
      label: 'Verifikasi Pembayaran',
      icon: <CheckSquare className="w-4 h-4" />,
      badge: pendingVerificationCount > 0 ? pendingVerificationCount : undefined,
    },
    {
      id: 'sewa',
      label: 'Penyewaan Aktif',
      icon: <Bike className="w-4 h-4" />,
      badge: activeRentalsCount > 0 ? activeRentalsCount : undefined,
    },
    { id: 'walkin', label: 'Walk-in Kasir', icon: <UserPlus className="w-4 h-4" /> },
    { id: 'sepeda', label: `Armada Sepeda (${bikes.length})`, icon: <Bike className="w-4 h-4" /> },
    { id: 'tracking', label: 'Tracking Center', icon: <Compass className="w-4 h-4" /> },
    { id: 'laporan', label: 'Laporan & Audit', icon: <FileBarChart className="w-4 h-4" /> },
  ];

  return (
    <div className="bg-[#FAFDFE] min-h-screen pb-16">
      {/* Top Internal Dashboard Bar */}
      <div className="bg-[#12202F] text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigateTo('home')}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
              title="Kembali ke portal konsumen"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Portal Konsumen</span>
            </button>
            <div className="border-l border-slate-700 pl-3">
              <div className="flex items-center gap-2">
                <span className="font-heading font-black text-xl text-white tracking-tight">
                  RAFA<span className="text-[#4FC3C8]">GO</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#4FC3C8] text-[#12202F] uppercase">
                  Internal Dashboard
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Sistem Operasional Rental Sepeda Per Jam
              </p>
            </div>
          </div>

          {/* User info & quick Role toggle */}
          <div className="flex items-center gap-3">
            <div className="text-right text-xs">
              <span className="text-slate-400 block text-[10px]">Login Sebagai:</span>
              <span className="font-bold text-[#4FC3C8]">
                {userRole === 'owner' ? 'Fadel (Owner)' : 'Budi (Admin Lapangan)'}
              </span>
            </div>

            <button
              onClick={() => setUserRole(userRole === 'owner' ? 'admin' : 'owner')}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-white font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <UserCog className="w-3.5 h-3.5 text-[#4FC3C8]" />
              <span>Ganti ke {userRole === 'owner' ? 'Admin' : 'Owner'}</span>
            </button>

            <button
              onClick={logoutAdmin}
              className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-xs text-rose-300 hover:text-white font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
              title="Keluar dari sesi pengelola"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation Sub-bar */}
      <div className="bg-white border-b border-[#E2EBF0] sticky top-0 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1 overflow-x-auto py-2.5 no-scrollbar">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-2 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#12202F] text-white shadow-xs'
                      : 'text-slate-600 hover:text-[#12202F] hover:bg-slate-50'
                  }`}
                >
                  <span className={isActive ? 'text-[#4FC3C8]' : 'text-slate-400'}>
                    {tab.icon}
                  </span>
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                        isActive ? 'bg-[#4FC3C8] text-[#12202F]' : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab Content Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {activeTab === 'overview' && <OverviewTab onSwitchTab={setActiveTab} />}
        {activeTab === 'verifikasi' && <PaymentVerificationTab />}
        {activeTab === 'sewa' && <ActiveRentalsTab />}
        {activeTab === 'walkin' && <WalkinTab />}
        {activeTab === 'sepeda' && <BikesManagementTab />}
        {activeTab === 'tracking' && <TrackingCenterTab />}
        {activeTab === 'laporan' && <ReportsTab />}
      </main>
    </div>
  );
};
