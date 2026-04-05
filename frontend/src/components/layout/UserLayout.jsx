// frontend/src/components/layout/UserLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import Container from "@/components/layout/Container";

const UserLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 w-full pb-16 xl:pb-0">
        <Container className="py-6">
          <Outlet />
        </Container>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default UserLayout;