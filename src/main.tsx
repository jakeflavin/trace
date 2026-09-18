import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import '@fontsource/andika/400.css'
import '@fontsource/andika/700.css'
import '@fontsource-variable/edu-vic-wa-nt-beginner'
import '@fontsource/cedarville-cursive'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
