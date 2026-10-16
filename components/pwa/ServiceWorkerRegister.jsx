'use client';

import { useEffect, useState, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';

export default function ServiceWorkerRegister() {
  const [hasUpdate, setHasUpdate] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState(null);

  const handleUpdateReload = useCallback(() => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    }
    window.location.reload();
  }, [waitingWorker]);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    // Only register on HTTPS or in production environments to prevent dev HMR interference
    const isProduction =
      process.env.NODE_ENV === 'production' ||
      window.location.protocol === 'https:';

    if (!isProduction) return;

    let refreshing = false;
    const handleControllerChange = () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

    const registerWorker = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });

        // Check if an updated worker is already waiting
        if (registration.waiting) {
          setWaitingWorker(registration.waiting);
          setHasUpdate(true);
        }

        // Check for updates periodically
        registration.addEventListener('updatefound', () => {
          const installingWorker = registration.installing;
          if (!installingWorker) return;

          installingWorker.addEventListener('statechange', () => {
            if (
              installingWorker.state === 'installed' &&
              navigator.serviceWorker.controller
            ) {
              setWaitingWorker(installingWorker);
              setHasUpdate(true);
            }
          });
        });
      } catch (err) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('Service worker registration failed:', err);
        }
      }
    };

    if (document.readyState === 'complete') {
      registerWorker();
    } else {
      window.addEventListener('load', registerWorker);
      return () => {
        window.removeEventListener('load', registerWorker);
        navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
      };
    }

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
    };
  }, []);

  if (!hasUpdate) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-3.5 py-1.5 bg-slate-900/95 backdrop-blur-md text-white text-xs rounded-full shadow-xl border border-slate-700/80"
    >
      <span className="w-2 h-2 rounded-full bg-emerald-400" />
      <span className="text-[12px] font-medium text-slate-200">
        Pembaruan tersedia
      </span>
      <button
        type="button"
        onClick={handleUpdateReload}
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-medium text-[11px] transition-colors"
      >
        <RefreshCw className="w-3 h-3" />
        <span>Muat Ulang</span>
      </button>
    </div>
  );
}

