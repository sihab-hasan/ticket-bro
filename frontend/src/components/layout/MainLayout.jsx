import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Navbar from './Navbar';
import Footer from './Footer';
import MobileBottomNav from './MobileBottomNav';
import Container from './Container';
import FloatingCartWidget from '../shared/FloatingCartWidget';
import FloatingTimerWidget from '../shared/FloatingClosingSoonWidget';
import { MAIN_LAYOUT_SHELL } from '@/config/layout-shell.config';
import { buildLayoutShellClassName } from '@/utils/layout-shell.utils';

const MainLayout = () => {
  const { pathname } = useLocation();
  const isHome = pathname === '/';
  const pageShellClassName = buildLayoutShellClassName(pathname, MAIN_LAYOUT_SHELL);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <Navbar />
      <Container
        as="main"
        fluid
        variant="full"
        className={MAIN_LAYOUT_SHELL.mainClassName}
      >
        <div className={`layout-page ${pageShellClassName}`}>
          <Outlet />
        </div>
      </Container>
      <Footer />
      <MobileBottomNav />
      <FloatingCartWidget />
      {isHome && <FloatingTimerWidget />}
    </div>
  );
};

export default MainLayout;
