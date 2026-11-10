/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useRental } from '../../lib/context/RentalContext';
import {
  ShoppingBag,
  MessageCircle,
  Menu,
  X,
  Bike,
  ShieldCheck,
  LogOut,
  HelpCircle,
  FileText,
  Search,
  Home,
  CheckCircle,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currentView,
    navigateTo,
    cart,
    userRole,
    bookings,
    isAdminAuthenticated,
    logoutAdmin,
  } = useRental();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const pendingVerificationCount = bookings.filter(
    (b) => b.status === 'menunggu_verifikasi'
  ).length;

  // Navigasi mulus ke bagian halaman beranda
  const handleNavToSection = (sectionId: string) => {
    setMobileMenuOpen(false);
    if (currentView !== 'home') {
      navigateTo('home');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 150);
    } else {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#E2EBF0] shadow-[0_4px_20px_rgba(18,32,47,0.06)]">
      <div className="h-[72px] max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Left: Official Brand Logo (Standard Website Convention) */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              navigateTo('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center cursor-pointer focus:outline-none transition-transform hover:opacity-90"
            title="RAFA GO — Beranda"
          >
            <img
              src="/RAFA_GO_Logo.svg"
              alt="RAFA GO Logo"
              className="h-11 w-auto object-contain"
            />
          </button>
        </div>

        {/* Center: Standard Navigation Links (Desktop) */}
        <nav className="hidden lg:flex items-center gap-8">
          <button
            onClick={() => {
              navigateTo('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`font-heading text-sm cursor-pointer transition-colors relative py-1 ${
              currentView === 'home'
                ? 'text-[#00696D] font-bold'
                : 'text-[#5B6B7A] hover:text-[#12202F] font-medium'
            }`}
          >
            Beranda
            {currentView === 'home' && (
              <span className="w-full h-[2.5px] bg-[#00696D] rounded-full absolute -bottom-1 left-0"></span>
            )}
          </button>

          <button
            onClick={() => navigateTo('katalog')}
            className={`font-heading text-sm cursor-pointer transition-colors relative py-1 ${
              currentView === 'katalog'
                ? 'text-[#00696D] font-bold'
                : 'text-[#5B6B7A] hover:text-[#12202F] font-medium'
            }`}
          >
            Katalog Sepeda
            {currentView === 'katalog' && (
              <span className="w-full h-[2.5px] bg-[#00696D] rounded-full absolute -bottom-1 left-0"></span>
            )}
          </button>

          <button
            onClick={() => handleNavToSection('cara-sewa')}
            className="font-heading text-sm text-[#5B6B7A] hover:text-[#12202F] font-medium cursor-pointer transition-colors py-1"
          >
            Cara Sewa
          </button>

          <button
            onClick={() => handleNavToSection('katalog-lengkap')}
            className="font-heading text-sm text-[#5B6B7A] hover:text-[#12202F] font-medium cursor-pointer transition-colors py-1"
          >
            Daftar Tarif
          </button>

          <button
            onClick={() => navigateTo('kebijakan')}
            className={`font-heading text-sm cursor-pointer transition-colors relative py-1 ${
              currentView === 'kebijakan'
                ? 'text-[#00696D] font-bold'
                : 'text-[#5B6B7A] hover:text-[#12202F] font-medium'
            }`}
          >
            Syarat & Denda
            {currentView === 'kebijakan' && (
              <span className="w-full h-[2.5px] bg-[#00696D] rounded-full absolute -bottom-1 left-0"></span>
            )}
          </button>

          <button
            onClick={() => handleNavToSection('faq')}
            className="font-heading text-sm text-[#5B6B7A] hover:text-[#12202F] font-medium cursor-pointer transition-colors py-1"
          >
            Bantuan / FAQ
          </button>
        </nav>

        {/* Right Side Actions: Cek Pesanan, Keranjang, WhatsApp, & Tombol Sewa */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Cek Pesanan / Status Sewa */}
          <button
            onClick={() => navigateTo('pesanan')}
            className={`h-10 px-4 hidden md:inline-flex items-center justify-center rounded-xl font-heading text-xs font-semibold transition-all cursor-pointer border ${
              currentView === 'pesanan'
                ? 'bg-[#12202F] text-white border-[#12202F] shadow-xs'
                : 'bg-slate-50 text-[#12202F] border-slate-200 hover:bg-slate-100'
            }`}
          >
            Cek Pesanan
          </button>

          {/* Keranjang Sewa */}
          <button
            onClick={() => navigateTo('pesan')}
            className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#12202F] flex items-center justify-center transition-all cursor-pointer relative"
            title="Keranjang Sewa Sepeda"
          >
            <ShoppingBag className="w-5 h-5 text-slate-700" />
            {cart.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-[#00696D] text-white text-[10px] font-bold flex items-center justify-center border-2 border-white shadow-xs">
                {cart.length}
              </span>
            )}
          </button>

          {/* Hubungi WhatsApp CS */}
          <a
            href="https://wa.me/62876653342?text=Halo%20Admin%20RAFA%20GO%2C%20saya%20ingin%20tanya%20sewa%20sepeda%20di%20CitraRaya%20City"
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-xl bg-[#EBF9FA] text-[#00696D] hover:bg-[#D4F3F5] flex items-center justify-center transition-all"
            title="Hubungi WhatsApp Admin"
          >
            <MessageCircle className="w-5 h-5" />
          </a>

          {/* Primary CTA: Sewa Sekarang */}
          <button
            onClick={() => navigateTo(cart.length > 0 ? 'pesan' : 'katalog')}
            className="h-10 px-4 sm:px-5 inline-flex items-center justify-center rounded-xl btn-primary text-xs font-bold shadow-md cursor-pointer whitespace-nowrap"
          >
            Sewa Sekarang
          </button>

          {/* Staff Shortcut if logged in */}
          {isAdminAuthenticated && (
            <div className="hidden sm:flex items-center gap-1.5 pl-2 border-l border-slate-200">
              <button
                onClick={() => navigateTo('dashboard')}
                className="px-3 py-2 rounded-xl bg-[#12202F] text-white text-xs font-bold hover:bg-slate-800 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                title="Buka Dashboard Admin"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#4FC3C8]" />
                <span className="hidden xl:inline">
                  {userRole === 'owner' ? 'Owner' : 'Admin'}
                </span>
                {pendingVerificationCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                )}
              </button>
              <button
                onClick={logoutAdmin}
                className="p-2 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer"
            aria-label="Menu Navigasi"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-[#E2EBF0] px-4 pt-3 pb-6 space-y-1.5 shadow-lg animate-in slide-in-from-top-2 duration-200">
          <button
            onClick={() => {
              navigateTo('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left px-3.5 py-3 rounded-xl text-xs font-bold flex items-center gap-2.5 ${
              currentView === 'home'
                ? 'bg-[#EBF9FA] text-[#00696D]'
                : 'text-[#12202F] hover:bg-slate-50'
            }`}
          >
            <Home className="w-4 h-4 text-slate-500" />
            <span>Beranda</span>
          </button>

          <button
            onClick={() => {
              navigateTo('katalog');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left px-3.5 py-3 rounded-xl text-xs font-bold flex items-center gap-2.5 ${
              currentView === 'katalog'
                ? 'bg-[#EBF9FA] text-[#00696D]'
                : 'text-[#12202F] hover:bg-slate-50'
            }`}
          >
            <Bike className="w-4 h-4 text-slate-500" />
            <span>Katalog Sepeda</span>
          </button>

          <button
            onClick={() => handleNavToSection('cara-sewa')}
            className="w-full text-left px-3.5 py-3 rounded-xl text-xs font-semibold text-[#12202F] hover:bg-slate-50 flex items-center gap-2.5"
          >
            <CheckCircle className="w-4 h-4 text-slate-500" />
            <span>Cara Sewa Sepeda</span>
          </button>

          <button
            onClick={() => handleNavToSection('katalog-lengkap')}
            className="w-full text-left px-3.5 py-3 rounded-xl text-xs font-semibold text-[#12202F] hover:bg-slate-50 flex items-center gap-2.5"
          >
            <Search className="w-4 h-4 text-slate-500" />
            <span>Daftar Tarif Rental</span>
          </button>

          <button
            onClick={() => {
              navigateTo('pesanan');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left px-3.5 py-3 rounded-xl text-xs font-bold flex items-center gap-2.5 ${
              currentView === 'pesanan'
                ? 'bg-[#EBF9FA] text-[#00696D]'
                : 'text-[#12202F] hover:bg-slate-50'
            }`}
          >
            <FileText className="w-4 h-4 text-slate-500" />
            <span>Cek Status Pesanan / Sewa</span>
          </button>

          <button
            onClick={() => {
              navigateTo('kebijakan');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left px-3.5 py-3 rounded-xl text-xs font-bold flex items-center gap-2.5 ${
              currentView === 'kebijakan'
                ? 'bg-[#EBF9FA] text-[#00696D]'
                : 'text-[#12202F] hover:bg-slate-50'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-slate-500" />
            <span>Syarat & Kebijakan Denda</span>
          </button>

          <button
            onClick={() => handleNavToSection('faq')}
            className="w-full text-left px-3.5 py-3 rounded-xl text-xs font-semibold text-[#12202F] hover:bg-slate-50 flex items-center gap-2.5"
          >
            <HelpCircle className="w-4 h-4 text-slate-500" />
            <span>Bantuan & FAQ</span>
          </button>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <button
              onClick={() => {
                navigateTo(cart.length > 0 ? 'pesan' : 'katalog');
                setMobileMenuOpen(false);
              }}
              className="w-full py-3 text-center rounded-xl btn-primary text-xs font-bold shadow-sm"
            >
              Sewa Sepeda Sekarang
            </button>

            {isAdminAuthenticated && (
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => {
                    navigateTo('dashboard');
                    setMobileMenuOpen(false);
                  }}
                  className="flex-1 py-2.5 text-center rounded-xl bg-[#12202F] text-white text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4 text-[#4FC3C8]" />
                  Dashboard Admin
                </button>
                <button
                  onClick={() => {
                    logoutAdmin();
                    setMobileMenuOpen(false);
                  }}
                  className="px-4 py-2.5 text-center rounded-xl bg-rose-50 text-rose-700 text-xs font-bold"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
