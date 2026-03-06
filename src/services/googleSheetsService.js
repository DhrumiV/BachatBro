import { dbService } from './db';
import syncService from './syncService';
import migrationService from './migrationService';

const SCOPES = 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file';
const REQUIRED_HEADERS = ['ID', 'Date', 'Month', 'Category', 'SubCategory', 'PaymentMethod', 'CardName', 'Amount', 'Type', 'Notes', 'CreatedAt', 'UpdatedAt'];

class GoogleSheetsService {
  constructor() {
    this.tokenClient = null;
    this.accessToken = null;
    this.isInitialized = false;
    this.tokenExpiry = null;
    
    // Token stored in localStorage for PWA persistence
    // This is the implicit flow token - expires in 1 hour
    // Full persistent auth (refresh tokens) is planned 
    // in Tasks 6-9 of the backend auth implementation
    this.restoreSession();
    
    // Run migration on initialization
    this.runMigration();
  }

  async runMigration() {
    try {
      const result = await migrationService.migrate();
      if (result.migrated && result.count > 0) {
        console.log(`✅ Migrated ${result.count} transactions to IndexedDB`);
      }
    } catch (error) {
      console.error('Migration failed:', error);
    }
  }

  restoreSession() {
    try {
      const savedToken = localStorage.getItem('bachatbro_auth_token');
      const savedExpiry = localStorage.getItem('bachatbro_token_expiry');
      
      if (savedToken && savedExpiry) {
        const expiryTime = parseInt(savedExpiry, 10);
        const now = Date.now();
        
        // Check if token is still valid (with 5 min buffer)
        if (expiryTime > now + 300000) {
          this.accessToken = savedToken;
          this.tokenExpiry = expiryTime;
          
          // Set token in sync service
          syncService.setAccessToken(savedToken);
          
          console.log('✅ Session restored from localStorage');
        } else {
          // Token expired, clear it
          this.clearSession();
          console.log('⚠️ Saved token expired');
        }
      }
    } catch (error) {
      console.error('Failed to restore session:', error);
    }
  }

  saveSession(token, expiresIn = 3600) {
    try {
      const expiryTime = Date.now() + (expiresIn * 1000);
      localStorage.setItem('bachatbro_auth_token', token);
      localStorage.setItem('bachatbro_token_expiry', expiryTime.toString());
      this.tokenExpiry = expiryTime;
      
      // Set token in sync service
      syncService.setAccessToken(token);
      
      console.log('✅ Session saved to localStorage');
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  }

  clearSession() {
    try {
      localStorage.removeItem('bachatbro_auth_token');
      localStorage.removeItem('bachatbro_token_expiry');
      this.accessToken = null;
      this.tokenExpiry = null;
    } catch (error) {
      console.error('Failed to clear session:', error);
    }
  }

  initClient() {
    return new Promise((resolve, reject) => {
      if (this.isInitialized) {
        resolve(true);
        return;
      }

      if (!window.google) {
        reject(new Error('Google Identity Services not loaded'));
        return;
      }

      if (!process.env.REACT_APP_GOOGLE_CLIENT_ID) {
        reject(new Error('Google Client ID not configured'));
        return;
      }

      try {
        this.tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
          scope: SCOPES,
          callback: () => {}, // Will be overridden in requestAccessToken
        });
        this.isInitialized = true;
        resolve(true);
      } catch (error) {
        reject(error);
      }
    });
  }

  requestAccessToken() {
    return new Promise((resolve, reject) => {
      if (!this.tokenClient) {
        reject(new Error('Token client not initialized. Call initClient() first.'));
        return;
      }

      this.tokenClient.callback = (response) => {
        if (response.error) {
          reject(new Error(response.error_description || response.error));
          return;
        }
        
        // Store token in memory and sessionStorage
        this.accessToken = response.access_token;
        this.saveSession(response.access_token, response.expires_in || 3600);
        resolve(response.access_token);
      };

      this.tokenClient.requestAccessToken({ prompt: 'consent' });
    });
  }

  isAuthenticated() {
    return !!this.accessToken;
  }

  async testConnection(sheetId) {
    if (!this.accessToken) {
      throw new Error('Not authenticated. Please sign in with Google.');
    }

    if (!sheetId || sheetId.trim() === '') {
      throw new Error('Sheet ID is required');
    }

    try {
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        }
      );

      if (response.status === 401) {
        this.clearSession(); // Clear invalid token
        throw new Error('Authentication expired. Please sign in again.');
      }

      if (response.status === 404) {
        throw new Error('Sheet not found. Check if Sheet ID is correct and you have access.');
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to connect to sheet');
      }

      return await response.json();
    } catch (error) {
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Network error. Check your internet connection.');
      }
      throw error;
    }
  }

  async validateAndSetupSheet(sheetId) {
    // Test connection first
    await this.testConnection(sheetId);

    // Check if headers exist and are correct
    const firstRow = await this.getFirstRow(sheetId);
    
    if (!firstRow || firstRow.length === 0) {
      // Empty sheet - create headers
      await this.createHeaders(sheetId);
      return { created: true, message: 'Headers created successfully' };
    }

    // Validate headers
    const headersMatch = REQUIRED_HEADERS.every((header, index) => firstRow[index] === header);
    
    if (!headersMatch) {
      // Headers don't match - recreate them
      await this.clearAndCreateHeaders(sheetId);
      return { created: true, message: 'Headers recreated (format was incorrect)' };
    }

    return { created: false, message: 'Sheet is ready' };
  }

  async getFirstRow(sheetId) {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1!A1:L1`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to read sheet');
    }

    const data = await response.json();
    return data.values?.[0] || [];
  }

  async clearAndCreateHeaders(sheetId) {
    // Clear all data
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1!A:Z:clear`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Create headers
    await this.createHeaders(sheetId);
  }

  async createHeaders(sheetId) {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1!A1:L1?valueInputOption=RAW`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: [REQUIRED_HEADERS],
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to create headers');
    }

    return await response.json();
  }

  async getTransactions(sheetId) {
    // Always load from IndexedDB first (single source of truth)
    const localTransactions = await dbService.getAllTransactions();
    
    // If offline, return local data immediately
    if (!navigator.onLine) {
      console.log('📴 Offline - loading from IndexedDB');
      return {
        transactions: localTransactions,
        fromCache: true,
        lastSynced: null
      };
    }

    if (!this.accessToken) {
      // Not authenticated but have local data
      if (localTransactions.length > 0) {
        return {
          transactions: localTransactions,
          fromCache: true,
          lastSynced: null
        };
      }
      throw new Error('Not authenticated. Please sign in with Google.');
    }

    try {
      // Pull latest data from Google Sheets and sync with IndexedDB
      await syncService.pullFromSheet(sheetId);
      
      // Return updated local data
      const updatedTransactions = await dbService.getAllTransactions();
      
      return {
        transactions: updatedTransactions,
        fromCache: false,
        lastSynced: Date.now()
      };
    } catch (error) {
      // Fetch failed - return local data if available
      if (error.message.includes('Failed to fetch') || error.message.includes('Network error')) {
        console.log('⚠️ Fetch failed - returning IndexedDB data');
        return {
          transactions: localTransactions,
          fromCache: true,
          lastSynced: null
        };
      }
      
      // Auth error or other error
      if (localTransactions.length > 0) {
        return {
          transactions: localTransactions,
          fromCache: true,
          lastSynced: null
        };
      }
      
      throw error;
    }
  }

  async addTransaction(sheetId, transaction) {
    // Step 1: Always save to IndexedDB first (single source of truth)
    const newTransaction = await dbService.addTransaction({
      ...transaction,
      syncStatus: 'pending'
    });
    
    console.log('✅ Transaction saved to IndexedDB:', newTransaction.id);

    // Step 2: If offline, return immediately
    if (!navigator.onLine) {
      console.log('📴 Offline - will sync when connected');
      return {
        success: true,
        offline: true,
        message: 'Saved offline · Will sync when connected',
        transaction: newTransaction
      };
    }

    // Step 3: If online, trigger background sync
    if (this.accessToken) {
      // Trigger sync in background (don't wait for it)
      syncService.syncPendingTransactions(sheetId).then(result => {
        if (result.success) {
          console.log('✅ Background sync completed');
        }
      }).catch(error => {
        console.error('Background sync failed:', error);
      });
    }

    return {
      success: true,
      offline: false,
      message: 'Transaction added successfully!',
      transaction: newTransaction
    };
  }

  async updateTransaction(sheetId, transactionId, transaction) {
    if (!this.accessToken) {
      throw new Error('Not authenticated. Please sign in with Google.');
    }

    // Step 1: Update in IndexedDB
    const updated = await dbService.updateTransaction(transactionId, {
      ...transaction,
      syncStatus: 'pending' // Mark as pending sync
    });

    if (!updated) {
      throw new Error('Transaction not found in local database');
    }

    // Step 2: Get sheet row index
    const localTransaction = await dbService.getTransaction(transactionId);
    if (!localTransaction.sheetRowIndex) {
      throw new Error('Transaction not yet synced to sheet');
    }

    const rowIndex = localTransaction.sheetRowIndex;

    const row = [
      localTransaction.id,
      localTransaction.date,
      localTransaction.month,
      localTransaction.category || '',
      localTransaction.subCategory || '',
      localTransaction.paymentMethod || '',
      localTransaction.cardName || '',
      localTransaction.amount,
      localTransaction.type || 'Expense',
      localTransaction.notes || '',
      localTransaction.createdAt,
      localTransaction.updatedAt
    ];

    try {
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1!A${rowIndex}:L${rowIndex}?valueInputOption=RAW`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            values: [row],
          }),
        }
      );

      if (response.status === 401) {
        this.clearSession();
        throw new Error('Authentication expired. Please sign in again.');
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to update transaction');
      }

      // Mark as synced
      await dbService.markAsSynced(transactionId, rowIndex);

      return await response.json();
    } catch (error) {
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Network error. Check your internet connection.');
      }
      throw error;
    }
  }

  async deleteTransaction(sheetId, transactionId) {
    if (!this.accessToken) {
      throw new Error('Not authenticated. Please sign in with Google.');
    }

    // Step 1: Get transaction from IndexedDB
    const transaction = await dbService.getTransaction(transactionId);
    if (!transaction) {
      throw new Error('Transaction not found in local database');
    }

    if (!transaction.sheetRowIndex || transaction.sheetRowIndex < 2) {
      // Transaction not yet synced or invalid row
      // Just delete from IndexedDB
      await dbService.deleteTransaction(transactionId);
      return { success: true, localOnly: true };
    }

    const rowIndex = transaction.sheetRowIndex;

    try {
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}:batchUpdate`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            requests: [
              {
                deleteDimension: {
                  range: {
                    sheetId: 0, // Sheet1 is always sheetId 0
                    dimension: 'ROWS',
                    startIndex: rowIndex - 1, // 0-indexed
                    endIndex: rowIndex,
                  },
                },
              },
            ],
          }),
        }
      );

      if (response.status === 401) {
        this.clearSession();
        throw new Error('Authentication expired. Please sign in again.');
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to delete transaction');
      }

      // Step 2: Delete from IndexedDB
      await dbService.deleteTransaction(transactionId);

      return await response.json();
    } catch (error) {
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Network error. Check your internet connection.');
      }
      throw error;
    }
  }

  signOut() {
    // Clear token from memory and sessionStorage
    this.clearSession();
  }

  getAuthStatus() {
    return {
      isAuthenticated: this.isAuthenticated(),
      isInitialized: this.isInitialized,
    };
  }
}

const googleSheetsServiceInstance = new GoogleSheetsService();
export default googleSheetsServiceInstance;
