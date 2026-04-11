// frontend/src/components/layout/UserLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Container from "@/components/layout/Container";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import FloatingCartWidget from "@/components/shared/FloatingCartWidget";
import FloatingMessengerWidget from "@/components/shared/FloatingMessengerWidget";

const UserLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 w-full pb-16 xl:pb-0">
        <Container>
          <Outlet />
        </Container>
      </main>
      <Footer />
      <MobileBottomNav />
      <FloatingCartWidget />
      <FloatingMessengerWidget />
    </div>
  );
};

export default UserLayout;