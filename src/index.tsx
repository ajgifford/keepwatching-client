import React from 'react';
import ReactDOM from 'react-dom/client';

import { registerSW } from 'virtual:pwa-register';

import App from './components/App';
import './index.css';

const updateSW = registerSW({
  onNeedRefresh() {
    window.dispatchEvent(new CustomEvent('sw-update-available', { detail: { updateSW } }));
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
