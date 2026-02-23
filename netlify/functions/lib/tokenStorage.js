/**
 * Token Storage Interface
 * Provides abstraction for storing encrypted refresh tokens
 * Supports Netlify Blobs and Upstash Redis
 */

const TokenManager = require('./tokenManager');

class TokenStorage {
  constructor() {
    this.tokenManager = new TokenManager();
    this.storageType = process.env.TOKEN_STORE_TYPE || 'netlify-blobs';
    
    // Initialize storage backend based on configuration
    if (this.storageType === 'netlify-blobs') {
      this.initNetlifyBlobs();
    } else if (this.storageType === 'upstash-redis') {
      this.initUpstashRedis();
    } else if (this.storageType === 'memory') {
      // Use in-memory storage for testing
      this.backend = 'memory';
      this.memoryStore = new Map();
    } else {
      throw new Error(`Unsupported TOKEN_STORE_TYPE: ${this.storageType}`);
    }
  }

  /**
   * Initialize Netlify Blobs storage
   */
  initNetlifyBlobs() {
    try {
      const { getStore } = require('@netlify/blobs');
      this.store = getStore('auth-tokens');
      this.backend = 'netlify-blobs';
    } catch (error) {
      console.warn('Netlify Blobs not available, using in-memory storage for development');
      this.backend = 'memory';
      this.memoryStore = new Map();
    }
  }

  /**
   * Initialize Upstash Redis storage
   */
  initUpstashRedis() {
    const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
    const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
    
    if (!redisUrl || !redisToken) {
      throw new Error('UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are required for Upstash Redis');
    }
    
    try {
      const { Redis } = require('@upstash/redis');
      this.redis = new Redis({
        url: redisUrl,
        token: redisToken,
      });
      this.backend = 'upstash-redis';
    } catch (error) {
      throw new Error('Failed to initialize Upstash Redis: ' + error.message);
    }
  }

  /**
   * Store an encrypted refresh token
   * @param {string} sessionId - Unique session identifier
   * @param {string} refreshToken - Refresh token to encrypt and store
   * @param {string} userEmail - User's email address
   * @returns {Promise<void>}
   */
  async storeRefreshToken(sessionId, refreshToken, userEmail) {
    if (!sessionId || !refreshToken || !userEmail) {
      throw new Error('sessionId, refreshToken, and userEmail are required');
    }

    // Encrypt the refresh token
    const encryptedToken = this.tokenManager.encryptToken(refreshToken);
    
    // Create session data with metadata
    const sessionData = {
      refreshToken: encryptedToken,
      userEmail: userEmail,
      createdAt: Date.now(),
      lastUsed: Date.now(),
    };

    const key = `session:${sessionId}`;
    
    // Store based on backend
    if (this.backend === 'netlify-blobs') {
      await this.store.set(key, JSON.stringify(sessionData));
    } else if (this.backend === 'upstash-redis') {
      // Store with 90-day TTL (in seconds)
      const ttl = 90 * 24 * 60 * 60;
      await this.redis.setex(key, ttl, JSON.stringify(sessionData));
    } else if (this.backend === 'memory') {
      this.memoryStore.set(key, sessionData);
    }
  }

  /**
   * Retrieve and decrypt a refresh token
   * @param {string} sessionId - Session identifier
   * @returns {Promise<{refreshToken: string, userEmail: string, createdAt: number, lastUsed: number}>}
   */
  async getRefreshToken(sessionId) {
    if (!sessionId) {
      throw new Error('sessionId is required');
    }

    const key = `session:${sessionId}`;
    let sessionData;

    // Retrieve based on backend
    if (this.backend === 'netlify-blobs') {
      const data = await this.store.get(key);
      if (!data) {
        throw new Error('Session not found');
      }
      sessionData = JSON.parse(data);
    } else if (this.backend === 'upstash-redis') {
      const data = await this.redis.get(key);
      if (!data) {
        throw new Error('Session not found');
      }
      sessionData = typeof data === 'string' ? JSON.parse(data) : data;
    } else if (this.backend === 'memory') {
      sessionData = this.memoryStore.get(key);
      if (!sessionData) {
        throw new Error('Session not found');
      }
    }

    // Decrypt the refresh token
    const decryptedToken = this.tokenManager.decryptToken(sessionData.refreshToken);
    
    // Update lastUsed timestamp
    sessionData.lastUsed = Date.now();
    
    // Update storage with new lastUsed
    if (this.backend === 'netlify-blobs') {
      await this.store.set(key, JSON.stringify(sessionData));
    } else if (this.backend === 'upstash-redis') {
      const ttl = 90 * 24 * 60 * 60;
      await this.redis.setex(key, ttl, JSON.stringify(sessionData));
    } else if (this.backend === 'memory') {
      this.memoryStore.set(key, sessionData);
    }

    return {
      refreshToken: decryptedToken,
      userEmail: sessionData.userEmail,
      createdAt: sessionData.createdAt,
      lastUsed: sessionData.lastUsed,
    };
  }

  /**
   * Delete a refresh token
   * @param {string} sessionId - Session identifier
   * @returns {Promise<void>}
   */
  async deleteRefreshToken(sessionId) {
    if (!sessionId) {
      throw new Error('sessionId is required');
    }

    const key = `session:${sessionId}`;

    if (this.backend === 'netlify-blobs') {
      await this.store.delete(key);
    } else if (this.backend === 'upstash-redis') {
      await this.redis.del(key);
    } else if (this.backend === 'memory') {
      this.memoryStore.delete(key);
    }
  }

  /**
   * Check if a session exists
   * @param {string} sessionId - Session identifier
   * @returns {Promise<boolean>}
   */
  async sessionExists(sessionId) {
    if (!sessionId) {
      return false;
    }

    const key = `session:${sessionId}`;

    try {
      if (this.backend === 'netlify-blobs') {
        const data = await this.store.get(key);
        return data !== null;
      } else if (this.backend === 'upstash-redis') {
        const exists = await this.redis.exists(key);
        return exists === 1;
      } else if (this.backend === 'memory') {
        return this.memoryStore.has(key);
      }
    } catch (error) {
      return false;
    }

    return false;
  }

  /**
   * Clean up expired sessions (for Netlify Blobs only, Redis has native TTL)
   * @param {number} maxAgeMs - Maximum age in milliseconds (default: 90 days)
   * @returns {Promise<number>} - Number of sessions deleted
   */
  async cleanupExpiredSessions(maxAgeMs = 90 * 24 * 60 * 60 * 1000) {
    if (this.backend !== 'netlify-blobs' && this.backend !== 'memory') {
      // Redis handles TTL automatically
      return 0;
    }

    let deletedCount = 0;
    const now = Date.now();
    const cutoff = now - maxAgeMs;

    if (this.backend === 'netlify-blobs') {
      // List all sessions
      const { blobs } = await this.store.list();
      
      for (const blob of blobs) {
        try {
          const data = await this.store.get(blob.key);
          const sessionData = JSON.parse(data);
          
          if (sessionData.createdAt < cutoff) {
            await this.store.delete(blob.key);
            deletedCount++;
          }
        } catch (error) {
          console.error(`Error cleaning up session ${blob.key}:`, error);
        }
      }
    } else if (this.backend === 'memory') {
      for (const [key, sessionData] of this.memoryStore.entries()) {
        if (sessionData.createdAt < cutoff) {
          this.memoryStore.delete(key);
          deletedCount++;
        }
      }
    }

    return deletedCount;
  }
}

module.exports = TokenStorage;
