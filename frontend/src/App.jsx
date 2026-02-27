import React, { useState, useEffect } from 'react'
import AppRoutes from './app/AppRoutes'
import Providers from './app/Providers'
import ScrollToTop from './hooks/scrollToTop'
import AuthModal from './pages/auth/AuthModal'

const App = () => {
  return (
    <Providers>
      <ScrollToTop />
      <AppRoutes />
      <AuthModal />
    </Providers>
  )
}

export default App