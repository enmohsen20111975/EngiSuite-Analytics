import { useEffect, useMemo, useState } from 'react';
import { Download, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { getOfflineCacheMetadata, warmOfflineCache } from '../services/apiClient';

function formatSyncTime(value) {
  if (!value) return 'Not downloaded yet';

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return 'Not downloaded yet';
  }

  return parsed.toLocaleString();
}

export default function OfflineStatusBanner() {
  const [meta, setMeta] = useState(() => getOfflineCacheMetadata());
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator === 'undefined' ? true : navigator.onLine,
  );
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const refreshStatus = () => {
      setMeta(getOfflineCacheMetadata());
      setIsOnline(typeof navigator === 'undefined' ? true : navigator.onLine);
    };

    const handleCacheUpdate = event => {
      setMeta(event.detail || getOfflineCacheMetadata());
      setIsOnline(typeof navigator === 'undefined' ? true : navigator.onLine);
    };

    window.addEventListener('engisuite:offline-cache-updated', handleCacheUpdate);
    window.addEventListener('online', refreshStatus);
    window.addEventListener('offline', refreshStatus);

    refreshStatus();

    return () => {
      window.removeEventListener('engisuite:offline-cache-updated', handleCacheUpdate);
      window.removeEventListener('online', refreshStatus);
      window.removeEventListener('offline', refreshStatus);
    };
  }, []);

  const toneClasses = useMemo(() => {
    if (!isOnline) {
      return 'border-amber-200 bg-amber-50/95 text-amber-900';
    }

    if (meta?.ready) {
      return 'border-emerald-200 bg-emerald-50/95 text-emerald-900';
    }

    return 'border-blue-200 bg-blue-50/95 text-blue-900';
  }, [isOnline, meta?.ready]);

  const message = !isOnline
    ? 'Offline mode is active and the app is using the downloaded engineering database.'
    : meta?.ready
      ? 'Offline engineering data is ready for local use on this device.'
      : 'Download the engineering database once so the app can keep working offline.';

  const handleSync = async () => {
    setIsSyncing(true);

    try {
      const nextMeta = await warmOfflineCache(true);
      setMeta(nextMeta);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[120] w-[min(92vw,360px)]">
      <div className={`pointer-events-auto rounded-2xl border shadow-lg backdrop-blur ${toneClasses}`}>
        <div className="flex items-start gap-3 px-4 py-3">
          <div className="mt-0.5">
            {!isOnline ? <WifiOff className="h-5 w-5" /> : <Download className="h-5 w-5" />}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold">
                {!isOnline ? 'Offline database in use' : 'Offline database ready'}
              </p>
              {isOnline && meta?.ready ? <Wifi className="h-4 w-4 opacity-70" /> : null}
            </div>

            <p className="mt-1 text-xs leading-5 opacity-90">{message}</p>
            <p className="mt-1 text-[11px] opacity-75">
              Last sync: {formatSyncTime(meta?.lastSyncAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-black/10 px-4 py-2">
          <span className="text-[11px] opacity-75">
            Cached sources: {meta?.syncedEndpoints?.length || 0}
          </span>

          <button
            type="button"
            onClick={handleSync}
            disabled={!isOnline || isSyncing}
            className="inline-flex items-center gap-1 rounded-lg border border-current/20 px-3 py-1.5 text-xs font-medium transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync now'}
          </button>
        </div>
      </div>
    </div>
  );
}
