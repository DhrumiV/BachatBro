import React, { useState, useEffect } from 'react';
import offlineManager from '../../utils/offlineManager';
import syncService from '../../services/syncService';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

const OfflineBanner = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showBanner, setShowBanner] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');
  const [pendingCount, setPendingCount] = useState(0);

  const updatePendingCount = async () => {
    const count = await offlineManager.getPendingCount();
    setPendingCount(count);
  };

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncMessage('Syncing...');
    
    const result = await offlineManager.syncPendingTransactions();
    
    if (result.success && result.count > 0) {
      setSyncMessage(result.message);
      await updatePendingCount();
      
      // Trigger a page reload to refresh data
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } else if (result.failed > 0) {
      setSyncMessage(`Synced ${result.count}, ${result.failed} failed`);
      await updatePendingCount();
    } else if (result.count === 0) {
      setSyncMessage('Nothing to sync');
    } else {
      setSyncMessage(result.message || 'Sync failed');
    }
    
    setIsSyncing(false);
  };

  useEffect(() => {
    // Update pending count on mount and periodically
    updatePendingCount();
    const interval = setInterval(updatePendingCount, 30000); // Every 30 seconds

    const unsubscribe = offlineManager.subscribe((status) => {
      setIsOnline(status === 'online');
      setShowBanner(true);

      if (status === 'online') {
        // Auto-sync when coming back online
        handleSync();
        
        // Auto-dismiss success banner after 3 seconds
        setTimeout(() => {
          setShowBanner(false);
        }, 3000);
      }
    });

    // Subscribe to sync events
    const unsubscribeSync = syncService.subscribe((event) => {
      if (event.type === 'sync_complete') {
        updatePendingCount();
      }
    });

    return () => {
      unsubscribe();
      unsubscribeSync();
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Always show banner if offline
  if (!isOnline) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500/90 backdrop-blur-sm text-black py-3 px-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <WifiOff className="w-5 h-5" />
            <span className="font-medium">
              You're offline
              {pendingCount > 0 && ` · ${pendingCount} transaction${pendingCount !== 1 ? 's' : ''} pending sync`}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Show banner temporarily when coming back online or syncing
  if (showBanner || isSyncing || syncMessage) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-success/90 backdrop-blur-sm text-white py-3 px-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {isSyncing ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <Wifi className="w-5 h-5" />
            )}
            <span className="font-medium">
              {syncMessage || 'Back online'}
            </span>
          </div>
          {!isSyncing && pendingCount > 0 && (
            <button
              onClick={handleSync}
              className="px-4 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
            >
              Sync Now ({pendingCount})
            </button>
          )}
        </div>
      </div>
    );
  }

  // Show pending count indicator if there are pending transactions
  if (pendingCount > 0) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500/90 backdrop-blur-sm text-black py-2 px-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <RefreshCw className="w-4 h-4" />
            <span className="text-sm font-medium">
              {pendingCount} transaction{pendingCount !== 1 ? 's' : ''} pending sync
            </span>
          </div>
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="px-3 py-1 bg-black/20 hover:bg-black/30 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
          >
            {isSyncing ? 'Syncing...' : 'Sync Now'}
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default OfflineBanner;
