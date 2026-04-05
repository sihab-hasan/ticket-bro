import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import Container from '@/components/layout/Container';
import FloatingCartWidget from '@/components/shared/FloatingCartWidget';
import { USER_LAYOUT_SHELL } from '@/config/layout-shell.config';
import { buildLayoutShellClassName } from '@/utils/layout-shell.utils';

const UserLayout = () => {
  const { pathname } = useLocation();
  const pageShellClassName = buildLayoutShellClassName(pathname, USER_LAYOUT_SHELL);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <Container
        as="main"
        fluid
        variant="full"
        className={USER_LAYOUT_SHELL.mainClassName}
      >
        <div className={`layout-page ${pageShellClassName}`}>
          <Outlet />
        </div>
      </Container>
      <Footer />
      <MobileBottomNav />
      <FloatingCartWidget />
    </div>
  );
};

export default UserLayout;
