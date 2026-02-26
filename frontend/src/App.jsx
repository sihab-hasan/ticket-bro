import React from 'react'
import AppRoutes from './app/AppRoutes'
import Providers from './app/Providers'

const App = () => {
  return (
    <Providers>
        <AppRoutes/>
    </Providers>
  )
}

export default App