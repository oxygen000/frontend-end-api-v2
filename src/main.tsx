import { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import NextToploader from 'nextjs-toploader';
import './index.css';
import './styles/rtl.css'; // Import RTL styles
import App from './App.tsx';
import './i18n'; // Import i18n configuration

// Loading spinner component for Suspense fallback
const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense fallback={<LoadingSpinner />}>
      <NextToploader
        color="linear-gradient(to right, #1958df, #1e7944)"
        height={4}
        showSpinner={false}
        shadow="0 0 10px #1958df"
      />
      <App />
    </Suspense>
  </StrictMode>
);
