/**
 * Property-Based Tests for SessionCookie
 * Feature: persistent-auth
 * Uses fast-check for property-based testing
 */

const fc = require('fast-check');
const SessionCookie = require('./sessionCookie');

// Mock environment variable for testing
process.env.SESSION_SECRET = 'b'.repeat(64); // 32 bytes in hex

describe('SessionCookie - Security Attributes', () => {
  let sessionCookie;

  beforeEach(() => {
    sessionCookie = new SessionCookie();
  });

  // Feature: persistent-auth, Property 6: Session Cookie Security Attributes
  test('session cookies have all required security attributes', () => {
    fc.assert(
      fc.property(
        fc.hexaString({ minLength: 64, maxLength: 64 }), // sessionId
        (sessionId) => {
          const setCookieHeader = sessionCookie.createSetCookieHeader(sessionId);
          
          // Check all required attributes
          const hasHttpOnly = setCookieHeader.includes('HttpOnly');
          const hasSecure = setCookieHeader.includes('Secure');
          const hasSameSite = setCookieHeader.includes('SameSite=Strict');
          const hasPath = setCookieHeader.includes('Path=/');
          const hasMaxAge = setCookieHeader.includes('Max-Age=2592000'); // 30 days
          const hasCorrectName = setCookieHeader.startsWith('__Host-session=');
          
          return hasHttpOnly && hasSecure && hasSameSite && hasPath && hasMaxAge && hasCorrectName;
        }
      ),
      { numRuns: 100 }
    );
  });

  // Property: Cookie name uses __Host- prefix
  test('cookie name uses __Host- prefix for security', () => {
    const setCookieHeader = sessionCookie.createSetCookieHeader();
    expect(setCookieHeader).toMatch(/^__Host-session=/);
  });

  // Property: Max-Age is exactly 30 days
  test('cookie Max-Age is 30 days in seconds', () => {
    const setCookieHeader = sessionCookie.createSetCookieHeader();
    const thirtyDaysInSeconds = 30 * 24 * 60 * 60;
    expect(setCookieHeader).toContain(`Max-Age=${thirtyDaysInSeconds}`);
  });

  // Property: Clear cookie has Max-Age=0
  test('clear cookie header sets Max-Age to 0', () => {
    const clearHeader = sessionCookie.createClearCookieHeader();
    expect(clearHeader).toContain('Max-Age=0');
    expect(clearHeader).toContain('__Host-session=');
  });
});

describe('SessionCookie - Cookie Structure', () => {
  let sessionCookie;

  beforeEach(() => {
    sessionCookie = new SessionCookie();
  });

  // Feature: persistent-auth, Property 7: Session Cookie Structure
  test('cookie value parses into sessionId and signature', () => {
    fc.assert(
      fc.property(
        fc.hexaString({ minLength: 64, maxLength: 64 }), // sessionId (hex)
        (sessionId) => {
          const cookieValue = sessionCookie.createCookieValue(sessionId);
          const parts = cookieValue.split('.');
          
          // Should have exactly 2 parts
          if (parts.length !== 2) return false;
          
          // Both parts should be 64 hex characters
          const sessionIdPart = parts[0];
          const signaturePart = parts[1];
          
          const sessionIdValid = sessionIdPart.length === 64 && /^[0-9a-f]+$/i.test(sessionIdPart);
          const signatureValid = signaturePart.length === 64 && /^[0-9a-f]+$/i.test(signaturePart);
          
          return sessionIdValid && signatureValid;
        }
      ),
      { numRuns: 100 }
    );
  });

  // Property: Generated session IDs are unique
  test('generated session IDs are unique', () => {
    const sessionIds = new Set();
    
    for (let i = 0; i < 1000; i++) {
      const sessionId = sessionCookie.generateSessionId();
      sessionIds.add(sessionId);
    }
    
    // All 1000 should be unique
    expect(sessionIds.size).toBe(1000);
  });

  // Property: Session ID is always 64 hex characters
  test('generated session IDs are 64 hex characters', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100 }),
        (_) => {
          const sessionId = sessionCookie.generateSessionId();
          return sessionId.length === 64 && /^[0-9a-f]+$/i.test(sessionId);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Property: Signature is always 64 hex characters
  test('signatures are 64 hex characters', () => {
    fc.assert(
      fc.property(
        fc.hexaString({ minLength: 64, maxLength: 64 }),
        (sessionId) => {
          const signature = sessionCookie.signSessionId(sessionId);
          return signature.length === 64 && /^[0-9a-f]+$/i.test(signature);
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('SessionCookie - Signature Validation', () => {
  let sessionCookie;

  beforeEach(() => {
    sessionCookie = new SessionCookie();
  });

  // Property: Valid signatures verify correctly
  test('valid signatures pass verification', () => {
    fc.assert(
      fc.property(
        fc.hexaString({ minLength: 64, maxLength: 64 }),
        (sessionId) => {
          const signature = sessionCookie.signSessionId(sessionId);
          return sessionCookie.verifySignature(sessionId, signature);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Property: Tampered signatures fail verification
  test('tampered signatures fail verification', () => {
    fc.assert(
      fc.property(
        fc.hexaString({ minLength: 64, maxLength: 64 }),
        (sessionId) => {
          const signature = sessionCookie.signSessionId(sessionId);
          
          // Tamper with signature by flipping a character
          const tamperedSignature = signature[0] === 'a' ? 'b' + signature.slice(1) : 'a' + signature.slice(1);
          
          return !sessionCookie.verifySignature(sessionId, tamperedSignature);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Property: Different session IDs produce different signatures
  test('different session IDs produce different signatures', () => {
    fc.assert(
      fc.property(
        fc.hexaString({ minLength: 64, maxLength: 64 }),
        fc.hexaString({ minLength: 64, maxLength: 64 }),
        (sessionId1, sessionId2) => {
          // Skip if session IDs are the same
          if (sessionId1 === sessionId2) return true;
          
          const signature1 = sessionCookie.signSessionId(sessionId1);
          const signature2 = sessionCookie.signSessionId(sessionId2);
          
          return signature1 !== signature2;
        }
      ),
      { numRuns: 100 }
    );
  });

  // Property: Parse and validate round-trip
  test('created cookies parse and validate correctly', () => {
    fc.assert(
      fc.property(
        fc.hexaString({ minLength: 64, maxLength: 64 }),
        (sessionId) => {
          const cookieValue = sessionCookie.createCookieValue(sessionId);
          const parsed = sessionCookie.parseCookieValue(cookieValue);
          
          return parsed.valid && parsed.sessionId === sessionId;
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('SessionCookie - Request Validation', () => {
  let sessionCookie;

  beforeEach(() => {
    sessionCookie = new SessionCookie();
  });

  test('validates request with valid cookie', () => {
    const sessionId = sessionCookie.generateSessionId();
    const cookieValue = sessionCookie.createCookieValue(sessionId);
    
    const headers = {
      cookie: `__Host-session=${cookieValue}`,
    };
    
    const result = sessionCookie.validateRequest(headers);
    
    expect(result.valid).toBe(true);
    expect(result.sessionId).toBe(sessionId);
  });

  test('rejects request with invalid signature', () => {
    const sessionId = sessionCookie.generateSessionId();
    const cookieValue = sessionCookie.createCookieValue(sessionId);
    
    // Tamper with cookie
    const tamperedValue = cookieValue[0] === 'a' ? 'b' + cookieValue.slice(1) : 'a' + cookieValue.slice(1);
    
    const headers = {
      cookie: `__Host-session=${tamperedValue}`,
    };
    
    const result = sessionCookie.validateRequest(headers);
    
    expect(result.valid).toBe(false);
    expect(result.sessionId).toBeNull();
  });

  test('rejects request with missing cookie', () => {
    const headers = {};
    
    const result = sessionCookie.validateRequest(headers);
    
    expect(result.valid).toBe(false);
    expect(result.sessionId).toBeNull();
  });

  test('extracts cookie from multiple cookies', () => {
    const sessionId = sessionCookie.generateSessionId();
    const cookieValue = sessionCookie.createCookieValue(sessionId);
    
    const headers = {
      cookie: `other=value; __Host-session=${cookieValue}; another=value`,
    };
    
    const result = sessionCookie.validateRequest(headers);
    
    expect(result.valid).toBe(true);
    expect(result.sessionId).toBe(sessionId);
  });
});

describe('SessionCookie - Response Headers', () => {
  let sessionCookie;

  beforeEach(() => {
    sessionCookie = new SessionCookie();
  });

  test('creates response headers with session cookie', () => {
    const sessionId = sessionCookie.generateSessionId();
    const headers = sessionCookie.createResponseHeaders(sessionId);
    
    expect(headers).toHaveProperty('Set-Cookie');
    expect(headers).toHaveProperty('Content-Type', 'application/json');
    expect(headers['Set-Cookie']).toContain('__Host-session=');
    expect(headers['Set-Cookie']).toContain('HttpOnly');
  });

  test('creates clear response headers', () => {
    const headers = sessionCookie.createClearResponseHeaders();
    
    expect(headers).toHaveProperty('Set-Cookie');
    expect(headers['Set-Cookie']).toContain('Max-Age=0');
  });

  test('includes additional headers', () => {
    const additionalHeaders = {
      'X-Custom-Header': 'value',
    };
    
    const headers = sessionCookie.createResponseHeaders(null, additionalHeaders);
    
    expect(headers).toHaveProperty('X-Custom-Header', 'value');
    expect(headers).toHaveProperty('Set-Cookie');
  });
});

describe('SessionCookie - Initialization', () => {
  test('throws error if SESSION_SECRET is missing', () => {
    const originalSecret = process.env.SESSION_SECRET;
    delete process.env.SESSION_SECRET;
    
    expect(() => new SessionCookie()).toThrow('SESSION_SECRET environment variable is required');
    
    process.env.SESSION_SECRET = originalSecret;
  });

  test('throws error if SESSION_SECRET is wrong length', () => {
    const originalSecret = process.env.SESSION_SECRET;
    process.env.SESSION_SECRET = 'tooshort';
    
    expect(() => new SessionCookie()).toThrow('SESSION_SECRET must be 32 bytes');
    
    process.env.SESSION_SECRET = originalSecret;
  });
});
