# Quick Start - IndexedDB Refactor

## 🎯 What Changed?

**Before**: localStorage (cache + queue)  
**After**: IndexedDB (single source of truth)

## 🚀 Quick Start

### For Developers

1. **No setup required** - Dexie.js already installed
2. **Auto-migration** - Runs on first load
3. **No breaking changes** - All existing features work

### For Users

1. **No action needed** - Everything works automatically
2. **Offline mode** - Add transactions offline, auto-syncs when online
3. **Sync status** - See "Pending Sync" badges on transactions

## 📁 Key Files

```
src/
├── services/
│   ├── db.js                    ← IndexedDB operations
│   ├── syncService.js           ← Sync with Google Sheets
│   ├── migrationService.js      ← Auto-migration
│   └── googleSheetsService.js   ← Updated to use IndexedDB
├── utils/
│   └── offlineManager.js        ← Simplified offline detection
└── components/
    └── Common/
        └── OfflineBanner.js     ← Sync status UI
```

## 🔧 Common Operations

### Add Transaction
```javascript
import { dbService } from './services/db';

await dbService.addTransaction({
  date: '2024-03-15',
  category: 'Food',
  amount: 1500,
  type: 'Expense',
  syncStatus: 'pending'
});
```

### Get All Transactions
```javascript
const transactions = await dbService.getAllTransactions();
```

### Sync to Google Sheets
```javascript
import syncService from './services/syncService';

await syncService.syncPendingTransactions(sheetId);
```

### Check Pending Count
```javascript
const count = await dbService.getPendingCount();
```

## 🎨 UI Features

### Sync Status Badges
- 🟡 **Pending Sync** - Transaction waiting to sync
- 🔴 **Sync Failed** - Sync error, will retry
- ✅ **Synced** - Successfully synced to Google Sheets

### Offline Banner
- Shows when offline
- Displays pending transaction count
- Auto-syncs when coming back online
- Manual "Sync Now" button

## 🐛 Troubleshooting

### Migration Issues
```javascript
// Check if migration complete
await migrationService.isMigrationComplete()

// Force re-migration (testing only)
await migrationService.resetMigration()
```

### Sync Issues
```javascript
// Check pending transactions
const pending = await dbService.getPendingTransactions()

// Check failed transactions
const failed = await dbService.getFailedTransactions()

// Retry sync
await syncService.syncPendingTransactions(sheetId)
```

### Clear Database (testing only)
```javascript
await dbService.clearAllTransactions()
```

## 📊 Database Schema

```javascript
{
  id: 'uuid',                  // Auto-generated
  date: 'YYYY-MM-DD',
  month: 'YYYY-MM',
  category: 'string',
  subCategory: 'string',
  paymentMethod: 'string',
  cardName: 'string',
  amount: number,
  type: 'Expense|Income|EMI|Investment|Savings',
  notes: 'string',
  createdAt: 'ISO timestamp',
  updatedAt: 'ISO timestamp',
  sheetRowIndex: number | null,
  syncStatus: 'pending|synced|failed'
}
```

## ✅ Testing Scenarios

1. **Online Add**: Add transaction → Should sync immediately
2. **Offline Add**: Go offline → Add transaction → Should show "Pending Sync"
3. **Auto Sync**: Offline → Add transaction → Go online → Should auto-sync
4. **Manual Sync**: Click "Sync Now" → Should sync pending transactions
5. **View Offline**: Go offline → View transactions → Should load from IndexedDB
6. **Edit**: Edit synced transaction → Should update both IndexedDB and sheet
7. **Delete**: Delete synced transaction → Should remove from both

## 🔍 Debugging

### Check IndexedDB in Browser
1. Open DevTools (F12)
2. Go to "Application" tab
3. Expand "IndexedDB"
4. Find "bachatbro_db"
5. View "transactions" table

### Check Console Logs
- 🔄 Migration logs
- 📥 Sync logs
- ✅ Success messages
- ❌ Error messages

## 📞 Support

- Full docs: `INDEXEDDB_REFACTOR_COMPLETE.md`
- Summary: `REFACTOR_SUMMARY.md`
- This guide: `QUICK_START_INDEXEDDB.md`

---

**Ready to use!** 🚀
