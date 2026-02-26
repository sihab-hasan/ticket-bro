// frontend/src/components/layout/AuthLayout.jsx
import React, { useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Ticket, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const AuthLayout = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/profile');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Side - Branding */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-12 flex-col justify-between relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        </div>

        {/* Logo */}
        <Link to="/" className="relative z-10 flex items-center gap-2 text-white">
          <Ticket className="h-8 w-8" />
          <span className="text-2xl font-bold">TicketBro</span>
        </Link>

        {/* Content */}
        <div className="relative z-10 text-white max-w-md mx-auto">
          <h1 className="text-4xl font-bold mb-6">Welcome Back!</h1>
          <p className="text-lg text-white/90 mb-8">
            Your premier destination for tickets to the best events worldwide.
          </p>
          
          {/* Features */}
          <div className="space-y-4">
            {[
              '🎫 Access to millions of tickets',
              '✨ Exclusive presales & offers',
              '🔒 Secure & guaranteed tickets',
              '⭐ 24/7 customer support'
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-yellow-300" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="relative z-10 text-white/60 text-sm">
          © 2024 TicketBro. All rights reserved.
        </p>
      </div>

      {/* Right Side - Auth Forms */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <Link to="/" className="md:hidden flex items-center justify-center gap-2 mb-8">
            <Ticket className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">TicketBro</span>
          </Link>

          {/* Auth Forms */}
          <Outlet />

          {/* Back to Home */}
          <div className="mt-8 text-center">
            <Link to="/" className="text-sm text-muted-foreground hover:text-primary">
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;