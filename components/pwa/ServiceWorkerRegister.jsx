'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    // Only register on HTTPS or in production environments to prevent dev HMR interference
    const isProduction =
      process.env.NODE_ENV === 'production' ||
      window.location.protocol === 'https:';

    if (!isProduction) return;

    const registerWorker = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });

        // Check for updates periodically
        registration.addEventListener('updatefound', () => {
          const installingWorker = registration.installing;
          if (!installingWorker) return;

          installingWorker.addEventListener('statechange', () => {
            if (
              installingWorker.state === 'installed' &&
              navigator.serviceWorker.controller
            ) {
              // A new service worker has been installed and is ready
            }
          });
        });
      } catch (err) {
        // Silently capture any registration errors without breaking UI
        if (process.env.NODE_ENV !== 'production') {
          console.warn('Service worker registration failed:', err);
        }
      }
    };

    if (document.readyState === 'complete') {
      registerWorker();
    } else {
      window.addEventListener('load', registerWorker);
      return () => window.removeEventListener('load', registerWorker);
    }
  }, []);

  return null;
}
