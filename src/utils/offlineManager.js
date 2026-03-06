// Offline Manager for BachatBro PWA
// Handles offline detection and triggers sync when online

import syncService from '../services/syncService';
import { dbService } from '../services/db';

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

  // Get pending transaction count
  async getPendingCount() {
    return await dbService.getPendingCount();
  }

  // Sync pending transactions when coming back online
  async syncPendingTransactions() {
    if (!this.isOnline) return { success: false, message: 'Offline' };

    try {
      // Get current user's sheet ID
      const currentUserName = localStorage.getItem('currentUser');
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find(u => u.name === currentUserName);
      
      if (!user || !user.sheetId) {
        return { success: false, message: 'No sheet connected' };
      }

      // Trigger sync
      const result = await syncService.syncPendingTransactions(user.sheetId);
      
      return result;
    } catch (error) {
      console.error('Sync failed:', error);
      return { success: false, message: error.message };
    }
  }
}

// Export singleton instance
const offlineManager = new OfflineManager();
export default offlineManager;
