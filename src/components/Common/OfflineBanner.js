import React, { useState, useEffect } from 'react';
import offlineManager from '../../utils/offlineManager';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

const OfflineBanner = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showBanner, setShowBanner] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  useEffect(() => {
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

    return unsubscribe;
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncMessage('Syncing...');
    
    const result = await offlineManager.syncPendingTransactions();
    
    if (result.success && result.count > 0) {
      setSyncMessage(result.message);
    } else if (result.failed > 0) {
      setSyncMessage(`Synced ${result.count}, ${result.failed} failed`);
    }
    
    setIsSyncing(false);
  };

  if (!showBanner && isOnline) return null;

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isOnline ? 'bg-success/90' : 'bg-yellow-500/90'
    } backdrop-blur-sm`}>
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {isOnline ? (
            <Wifi className="w-5 h-5 text-white" />
          ) : (
            <WifiOff className="w-5 h-5 text-white" />
          )}
          <span className="text-white font-medium text-sm">
            {isOnline ? (
              syncMessage || 'Back online'
            ) : (
              "You're offline · Data will sync when reconnected"
            )}
          </span>
        </div>
        
        {isOnline && offlineManager.hasPendingTransactions() && !isSyncing && (
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
        
        {isOnline && !offlineManager.hasPendingTransactions() && (
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
