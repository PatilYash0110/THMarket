import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext.tsx'
import { ListingsProvider } from './context/ListingsContext.tsx'
import { MessagesProvider } from './context/MessagesContext.tsx'
import './styles/index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ListingsProvider>
          <MessagesProvider>
            <App />
          </MessagesProvider>
        </ListingsProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
