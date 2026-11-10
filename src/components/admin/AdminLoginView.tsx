/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useRental } from '../../lib/context/RentalContext';
import { UserRole } from '../../types/rental';
import {
  Lock,
  ShieldCheck,
  ArrowLeft,
  KeyRound,
  UserCheck,
  AlertCircle,
  Sparkles,
  Info,
} from 'lucide-react';

export const AdminLoginView: React.FC = () => {
  const { loginAdmin, navigateTo } = useRental();
  const [selectedRole, setSelectedRole] = useState<'admin' | 'owner'>('admin');
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      const success = loginAdmin(selectedRole, pin);
      setIsLoading(false);
      if (!success) {
        setError(
          selectedRole === 'admin'
            ? 'PIN Petugas Lapangan salah! (Gunakan PIN default: 1234)'
            : 'PIN Owner salah! (Gunakan PIN default: 8888)'
        );
      }
    }, 350);
  };

  const handleQuickFill = (role: 'admin' | 'owner', testPin: string) => {
    setSelectedRole(role);
    setPin(testPin);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#F0F7F8] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative blurred background shapes */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#4FC3C8] opacity-15 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#12202F] opacity-10 rounded-full blur-3xl pointer-events-none translate-y-1/2 -translate-x-1/2" />

      {/* Back to Consumer site button */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 mb-4">
        <button
          onClick={() => navigateTo('home')}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#12202F] bg-white/80 hover:bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#248287]" />
          <span>Kembali ke Website Konsumen</span>
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl rounded-3xl border border-slate-200/80 relative z-10">
          {/* Header logo & title */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#12202F] text-white shadow-md mb-3">
              <Lock className="w-6 h-6 text-[#4FC3C8]" />
            </div>
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="font-heading font-black text-2xl text-[#12202F] tracking-tight">
                RAFA<span className="text-[#4FC3C8]">GO</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#12202F] text-[#4FC3C8] uppercase tracking-wider">
                Internal
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-800">
              Portal Akses Staf &amp; Pengelola
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Halaman operasional khusus kasir lapangan dan pemilik armada
            </p>
          </div>

          {/* Role selector tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => {
                setSelectedRole('admin');
                setError(null);
              }}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                selectedRole === 'admin'
                  ? 'bg-white text-[#12202F] shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <UserCheck className="w-4 h-4 text-[#248287]" />
              <span>Budi (Staff Kasir)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedRole('owner');
                setError(null);
              }}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                selectedRole === 'owner'
                  ? 'bg-[#12202F] text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-[#4FC3C8]" />
              <span>Fadel (Owner)</span>
            </button>
          </div>

          {/* Form Login */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>PIN / Sandi Keamanan</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  {selectedRole === 'admin' ? 'Staf Lapangan' : 'Pemilik Bisnis'}
                </span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  maxLength={12}
                  placeholder={selectedRole === 'admin' ? 'Masukkan PIN Petugas...' : 'Masukkan PIN Owner...'}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4FC3C8] font-mono tracking-widest transition-all"
                  required
                  autoFocus
                />
                <KeyRound className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !pin.trim()}
              className="w-full py-3 bg-[#12202F] text-white font-heading font-bold text-sm rounded-xl hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <span>Memverifikasi Akses...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-[#4FC3C8]" />
                  <span>Masuk ke Dashboard {selectedRole === 'owner' ? 'Owner' : 'Kasir'}</span>
                </>
              )}
            </button>
          </form>

          {/* Demo Quick-Login Credentials helper box */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-slate-400" />
              Kredensial Akses Cepat (Testing):
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickFill('admin', '1234')}
                className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-[#EBF9FA] hover:border-[#4FC3C8] transition-all text-left cursor-pointer"
              >
                <p className="font-bold text-slate-800">Staff Admin</p>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">PIN: 1234</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('owner', '8888')}
                className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-[#12202F] hover:text-white transition-all text-left cursor-pointer group"
              >
                <p className="font-bold text-slate-800 group-hover:text-white">Owner Utama</p>
                <p className="text-[11px] text-slate-500 group-hover:text-slate-300 font-mono mt-0.5">PIN: 8888</p>
              </button>
            </div>
          </div>
        </div>

        {/* Security disclaimer footer */}
        <p className="text-center text-[11px] text-slate-500 mt-4">
          Konsumen umum tidak perlu login. Pemesanan sepeda dilakukan langsung melalui beranda.
        </p>
      </div>
    </div>
  );
};
