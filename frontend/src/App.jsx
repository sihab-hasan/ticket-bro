import React, { useState, useEffect } from 'react'
import AppRoutes from './app/AppRoutes'
import Providers from './app/Providers'
import ScrollToTop from './hooks/scrollToTop'
import AuthModal from './pages/auth/AuthModal'

const App = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  // Optional: a function to toggle the modal
  const toggleAuthModal = () => setIsAuthModalOpen(prev => !prev)

  // Scroll lock effect
  useEffect(() => {
    if (isAuthModalOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  }, [isAuthModalOpen])

  return (
    <Providers>
      <ScrollToTop />
      <AppRoutes />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </Providers>
  )
}

export default App