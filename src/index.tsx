import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './components/App';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

registerSW({
  onRegistered(registration) {
    if (registration) {
      setInterval(() => registration.update(), 60 * 60 * 1000);

      // iOS suspends timers for backgrounded PWAs, so the interval above may
      // never fire for an app left open for days. Checking on visibility
      // change catches the moment the user actually reopens the app.
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          registration.update();
        }
      });
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
