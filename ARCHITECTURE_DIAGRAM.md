# BachatBro IndexedDB Architecture

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
├─────────────────────────────────────────────────────────────────┤
│  ExpenseForm  │  History  │  Dashboard  │  OfflineBanner       │
└────────┬──────┴─────┬─────┴──────┬──────┴──────────┬───────────┘
         │            │            │                  │
         │            │            │                  │
         ▼            ▼            ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    GOOGLE SHEETS SERVICE                        │
│  - Authentication (OAuth 2.0)                                   │
│  - Add/Update/Delete Transactions                               │
│  - Triggers Migration & Sync                                    │
└────────┬────────────────────────────────────────────┬───────────┘
         │                                            │
         │                                            │
         ▼                                            ▼
┌──────────────────────┐                  ┌──────────────────────┐
│   MIGRATION SERVICE  │                  │    SYNC SERVICE      │
│  - One-time migrate  │                  │  - Push to Sheets    │
│  - localStorage → DB │                  │  - Pull from Sheets  │
│  - Cleanup old keys  │                  │  - Retry failed      │
└──────────┬───────────┘                  └──────────┬───────────┘
           │                                         │
           │                                         │
           ▼                                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATABASE SERVICE (db.js)                   │
│  - CRUD Operations                                              │
│  - Query by syncStatus                                          │
│  - Bulk Operations                                              │
└────────┬────────────────────────────────────────────────────────┘
         │
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    INDEXEDDB (Dexie.js)                         │
│  Database: bachatbro_db                                         │
│  Table: transactions                                            │
│  - id, date, month, category, subCategory                       │
│  - paymentMethod, cardName, amount, type, notes                 │
│  - createdAt, updatedAt, sheetRowIndex, syncStatus              │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow - Add Transaction

```
┌──────────────┐
│ User submits │
│    form      │
└──────┬───────┘
       │
       ▼
┌─────────────────────────────────────┐
│ googleSheetsService.addTransaction  │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│ dbService.addTransaction            │
│ - Generate UUID                     │
│ - Set syncStatus = 'pending'        │
│ - Save to IndexedDB                 │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│ UI updates immediately              │
│ Shows "Pending Sync" badge          │
└──────┬──────────────────────────────┘
       │
       ▼
    Online?
       │
   ┌───┴───┐
   │  Yes  │  No → Wait for online event
   └───┬───┘
       │
       ▼
┌─────────────────────────────────────┐
│ syncService.syncPendingTransactions │
│ - POST to Google Sheets API         │
│ - Get sheetRowIndex from response   │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│ dbService.markAsSynced              │
│ - Update syncStatus = 'synced'      │
│ - Set sheetRowIndex                 │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│ UI updates                          │
│ Removes "Pending Sync" badge        │
└─────────────────────────────────────┘
```

## Data Flow - Load Transactions

```
┌──────────────┐
│ User opens   │
│   History    │
└──────┬───────┘
       │
       ▼
┌─────────────────────────────────────┐
│ googleSheetsService.getTransactions │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│ dbService.getAllTransactions        │
│ - Query IndexedDB                   │
│ - Return immediately                │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│ UI displays transactions            │
│ (instant, from local DB)            │
└──────┬──────────────────────────────┘
       │
       ▼
    Online?
       │
   ┌───┴───┐
   │  Yes  │  No → Done
   └───┬───┘
       │
       ▼
┌─────────────────────────────────────┐
│ syncService.pullFromSheet           │
│ - GET from Google Sheets API        │
│ - Compare with local data           │
│ - Update IndexedDB if needed        │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│ UI refreshes with latest data       │
└─────────────────────────────────────┘
```

## Offline/Online Flow

```
┌──────────────┐
│ Browser goes │
│   OFFLINE    │
└──────┬───────┘
       │
       ▼
┌─────────────────────────────────────┐
│ offlineManager detects              │
│ - window.addEventListener('offline')│
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│ OfflineBanner shows                 │
│ "You're offline · X pending"        │
└─────────────────────────────────────┘
       │
       │ User adds transactions
       │ (saved to IndexedDB)
       │
       ▼
┌──────────────┐
│ Browser goes │
│   ONLINE     │
└──────┬───────┘
       │
       ▼
┌─────────────────────────────────────┐
│ offlineManager detects              │
│ - window.addEventListener('online') │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│ Auto-trigger sync                   │
│ syncService.syncPendingTransactions │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│ OfflineBanner shows                 │
│ "Syncing... X transactions"         │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│ Sync completes                      │
│ - Success: "Synced X transactions"  │
│ - Partial: "Synced X, Y failed"     │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│ Page reloads to refresh data        │
└─────────────────────────────────────┘
```

## Sync Status States

```
┌─────────────┐
│   PENDING   │ ← New transaction created
└──────┬──────┘
       │
       │ Sync attempt
       │
   ┌───┴───┐
   │Success│ Failure
   │       │
   ▼       ▼
┌────────┐ ┌────────┐
│ SYNCED │ │ FAILED │
└────────┘ └───┬────┘
              │
              │ Retry on next sync
              │
              └──────────┐
                         │
                         ▼
                    ┌─────────┐
                    │ PENDING │
                    └─────────┘
```

## Component Interaction

```
┌─────────────────────────────────────────────────────────────────┐
│                         App.js                                  │
└────────┬────────────────────────────────────────────┬───────────┘
         │                                            │
         ▼                                            ▼
┌──────────────────────┐                  ┌──────────────────────┐
│   AppContext         │                  │  OfflineBanner       │
│  - currentUser       │                  │  - Shows status      │
│  - isAuthenticated   │                  │  - Sync button       │
└──────────┬───────────┘                  └──────────┬───────────┘
           │                                         │
           │                                         │
           ▼                                         ▼
┌──────────────────────┐                  ┌──────────────────────┐
│   ExpenseForm        │                  │  offlineManager      │
│  - Add transaction   │◄─────────────────┤  - Detect online     │
└──────────┬───────────┘                  │  - Trigger sync      │
           │                               └──────────────────────┘
           │
           ▼
┌──────────────────────┐
│   History            │
│  - List transactions │
│  - Edit/Delete       │
│  - Show sync badges  │
└──────────────────────┘
```

## Storage Comparison

### Before (localStorage)
```
localStorage
├── bachatbro_transactions_cache (JSON string)
│   └── { transactions: [...], lastSynced: timestamp }
├── bachatbro_sync_queue (JSON string)
│   └── [{ transaction1 }, { transaction2 }, ...]
└── bachatbro_last_sync (timestamp)

Problems:
- Synchronous (blocks UI)
- JSON parse/stringify overhead
- Duplicate data (cache + queue)
- Limited to ~5-10MB
- No structured queries
```

### After (IndexedDB)
```
IndexedDB: bachatbro_db
└── transactions (table)
    ├── transaction1 { id, date, ..., syncStatus: 'synced' }
    ├── transaction2 { id, date, ..., syncStatus: 'pending' }
    └── transaction3 { id, date, ..., syncStatus: 'failed' }

Benefits:
- Asynchronous (non-blocking)
- No serialization overhead
- Single source of truth
- Unlimited storage
- Indexed queries
- Transaction support
```

## Migration Process

```
┌──────────────────────────────────────┐
│ App loads for first time after deploy│
└──────────┬───────────────────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│ googleSheetsService.runMigration     │
└──────────┬───────────────────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│ migrationService.migrate()           │
│ - Check if already migrated          │
└──────────┬───────────────────────────┘
           │
       Already?
           │
       ┌───┴───┐
       │  No   │  Yes → Skip
       └───┬───┘
           │
           ▼
┌──────────────────────────────────────┐
│ Read localStorage                    │
│ - bachatbro_transactions_cache       │
│ - bachatbro_sync_queue               │
└──────────┬───────────────────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│ Convert to IndexedDB format          │
│ - Cache → syncStatus: 'synced'       │
│ - Queue → syncStatus: 'pending'      │
└──────────┬───────────────────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│ Save to IndexedDB                    │
│ dbService.bulkAddTransactions        │
└──────────┬───────────────────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│ Clean up localStorage                │
│ - Remove old keys                    │
│ - Set migration flag                 │
└──────────┬───────────────────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│ Migration complete                   │
│ App continues normally               │
└──────────────────────────────────────┘
```

---

**Architecture**: Offline-First, Single Source of Truth (IndexedDB)  
**Sync**: Bidirectional (IndexedDB ↔ Google Sheets)  
**Performance**: Async, Indexed, Scalable
