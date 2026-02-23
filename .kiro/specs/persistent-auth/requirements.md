# Requirements Document: Persistent Authentication

## Introduction

This specification defines the authentication persistence system for BachatBro, a personal finance web application where users store financial data in their private Google Sheets. The system must provide seamless re-login experience while maintaining OAuth 2.0 security best practices, operating entirely on free-tier infrastructure.

## Glossary

- **Auth_System**: The complete authentication subsystem including frontend OAuth client, backend token handler, and session manager
- **Access_Token**: Short-lived OAuth 2.0 token used to access Google Sheets API (expires in ~1 hour)
- **Refresh_Token**: Long-lived OAuth 2.0 token used to obtain new access tokens without user interaction
- **Session_Cookie**: HttpOnly, Secure cookie containing encrypted session identifier
- **Soft_Logout**: User-initiated logout that ends the app session but preserves Google authorization
- **Hard_Disconnect**: User-initiated action that revokes all tokens and requires full OAuth consent on next login
- **Backend_Function**: Stateless Netlify serverless function handling OAuth flow and token management
- **Token_Store**: Encrypted server-side storage for refresh tokens (using environment variables or secure key-value store)
- **PKCE**: Proof Key for Code Exchange - OAuth 2.0 security extension for public clients
- **Authorization_Code_Flow**: OAuth 2.0 flow where backend exchanges authorization code for tokens

## Requirements

### Requirement 1: OAuth Authorization Code Flow with PKCE

**User Story:** As a user, I want to authenticate with Google once, so that I can access my financial data without repeated consent screens.

#### Acceptance Criteria

1. WHEN a user initiates login, THE Auth_System SHALL generate a PKCE code verifier and code challenge
2. WHEN redirecting to Google OAuth, THE Auth_System SHALL include the code challenge and use Authorization Code Flow
3. WHEN Google redirects back with authorization code, THE Backend_Function SHALL exchange the code for access and refresh tokens using the code verifier
4. WHEN tokens are received, THE Backend_Function SHALL validate the tokens against Google's token endpoint
5. WHERE the OAuth scope is specified, THE Auth_System SHALL request only `https://www.googleapis.com/auth/spreadsheets` scope

### Requirement 2: Secure Token Storage

**User Story:** As a security-conscious user, I want my OAuth tokens stored securely, so that my financial data remains protected.

#### Acceptance Criteria

1. WHEN a refresh token is received, THE Backend_Function SHALL encrypt it using AES-256-GCM before storage
2. THE Backend_Function SHALL store encrypted refresh tokens in a secure key-value store tied to user email
3. THE Backend_Function SHALL NOT log refresh tokens or access tokens in any form
4. THE Backend_Function SHALL NOT send refresh tokens to the frontend under any circumstance
5. WHEN storing tokens, THE Backend_Function SHALL associate them with a unique session identifier
6. THE Backend_Function SHALL set token expiry metadata to enable automatic cleanup

### Requirement 3: Session Cookie Management

**User Story:** As a user, I want my login session to persist across browser sessions, so that I don't have to re-authenticate frequently.

#### Acceptance Criteria

1. WHEN authentication succeeds, THE Backend_Function SHALL create an HttpOnly session cookie
2. THE Backend_Function SHALL set the Secure flag on session cookies to enforce HTTPS-only transmission
3. THE Backend_Function SHALL set SameSite=Strict on session cookies to prevent CSRF attacks
4. THE Backend_Function SHALL set session cookie expiry to 30 days from creation
5. WHEN a session cookie is created, THE Backend_Function SHALL include an encrypted session identifier that maps to the stored refresh token
6. THE Backend_Function SHALL NOT include any user data or tokens in the cookie value

### Requirement 4: Silent Token Refresh

**User Story:** As a returning user, I want to be logged in automatically when I revisit the app, so that I can access my data immediately.

#### Acceptance Criteria

1. WHEN a user visits the app with a valid session cookie, THE Auth_System SHALL verify the session without user interaction
2. WHEN an access token is expired, THE Backend_Function SHALL use the refresh token to obtain a new access token silently
3. WHEN token refresh succeeds, THE Backend_Function SHALL return the new access token to the frontend
4. IF the refresh token is invalid or expired, THEN THE Auth_System SHALL clear the session and redirect to login
5. THE Backend_Function SHALL complete token refresh within 2 seconds to maintain responsive UX

### Requirement 5: Soft Logout (Session Termination)

**User Story:** As a user, I want to log out of the app without disconnecting my Google account, so that I can quickly log back in later.

#### Acceptance Criteria

1. WHEN a user clicks "Logout", THE Auth_System SHALL destroy the session cookie
2. WHEN performing soft logout, THE Auth_System SHALL NOT revoke the refresh token
3. WHEN performing soft logout, THE Auth_System SHALL NOT call Google's token revocation endpoint
4. WHEN performing soft logout, THE Auth_System SHALL clear all frontend state including user data and sheet ID
5. WHEN a user logs in after soft logout, THE Auth_System SHALL use the stored refresh token for silent authentication

### Requirement 6: Hard Disconnect (Full Revocation)

**User Story:** As a user, I want to completely disconnect my Google account from the app, so that I can revoke all access when needed.

#### Acceptance Criteria

1. WHERE a "Disconnect Google Account" option exists in Settings, THE Auth_System SHALL provide explicit hard disconnect functionality
2. WHEN a user initiates hard disconnect, THE Auth_System SHALL display a confirmation dialog explaining the consequences
3. WHEN hard disconnect is confirmed, THE Backend_Function SHALL revoke the refresh token via Google's revocation endpoint
4. WHEN hard disconnect is confirmed, THE Backend_Function SHALL delete the encrypted refresh token from storage
5. WHEN hard disconnect is confirmed, THE Auth_System SHALL destroy the session cookie
6. WHEN hard disconnect is confirmed, THE Auth_System SHALL clear all user data including sheet ID from frontend storage
7. WHEN a user logs in after hard disconnect, THE Auth_System SHALL require full OAuth consent flow

### Requirement 7: Token Lifecycle Management

**User Story:** As a system administrator, I want expired tokens to be cleaned up automatically, so that the system remains secure and efficient.

#### Acceptance Criteria

1. WHEN a refresh token is stored, THE Backend_Function SHALL record the creation timestamp
2. THE Backend_Function SHALL implement automatic cleanup of refresh tokens older than 90 days
3. WHEN a session cookie expires, THE Backend_Function SHALL mark the associated refresh token for deletion
4. IF a token refresh fails with "invalid_grant" error, THEN THE Backend_Function SHALL delete the invalid refresh token
5. THE Backend_Function SHALL run token cleanup operations daily via scheduled function

### Requirement 8: Security Invariants

**User Story:** As a security engineer, I want the authentication system to enforce security invariants, so that vulnerabilities are prevented by design.

#### Acceptance Criteria

1. THE Auth_System SHALL validate that all OAuth redirects use HTTPS protocol
2. THE Backend_Function SHALL validate that OAuth state parameter matches the session to prevent CSRF
3. THE Backend_Function SHALL validate that authorization codes are used exactly once
4. THE Backend_Function SHALL reject requests with missing or invalid session cookies
5. THE Backend_Function SHALL implement rate limiting of 10 requests per minute per user for token refresh endpoints
6. THE Backend_Function SHALL log all authentication failures with timestamp and IP address for security monitoring

### Requirement 9: Cross-User Isolation

**User Story:** As a user, I want my authentication session to be isolated from other users, so that my data cannot be accessed by others.

#### Acceptance Criteria

1. WHEN storing refresh tokens, THE Backend_Function SHALL use user email as the primary isolation key
2. THE Backend_Function SHALL validate that session cookies can only access tokens belonging to the authenticated user
3. THE Backend_Function SHALL prevent session fixation by regenerating session identifiers after authentication
4. IF a session cookie is presented for a different user email, THEN THE Backend_Function SHALL reject the request and clear the cookie
5. THE Backend_Function SHALL implement cryptographic binding between session identifier and user email

### Requirement 10: Frontend Authentication State

**User Story:** As a user, I want the app to reflect my authentication status accurately, so that I know when I'm logged in or out.

#### Acceptance Criteria

1. WHEN the app loads, THE Auth_System SHALL check for a valid session cookie before rendering protected routes
2. WHEN authentication status changes, THE Auth_System SHALL update the UI within 500ms
3. WHEN an access token expires during app usage, THE Auth_System SHALL refresh it transparently without user disruption
4. IF token refresh fails, THEN THE Auth_System SHALL display a "Session expired, please log in again" message
5. THE Auth_System SHALL NOT store access tokens or refresh tokens in localStorage or sessionStorage

### Requirement 11: Error Handling and Recovery

**User Story:** As a user, I want clear error messages when authentication fails, so that I can understand and resolve issues.

#### Acceptance Criteria

1. WHEN OAuth authorization fails, THE Auth_System SHALL display a user-friendly error message explaining the failure
2. WHEN token refresh fails due to network issues, THE Auth_System SHALL retry up to 3 times with exponential backoff
3. IF all retry attempts fail, THEN THE Auth_System SHALL prompt the user to log in again
4. WHEN Google's OAuth service is unavailable, THE Auth_System SHALL display a "Service temporarily unavailable" message
5. THE Auth_System SHALL log detailed error information server-side while showing simplified messages to users

### Requirement 12: Privacy and Transparency

**User Story:** As a privacy-conscious user, I want to understand how my authentication data is handled, so that I can trust the application.

#### Acceptance Criteria

1. THE Auth_System SHALL display a privacy notice during first login explaining token storage and usage
2. THE Auth_System SHALL provide a "How is my data secured?" link in Settings that explains the authentication architecture
3. THE Auth_System SHALL truthfully state: "We do not store your financial data"
4. THE Auth_System SHALL truthfully state: "Your data stays in your Google account"
5. THE Auth_System SHALL truthfully state: "Logging out does not revoke Google access"
6. THE Auth_System SHALL truthfully state: "You can disconnect Google anytime from Settings"

### Requirement 13: Backward Compatibility

**User Story:** As an existing user, I want the new authentication system to work with my existing setup, so that I don't lose access to my data.

#### Acceptance Criteria

1. WHEN the new auth system is deployed, THE Auth_System SHALL detect users with old sessionStorage-based tokens
2. WHEN an old token is detected, THE Auth_System SHALL prompt the user to re-authenticate once with a clear explanation
3. WHEN re-authentication completes, THE Auth_System SHALL migrate the user to the new persistent auth system
4. THE Auth_System SHALL preserve the user's sheet ID during migration
5. THE Auth_System SHALL clear old sessionStorage tokens after successful migration

### Requirement 14: Performance Requirements

**User Story:** As a user, I want authentication operations to be fast, so that the app feels responsive.

#### Acceptance Criteria

1. WHEN a user initiates login, THE Auth_System SHALL redirect to Google OAuth within 500ms
2. WHEN OAuth callback is received, THE Backend_Function SHALL complete token exchange within 2 seconds
3. WHEN refreshing an access token, THE Backend_Function SHALL complete the operation within 1 second
4. THE Backend_Function SHALL cache encryption keys in memory to avoid repeated key derivation
5. THE Auth_System SHALL use connection pooling for Google API requests to minimize latency

### Requirement 15: Monitoring and Observability

**User Story:** As a system operator, I want to monitor authentication health, so that I can detect and resolve issues proactively.

#### Acceptance Criteria

1. THE Backend_Function SHALL log successful authentications with timestamp and user email (hashed)
2. THE Backend_Function SHALL log failed authentication attempts with error type and timestamp
3. THE Backend_Function SHALL expose metrics for token refresh success rate
4. THE Backend_Function SHALL expose metrics for average token refresh latency
5. THE Backend_Function SHALL alert when token refresh failure rate exceeds 5% over a 1-hour window

## Notes

- All requirements assume Netlify Functions as the backend platform
- Encryption keys must be stored in Netlify environment variables
- Token storage can use Netlify Blobs (free tier: 1GB) or external KV store like Upstash Redis (free tier: 10K requests/day)
- PKCE implementation must use SHA-256 for code challenge
- Session identifiers must be cryptographically random (minimum 128 bits entropy)
- All timestamps must use UTC timezone
- Rate limiting can be implemented using Netlify Edge Functions or external service like Upstash Rate Limiting
