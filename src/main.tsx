import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import NextToploader from 'nextjs-toploader'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
        <NextToploader
          color="linear-gradient(to right, #1958df, #1e7944)"
          height={4}
          showSpinner={false}
          shadow="0 0 10px #1958df"
        />
        <App />
  </StrictMode>,
)
