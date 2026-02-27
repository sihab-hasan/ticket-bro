import React from 'react'
import AppRoutes from './app/AppRoutes'
import Providers from './app/Providers'
import ScrollToTop from './hooks/scrollToTop'

const App = () => {
  return (
    <Providers>
        <ScrollToTop/>
        <AppRoutes/>
    </Providers>
  )
}

export default App