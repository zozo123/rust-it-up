import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './finish.css'
import App from './App.tsx'

// GitHub Pages SPA redirect restore (see public/404.html)
const redirect = sessionStorage.redirect
delete sessionStorage.redirect
if (redirect && redirect !== location.href) {
  history.replaceState(null, '', redirect.replace(location.origin, ''))
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
