import React from 'react';
import { Navigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes.config';

const TicketBookingRedirectPage = () => (
  <Navigate to={ROUTES.CART.CHECKOUT} replace />
);

export default TicketBookingRedirectPage;
