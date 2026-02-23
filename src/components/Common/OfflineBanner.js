import React, { useState, useEffect } from 'react';
import offlineManager from '../../utils/offlineManager';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

const OfflineBanner = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showBanner, setShowBanner] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');
  const [lastSynced, setLastSynced] = useState(null);

  const updateLastSyncedTime = () => {
    const cached = localStorage.getItem('bachatbro_transactions_cache');
    if (cached) {
      try {
        const data = JSON.parse(cached);
        setLastSynced(data.lastSynced);
      } catch (error) {
        console.error('Failed to get last synced time:', error);
      }
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncMessage('Syncing...');
    
    const result = await offlineManager.syncPendingTransactions();
    
    if (result.success && result.count > 0) {
      setSyncMessage(result.message);
      updateLastSyncedTime();
      
      // Trigger a page reload to refresh data from Google Sheets
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } else if (result.failed > 0) {
      setSyncMessage(`Synced ${result.count}, ${result.failed} failed`);
    }
    
    setIsSyncing(false);
  };

  const getLastSyncedText = (timestamp) => {
    if (!timestamp) return 'Never synced';
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  };

  useEffect(() => {
    // Get last synced time on mount
    updateLastSyncedTime();

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

    // Update last synced time every minute
    const interval = setInterval(updateLastSyncedTime, 60000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Always show banner when offline
  if (!isOnline) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <WifiOff className="w-5 h-5 text-white" />
            <span className="text-white font-medium text-sm">
              You're offline · Showing data from {getLastSyncedText(lastSynced)}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Show banner temporarily when coming back online
  if (!showBanner) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-success/90 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Wifi className="w-5 h-5 text-white" />
          <span className="text-white font-medium text-sm">
            {syncMessage || 'Back online'}
          </span>
        </div>
        
        {offlineManager.hasPendingTransactions() && !isSyncing && (
          <button
            onClick={handleSync}
            className="flex items-center space-x-2 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-white" />
            <span className="text-white text-sm">Sync Now</span>
          </button>
        )}
        
        {isSyncing && (
          <RefreshCw className="w-5 h-5 text-white animate-spin" />
        )}
        
        {!offlineManager.hasPendingTransactions() && (
          <button
            onClick={() => setShowBanner(false)}
            className="text-white hover:text-white/80 text-xl leading-none"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

export default OfflineBanner;
