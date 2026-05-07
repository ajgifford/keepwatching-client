import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './components/App';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

registerSW({
  onRegistered(registration) {
    if (registration) {
      setInterval(() => registration.update(), 60 * 60 * 1000);
    }
  },
  onOfflineReady() {
    window.dispatchEvent(new CustomEvent('sw-offline-ready'));
  },
});

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
