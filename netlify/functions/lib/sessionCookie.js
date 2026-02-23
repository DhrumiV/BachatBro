/**
 * Session Cookie Utilities
 * Handles creation, validation, and management of secure session cookies
 * Uses HMAC-SHA256 for cookie signature to prevent tampering
 */

const crypto = require('crypto');

class SessionCookie {
  constructor() {
    // Get session secret from environment variable
    this.sessionSecret = process.env.SESSION_SECRET;
    
    if (!this.sessionSecret) {
      throw new Error('SESSION_SECRET environment variable is required');
    }
    
    // Convert hex string to Buffer (32 bytes for HMAC-SHA256)
    if (this.sessionSecret.length !== 64) {
      throw new Error('SESSION_SECRET must be 32 bytes (64 hex characters)');
    }
    
    this.secretBuffer = Buffer.from(this.sessionSecret, 'hex');
    
    // Cookie configuration
    this.cookieName = '__Host-session';
    this.maxAge = 30 * 24 * 60 * 60; // 30 days in seconds
  }

  /**
   * Generate a cryptographically random session ID
   * @returns {string} - 64-character hex string (32 bytes)
   */
  generateSessionId() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Create HMAC-SHA256 signature for session ID
   * @param {string} sessionId - Session identifier
   * @returns {string} - Hex-encoded signature
   */
  signSessionId(sessionId) {
    if (!sessionId || typeof sessionId !== 'string') {
      throw new Error('sessionId must be a non-empty string');
    }

    const hmac = crypto.createHmac('sha256', this.secretBuffer);
    hmac.update(sessionId);
    return hmac.digest('hex');
  }

  /**
   * Verify session cookie signature
   * @param {string} sessionId - Session identifier
   * @param {string} signature - Signature to verify
   * @returns {boolean} - True if signature is valid
   */
  verifySignature(sessionId, signature) {
    if (!sessionId || !signature) {
      return false;
    }

    const expectedSignature = this.signSessionId(sessionId);
    
    // Use timing-safe comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(signature, 'hex')
    );
  }

  /**
   * Create a session cookie value
   * @param {string} sessionId - Session identifier (optional, will generate if not provided)
   * @returns {string} - Cookie value in format: sessionId.signature
   */
  createCookieValue(sessionId = null) {
    // Generate session ID if not provided
    if (!sessionId) {
      sessionId = this.generateSessionId();
    }

    // Create signature
    const signature = this.signSessionId(sessionId);
    
    // Return format: sessionId.signature
    return `${sessionId}.${signature}`;
  }

  /**
   * Parse and validate a session cookie value
   * @param {string} cookieValue - Cookie value to parse
   * @returns {{sessionId: string, signature: string, valid: boolean}}
   */
  parseCookieValue(cookieValue) {
    if (!cookieValue || typeof cookieValue !== 'string') {
      return { sessionId: null, signature: null, valid: false };
    }

    // Parse the cookie value
    const parts = cookieValue.split('.');
    if (parts.length !== 2) {
      return { sessionId: null, signature: null, valid: false };
    }

    const [sessionId, signature] = parts;
    
    // Validate format
    if (sessionId.length !== 64 || signature.length !== 64) {
      return { sessionId: null, signature: null, valid: false };
    }

    // Verify signature
    const valid = this.verifySignature(sessionId, signature);
    
    return { sessionId, signature, valid };
  }

  /**
   * Create a Set-Cookie header value with all security attributes
   * @param {string} sessionId - Session identifier (optional)
   * @returns {string} - Complete Set-Cookie header value
   */
  createSetCookieHeader(sessionId = null) {
    const cookieValue = this.createCookieValue(sessionId);
    
    // Build cookie with all security attributes
    const attributes = [
      `${this.cookieName}=${cookieValue}`,
      'HttpOnly',
      'Secure',
      'SameSite=Strict',
      'Path=/',
      `Max-Age=${this.maxAge}`,
    ];
    
    return attributes.join('; ');
  }

  /**
   * Create a Set-Cookie header to clear/delete the session cookie
   * @returns {string} - Set-Cookie header value that clears the cookie
   */
  createClearCookieHeader() {
    const attributes = [
      `${this.cookieName}=`,
      'HttpOnly',
      'Secure',
      'SameSite=Strict',
      'Path=/',
      'Max-Age=0', // Expire immediately
    ];
    
    return attributes.join('; ');
  }

  /**
   * Extract session cookie from request headers
   * @param {Object} headers - Request headers object
   * @returns {string|null} - Cookie value or null if not found
   */
  extractCookieFromHeaders(headers) {
    if (!headers || !headers.cookie) {
      return null;
    }

    const cookies = headers.cookie.split(';').map(c => c.trim());
    
    for (const cookie of cookies) {
      if (cookie.startsWith(`${this.cookieName}=`)) {
        return cookie.substring(this.cookieName.length + 1);
      }
    }
    
    return null;
  }

  /**
   * Validate and extract session ID from request
   * @param {Object} headers - Request headers object
   * @returns {{sessionId: string|null, valid: boolean}}
   */
  validateRequest(headers) {
    const cookieValue = this.extractCookieFromHeaders(headers);
    
    if (!cookieValue) {
      return { sessionId: null, valid: false };
    }

    const parsed = this.parseCookieValue(cookieValue);
    
    return {
      sessionId: parsed.valid ? parsed.sessionId : null,
      valid: parsed.valid,
    };
  }

  /**
   * Create response headers with session cookie
   * @param {string} sessionId - Session identifier (optional)
   * @param {Object} additionalHeaders - Additional headers to include
   * @returns {Object} - Headers object
   */
  createResponseHeaders(sessionId = null, additionalHeaders = {}) {
    return {
      'Set-Cookie': this.createSetCookieHeader(sessionId),
      'Content-Type': 'application/json',
      ...additionalHeaders,
    };
  }

  /**
   * Create response headers that clear the session cookie
   * @param {Object} additionalHeaders - Additional headers to include
   * @returns {Object} - Headers object
   */
  createClearResponseHeaders(additionalHeaders = {}) {
    return {
      'Set-Cookie': this.createClearCookieHeader(),
      'Content-Type': 'application/json',
      ...additionalHeaders,
    };
  }
}

module.exports = SessionCookie;
