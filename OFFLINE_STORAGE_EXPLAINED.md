# Offline Transaction Storage - Complete Guide

## Overview
BachatBro uses a dual-storage system to handle offline transactions, ensuring data is never lost and appears immediately in the UI.

## Storage Architecture

### 1. Transaction Cache (`bachatbro_transactions_cache`)
**Purpose**: Store all transactions for offline viewing

**Structure**:
```javascript
{
  transactions: [
    {
      rowIndex: 2,
      date: "2024-02-23",
      month: "2024-02",
      category: "Food",
      subCategory: "Lunch",
      paymentMethod: "UPI",
      cardName: "",
      amount: 250,
      type: "Expense",
      notes: "Office lunch"
    },
    // ... more transactions
  ],
  lastSynced: 1708704000000  // Timestamp in milliseconds
}
```

**When Updated**:
- ✅ After every successful fetch from Google Sheets
- ✅ Immediately when adding offline transaction
- ✅ After successful sync (removes pending transactions)

**Location**: `localStorage.getItem('bachatbro_transactions_cache')`

---

### 2. Sync Queue (`bachatbro_sync_queue`)
**Purpose**: Store transactions waiting to be synced to Google Sheets

**Structure**:
```javascript
[
  {
    date: "2024-02-23",
    month: "2024-02",
    category: "Food",
    subCategory: "Lunch",
    paymentMethod: "UPI",
    cardName: "",
    amount: 250,
    type: "Expense",
    notes: "Office lunch",
    _pending: true,              // Flag for UI display
    _tempId: "temp_1708704_0.123", // Unique temporary ID
    _queuedAt: 1708704000000,    // When queued
    rowIndex: -1                 // Temporary placeholder
  },
  // ... more pending transactions
]
```

**When Updated**:
- ✅ When transaction added offline
- ✅ When transaction added but network fails
- ✅ Cleared after successful sync

**Location**: `localStorage.getItem('bachatbro_sync_queue')`

---

## How It Works

### Scenario 1: Adding Transaction While Online
```javascript
1. User submits expense form
2. POST request to Google Sheets API
3. Success → Transaction saved to sheet
4. Next data fetch → Cache updated with new transaction
5. UI shows transaction immediately
```

### Scenario 2: Adding Transaction While Offline
```javascript
1. User submits expense form
2. Detect offline: navigator.onLine === false
3. Create transaction with special flags:
   {
     ...transactionData,
     _pending: true,
     _tempId: "temp_123_0.456",
     _queuedAt: Date.now(),
     rowIndex: -1
   }
4. Add to sync queue (bachatbro_sync_queue)
5. Add to transaction cache (bachatbro_transactions_cache)
6. UI shows transaction immediately with "Pending Sync" badge
7. Return success message: "Saved offline · Will sync when connected"
```

### Scenario 3: Coming Back Online
```javascript
1. Browser detects online: 'online' event fires
2. OfflineBanner triggers auto-sync
3. For each transaction in sync queue:
   a. Remove internal flags (_pending, _tempId, etc.)
   b. POST to Google Sheets API
   c. Track successfully synced _tempIds
4. Remove synced transactions from queue
5. Remove pending transactions from cache
6. Refresh data from Google Sheets
7. UI updates with real row indices
8. "Pending Sync" badges disappear
```

---

## Code Implementation

### Adding Offline Transaction
**File**: `src/services/googleSheetsService.js`

```javascript
async addTransaction(sheetId, transaction) {
  // Check if offline
  if (!navigator.onLine) {
    const newTransaction = {
      ...transaction,
      rowIndex: -1,
      _pending: true,
      _tempId: `temp_${Date.now()}_${Math.random()}`,
      _queuedAt: Date.now()
    };
    
    // STEP 1: Add to sync queue
    const queue = JSON.parse(
      localStorage.getItem('bachatbro_sync_queue') || '[]'
    );
    queue.push(newTransaction);
    localStorage.setItem('bachatbro_sync_queue', JSON.stringify(queue));
    
    // STEP 2: Add to cache (shows immediately in UI)
    const cached = localStorage.getItem('bachatbro_transactions_cache');
    if (cached) {
      const data = JSON.parse(cached);
      data.transactions.unshift(newTransaction); // Add to top
      localStorage.setItem('bachatbro_transactions_cache', JSON.stringify(data));
    }
    
    return {
      success: true,
      offline: true,
      message: 'Saved offline · Will sync when connected'
    };
  }
  
  // ... online logic
}
```

### Syncing Queued Transactions
**File**: `src/utils/offlineManager.js`

```javascript
async syncPendingTransactions() {
  const queue = this.getSyncQueue();
  if (queue.length === 0) return { success: true, count: 0 };
  
  let synced = 0;
  const syncedTempIds = [];
  
  for (const transaction of queue) {
    // Remove internal flags before syncing
    const cleanTransaction = { ...transaction };
    delete cleanTransaction._queuedAt;
    delete cleanTransaction._tempId;
    delete cleanTransaction._pending;
    delete cleanTransaction.rowIndex;
    
    try {
      await googleSheetsService.addTransaction(sheetId, cleanTransaction);
      synced++;
      syncedTempIds.push(transaction._tempId);
    } catch (error) {
      // Keep in queue for retry
    }
  }
  
  // Remove synced transactions from cache
  const cached = localStorage.getItem('bachatbro_transactions_cache');
  if (cached) {
    const data = JSON.parse(cached);
    data.transactions = data.transactions.filter(t => 
      !t._tempId || !syncedTempIds.includes(t._tempId)
    );
    localStorage.setItem('bachatbro_transactions_cache', JSON.stringify(data));
  }
  
  return { success: true, count: synced };
}
```

---

## UI Indicators

### Pending Badge
**File**: `src/components/History/History.js`

```javascript
{transaction._pending && (
  <span className="px-2 py-1 bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 rounded-lg text-xs font-medium">
    Pending Sync
  </span>
)}
```

### Disabled Actions
```javascript
{!transaction._pending ? (
  <>
    <button onClick={() => edit(transaction)}>✏️</button>
    <button onClick={() => delete(transaction)}>🗑️</button>
  </>
) : (
  <span className="text-xs text-secondary-text">Syncing...</span>
)}
```

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    USER ADDS TRANSACTION                 │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
                    ┌───────────────┐
                    │ Check Online? │
                    └───────────────┘
                     │              │
              Online │              │ Offline
                     ▼              ▼
         ┌──────────────────┐  ┌──────────────────┐
         │ POST to Google   │  │ Add to Sync      │
         │ Sheets API       │  │ Queue            │
         └──────────────────┘  └──────────────────┘
                     │              │
                     │              ▼
                     │          ┌──────────────────┐
                     │          │ Add to Cache     │
                     │          │ (with _pending)  │
                     │          └──────────────────┘
                     │              │
                     ▼              ▼
         ┌──────────────────────────────────────┐
         │     UI SHOWS TRANSACTION             │
         │  (with "Pending" badge if offline)   │
         └──────────────────────────────────────┘
                            │
                            ▼
                    ┌───────────────┐
                    │ Back Online?  │
                    └───────────────┘
                            │
                            ▼
                    ┌───────────────┐
                    │ Auto-Sync     │
                    │ Queue         │
                    └───────────────┘
                            │
                            ▼
                    ┌───────────────┐
                    │ Remove from   │
                    │ Queue & Cache │
                    └───────────────┘
                            │
                            ▼
                    ┌───────────────┐
                    │ Refresh from  │
                    │ Google Sheets │
                    └───────────────┘
```

---

## Storage Keys Reference

| Key | Purpose | Structure | Cleared When |
|-----|---------|-----------|--------------|
| `bachatbro_transactions_cache` | All transactions for offline viewing | `{transactions: [], lastSynced: timestamp}` | Never (updated) |
| `bachatbro_sync_queue` | Pending transactions to sync | `[{...transaction, _pending, _tempId}]` | After successful sync |
| `bachatbro_auth_token` | Google OAuth token | String | On sign out or expiry |
| `bachatbro_token_expiry` | Token expiration time | Timestamp | On sign out |
| `bachatbro_sheet_id` | Connected sheet ID | String | On sign out |

---

## Testing Offline Storage

### Test Case 1: Add Transaction Offline
1. Open app online
2. Turn off internet (DevTools → Network → Offline)
3. Add a transaction
4. Check localStorage:
   ```javascript
   JSON.parse(localStorage.getItem('bachatbro_sync_queue'))
   // Should show 1 transaction with _pending: true
   
   JSON.parse(localStorage.getItem('bachatbro_transactions_cache'))
   // Should show transaction at top of array
   ```
5. Go to Transactions page
6. Verify transaction appears with yellow "Pending Sync" badge

### Test Case 2: Sync When Back Online
1. Continue from Test Case 1
2. Turn internet back on
3. Wait for auto-sync (or click "Sync Now")
4. Check localStorage:
   ```javascript
   JSON.parse(localStorage.getItem('bachatbro_sync_queue'))
   // Should be empty []
   ```
5. Check Google Sheet
6. Verify transaction is there
7. Refresh app
8. Verify "Pending Sync" badge is gone

---

## Troubleshooting

### Transaction not appearing after adding offline
**Check**:
1. Is `bachatbro_transactions_cache` being updated?
2. Is component reloading data after add?
3. Check browser console for errors

### Transaction not syncing when back online
**Check**:
1. Is `bachatbro_sync_queue` populated?
2. Is auth token still valid?
3. Check OfflineBanner auto-sync logic
4. Check browser console for sync errors

### Duplicate transactions after sync
**Check**:
1. Is sync removing transactions from cache by `_tempId`?
2. Is page refreshing after sync?
3. Check if transaction has proper `_tempId`

---

## Future Enhancements

1. **Conflict Resolution**: Handle edits made offline vs online
2. **Batch Sync**: Sync multiple transactions in one API call
3. **Retry Logic**: Exponential backoff for failed syncs
4. **Sync Status**: Show detailed sync progress
5. **Offline Edits**: Allow editing pending transactions
6. **IndexedDB**: Move to IndexedDB for larger storage capacity
