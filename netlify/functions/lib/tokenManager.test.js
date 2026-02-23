/**
 * Property-Based Tests for TokenManager
 * Feature: persistent-auth
 * Uses fast-check for property-based testing
 */

const fc = require('fast-check');
const TokenManager = require('./tokenManager');

// Mock environment variable for testing
process.env.ENCRYPTION_KEY = 'a'.repeat(64); // 32 bytes in hex

describe('TokenManager - Encryption', () => {
  let tokenManager;

  beforeEach(() => {
    tokenManager = new TokenManager();
  });

  // Feature: persistent-auth, Property 3: Token Encryption Round-Trip
  test('encrypted tokens decrypt to original value', () => {
    fc.assert(
      fc.property(
        // Generate random tokens (20-200 characters)
        fc.string({ minLength: 20, maxLength: 200 }),
        (token) => {
          const encrypted = tokenManager.encryptToken(token);
          const decrypted = tokenManager.decryptToken(encrypted);
          return decrypted === token;
        }
      ),
      { numRuns: 100 }
    );
  });

  // Property: Each encryption produces different ciphertext (due to random IV)
  test('encrypting same token twice produces different ciphertext', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 20, maxLength: 200 }),
        (token) => {
          const encrypted1 = tokenManager.encryptToken(token);
          const encrypted2 = tokenManager.encryptToken(token);
          
          // Ciphertext should be different (different IVs)
          const different = encrypted1 !== encrypted2;
          
          // But both should decrypt to same value
          const decrypted1 = tokenManager.decryptToken(encrypted1);
          const decrypted2 = tokenManager.decryptToken(encrypted2);
          const sameDecrypted = decrypted1 === token && decrypted2 === token;
          
          return different && sameDecrypted;
        }
      ),
      { numRuns: 100 }
    );
  });

  // Property: Encrypted format is always valid (iv.ciphertext.authTag)
  test('encrypted tokens have correct format', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 20, maxLength: 200 }),
        (token) => {
          const encrypted = tokenManager.encryptToken(token);
          const parts = encrypted.split('.');
          
          // Should have exactly 3 parts
          if (parts.length !== 3) return false;
          
          // All parts should be valid hex strings
          const allHex = parts.every(part => /^[0-9a-f]+$/i.test(part));
          if (!allHex) return false;
          
          // IV should be 12 bytes (24 hex chars)
          const ivValid = parts[0].length === 24;
          
          // Auth tag should be 16 bytes (32 hex chars)
          const authTagValid = parts[2].length === 32;
          
          return ivValid && authTagValid;
        }
      ),
      { numRuns: 100 }
    );
  });

  // Property: Tampering with encrypted data causes decryption to fail
  test('tampered ciphertext fails authentication', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 20, maxLength: 200 }),
        fc.integer({ min: 0, max: 2 }), // Which part to tamper with
        (token, partIndex) => {
          const encrypted = tokenManager.encryptToken(token);
          const parts = encrypted.split('.');
          
          // Tamper with one part by flipping a bit
          const tampered = parts[partIndex];
          const tamperedChar = tampered[0] === 'a' ? 'b' : 'a';
          parts[partIndex] = tamperedChar + tampered.slice(1);
          
          const tamperedEncrypted = parts.join('.');
          
          // Decryption should throw an error
          try {
            tokenManager.decryptToken(tamperedEncrypted);
            return false; // Should have thrown
          } catch (error) {
            return true; // Expected behavior
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('TokenManager - Input Validation', () => {
  let tokenManager;

  beforeEach(() => {
    tokenManager = new TokenManager();
  });

  test('throws error for empty token encryption', () => {
    expect(() => tokenManager.encryptToken('')).toThrow();
  });

  test('throws error for null token encryption', () => {
    expect(() => tokenManager.encryptToken(null)).toThrow();
  });

  test('throws error for undefined token encryption', () => {
    expect(() => tokenManager.encryptToken(undefined)).toThrow();
  });

  test('throws error for non-string token encryption', () => {
    expect(() => tokenManager.encryptToken(12345)).toThrow();
  });

  test('throws error for invalid encrypted format', () => {
    expect(() => tokenManager.decryptToken('invalid')).toThrow();
  });

  test('throws error for wrong number of parts', () => {
    expect(() => tokenManager.decryptToken('part1.part2')).toThrow();
  });
});

describe('TokenManager - Initialization', () => {
  test('throws error if ENCRYPTION_KEY is missing', () => {
    const originalKey = process.env.ENCRYPTION_KEY;
    delete process.env.ENCRYPTION_KEY;
    
    expect(() => new TokenManager()).toThrow('ENCRYPTION_KEY environment variable is required');
    
    process.env.ENCRYPTION_KEY = originalKey;
  });

  test('throws error if ENCRYPTION_KEY is wrong length', () => {
    const originalKey = process.env.ENCRYPTION_KEY;
    process.env.ENCRYPTION_KEY = 'tooshort';
    
    expect(() => new TokenManager()).toThrow('ENCRYPTION_KEY must be 32 bytes');
    
    process.env.ENCRYPTION_KEY = originalKey;
  });

  test('validateEncryption returns true for working encryption', () => {
    const tokenManager = new TokenManager();
    expect(tokenManager.validateEncryption()).toBe(true);
  });
});
