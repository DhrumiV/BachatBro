// Migration Service - Migrates localStorage data to IndexedDB
import { db, Transaction } from './db';

const MIGRATION_KEY = 'bachatbro_migration_complete';
const OLD_CACHE_KEY = 'bachatbro_transactions_cache';
const OLD_QUEUE_KEY = 'bachatbro_sync_queue';

class MigrationService {
  async isMigrationComplete() {
    return localStorage.getItem(MIGRATION_KEY) === 'true';
  }

  async markMigrationComplete() {
    localStorage.setItem(MIGRATION_KEY, 'true');
  }

  async migrate() {
    return await this.migrateFromLocalStorage();
  }

  async migrateFromLocalStorage() {
    try {
      // Check if migration already done
      if (await this.isMigrationComplete()) {
        console.log('✅ Migration already complete');
        return { success: true, message: 'Already migrated' };
      }

      console.log('🔄 Starting migration from localStorage to IndexedDB');

      let migratedCount = 0;
      let pendingCount = 0;

      // Step 1: Migrate cached transactions
      const cachedData = localStorage.getItem(OLD_CACHE_KEY);
      if (cachedData) {
        try {
          const parsed = JSON.parse(cachedData);
          const transactions = parsed.transactions || [];

          console.log(`📦 Found ${transactions.length} cached transactions`);

          for (const tx of transactions) {
            // Skip if it has _pending flag (will be migrated from queue)
            if (tx._pending) continue;

            const transaction = new Transaction({
              date: tx.date,
              month: tx.month,
              category: tx.category,
              subCategory: tx.subCategory,
              paymentMethod: tx.paymentMethod,
              cardName: tx.cardName,
              amount: tx.amount,
              type: tx.type,
              notes: tx.notes,
              sheetRowIndex: tx.rowIndex || null,
              syncStatus: 'synced', // Cached transactions are already synced
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            });

            await db.transactions.add(transaction);
            migratedCount++;
          }

          console.log(`✅ Migrated ${migratedCount} synced transactions`);
        } catch (error) {
          console.error('Failed to migrate cached transactions:', error);
        }
      }

      // Step 2: Migrate sync queue (pending transactions)
      const queueData = localStorage.getItem(OLD_QUEUE_KEY);
      if (queueData) {
        try {
          const queue = JSON.parse(queueData);
          console.log(`📦 Found ${queue.length} pending transactions in queue`);

          for (const tx of queue) {
            const transaction = new Transaction({
              date: tx.date,
              month: tx.month,
              category: tx.category,
              subCategory: tx.subCategory,
              paymentMethod: tx.paymentMethod,
              cardName: tx.cardName,
              amount: tx.amount,
              type: tx.type,
              notes: tx.notes,
              sheetRowIndex: null,
              syncStatus: 'pending', // Queue items are pending sync
              createdAt: tx._queuedAt ? new Date(tx._queuedAt).toISOString() : new Date().toISOString(),
              updatedAt: new Date().toISOString()
            });

            await db.transactions.add(transaction);
            pendingCount++;
          }

          console.log(`✅ Migrated ${pendingCount} pending transactions`);
        } catch (error) {
          console.error('Failed to migrate sync queue:', error);
        }
      }

      // Step 3: Mark migration as complete
      await this.markMigrationComplete();

      // Step 4: Clean up old localStorage keys
      localStorage.removeItem(OLD_CACHE_KEY);
      localStorage.removeItem(OLD_QUEUE_KEY);
      localStorage.removeItem('bachatbro_last_sync');

      console.log('✅ Migration complete and localStorage cleaned up');

      return {
        success: true,
        migratedCount,
        pendingCount,
        message: `Migrated ${migratedCount} synced and ${pendingCount} pending transactions`
      };
    } catch (error) {
      console.error('Migration failed:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Force re-migration (for testing or recovery)
  async resetMigration() {
    localStorage.removeItem(MIGRATION_KEY);
    await db.transactions.clear();
    console.log('🔄 Migration reset - ready to migrate again');
  }
}

const migrationService = new MigrationService();
export default migrationService;
