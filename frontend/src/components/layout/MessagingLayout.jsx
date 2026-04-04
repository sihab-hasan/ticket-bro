// frontend/src/components/layout/MessagingLayout.jsx
// Full-height layout for /messages — no footer, header + bottom nav only.
// main is flex-1 min-h-0 so children can fill with h-full safely.
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '@/components/layout/Header';
import MobileBottomNav from '@/components/layout/MobileBottomNav';

const MessagingLayout = () => (
  // h-dvh: dynamic viewport height — accounts for browser chrome on mobile
  <div className="flex flex-col h-dvh bg-background overflow-hidden">
    {/* sticky header — h-14 mobile / h-16 desktop */}
    <Header />
    {/*
      flex-1 min-h-0: allows children to shrink below natural height (critical for flex scroll).
      pb-14 xl:pb-0: reserve space for MobileBottomNav (h-14) on mobile; gone on xl.
    */}
    <main className="flex-1 min-h-0 pb-14 xl:pb-0 overflow-hidden">
      <Outlet />
    </main>
    <MobileBottomNav />
  </div>
);

export default MessagingLayout;
