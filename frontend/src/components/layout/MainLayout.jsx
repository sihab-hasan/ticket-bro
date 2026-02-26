import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Navbar from './Navbar';
import Footer from './Footer';


const MainLayout = () => {
  return (
    <div>
      <Header/>
      <Navbar/>
      <main className="min-h-screen">
        <Outlet />
      </main>
      <Footer/>
    </div>
  );
};
export default MainLayout;