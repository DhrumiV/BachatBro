/**
 * Token Manager
 * Handles encryption, decryption, and storage of OAuth refresh tokens
 * Uses AES-256-GCM for authenticated encryption
 */

const crypto = require('crypto');

class TokenManager {
  constructor() {
    // Get encryption key from environment variable
    this.encryptionKey = process.env.ENCRYPTION_KEY;
    
    if (!this.encryptionKey) {
      throw new Error('ENCRYPTION_KEY environment variable is required');
    }
    
    // Convert hex string to Buffer (32 bytes for AES-256)
    if (this.encryptionKey.length !== 64) {
      throw new Error('ENCRYPTION_KEY must be 32 bytes (64 hex characters)');
    }
    
    this.keyBuffer = Buffer.from(this.encryptionKey, 'hex');
  }

  /**
   * Encrypt a refresh token using AES-256-GCM
   * @param {string} token - The refresh token to encrypt
   * @returns {string} - Encrypted token in format: iv.ciphertext.authTag (hex-encoded)
   */
  encryptToken(token) {
    if (!token || typeof token !== 'string') {
      throw new Error('Token must be a non-empty string');
    }

    // Generate random 12-byte IV (recommended for GCM)
    const iv = crypto.randomBytes(12);
    
    // Create cipher
    const cipher = crypto.createCipheriv('aes-256-gcm', this.keyBuffer, iv);
    
    // Encrypt the token
    let encrypted = cipher.update(token, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Get authentication tag (16 bytes)
    const authTag = cipher.getAuthTag();
    
    // Return format: iv.ciphertext.authTag (all hex-encoded)
    return `${iv.toString('hex')}.${encrypted}.${authTag.toString('hex')}`;
  }

  /**
   * Decrypt an encrypted refresh token
   * @param {string} encryptedToken - Encrypted token in format: iv.ciphertext.authTag
   * @returns {string} - Decrypted refresh token
   */
  decryptToken(encryptedToken) {
    if (!encryptedToken || typeof encryptedToken !== 'string') {
      throw new Error('Encrypted token must be a non-empty string');
    }

    // Parse the encrypted token
    const parts = encryptedToken.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted token format');
    }

    const [ivHex, encryptedHex, authTagHex] = parts;
    
    // Convert from hex to Buffer
    const iv = Buffer.from(ivHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    // Validate sizes
    if (iv.length !== 12) {
      throw new Error('Invalid IV length');
    }
    if (authTag.length !== 16) {
      throw new Error('Invalid auth tag length');
    }
    
    // Create decipher
    const decipher = crypto.createDecipheriv('aes-256-gcm', this.keyBuffer, iv);
    decipher.setAuthTag(authTag);
    
    // Decrypt the token
    let decrypted = decipher.update(encrypted, undefined, 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Validate that encryption/decryption is working correctly
   * @returns {boolean} - True if validation passes
   */
  validateEncryption() {
    const testToken = 'test-token-' + crypto.randomBytes(16).toString('hex');
    const encrypted = this.encryptToken(testToken);
    const decrypted = this.decryptToken(encrypted);
    return testToken === decrypted;
  }
}

module.exports = TokenManager;
