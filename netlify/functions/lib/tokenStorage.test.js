/**
 * Property-Based Tests for TokenStorage
 * Feature: persistent-auth
 * Uses fast-check for property-based testing
 */

const fc = require('fast-check');
const TokenStorage = require('./tokenStorage');

// Mock environment variables for testing
process.env.ENCRYPTION_KEY = 'a'.repeat(64);
process.env.TOKEN_STORE_TYPE = 'memory'; // Use in-memory for tests

describe('TokenStorage - Storage Round-Trip', () => {
  let tokenStorage;

  beforeEach(() => {
    tokenStorage = new TokenStorage();
  });

  // Feature: persistent-auth, Property 4: Token Storage Round-Trip
  test('stored tokens can be retrieved with same data', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 10, maxLength: 50 }), // sessionId
        fc.string({ minLength: 20, maxLength: 200 }), // refreshToken
        fc.emailAddress(), // userEmail
        async (sessionId, refreshToken, userEmail) => {
          // Store the token
          await tokenStorage.storeRefreshToken(sessionId, refreshToken, userEmail);
          
          // Retrieve the token
          const retrieved = await tokenStorage.getRefreshToken(sessionId);
          
          // Verify all data matches
          const tokenMatches = retrieved.refreshToken === refreshToken;
          const emailMatches = retrieved.userEmail === userEmail;
          const hasCreatedAt = typeof retrieved.createdAt === 'number';
          const hasLastUsed = typeof retrieved.lastUsed === 'number';
          
          // Clean up
          await tokenStorage.deleteRefreshToken(sessionId);
          
          return tokenMatches && emailMatches && hasCreatedAt && hasLastUsed;
        }
      ),
      { numRuns: 100 }
    );
  });

  // Property: Metadata includes required fields
  test('stored tokens include all required metadata', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 10, maxLength: 50 }),
        fc.string({ minLength: 20, maxLength: 200 }),
        fc.emailAddress(),
        async (sessionId, refreshToken, userEmail) => {
          await tokenStorage.storeRefreshToken(sessionId, refreshToken, userEmail);
          const retrieved = await tokenStorage.getRefreshToken(sessionId);
          
          // Check all required fields exist
          const hasRefreshToken = typeof retrieved.refreshToken === 'string';
          const hasUserEmail = typeof retrieved.userEmail === 'string';
          const hasCreatedAt = typeof retrieved.createdAt === 'number' && retrieved.createdAt > 0;
          const hasLastUsed = typeof retrieved.lastUsed === 'number' && retrieved.lastUsed > 0;
          
          // lastUsed should be >= createdAt
          const timestampsValid = retrieved.lastUsed >= retrieved.createdAt;
          
          await tokenStorage.deleteRefreshToken(sessionId);
          
          return hasRefreshToken && hasUserEmail && hasCreatedAt && hasLastUsed && timestampsValid;
        }
      ),
      { numRuns: 100 }
    );
  });

  // Property: lastUsed updates on retrieval
  test('lastUsed timestamp updates when token is retrieved', async () => {
    const sessionId = 'test-session-' + Date.now();
    const refreshToken = 'test-token-' + Math.random();
    const userEmail = 'test@example.com';
    
    // Store token
    await tokenStorage.storeRefreshToken(sessionId, refreshToken, userEmail);
    
    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 10));
    
    // Retrieve token
    const retrieved1 = await tokenStorage.getRefreshToken(sessionId);
    const firstLastUsed = retrieved1.lastUsed;
    
    // Wait a bit more
    await new Promise(resolve => setTimeout(resolve, 10));
    
    // Retrieve again
    const retrieved2 = await tokenStorage.getRefreshToken(sessionId);
    const secondLastUsed = retrieved2.lastUsed;
    
    // Clean up
    await tokenStorage.deleteRefreshToken(sessionId);
    
    // Second lastUsed should be greater than first
    expect(secondLastUsed).toBeGreaterThan(firstLastUsed);
  });

  // Property: Deleted tokens cannot be retrieved
  test('deleted tokens throw error on retrieval', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 10, maxLength: 50 }),
        fc.string({ minLength: 20, maxLength: 200 }),
        fc.emailAddress(),
        async (sessionId, refreshToken, userEmail) => {
          // Store token
          await tokenStorage.storeRefreshToken(sessionId, refreshToken, userEmail);
          
          // Delete token
          await tokenStorage.deleteRefreshToken(sessionId);
          
          // Try to retrieve - should throw
          try {
            await tokenStorage.getRefreshToken(sessionId);
            return false; // Should have thrown
          } catch (error) {
            return error.message === 'Session not found';
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  // Property: sessionExists returns correct boolean
  test('sessionExists returns true for existing sessions and false for non-existing', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 10, maxLength: 50 }),
        fc.string({ minLength: 20, maxLength: 200 }),
        fc.emailAddress(),
        async (sessionId, refreshToken, userEmail) => {
          // Should not exist initially
          const existsBefore = await tokenStorage.sessionExists(sessionId);
          
          // Store token
          await tokenStorage.storeRefreshToken(sessionId, refreshToken, userEmail);
          
          // Should exist now
          const existsAfter = await tokenStorage.sessionExists(sessionId);
          
          // Delete token
          await tokenStorage.deleteRefreshToken(sessionId);
          
          // Should not exist anymore
          const existsAfterDelete = await tokenStorage.sessionExists(sessionId);
          
          return !existsBefore && existsAfter && !existsAfterDelete;
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('TokenStorage - Input Validation', () => {
  let tokenStorage;

  beforeEach(() => {
    tokenStorage = new TokenStorage();
  });

  test('throws error when storing without sessionId', async () => {
    await expect(
      tokenStorage.storeRefreshToken('', 'token', 'email@example.com')
    ).rejects.toThrow();
  });

  test('throws error when storing without refreshToken', async () => {
    await expect(
      tokenStorage.storeRefreshToken('session123', '', 'email@example.com')
    ).rejects.toThrow();
  });

  test('throws error when storing without userEmail', async () => {
    await expect(
      tokenStorage.storeRefreshToken('session123', 'token', '')
    ).rejects.toThrow();
  });

  test('throws error when retrieving without sessionId', async () => {
    await expect(
      tokenStorage.getRefreshToken('')
    ).rejects.toThrow();
  });

  test('throws error when retrieving non-existent session', async () => {
    await expect(
      tokenStorage.getRefreshToken('non-existent-session')
    ).rejects.toThrow('Session not found');
  });

  test('throws error when deleting without sessionId', async () => {
    await expect(
      tokenStorage.deleteRefreshToken('')
    ).rejects.toThrow();
  });
});

describe('TokenStorage - Cleanup', () => {
  let tokenStorage;

  beforeEach(() => {
    tokenStorage = new TokenStorage();
  });

  test('cleanupExpiredSessions removes old sessions', async () => {
    // Create a session with old timestamp
    const sessionId = 'old-session-' + Date.now();
    await tokenStorage.storeRefreshToken(sessionId, 'token', 'test@example.com');
    
    // Manually set old createdAt (hack for testing)
    const key = `session:${sessionId}`;
    const oldData = tokenStorage.memoryStore.get(key);
    oldData.createdAt = Date.now() - (91 * 24 * 60 * 60 * 1000); // 91 days ago
    tokenStorage.memoryStore.set(key, oldData);
    
    // Run cleanup
    const deletedCount = await tokenStorage.cleanupExpiredSessions();
    
    // Should have deleted 1 session
    expect(deletedCount).toBe(1);
    
    // Session should not exist
    const exists = await tokenStorage.sessionExists(sessionId);
    expect(exists).toBe(false);
  });

  test('cleanupExpiredSessions keeps recent sessions', async () => {
    const sessionId = 'recent-session-' + Date.now();
    await tokenStorage.storeRefreshToken(sessionId, 'token', 'test@example.com');
    
    // Run cleanup
    const deletedCount = await tokenStorage.cleanupExpiredSessions();
    
    // Should not have deleted anything
    expect(deletedCount).toBe(0);
    
    // Session should still exist
    const exists = await tokenStorage.sessionExists(sessionId);
    expect(exists).toBe(true);
    
    // Clean up
    await tokenStorage.deleteRefreshToken(sessionId);
  });
});
