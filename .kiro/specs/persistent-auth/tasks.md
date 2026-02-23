# Implementation Plan: Persistent Authentication

## Overview

This plan implements secure persistent authentication for BachatBro using OAuth 2.0 Authorization Code Flow with PKCE, Netlify Functions backend, and HttpOnly session cookies. Implementation follows a backend-first approach to ensure security infrastructure is solid before frontend integration.

## Tasks

- [x] 1. Setup Netlify Functions infrastructure
  - Create `netlify.toml` configuration file
  - Create `netlify/functions` directory structure
  - Configure environment variables in Netlify dashboard
  - Test basic function deployment
  - _Requirements: 14.1, 14.2, 14.3_

- [x] 2. Implement token encryption and storage
  - [x] 2.1 Create TokenManager class with encryption methods
    - Implement AES-256-GCM encryption with random IV
    - Implement decryption with authentication tag validation
    - Use crypto.subtle or Node crypto module
    - _Requirements: 2.1_

  - [x] 2.2 Write property test for encryption round-trip
    - **Property 3: Token Encryption Round-Trip**
    - **Validates: Requirements 2.1**

  - [x] 2.3 Implement token storage interface
    - Create abstraction for Netlify Blobs and Upstash Redis
    - Implement store/retrieve/delete operations
    - Include metadata (createdAt, lastUsed, userEmail)
    - _Requirements: 2.2, 2.5, 2.6_

  - [x] 2.4 Write property test for storage round-trip
    - **Property 4: Token Storage Round-Trip**
    - **Validates: Requirements 2.2, 2.5, 2.6, 7.1**

- [x] 3. Implement session cookie management
  - [x] 3.1 Create session cookie utilities
    - Generate cryptographically random session IDs (32 bytes)
    - Implement HMAC-SHA256 signature for session cookies
    - Create cookie serialization with all security attributes
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 3.2 Write property test for cookie security attributes
    - **Property 6: Session Cookie Security Attributes**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4**

  - [x] 3.3 Write property test for cookie structure
    - **Property 7: Session Cookie Structure**
    - **Validates: Requirements 3.5, 3.6**

- [x] 4. Implement PKCE utilities
  - [x] 4.1 Create PKCE generator
    - Generate random code verifier (43-128 characters)
    - Compute SHA-256 code challenge
    - Base64url encode challenge
    - _Requirements: 1.1_

  - [x] 4.2 Write property test for PKCE uniqueness
    - **Property 1: PKCE Generation Uniqueness**
    - **Validates: Requirements 1.1**

- [ ] 5. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Implement OAuth login endpoint
  - [ ] 6.1 Create `/api/auth/login` function
    - Generate PKCE parameters
    - Generate OAuth state parameter
    - Store state and verifier in temporary storage (5 min TTL)
    - Construct Google OAuth URL with all parameters
    - Return redirect URL to frontend
    - _Requirements: 1.1, 1.2, 1.5_

  - [ ] 6.2 Write property test for OAuth URL construction
    - **Property 2: OAuth URL Construction**
    - **Validates: Requirements 1.2, 1.5**

  - [ ] 6.3 Write property test for HTTPS enforcement
    - **Property 20: HTTPS Enforcement**
    - **Validates: Requirements 8.1**

- [ ] 7. Implement OAuth callback endpoint
  - [ ] 7.1 Create `/api/auth/callback` function
    - Validate OAuth state parameter (CSRF protection)
    - Retrieve code verifier from temporary storage
    - Exchange authorization code for tokens with Google
    - Validate tokens with Google's tokeninfo endpoint
    - Encrypt and store refresh token
    - Generate session cookie
    - Return success response with cookie
    - _Requirements: 1.3, 1.4, 2.1, 2.2, 3.1, 8.2_

  - [ ] 7.2 Write unit test for authorization code single-use
    - **Property 11: Authorization Code Single-Use**
    - **Validates: Requirements 8.3**

  - [ ] 7.3 Write property test for session fixation prevention
    - **Property 15: Session Fixation Prevention**
    - **Validates: Requirements 9.3**

- [ ] 8. Implement token refresh endpoint
  - [ ] 8.1 Create `/api/auth/refresh` function
    - Validate session cookie signature
    - Retrieve encrypted refresh token from storage
    - Decrypt refresh token
    - Call Google's token endpoint to get new access token
    - Update lastUsed timestamp in storage
    - Return new access token to frontend
    - _Requirements: 4.1, 4.2, 4.3_

  - [ ] 8.2 Write property test for silent token refresh
    - **Property 8: Silent Token Refresh**
    - **Validates: Requirements 4.2, 4.3**

  - [ ] 8.3 Write property test for protected endpoint security
    - **Property 12: Protected Endpoint Security**
    - **Validates: Requirements 8.4, 9.2**

- [ ] 9. Implement logout endpoints
  - [ ] 9.1 Create `/api/auth/logout` function (soft logout)
    - Clear session cookie (Max-Age=0)
    - Do NOT delete refresh token from storage
    - Do NOT call Google revocation endpoint
    - Return success response
    - _Requirements: 5.1, 5.2, 5.3_

  - [ ] 9.2 Write property test for soft logout preservation
    - **Property 9: Soft Logout Preservation**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4**

  - [ ] 9.3 Create `/api/auth/disconnect` function (hard disconnect)
    - Validate session cookie
    - Retrieve refresh token
    - Call Google's revocation endpoint
    - Delete refresh token from storage
    - Clear session cookie
    - Return success response
    - _Requirements: 6.3, 6.4, 6.5_

  - [ ] 9.4 Write property test for hard disconnect completeness
    - **Property 10: Hard Disconnect Completeness**
    - **Validates: Requirements 6.3, 6.4, 6.5, 6.6**

- [ ] 10. Implement security features
  - [ ] 10.1 Add rate limiting middleware
    - Track requests per user per minute
    - Limit to 10 requests per minute for token refresh
    - Return 429 with Retry-After header when exceeded
    - _Requirements: 8.5_

  - [ ] 10.2 Write property test for rate limiting
    - **Property 13: Rate Limiting Enforcement**
    - **Validates: Requirements 8.5**

  - [ ] 10.3 Add cross-user isolation validation
    - Validate session email matches stored token email
    - Reject requests attempting cross-user access
    - Log security violations
    - _Requirements: 9.1, 9.2, 9.4_

  - [ ] 10.4 Write property test for cross-user isolation
    - **Property 14: Cross-User Isolation**
    - **Validates: Requirements 9.1, 9.2**

- [ ] 11. Checkpoint - Ensure all backend tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 12. Implement frontend auth service
  - [ ] 12.1 Create new AuthService class
    - Implement PKCE generation (client-side)
    - Implement login initiation (call /api/auth/login)
    - Implement OAuth callback handling
    - Implement token refresh logic
    - Implement logout and disconnect methods
    - _Requirements: 1.1, 4.1, 4.2, 5.1, 6.2_

  - [ ] 12.2 Write property test for token storage prohibition
    - **Property 17: Token Storage Prohibition**
    - **Validates: Requirements 10.5**

- [ ] 13. Update React context for new auth flow
  - [ ] 13.1 Modify AppContext to use new AuthService
    - Remove old sessionStorage token logic
    - Add session cookie-based auth state
    - Implement automatic token refresh on API calls
    - Handle auth errors and session expiry
    - _Requirements: 10.1, 10.3, 10.4_

  - [ ] 13.2 Write property test for transparent token refresh
    - **Property 16: Transparent Token Refresh**
    - **Validates: Requirements 10.3**

- [ ] 14. Update Google Sheets service for new auth
  - [ ] 14.1 Modify googleSheetsService to use new auth
    - Replace direct token access with AuthService.getAccessToken()
    - Add automatic retry on 401 errors
    - Remove token storage from service
    - _Requirements: 10.3_

  - [ ] 14.2 Write property test for error retry with backoff
    - **Property 18: Error Retry with Exponential Backoff**
    - **Validates: Requirements 11.2**

- [ ] 15. Implement error handling and logging
  - [ ] 15.1 Add comprehensive error handling
    - Map OAuth errors to user-friendly messages
    - Implement retry logic with exponential backoff
    - Add fallback to login on unrecoverable errors
    - _Requirements: 11.1, 11.2, 11.3, 11.4_

  - [ ] 15.2 Add server-side logging
    - Log all auth events with required metadata
    - Hash user emails in logs for privacy
    - Include timestamp, event type, IP address
    - Separate detailed logs from user messages
    - _Requirements: 8.6, 11.5, 15.1, 15.2_

  - [ ] 15.3 Write property test for auth event logging
    - **Property 19: Comprehensive Auth Event Logging**
    - **Validates: Requirements 8.6, 11.5, 15.1, 15.2**

- [ ] 16. Add UI for hard disconnect
  - [ ] 16.1 Add "Disconnect Google Account" to Settings
    - Add button in Settings component
    - Implement confirmation dialog with explanation
    - Call AuthService.disconnect() on confirmation
    - Clear all user data from frontend
    - Redirect to login page
    - _Requirements: 6.1, 6.2, 6.6_

- [ ] 17. Implement migration logic
  - [ ] 17.1 Add migration detection
    - Check for old sessionStorage tokens on app load
    - Display one-time migration prompt
    - Clear old tokens after migration
    - Preserve sheet ID during migration
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

- [ ] 18. Add privacy notices
  - [ ] 18.1 Create privacy notice component
    - Display during first login
    - Add "How is my data secured?" link in Settings
    - Include all required privacy statements
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6_

- [ ] 19. Implement token cleanup
  - [ ] 19.1 Create scheduled cleanup function
    - Query tokens older than 90 days
    - Delete expired tokens
    - Log cleanup statistics
    - Deploy as Netlify scheduled function (daily)
    - _Requirements: 7.2, 7.3, 7.4_

- [ ] 20. Final checkpoint - Integration testing
  - Test complete OAuth flow end-to-end
  - Test soft logout and re-login
  - Test hard disconnect and full re-auth
  - Test token refresh during active session
  - Test error scenarios and recovery
  - Verify no tokens in browser storage
  - Verify all security properties hold
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Backend tasks (1-11) should be completed before frontend tasks (12-18)
- Property tests use fast-check library with minimum 100 iterations
- All sensitive operations must be logged server-side
- Migration logic can be removed after 30 days post-deployment
- Token cleanup function should run daily via Netlify scheduled functions
- Rate limiting can use in-memory store for MVP, upgrade to Redis for production scale
