/**
 * Property-Based Tests for PKCE Utilities
 * 
 * Tests RFC 7636 compliance using fast-check property testing.
 * Each test validates correctness properties from design.md.
 */

const fc = require('fast-check');
const PKCE = require('./pkce');

describe('PKCE', () => {
  let pkce;

  beforeEach(() => {
    pkce = new PKCE();
  });

  describe('Code Verifier Generation', () => {
    // Property 1: PKCE Generation Uniqueness (Part 1)
    test('generates unique code verifiers', () => {
      fc.assert(
        fc.property(
          fc.constant(null), // Run 100 times
          () => {
            const verifier1 = pkce.generateCodeVerifier();
            const verifier2 = pkce.generateCodeVerifier();
            
            // Verifiers should be different (collision probability < 2^-128)
            return verifier1 !== verifier2;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('generates verifiers with correct length', () => {
      fc.assert(
        fc.property(
          fc.constant(null),
          () => {
            const verifier = pkce.generateCodeVerifier();
            
            // 32 bytes base64url encoded = 43 characters (no padding)
            return verifier.length === 43;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('generates verifiers with valid character set', () => {
      fc.assert(
        fc.property(
          fc.constant(null),
          () => {
            const verifier = pkce.generateCodeVerifier();
            
            // RFC 7636: [A-Z] / [a-z] / [0-9] / "-" / "." / "_" / "~"
            // Base64url uses: [A-Z] / [a-z] / [0-9] / "-" / "_"
            const validPattern = /^[A-Za-z0-9\-_]+$/;
            return validPattern.test(verifier);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('generates verifiers without padding', () => {
      fc.assert(
        fc.property(
          fc.constant(null),
          () => {
            const verifier = pkce.generateCodeVerifier();
            
            // Base64url should not contain '=' padding
            return !verifier.includes('=');
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Code Challenge Generation', () => {
    // Property 1: PKCE Generation Uniqueness (Part 2)
    test('generates unique challenges for unique verifiers', () => {
      fc.assert(
        fc.property(
          fc.constant(null),
          () => {
            const verifier1 = pkce.generateCodeVerifier();
            const verifier2 = pkce.generateCodeVerifier();
            
            const challenge1 = pkce.generateCodeChallenge(verifier1);
            const challenge2 = pkce.generateCodeChallenge(verifier2);
            
            // Different verifiers should produce different challenges
            return challenge1 !== challenge2;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('generates deterministic challenges', () => {
      fc.assert(
        fc.property(
          fc.constant(null),
          () => {
            const verifier = pkce.generateCodeVerifier();
            
            const challenge1 = pkce.generateCodeChallenge(verifier);
            const challenge2 = pkce.generateCodeChallenge(verifier);
            
            // Same verifier should always produce same challenge
            return challenge1 === challenge2;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('generates challenges with correct length', () => {
      fc.assert(
        fc.property(
          fc.constant(null),
          () => {
            const verifier = pkce.generateCodeVerifier();
            const challenge = pkce.generateCodeChallenge(verifier);
            
            // SHA-256 = 32 bytes, base64url encoded = 43 characters
            return challenge.length === 43;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('generates challenges with valid character set', () => {
      fc.assert(
        fc.property(
          fc.constant(null),
          () => {
            const verifier = pkce.generateCodeVerifier();
            const challenge = pkce.generateCodeChallenge(verifier);
            
            const validPattern = /^[A-Za-z0-9\-_]+$/;
            return validPattern.test(challenge);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('rejects invalid verifier types', () => {
      expect(() => pkce.generateCodeChallenge(null)).toThrow('must be a non-empty string');
      expect(() => pkce.generateCodeChallenge(undefined)).toThrow('must be a non-empty string');
      expect(() => pkce.generateCodeChallenge(123)).toThrow('must be a non-empty string');
      expect(() => pkce.generateCodeChallenge('')).toThrow('must be a non-empty string');
    });

    test('rejects verifiers with invalid length', () => {
      const tooShort = 'a'.repeat(42);
      const tooLong = 'a'.repeat(129);
      
      expect(() => pkce.generateCodeChallenge(tooShort)).toThrow('must be between 43 and 128 characters');
      expect(() => pkce.generateCodeChallenge(tooLong)).toThrow('must be between 43 and 128 characters');
    });

    test('rejects verifiers with invalid characters', () => {
      const validLength = 'a'.repeat(43);
      const withSpace = validLength.slice(0, -1) + ' ';
      const withSpecial = validLength.slice(0, -1) + '@';
      
      expect(() => pkce.generateCodeChallenge(withSpace)).toThrow('invalid characters');
      expect(() => pkce.generateCodeChallenge(withSpecial)).toThrow('invalid characters');
    });
  });

  describe('PKCE Pair Generation', () => {
    test('generates complete PKCE pair', () => {
      fc.assert(
        fc.property(
          fc.constant(null),
          () => {
            const pair = pkce.generatePKCEPair();
            
            return (
              pair.verifier &&
              pair.challenge &&
              pair.method === 'S256' &&
              typeof pair.verifier === 'string' &&
              typeof pair.challenge === 'string'
            );
          }
        ),
        { numRuns: 100 }
      );
    });

    test('generates matching verifier and challenge', () => {
      fc.assert(
        fc.property(
          fc.constant(null),
          () => {
            const pair = pkce.generatePKCEPair();
            
            // Challenge should match verifier
            const expectedChallenge = pkce.generateCodeChallenge(pair.verifier);
            return pair.challenge === expectedChallenge;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('generates unique pairs', () => {
      fc.assert(
        fc.property(
          fc.constant(null),
          () => {
            const pair1 = pkce.generatePKCEPair();
            const pair2 = pkce.generatePKCEPair();
            
            return (
              pair1.verifier !== pair2.verifier &&
              pair1.challenge !== pair2.challenge
            );
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Challenge Verification', () => {
    test('verifies correct challenge-verifier pairs', () => {
      fc.assert(
        fc.property(
          fc.constant(null),
          () => {
            const verifier = pkce.generateCodeVerifier();
            const challenge = pkce.generateCodeChallenge(verifier);
            
            return pkce.verifyChallenge(verifier, challenge) === true;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('rejects incorrect challenge-verifier pairs', () => {
      fc.assert(
        fc.property(
          fc.constant(null),
          () => {
            const verifier1 = pkce.generateCodeVerifier();
            const verifier2 = pkce.generateCodeVerifier();
            const challenge1 = pkce.generateCodeChallenge(verifier1);
            
            // Different verifier should not match challenge
            return pkce.verifyChallenge(verifier2, challenge1) === false;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('handles invalid inputs gracefully', () => {
      expect(pkce.verifyChallenge(null, 'challenge')).toBe(false);
      expect(pkce.verifyChallenge('verifier', null)).toBe(false);
      expect(pkce.verifyChallenge('', '')).toBe(false);
    });
  });

  describe('RFC 7636 Compliance', () => {
    test('verifier meets minimum entropy requirement', () => {
      // RFC 7636 recommends minimum 256 bits of entropy
      // 32 bytes = 256 bits
      const verifier = pkce.generateCodeVerifier();
      
      // Base64url encoding of 32 bytes = 43 characters
      expect(verifier.length).toBe(43);
      
      // Verify it's truly random by checking uniqueness
      const verifiers = new Set();
      for (let i = 0; i < 100; i++) {
        verifiers.add(pkce.generateCodeVerifier());
      }
      expect(verifiers.size).toBe(100); // All unique
    });

    test('challenge uses S256 method correctly', () => {
      const pair = pkce.generatePKCEPair();
      
      // Method should be S256
      expect(pair.method).toBe('S256');
      
      // Verify SHA-256 is used by checking output length
      // SHA-256 = 32 bytes = 43 characters base64url
      expect(pair.challenge.length).toBe(43);
    });

    test('base64url encoding is correct', () => {
      fc.assert(
        fc.property(
          fc.constant(null),
          () => {
            const verifier = pkce.generateCodeVerifier();
            const challenge = pkce.generateCodeChallenge(verifier);
            
            // Should not contain standard base64 characters
            const hasPlus = verifier.includes('+') || challenge.includes('+');
            const hasSlash = verifier.includes('/') || challenge.includes('/');
            const hasPadding = verifier.includes('=') || challenge.includes('=');
            
            return !hasPlus && !hasSlash && !hasPadding;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Edge Cases', () => {
    test('handles maximum length verifier', () => {
      const maxVerifier = 'a'.repeat(128);
      const challenge = pkce.generateCodeChallenge(maxVerifier);
      
      expect(challenge).toBeTruthy();
      expect(challenge.length).toBe(43);
    });

    test('handles minimum length verifier', () => {
      const minVerifier = 'a'.repeat(43);
      const challenge = pkce.generateCodeChallenge(minVerifier);
      
      expect(challenge).toBeTruthy();
      expect(challenge.length).toBe(43);
    });

    test('handles all valid characters', () => {
      // RFC 7636 allows: [A-Z] / [a-z] / [0-9] / "-" / "." / "_" / "~"
      const allChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
      const verifier = allChars.slice(0, 43);
      
      const challenge = pkce.generateCodeChallenge(verifier);
      expect(challenge).toBeTruthy();
      expect(challenge.length).toBe(43);
    });
  });
});
