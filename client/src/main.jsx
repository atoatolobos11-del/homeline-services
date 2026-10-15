import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { CartProvider } from './context/CartContext.jsx'
import { DataProvider } from './context/DataContext.jsx'
import { initAuth } from './utils/auth.js'

// Restore the persisted Supabase session before first paint; components learn
// about it via AUTH_EVENT (App.jsx also waits for isAuthReady()).
initAuth()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <DataProvider>
      <CartProvider>
        <App />
      </CartProvider>
    </DataProvider>
  </React.StrictMode>,
)
