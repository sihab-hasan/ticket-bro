import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import 'leaflet/dist/leaflet.css'
import "@/styles/index.css";
// import "@/styles/main.theme.css";
 
// main.jsx

import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store";
import { Toaster } from "react-hot-toast";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'var(--card)',
              color: 'var(--foreground)',
              border: '1px solid var(--border)',
              borderRadius: 'calc(var(--radius) * 3)',
              fontFamily: 'var(--font-sans)',
              fontSize: '13px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
            },
          }}
        />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);