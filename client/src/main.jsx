import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import { BlockchainProvider } from './context/BlockchainContext'
import './styles/tailwind.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <BlockchainProvider>
          <App />
        </BlockchainProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
