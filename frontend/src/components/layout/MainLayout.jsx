// frontend/src/components/layout/MainLayout.jsx
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Navbar from './Navbar';
import Footer from './Footer';
import MobileBottomNav from './MobileBottomNav';
import FloatingCartWidget from '../shared/FloatingCartWidget';
import FloatingTimerWidget from '../shared/FloatingClosingSoonWidget';

const MainLayout = () => {
  const { pathname } = useLocation();
  const isHome = pathname === '/';

  return (
    <div>
      <Header />
      <Navbar />
      {/* pb-16 xl:pb-0 — clears space for MobileBottomNav on mobile, removed on desktop */}
      <main className="min-h-screen pb-16 xl:pb-0">
        <Outlet />
      </main>
      <Footer />
      <MobileBottomNav />

      {/* ── Floating widgets ── */}
      <FloatingCartWidget />
      {isHome && <FloatingTimerWidget />}
    </div>
  );
};

export default MainLayout;