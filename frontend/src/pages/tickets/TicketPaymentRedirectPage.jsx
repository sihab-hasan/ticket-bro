import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { ROUTES } from '@/app/AppRoutes';
import Container from '@/components/layout/Container';

const TicketPaymentRedirectPage = () => {
  const { bookingId } = useParams();
  return <Navigate to={ROUTES.PAYMENTS.ROOT(bookingId)} replace />;
};

export default TicketPaymentRedirectPage;
