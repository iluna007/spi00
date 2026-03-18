import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { FluxProvider } from './state/FluxProvider'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <FluxProvider>
      <App />
    </FluxProvider>
  </StrictMode>,
)
