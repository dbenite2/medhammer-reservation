import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { TranslationProvider } from './i18n/useTranslate.tsx'
import './index.css'
import './styles/designTokesn.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TranslationProvider locale="es">
      <App />
    </TranslationProvider>
  </StrictMode>,
)
