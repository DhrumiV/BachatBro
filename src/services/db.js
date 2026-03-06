// IndexedDB Database Service using Dexie.js
// Single source of truth for all transaction data

import Dexie from 'dexie';

// Initialize Dexie database
const db = new Dexie('bachatbro_db');

// Define schema
db.version(1).stores({
  transactions: 'id, date, month, category, subCategory, paymentMethod, cardName, amount, type, syncStatus, createdAt, updatedAt, sheetRowIndex'
});

// Transaction model with default values
class Transaction {
  constructor(data) {
    this.id = data.id || crypto.randomUUID();
    this.date = data.date || '';
    this.month = data.month || '';
    this.category = data.category || '';
    this.subCategory = data.subCategory || '';
    this.paymentMethod = data.paymentMethod || '';
    this.cardName = data.cardName || '';
    this.amount = data.amount || 0;
    this.type = data.type || 'Expense';
    this.notes = data.notes || '';
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    this.sheetRowIndex = data.sheetRowIndex || null;
    this.syncStatus = data.syncStatus || 'pending'; // 'pending' | 'synced' | 'failed'
  }
}

// Database operations
const dbService = {
  // Get all transactions
  async getAllTransactions() {
    return await db.transactions.orderBy('date').reverse().toArray();
  },

  // Get pending transactions (need sync)
  async getPendingTransactions() {
    return await db.transactions.where('syncStatus').equals('pending').toArray();
  },

  // Get failed transactions
  async getFailedTransactions() {
    return await db.transactions.where('syncStatus').equals('failed').toArray();
  },

  // Add new transaction
  async addTransaction(transactionData) {
    const transaction = new Transaction(transactionData);
    await db.transactions.add(transaction);
    return transaction;
  },

  // Update existing transaction
  async updateTransaction(id, updates) {
    const updatedData = {
      ...updates,
      updatedAt: new Date().toISOString()
    };
    await db.transactions.update(id, updatedData);
    return await db.transactions.get(id);
  },

  // Delete transaction
  async deleteTransaction(id) {
    await db.transactions.delete(id);
  },

  // Bulk add transactions (for migration and sync)
  async bulkAddTransactions(transactions) {
    const transactionObjects = transactions.map(t => new Transaction(t));
    await db.transactions.bulkAdd(transactionObjects);
    return transactionObjects;
  },

  // Bulk update transactions (after sync)
  async bulkUpdateTransactions(updates) {
    // updates is an array of { id, changes }
    await db.transaction('rw', db.transactions, async () => {
      for (const { id, changes } of updates) {
        await db.transactions.update(id, {
          ...changes,
          updatedAt: new Date().toISOString()
        });
      }
    });
  },

  // Mark transaction as synced
  async markAsSynced(id, sheetRowIndex) {
    await db.transactions.update(id, {
      syncStatus: 'synced',
      sheetRowIndex: sheetRowIndex,
      updatedAt: new Date().toISOString()
    });
  },

  // Mark transaction as failed
  async markAsFailed(id) {
    await db.transactions.update(id, {
      syncStatus: 'failed',
      updatedAt: new Date().toISOString()
    });
  },

  // Get transaction by ID
  async getTransaction(id) {
    return await db.transactions.get(id);
  },

  // Get transaction by sheet row index
  async getTransactionByRowIndex(rowIndex) {
    return await db.transactions.where('sheetRowIndex').equals(rowIndex).first();
  },

  // Clear all transactions (for testing/reset)
  async clearAllTransactions() {
    await db.transactions.clear();
  },

  // Get count of pending transactions
  async getPendingCount() {
    return await db.transactions.where('syncStatus').equals('pending').count();
  },

  // Check if database is empty
  async isEmpty() {
    const count = await db.transactions.count();
    return count === 0;
  }
};

export { db, dbService, Transaction };
