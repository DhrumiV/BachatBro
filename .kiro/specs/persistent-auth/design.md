# Design Document: Persistent Authentication

## Overview

This design implements a secure, persistent authentication system for BachatBro using OAuth 2.0 Authorization Code Flow with PKCE. The system separates concerns between a stateless backend (Netlify Functions) handling sensitive token operations and a React frontend managing user sessions via HttpOnly cookies.

**Key Design Principles:**
- Zero-trust: Never expose refresh tokens to frontend
- Stateless backend: All state in cookies + encrypted KV store
- Fail-secure: Default to logout on any security violation
- Privacy-first: Minimal data retention, explicit user control

## Architecture

### High-Level Components

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│                 │         │                  │         │                 │
│  React Frontend │◄───────►│ Netlify Functions│◄───────►│  Google OAuth   │
│                 │         │                  │         │                 │
└─────────────────┘         └──────────────────┘         └─────────────────┘
        │                            │
        │                            │
        ▼                            ▼
┌─────────────────┐         ┌──────────────────┐
│  Session Cookie │         │  Encrypted Token │
│  (HttpOnly)     │         │  Store (KV)      │
└─────────────────┘         └──────────────────┘
```

### Component Responsibilities

**Frontend (React)**
- Initiate OAuth flow with PKCE
- Store session cookie (browser-managed)
- Request access tokens from backend
- Handle UI state for auth status
- Trigger soft logout / hard disconnect

**Backend (Netlify Functions)**
- `/api/auth/login` - Generate PKCE challenge, redirect to Google
- `/api/auth/callback` - Exchange code for tokens, store refresh token
- `/api/auth/refresh` - Use refresh token to get new access token
- `/api/auth/logout` - Destroy session (soft)
- `/api/auth/disconnect` - Revoke tokens (hard)
- `/api/auth/status` - Check session validity

**Token Store (Netlify Blobs or Upstash Redis)**
- Key: `session:{sessionId}`
- Value: `{refreshToken: encrypted, userEmail: string, createdAt: timestamp}`
- TTL: 90 days


## Components and Interfaces

### 1. Frontend OAuth Client

**File:** `src/services/authService.js`

**Responsibilities:**
- Generate PKCE code verifier and challenge
- Construct OAuth authorization URL
- Handle OAuth callback
- Manage authentication state in React context
- Request token refresh when needed

**Key Methods:**
```javascript
class AuthService {
  // Generate PKCE parameters
  generatePKCE(): { verifier: string, challenge: string }
  
  // Initiate OAuth flow
  initiateLogin(): void
  
  // Handle OAuth callback
  handleCallback(code: string, state: string): Promise<void>
  
  // Check if user has valid session
  checkSession(): Promise<boolean>
  
  // Get current access token (triggers refresh if needed)
  getAccessToken(): Promise<string>
  
  // Soft logout
  logout(): Promise<void>
  
  // Hard disconnect
  disconnect(): Promise<void>
}
```

**State Management:**
- Store PKCE verifier in sessionStorage temporarily (cleared after callback)
- Store OAuth state parameter for CSRF protection
- Do NOT store any tokens in browser storage
- Rely on session cookie for persistence


### 2. Backend Token Handler

**Files:** 
- `netlify/functions/auth-login.js`
- `netlify/functions/auth-callback.js`
- `netlify/functions/auth-refresh.js`
- `netlify/functions/auth-logout.js`
- `netlify/functions/auth-disconnect.js`
- `netlify/functions/auth-status.js`

**Shared Module:** `netlify/functions/lib/tokenManager.js`

**Token Manager Interface:**
```javascript
class TokenManager {
  // Encrypt refresh token using AES-256-GCM
  encryptToken(token: string): string
  
  // Decrypt refresh token
  decryptToken(encrypted: string): string
  
  // Store encrypted refresh token
  storeRefreshToken(sessionId: string, refreshToken: string, userEmail: string): Promise<void>
  
  // Retrieve and decrypt refresh token
  getRefreshToken(sessionId: string): Promise<{ refreshToken: string, userEmail: string }>
  
  // Delete refresh token
  deleteRefreshToken(sessionId: string): Promise<void>
  
  // Exchange authorization code for tokens
  exchangeCodeForTokens(code: string, codeVerifier: string): Promise<TokenResponse>
  
  // Use refresh token to get new access token
  refreshAccessToken(refreshToken: string): Promise<string>
  
  // Revoke refresh token with Google
  revokeToken(refreshToken: string): Promise<void>
}
```

**Environment Variables Required:**
```
GOOGLE_CLIENT_ID=<OAuth client ID>
GOOGLE_CLIENT_SECRET=<OAuth client secret>
GOOGLE_REDIRECT_URI=https://yourdomain.com/api/auth/callback
ENCRYPTION_KEY=<32-byte hex string for AES-256>
TOKEN_STORE_URL=<Upstash Redis URL or leave empty for Netlify Blobs>
TOKEN_STORE_TOKEN=<Upstash Redis token if using Redis>
```


### 3. Session Cookie Specification

**Cookie Name:** `__Host-session`

**Attributes:**
- `HttpOnly`: true (prevents JavaScript access)
- `Secure`: true (HTTPS only)
- `SameSite`: Strict (CSRF protection)
- `Path`: /
- `Max-Age`: 2592000 (30 days)
- `Domain`: Not set (restricts to exact domain)

**Cookie Value Structure:**
```
sessionId.signature
```

Where:
- `sessionId`: Cryptographically random 32-byte hex string
- `signature`: HMAC-SHA256(sessionId, SECRET_KEY) to prevent tampering

**Security Properties:**
- Prefix `__Host-` enforces Secure flag and no Domain attribute
- Signature prevents session fixation attacks
- Random sessionId provides 256 bits of entropy


### 4. Token Storage Schema

**Storage Backend:** Netlify Blobs (primary) or Upstash Redis (fallback)

**Key Format:** `session:{sessionId}`

**Value Format (JSON):**
```json
{
  "refreshToken": "<encrypted-token>",
  "userEmail": "user@example.com",
  "createdAt": 1704067200000,
  "lastUsed": 1704153600000
}
```

**Encryption Details:**
- Algorithm: AES-256-GCM
- IV: Random 12 bytes, prepended to ciphertext
- Auth Tag: 16 bytes, appended to ciphertext
- Format: `iv.ciphertext.authTag` (hex-encoded)

**TTL Strategy:**
- Netlify Blobs: Manual cleanup via scheduled function
- Upstash Redis: Native TTL of 90 days


## Data Models

### OAuth Token Response

```typescript
interface TokenResponse {
  access_token: string;      // Short-lived (1 hour)
  refresh_token?: string;    // Long-lived (only on first auth)
  expires_in: number;        // Seconds until access_token expires
  scope: string;             // Granted scopes
  token_type: "Bearer";
}
```

### Session Data

```typescript
interface SessionData {
  sessionId: string;         // Unique session identifier
  userEmail: string;         // User's Google email
  createdAt: number;         // Unix timestamp (ms)
  lastUsed: number;          // Unix timestamp (ms)
  refreshToken: string;      // Encrypted refresh token
}
```

### PKCE Parameters

```typescript
interface PKCEParams {
  codeVerifier: string;      // Random 43-128 char string
  codeChallenge: string;     // SHA256(codeVerifier) base64url
  codeChallengeMethod: "S256";
}
```

### Auth State

```typescript
interface AuthState {
  isAuthenticated: boolean;
  userEmail: string | null;
  isLoading: boolean;
  error: string | null;
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: PKCE Generation Uniqueness

*For any* two login attempts, the generated PKCE code verifiers should be cryptographically unique (collision probability < 2^-128), and each code challenge should correctly derive from its verifier using SHA-256 and base64url encoding.

**Validates: Requirements 1.1**

### Property 2: OAuth URL Construction

*For any* PKCE parameters and OAuth configuration, the generated authorization URL should include all required parameters (client_id, redirect_uri, response_type=code, scope, code_challenge, code_challenge_method=S256, state) with correct URL encoding.

**Validates: Requirements 1.2, 1.5**

### Property 3: Token Encryption Round-Trip

*For any* refresh token string, encrypting then decrypting should return the original token unchanged, and each encryption should produce different ciphertext due to random IV generation.

**Validates: Requirements 2.1**

### Property 4: Token Storage Round-Trip

*For any* session ID, user email, and refresh token, storing the token then retrieving it should return the same token and email, with all required metadata (createdAt, lastUsed) present.

**Validates: Requirements 2.2, 2.5, 2.6, 7.1**

### Property 5: Token Confidentiality

*For any* API response or log output, the content should never contain refresh tokens or access tokens (validated by pattern matching against JWT/token formats).

**Validates: Requirements 2.3, 2.4**

### Property 6: Session Cookie Security Attributes

*For any* successful authentication, the Set-Cookie header should include a session cookie with all required security attributes: HttpOnly, Secure, SameSite=Strict, Max-Age=2592000, and cookie name prefix __Host-.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4**

### Property 7: Session Cookie Structure

*For any* session cookie value, it should parse into exactly two components (sessionId and signature), where sessionId is 64 hex characters and signature is valid HMAC-SHA256 of sessionId.

**Validates: Requirements 3.5, 3.6**

### Property 8: Silent Token Refresh

*For any* expired access token scenario, calling the refresh endpoint with a valid session cookie should return a new access token without requiring user interaction or OAuth consent.

**Validates: Requirements 4.2, 4.3**

### Property 9: Soft Logout Preservation

*For any* soft logout operation, the session cookie should be cleared (Max-Age=0) and frontend state should be reset, but the refresh token should remain in storage and Google's revocation endpoint should not be called.

**Validates: Requirements 5.1, 5.2, 5.3, 5.4**

### Property 10: Hard Disconnect Completeness

*For any* confirmed hard disconnect operation, all of the following should occur: Google's revocation endpoint is called, refresh token is deleted from storage, session cookie is cleared, and all frontend storage (localStorage, sessionStorage) is emptied.

**Validates: Requirements 6.3, 6.4, 6.5, 6.6**

### Property 11: Authorization Code Single-Use

*For any* authorization code, attempting to exchange it for tokens more than once should fail on the second attempt with an invalid_grant error.

**Validates: Requirements 8.3**

### Property 12: Protected Endpoint Security

*For any* request to protected endpoints (/api/auth/refresh, /api/auth/status), requests without a valid session cookie or with tampered cookies should be rejected with 401 Unauthorized status.

**Validates: Requirements 8.4, 9.2**

### Property 13: Rate Limiting Enforcement

*For any* user making more than 10 requests to token refresh endpoint within 60 seconds, the 11th and subsequent requests should be rejected with 429 Too Many Requests status.

**Validates: Requirements 8.5**

### Property 14: Cross-User Isolation

*For any* two users with different email addresses, their session IDs should map to different refresh tokens in storage, and attempting to use User A's session cookie to access User B's tokens should fail.

**Validates: Requirements 9.1, 9.2**

### Property 15: Session Fixation Prevention

*For any* authentication flow, the session ID generated after successful authentication should be different from any session ID that existed before authentication started.

**Validates: Requirements 9.3**

### Property 16: Transparent Token Refresh

*For any* API call to Google Sheets that fails with 401 Unauthorized, the Auth_System should automatically attempt token refresh and retry the original request without user intervention.

**Validates: Requirements 10.3**

### Property 17: Token Storage Prohibition

*For any* point during application execution, localStorage and sessionStorage should not contain any strings matching OAuth token patterns (JWT format or "ya29." prefix for Google tokens).

**Validates: Requirements 10.5**

### Property 18: Error Retry with Exponential Backoff

*For any* token refresh request that fails with a network error, the system should retry up to 3 times with delays of 1s, 2s, and 4s respectively before giving up.

**Validates: Requirements 11.2**

### Property 19: Comprehensive Auth Event Logging

*For any* authentication event (success, failure, logout, disconnect), the server logs should contain an entry with timestamp, event type, user email (hashed), and IP address.

**Validates: Requirements 8.6, 11.5, 15.1, 15.2**

### Property 20: HTTPS Enforcement

*For any* OAuth redirect URL or API endpoint URL generated by the system, the protocol should be "https://" (never "http://").

**Validates: Requirements 8.1**


## Error Handling

### Error Categories

**1. OAuth Errors**
- `access_denied`: User declined consent → Show "Authorization cancelled" message
- `invalid_request`: Malformed OAuth parameters → Log error, show "Configuration error"
- `server_error`: Google OAuth service down → Show "Service temporarily unavailable, please try again"

**2. Token Errors**
- `invalid_grant`: Refresh token expired/revoked → Clear session, redirect to login
- `invalid_token`: Access token malformed → Attempt refresh, fallback to login
- Network timeout → Retry with exponential backoff (3 attempts)

**3. Session Errors**
- Missing session cookie → Return 401, prompt login
- Invalid session signature → Clear cookie, return 401
- Session not found in store → Clear cookie, return 401
- Session expired (>30 days) → Clear session, prompt login

**4. Security Violations**
- CSRF state mismatch → Reject request, log security event
- Rate limit exceeded → Return 429, include Retry-After header
- Cross-user access attempt → Reject, log security alert

### Error Response Format

```json
{
  "error": "error_code",
  "error_description": "Human-readable description",
  "user_message": "Simplified message for UI display"
}
```


## Testing Strategy

### Unit Tests

**Frontend (Jest + React Testing Library)**
- PKCE generation produces valid verifier and challenge
- OAuth URL construction includes all required parameters
- Auth state updates correctly on login/logout
- Error messages display for various failure scenarios
- Session cookie is not accessible via document.cookie

**Backend (Jest + Supertest)**
- Token encryption/decryption round-trip
- Session cookie attributes are correct
- Protected endpoints reject invalid cookies
- Rate limiting blocks excessive requests
- CSRF state validation works correctly

### Property-Based Tests

**Library:** fast-check (JavaScript property testing)

**Configuration:** Minimum 100 iterations per property test

**Test Organization:**
- `tests/properties/pkce.test.js` - Properties 1, 2
- `tests/properties/encryption.test.js` - Properties 3, 4, 5
- `tests/properties/cookies.test.js` - Properties 6, 7
- `tests/properties/auth-flow.test.js` - Properties 8, 9, 10
- `tests/properties/security.test.js` - Properties 11, 12, 13, 14, 15, 20
- `tests/properties/error-handling.test.js` - Properties 16, 17, 18, 19

**Example Property Test:**
```javascript
// Feature: persistent-auth, Property 3: Token Encryption Round-Trip
test('encrypted tokens decrypt to original value', () => {
  fc.assert(
    fc.property(
      fc.string({ minLength: 20, maxLength: 200 }), // Random token
      (token) => {
        const encrypted = tokenManager.encryptToken(token);
        const decrypted = tokenManager.decryptToken(encrypted);
        return decrypted === token;
      }
    ),
    { numRuns: 100 }
  );
});
```

### Integration Tests

- Full OAuth flow with mocked Google endpoints
- Token refresh with expired access token
- Soft logout followed by re-login
- Hard disconnect followed by full re-auth
- Session expiry and cleanup

### Security Tests

- Attempt to access another user's tokens
- Attempt to tamper with session cookie
- Attempt to replay authorization code
- Attempt to use revoked refresh token
- Verify tokens never appear in logs or responses


## Deployment and Configuration

### Netlify Configuration

**netlify.toml:**
```toml
[build]
  functions = "netlify/functions"
  publish = "build"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[functions]
  node_bundler = "esbuild"
```

### Environment Variables

**Required in Netlify Dashboard:**
```
GOOGLE_CLIENT_ID=<from Google Cloud Console>
GOOGLE_CLIENT_SECRET=<from Google Cloud Console>
GOOGLE_REDIRECT_URI=https://yourdomain.com/api/auth/callback
ENCRYPTION_KEY=<generate with: openssl rand -hex 32>
SESSION_SECRET=<generate with: openssl rand -hex 32>
TOKEN_STORE_TYPE=netlify-blobs  # or "upstash-redis"
# If using Upstash Redis:
UPSTASH_REDIS_REST_URL=<from Upstash dashboard>
UPSTASH_REDIS_REST_TOKEN=<from Upstash dashboard>
```

### Google Cloud Console Setup

1. Create OAuth 2.0 Client ID (Web application)
2. Add authorized JavaScript origins:
   - `https://yourdomain.com`
3. Add authorized redirect URIs:
   - `https://yourdomain.com/api/auth/callback`
4. Enable Google Sheets API
5. Set OAuth consent screen (External, no verification needed for personal use)

### Token Storage Options

**Option A: Netlify Blobs (Recommended)**
- Free tier: 1GB storage
- Built-in, no external dependencies
- Requires manual TTL implementation

**Option B: Upstash Redis**
- Free tier: 10K requests/day
- Native TTL support
- Slightly more complex setup


## Security Considerations

### Threat Mitigation

**1. OAuth Token Leakage**
- Mitigation: Tokens never sent to frontend, HttpOnly cookies only
- Mitigation: Encryption at rest using AES-256-GCM
- Mitigation: No logging of token values

**2. Session Fixation**
- Mitigation: Regenerate session ID after authentication
- Mitigation: Cryptographic binding of session to user email
- Mitigation: HMAC signature on session cookie

**3. CSRF Attacks**
- Mitigation: SameSite=Strict on cookies
- Mitigation: OAuth state parameter validation
- Mitigation: Origin header validation on API requests

**4. Cross-User Access**
- Mitigation: Session ID cryptographically bound to user email
- Mitigation: Token store keys include user email
- Mitigation: Validation on every token retrieval

**5. Token Replay**
- Mitigation: Authorization codes used exactly once
- Mitigation: Short-lived access tokens (1 hour)
- Mitigation: Refresh token rotation (optional enhancement)

**6. Man-in-the-Middle**
- Mitigation: HTTPS enforced everywhere
- Mitigation: Secure flag on cookies
- Mitigation: HSTS headers recommended

### Security Checklist

- [ ] All OAuth redirects use HTTPS
- [ ] Encryption keys stored in environment variables (never in code)
- [ ] Session cookies have HttpOnly, Secure, SameSite=Strict
- [ ] Rate limiting implemented on token endpoints
- [ ] Tokens never logged or sent to frontend
- [ ] CSRF state validation on OAuth callback
- [ ] Session fixation prevention via ID regeneration
- [ ] Cross-user access prevented by email binding
- [ ] Authorization codes validated for single use
- [ ] Failed auth attempts logged with IP address


## Migration Strategy

### Phase 1: Backend Deployment

1. Deploy Netlify Functions without changing frontend
2. Test backend endpoints in isolation
3. Verify token encryption/decryption
4. Verify session cookie creation

### Phase 2: Frontend Migration

1. Add migration detection logic:
```javascript
const hasOldAuth = sessionStorage.getItem('googleAccessToken') !== null;
if (hasOldAuth) {
  showMigrationPrompt();
}
```

2. Prompt user: "We've upgraded our security. Please sign in again (one-time only)."

3. Clear old sessionStorage tokens

4. Redirect to new OAuth flow

### Phase 3: Cleanup

1. Remove old OAuth client code after 30 days
2. Monitor for users still on old auth (should be zero)
3. Remove migration detection code

### Rollback Plan

If critical issues arise:
1. Revert frontend to old OAuth flow
2. Keep backend functions deployed (no harm)
3. Fix issues in staging environment
4. Re-deploy when ready

