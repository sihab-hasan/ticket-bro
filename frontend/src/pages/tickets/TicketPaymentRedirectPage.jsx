import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { ROUTES } from '@/config/routes.config';

const TicketPaymentRedirectPage = () => {
  const { bookingId } = useParams();
  return <Navigate to={ROUTES.PAYMENTS.ROOT(bookingId)} replace />;
};

export default TicketPaymentRedirectPage;
