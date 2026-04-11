import React, { useState, useEffect } from "react";
import AppRoutes from "./app/AppRoutes";
import Providers from "./app/Providers";
import AuthModal from "./components/auth/AuthModal";
import { NevigationToTop } from "./hooks/scrollToTop";
import CarbonFootprintDisplay from "./components/CarbonFootprintDisplay";

const App = () => {
  return (
    <Providers>
      <NevigationToTop />
      <AppRoutes />
      <AuthModal />
      <CarbonFootprintDisplay />
    </Providers>
  );
};

export default App;
