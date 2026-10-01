import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './demo.css'
import { appearance } from './theme-controls'
import { App } from './App'

appearance.initialize()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
