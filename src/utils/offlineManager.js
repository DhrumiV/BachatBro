// Offline Manager for BachatBro PWA
// Handles offline detection, caching, and sync queue

const CACHE_KEYS = {
  TRANSACTIONS: 'bachatbro_transactions_cache',
  SYNC_QUEUE: 'bachatbro_sync_queue',
  LAST_SYNC: 'bachatbro_last_sync'
};

class OfflineManager {
  constructor() {
    this.isOnline = navigator.onLine;
    this.listeners = [];
    this.setupListeners();
  }

  setupListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notifyListeners('online');
      this.syncPendingTransactions();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyListeners('offline');
    });
  }

  // Subscribe to online/offline events
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  notifyListeners(status) {
    this.listeners.forEach(callback => callback(status));
  }

  // Cache transactions
  cacheTransactions(transactions) {
    try {
      localStorage.setItem(CACHE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
      localStorage.setItem(CACHE_KEYS.LAST_SYNC, new Date().toISOString());
      return true;
    } catch (error) {
      console.error('Failed to cache transactions:', error);
      return false;
    }
  }

  // Get cached transactions
  getCachedTransactions() {
    try {
      const cached = localStorage.getItem(CACHE_KEYS.TRANSACTIONS);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Failed to get cached transactions:', error);
      return null;
    }
  }

  // Get last sync timestamp
  getLastSyncTime() {
    return localStorage.getItem(CACHE_KEYS.LAST_SYNC);
  }

  // Add transaction to sync queue
  addToSyncQueue(transaction) {
    try {
      const queue = this.getSyncQueue();
      queue.push({
        ...transaction,
        _queuedAt: new Date().toISOString(),
        _id: Date.now() + Math.random() // Temporary ID
      });
      localStorage.setItem(CACHE_KEYS.SYNC_QUEUE, JSON.stringify(queue));
      return true;
    } catch (error) {
      console.error('Failed to add to sync queue:', error);
      return false;
    }
  }

  // Get sync queue
  getSyncQueue() {
    try {
      const queue = localStorage.getItem(CACHE_KEYS.SYNC_QUEUE);
      return queue ? JSON.parse(queue) : [];
    } catch (error) {
      console.error('Failed to get sync queue:', error);
      return [];
    }
  }

  // Clear sync queue
  clearSyncQueue() {
    localStorage.removeItem(CACHE_KEYS.SYNC_QUEUE);
  }

  // Sync pending transactions
  async syncPendingTransactions() {
    if (!this.isOnline) return { success: false, message: 'Offline' };

    const queue = this.getSyncQueue();
    if (queue.length === 0) return { success: true, count: 0 };

    try {
      // Import googleSheetsService dynamically to avoid circular dependencies
      const { default: googleSheetsService } = await import('../services/googleSheetsService');
      
      const currentUserName = localStorage.getItem('currentUser');
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find(u => u.name === currentUserName);
      
      if (!user || !user.sheetId) {
        return { success: false, message: 'No sheet connected' };
      }

      let synced = 0;
      const failed = [];
      const syncedTempIds = [];

      for (const transaction of queue) {
        try {
          // Remove internal flags before syncing
          const cleanTransaction = { ...transaction };
          delete cleanTransaction._queuedAt;
          delete cleanTransaction._tempId;
          delete cleanTransaction._pending;
          delete cleanTransaction.rowIndex;
          
          await googleSheetsService.addTransaction(user.sheetId, cleanTransaction);
          synced++;
          
          // Track which temp IDs were successfully synced
          if (transaction._tempId) {
            syncedTempIds.push(transaction._tempId);
          }
        } catch (error) {
          console.error('Failed to sync transaction:', error);
          failed.push(transaction);
        }
      }

      // Update queue with only failed transactions
      if (failed.length > 0) {
        localStorage.setItem(CACHE_KEYS.SYNC_QUEUE, JSON.stringify(failed));
      } else {
        this.clearSyncQueue();
      }

      // Remove _pending flag from synced transactions in cache
      if (syncedTempIds.length > 0) {
        const cached = localStorage.getItem(CACHE_KEYS.TRANSACTIONS);
        if (cached) {
          try {
            const data = JSON.parse(cached);
            // Remove pending transactions that were synced
            data.transactions = data.transactions.filter(t => 
              !t._tempId || !syncedTempIds.includes(t._tempId)
            );
            localStorage.setItem(CACHE_KEYS.TRANSACTIONS, JSON.stringify(data));
            console.log('✅ Removed', syncedTempIds.length, 'pending transactions from cache');
          } catch (error) {
            console.error('Failed to update cache after sync:', error);
          }
        }
      }

      return {
        success: true,
        count: synced,
        failed: failed.length,
        message: `Synced ${synced} transaction${synced !== 1 ? 's' : ''}`
      };
    } catch (error) {
      console.error('Sync failed:', error);
      return { success: false, message: error.message };
    }
  }

  // Check if there are pending transactions
  hasPendingTransactions() {
    return this.getSyncQueue().length > 0;
  }

  // Get pending count
  getPendingCount() {
    return this.getSyncQueue().length;
  }
}

// Export singleton instance
const offlineManager = new OfflineManager();
export default offlineManager;
