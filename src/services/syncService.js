// Sync Service - Handles synchronization between IndexedDB and Google Sheets
import { db, Transaction } from './db';

// Note: googleSheetsService import removed to avoid circular dependency
// We'll use direct API calls instead

class SyncService {
  constructor() {
    this.isSyncing = false;
    this.syncListeners = [];
    this.accessToken = null;
  }

  // Set access token (called by googleSheetsService)
  setAccessToken(token) {
    this.accessToken = token;
  }

  // Subscribe to sync events
  subscribe(callback) {
    this.syncListeners.push(callback);
    return () => {
      this.syncListeners = this.syncListeners.filter(cb => cb !== callback);
    };
  }

  notifyListeners(event) {
    this.syncListeners.forEach(callback => callback(event));
  }

  // Get all pending transactions
  async getPendingTransactions() {
    return await db.transactions
      .where('syncStatus')
      .equals('pending')
      .toArray();
  }

  // Get all failed transactions
  async getFailedTransactions() {
    return await db.transactions
      .where('syncStatus')
      .equals('failed')
      .toArray();
  }

  // Sync pending transactions to Google Sheets
  async syncToSheets(sheetId) {
    if (this.isSyncing) {
      console.log('⏳ Sync already in progress');
      return { success: false, message: 'Sync already in progress' };
    }

    if (!navigator.onLine) {
      console.log('📴 Offline - cannot sync');
      return { success: false, message: 'Offline' };
    }

    if (!sheetId) {
      return { success: false, message: 'No sheet ID provided' };
    }

    this.isSyncing = true;
    this.notifyListeners({ type: 'sync_start' });

    try {
      // Get all pending and failed transactions
      const pendingTransactions = await this.getPendingTransactions();
      const failedTransactions = await this.getFailedTransactions();
      const allToSync = [...pendingTransactions, ...failedTransactions];

      if (allToSync.length === 0) {
        this.isSyncing = false;
        return { success: true, count: 0, message: 'Nothing to sync' };
      }

      console.log(`🔄 Syncing ${allToSync.length} transactions to Google Sheets`);

      let synced = 0;
      let failed = 0;

      // Sync each transaction individually
      for (const transaction of allToSync) {
        try {
          // Add to Google Sheets using direct API call
          const row = [
            transaction.id,
            transaction.date,
            transaction.month,
            transaction.category || '',
            transaction.subCategory || '',
            transaction.paymentMethod || '',
            transaction.cardName || '',
            transaction.amount,
            transaction.type || 'Expense',
            transaction.notes || '',
            transaction.createdAt,
            transaction.updatedAt
          ];

          const response = await fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1!A:L:append?valueInputOption=RAW`,
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                values: [row],
              }),
            }
          );

          if (!response.ok) {
            throw new Error('Failed to add transaction to sheet');
          }

          const result = await response.json();
          
          // Extract row index from response
          // Response format: "Sheet1!A{row}:L{row}"
          const rowIndex = result.updates?.updatedRange 
            ? parseInt(result.updates.updatedRange.match(/\d+/)?.[0]) 
            : null;

          // Update transaction in IndexedDB
          await db.transactions.update(transaction.id, {
            syncStatus: 'synced',
            sheetRowIndex: rowIndex,
            updatedAt: new Date().toISOString()
          });

          synced++;
          console.log(`✅ Synced transaction ${transaction.id}`);
        } catch (error) {
          console.error(`❌ Failed to sync transaction ${transaction.id}:`, error);
          
          // Mark as failed
          await db.transactions.update(transaction.id, {
            syncStatus: 'failed',
            updatedAt: new Date().toISOString()
          });
          
          failed++;
        }
      }

      this.isSyncing = false;
      this.notifyListeners({ 
        type: 'sync_complete', 
        synced, 
        failed 
      });

      return {
        success: true,
        count: synced,
        failed,
        message: failed > 0 
          ? `Synced ${synced}, ${failed} failed` 
          : `Synced ${synced} transactions`
      };
    } catch (error) {
      this.isSyncing = false;
      this.notifyListeners({ type: 'sync_error', error });
      console.error('Sync error:', error);
      return { success: false, message: error.message };
    }
  }

  // Pull transactions from Google Sheets and update IndexedDB
  async pullFromSheet(sheetId) {
    if (!navigator.onLine) {
      console.log('📴 Offline - cannot pull from sheets');
      return { success: false, message: 'Offline' };
    }

    if (!this.accessToken) {
      return { success: false, message: 'Not authenticated' };
    }

    try {
      console.log('📥 Pulling transactions from Google Sheets');
      
      // Get transactions from Google Sheets using direct API call
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1!A2:L`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch transactions from sheet');
      }

      const data = await response.json();
      const rows = data.values || [];
      
      if (rows.length === 0) {
        console.log('No transactions in Google Sheets');
        return { success: true, count: 0 };
      }

      // Map rows to transaction objects
      const sheetTransactions = rows.map((row, index) => ({
        id: row[0] || crypto.randomUUID(), // Use ID from sheet or generate new
        rowIndex: index + 2, // Row 1 is headers, data starts at row 2
        date: row[1] || '',
        month: row[2] || '',
        category: row[3] || '',
        subCategory: row[4] || '',
        paymentMethod: row[5] || '',
        cardName: row[6] || '',
        amount: parseFloat(row[7]) || 0,
        type: row[8] || 'Expense',
        notes: row[9] || '',
        createdAt: row[10] || new Date().toISOString(),
        updatedAt: row[11] || new Date().toISOString()
      }));

      // Get all synced transactions from IndexedDB
      const localTransactions = await db.transactions
        .where('syncStatus')
        .equals('synced')
        .toArray();

      // Create a map of local transactions by sheetRowIndex
      const localMap = new Map();
      localTransactions.forEach(t => {
        if (t.sheetRowIndex) {
          localMap.set(t.sheetRowIndex, t);
        }
      });

      let added = 0;
      let updated = 0;

      // Process each sheet transaction
      for (const sheetTx of sheetTransactions) {
        const localTx = localMap.get(sheetTx.rowIndex);

        if (!localTx) {
          // New transaction from sheet - add to IndexedDB
          const newTransaction = new Transaction({
            ...sheetTx,
            sheetRowIndex: sheetTx.rowIndex,
            syncStatus: 'synced',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
          
          await db.transactions.add(newTransaction);
          added++;
        } else {
          // Transaction exists - check if sheet version is newer
          // For now, we trust the sheet as source of truth
          await db.transactions.update(localTx.id, {
            date: sheetTx.date,
            month: sheetTx.month,
            category: sheetTx.category,
            subCategory: sheetTx.subCategory,
            paymentMethod: sheetTx.paymentMethod,
            cardName: sheetTx.cardName,
            amount: sheetTx.amount,
            type: sheetTx.type,
            notes: sheetTx.notes,
            updatedAt: new Date().toISOString()
          });
          updated++;
        }
      }

      console.log(`✅ Pull complete: ${added} added, ${updated} updated`);
      
      return {
        success: true,
        added,
        updated,
        message: `Pulled ${added + updated} transactions`
      };
    } catch (error) {
      console.error('Pull error:', error);
      return { success: false, message: error.message };
    }
  }

  // Sync pending transactions (alias for syncToSheets)
  async syncPendingTransactions(sheetId) {
    return await this.syncToSheets(sheetId);
  }

  // Full sync: push pending, then pull from sheets
  async fullSync(sheetId) {
    console.log('🔄 Starting full sync');
    
    // Step 1: Push pending transactions
    const pushResult = await this.syncToSheets(sheetId);
    
    // Step 2: Pull from sheets to get latest data
    const pullResult = await this.pullFromSheet(sheetId);
    
    return {
      success: pushResult.success && pullResult.success,
      push: pushResult,
      pull: pullResult
    };
  }
}

// Export singleton instance
const syncService = new SyncService();
export default syncService;
