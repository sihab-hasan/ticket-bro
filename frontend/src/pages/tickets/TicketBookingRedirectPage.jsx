import React from 'react';
import { Navigate } from 'react-router-dom';
import { ROUTES } from '@/app/AppRoutes';

const TicketBookingRedirectPage = () => (
  <Navigate to={ROUTES.CART.CHECKOUT} replace />
);

export default TicketBookingRedirectPage;
