import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { AuthProvider } from './contexts/AuthContext';
import { MapProvider } from './contexts/MapContext';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import ErrorBoundary from './components/ErrorBoundary';

// Add some debug logging
console.log('Starting app initialization...');

const root = document.getElementById('root');
if (!root) {
  throw new Error('Root element not found');
}

createRoot(root).render(
  <ErrorBoundary>
    <StrictMode>
      <BrowserRouter>
        <I18nextProvider i18n={i18n}>
          <AuthProvider>
            <MapProvider>
              <App />
            </MapProvider>
          </AuthProvider>
        </I18nextProvider>
      </BrowserRouter>
    </StrictMode>
  </ErrorBoundary>
);