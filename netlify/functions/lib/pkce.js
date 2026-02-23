/**
 * PKCE (Proof Key for Code Exchange) Utilities
 * 
 * Implements RFC 7636 for OAuth 2.0 Authorization Code Flow with PKCE.
 * Used to prevent authorization code interception attacks.
 * 
 * @module pkce
 */

const crypto = require('crypto');

class PKCE {
  /**
   * Generate a cryptographically random code verifier
   * 
   * Per RFC 7636:
   * - Length: 43-128 characters
   * - Character set: [A-Z] / [a-z] / [0-9] / "-" / "." / "_" / "~"
   * - Entropy: Minimum 256 bits recommended
   * 
   * @returns {string} Base64url-encoded random string (43 characters)
   */
  generateCodeVerifier() {
    // Generate 32 random bytes (256 bits of entropy)
    const randomBytes = crypto.randomBytes(32);
    
    // Base64url encode (no padding)
    return this._base64urlEncode(randomBytes);
  }

  /**
   * Generate code challenge from code verifier
   * 
   * Per RFC 7636:
   * - Method: S256 (SHA-256)
   * - Challenge = BASE64URL(SHA256(ASCII(code_verifier)))
   * 
   * @param {string} codeVerifier - The code verifier to hash
   * @returns {string} Base64url-encoded SHA-256 hash
   * @throws {Error} If codeVerifier is invalid
   */
  generateCodeChallenge(codeVerifier) {
    if (!codeVerifier || typeof codeVerifier !== 'string') {
      throw new Error('Code verifier must be a non-empty string');
    }

    if (codeVerifier.length < 43 || codeVerifier.length > 128) {
      throw new Error('Code verifier must be between 43 and 128 characters');
    }

    // Validate character set
    const validPattern = /^[A-Za-z0-9\-._~]+$/;
    if (!validPattern.test(codeVerifier)) {
      throw new Error('Code verifier contains invalid characters');
    }

    // SHA-256 hash
    const hash = crypto.createHash('sha256')
      .update(codeVerifier, 'ascii')
      .digest();

    // Base64url encode
    return this._base64urlEncode(hash);
  }

  /**
   * Generate both verifier and challenge in one call
   * 
   * @returns {{ verifier: string, challenge: string, method: string }}
   */
  generatePKCEPair() {
    const verifier = this.generateCodeVerifier();
    const challenge = this.generateCodeChallenge(verifier);

    return {
      verifier,
      challenge,
      method: 'S256'
    };
  }

  /**
   * Verify that a code challenge matches a code verifier
   * 
   * Used for testing and validation purposes.
   * 
   * @param {string} codeVerifier - The original code verifier
   * @param {string} codeChallenge - The code challenge to verify
   * @returns {boolean} True if challenge matches verifier
   */
  verifyChallenge(codeVerifier, codeChallenge) {
    try {
      const expectedChallenge = this.generateCodeChallenge(codeVerifier);
      return expectedChallenge === codeChallenge;
    } catch (error) {
      return false;
    }
  }

  /**
   * Base64url encode (RFC 4648 Section 5)
   * 
   * Differences from standard Base64:
   * - Replace '+' with '-'
   * - Replace '/' with '_'
   * - Remove padding '='
   * 
   * @private
   * @param {Buffer} buffer - Data to encode
   * @returns {string} Base64url-encoded string
   */
  _base64urlEncode(buffer) {
    return buffer
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }
}

module.exports = PKCE;
