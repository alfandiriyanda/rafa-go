/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { RentalProvider, useRental } from './lib/context/RentalContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { Hero } from './components/public/Hero';
import { ThreeColumnFeatured } from './components/public/ThreeColumnFeatured';
import { RentalRulesSection } from './components/public/RentalRulesSection';
import { BikeCatalog } from './components/public/BikeCatalog';
import { BikeDetailModal } from './components/public/BikeDetailModal';
import { BookingModal } from './components/public/BookingModal';
import { PaymentView } from './components/public/PaymentView';
import { OrderLookupView } from './components/public/OrderLookupView';
import { QRScanView } from './components/public/QRScanView';
import { PolicyView } from './components/public/PolicyView';
import { FaqSection } from './components/public/FaqSection';
import { DashboardLayout } from './components/dashboard/DashboardLayout';
import { AdminLoginView } from './components/admin/AdminLoginView';

const AppContent: React.FC = () => {
  const { currentView } = useRental();

  // If in internal admin login portal
  if (currentView === 'admin-login') {
    return <AdminLoginView />;
  }

  // If in internal dashboard mode, render the dedicated dashboard shell
  if (currentView === 'dashboard') {
    return (
      <div className="min-h-screen bg-[#F3FBFB] text-[#12202F]">
        <DashboardLayout />
        <BikeDetailModal />
      </div>
    );
  }

  // Consumer-facing public pages
  return (
    <div className="min-h-screen flex flex-col bg-[#F3FBFB] text-[#12202F] relative">
      {/* Faint line-art bicycle sketch watermark from design.md */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 flex items-center justify-center opacity-[0.035] select-none overflow-hidden"
      >
        <svg
          className="w-[900px] h-[900px] text-[#00696d]"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.8"
          viewBox="0 0 24 24"
        >
          <circle cx="5.5" cy="17.5" r="3.5"></circle>
          <circle cx="18.5" cy="17.5" r="3.5"></circle>
          <path
            d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5L8.5 9H12l2.5 4.5M5.5 17.5l4-8.5h4l3 5.5h2"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></path>
          <path d="M12 17.5l3.5-7.5M14 6h3" strokeLinecap="round" strokeLinejoin="round"></path>
        </svg>
      </div>

      <Navbar />

      <main className="flex-1 relative z-10">
        {currentView === 'home' && (
          <>
            <Hero />
            <ThreeColumnFeatured />
            <div id="cara-sewa">
              <RentalRulesSection />
            </div>
            <div id="katalog-lengkap">
              <BikeCatalog />
            </div>
            <div id="faq">
              <FaqSection />
            </div>
          </>
        )}

        {currentView === 'katalog' && <BikeCatalog />}
        {currentView === 'pesan' && <BookingModal />}
        {currentView === 'bayar' && <PaymentView />}
        {currentView === 'pesanan' && <OrderLookupView />}
        {currentView === 's' && <QRScanView />}
        {currentView === 'kebijakan' && <PolicyView />}
      </main>

      <Footer />
      <BikeDetailModal />
    </div>
  );
};

export default function App() {
  return (
    <RentalProvider>
      <AppContent />
    </RentalProvider>
  );
}
