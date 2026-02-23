const SCOPES = 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file';
const REQUIRED_HEADERS = ['Date', 'Month', 'Category', 'SubCategory', 'PaymentMethod', 'CardName', 'Amount', 'Type', 'Notes'];

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
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1!A1:I1`,
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
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1!A1:I1?valueInputOption=RAW`,
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
    // If offline, return cached data immediately
    if (!navigator.onLine) {
      console.log('📴 Offline - loading from cache');
      const cached = localStorage.getItem('bachatbro_transactions_cache');
      if (cached) {
        try {
          const data = JSON.parse(cached);
          return {
            transactions: data.transactions || [],
            fromCache: true,
            lastSynced: data.lastSynced || null
          };
        } catch (error) {
          console.error('Failed to parse cached transactions:', error);
        }
      }
      return { transactions: [], fromCache: true, lastSynced: null };
    }

    if (!this.accessToken) {
      throw new Error('Not authenticated. Please sign in with Google.');
    }

    try {
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1!A2:I`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        }
      );

      if (response.status === 401) {
        this.clearSession();
        throw new Error('Authentication expired. Please sign in again.');
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to fetch transactions');
      }

      const data = await response.json();
      const rows = data.values || [];

      // Map rows to transaction objects with row index for edit/delete
      const transactions = rows.map((row, index) => ({
        rowIndex: index + 2, // Row 1 is headers, data starts at row 2
        date: row[0] || '',
        month: row[1] || '',
        category: row[2] || '',
        subCategory: row[3] || '',
        paymentMethod: row[4] || '',
        cardName: row[5] || '',
        amount: parseFloat(row[6]) || 0,
        type: row[7] || 'Expense',
        notes: row[8] || '',
      }));

      // Cache successful fetch
      localStorage.setItem('bachatbro_transactions_cache', JSON.stringify({
        transactions,
        lastSynced: Date.now()
      }));
      console.log('✅ Transactions cached');

      return {
        transactions,
        fromCache: false,
        lastSynced: Date.now()
      };
    } catch (error) {
      // Fetch failed even though online (bad connection, auth error, etc.)
      // Fall back to cache if available
      if (error.message.includes('Failed to fetch') || error.message.includes('Network error')) {
        console.log('⚠️ Fetch failed - falling back to cache');
        const cached = localStorage.getItem('bachatbro_transactions_cache');
        if (cached) {
          try {
            const data = JSON.parse(cached);
            return {
              transactions: data.transactions || [],
              fromCache: true,
              lastSynced: data.lastSynced || null
            };
          } catch (parseError) {
            console.error('Failed to parse cached transactions:', parseError);
          }
        }
      }
      throw error;
    }
  }

  async addTransaction(sheetId, transaction) {
    // If offline, add to sync queue and local cache
    if (!navigator.onLine) {
      console.log('📴 Offline - adding to sync queue');
      
      // Add to sync queue
      const queue = JSON.parse(localStorage.getItem('bachatbro_sync_queue') || '[]');
      const queuedTransaction = {
        ...transaction,
        _queuedAt: Date.now(),
        _tempId: `temp_${Date.now()}_${Math.random()}`,
        _pending: true
      };
      queue.push(queuedTransaction);
      localStorage.setItem('bachatbro_sync_queue', JSON.stringify(queue));
      
      // Also add to local cache so it shows up immediately
      const cached = localStorage.getItem('bachatbro_transactions_cache');
      if (cached) {
        try {
          const data = JSON.parse(cached);
          const newTransaction = {
            ...transaction,
            rowIndex: -1, // Temporary row index
            _pending: true,
            _tempId: queuedTransaction._tempId
          };
          data.transactions.unshift(newTransaction); // Add to beginning
          localStorage.setItem('bachatbro_transactions_cache', JSON.stringify(data));
        } catch (error) {
          console.error('Failed to update cache:', error);
        }
      }
      
      return {
        success: true,
        offline: true,
        message: 'Saved offline · Will sync when connected'
      };
    }

    if (!this.accessToken) {
      throw new Error('Not authenticated. Please sign in with Google.');
    }

    // Validate required fields
    if (!transaction.date || !transaction.category || !transaction.amount) {
      throw new Error('Date, Category, and Amount are required');
    }

    const row = [
      transaction.date,
      transaction.month,
      transaction.category || '',
      transaction.subCategory || '',
      transaction.paymentMethod || '',
      transaction.cardName || '',
      transaction.amount,
      transaction.type || 'Expense',
      transaction.notes || '',
    ];

    try {
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1!A:I:append?valueInputOption=RAW`,
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

      if (response.status === 401) {
        this.clearSession();
        throw new Error('Authentication expired. Please sign in again.');
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to add transaction');
      }

      return await response.json();
    } catch (error) {
      if (error.message.includes('Failed to fetch')) {
        // Network error - add to queue like offline mode
        console.log('⚠️ Network error - adding to sync queue');
        const queue = JSON.parse(localStorage.getItem('bachatbro_sync_queue') || '[]');
        queue.push({
          ...transaction,
          _queuedAt: Date.now(),
          _tempId: `temp_${Date.now()}_${Math.random()}`,
          _pending: true
        });
        localStorage.setItem('bachatbro_sync_queue', JSON.stringify(queue));
        
        return {
          success: true,
          offline: true,
          message: 'Network error · Added to sync queue'
        };
      }
      throw error;
    }
  }

  async updateTransaction(sheetId, rowIndex, transaction) {
    if (!this.accessToken) {
      throw new Error('Not authenticated. Please sign in with Google.');
    }

    if (!rowIndex || rowIndex < 2) {
      throw new Error('Invalid row index');
    }

    const row = [
      transaction.date,
      transaction.month,
      transaction.category || '',
      transaction.subCategory || '',
      transaction.paymentMethod || '',
      transaction.cardName || '',
      transaction.amount,
      transaction.type || 'Expense',
      transaction.notes || '',
    ];

    try {
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1!A${rowIndex}:I${rowIndex}?valueInputOption=RAW`,
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

      return await response.json();
    } catch (error) {
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Network error. Check your internet connection.');
      }
      throw error;
    }
  }

  async deleteTransaction(sheetId, rowIndex) {
    if (!this.accessToken) {
      throw new Error('Not authenticated. Please sign in with Google.');
    }

    if (!rowIndex || rowIndex < 2) {
      throw new Error('Invalid row index. Cannot delete header row.');
    }

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
