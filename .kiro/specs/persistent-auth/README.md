# Persistent Authentication Spec

## Overview

This specification defines a secure, persistent authentication system for BachatBro using OAuth 2.0 Authorization Code Flow with PKCE, Netlify Functions backend, and HttpOnly session cookies.

## Problem Statement

Currently, users must re-authenticate with Google every time they log out and log back in. This happens because:
- OAuth access tokens are short-lived (1 hour)
- Refresh tokens are not retained
- Session state is not persisted correctly

This creates poor UX and makes the app feel unpolished.

## Solution

Implement a proper OAuth 2.0 Authorization Code Flow with:
- **Backend (Netlify Functions)**: Handles token exchange, storage, and refresh
- **Refresh Token Storage**: Encrypted server-side storage (never exposed to frontend)
- **Session Cookies**: HttpOnly, Secure, SameSite=Strict cookies for session management
- **Soft Logout**: Ends session but preserves Google authorization
- **Hard Disconnect**: Revokes all tokens and requires full re-consent

## Key Benefits

1. **Better UX**: Users log in once, stay logged in for 30 days
2. **Security**: Tokens never exposed to frontend JavaScript
3. **Privacy**: Clear separation between logout and revocation
4. **Free**: Runs entirely on free-tier infrastructure

## Architecture

```
Frontend (React) ←→ Backend (Netlify Functions) ←→ Google OAuth
                            ↓
                    Token Store (Encrypted)
```

## Documents

- **[requirements.md](./requirements.md)**: 15 requirements with EARS-compliant acceptance criteria
- **[design.md](./design.md)**: Complete system design with 20 correctness properties
- **[tasks.md](./tasks.md)**: 20 implementation tasks with sub-tasks

## Implementation Status

- [ ] Requirements: Complete
- [ ] Design: Complete
- [ ] Tasks: Ready for execution
- [ ] Implementation: Not started

## Quick Start

To begin implementation:

1. Review requirements.md to understand what we're building
2. Review design.md to understand how we're building it
3. Open tasks.md and start with Task 1

## Security Guarantees

- ✅ Refresh tokens encrypted at rest (AES-256-GCM)
- ✅ Tokens never sent to frontend
- ✅ HttpOnly cookies prevent XSS token theft
- ✅ PKCE prevents authorization code interception
- ✅ Rate limiting prevents brute force
- ✅ Cross-user isolation enforced cryptographically
- ✅ All auth events logged for security monitoring

## Testing Strategy

- **Unit Tests**: Specific examples and edge cases
- **Property-Based Tests**: 20 properties tested with 100+ random inputs each
- **Integration Tests**: Full OAuth flow end-to-end
- **Security Tests**: Attempt various attacks to verify defenses

## Dependencies

**Backend:**
- Netlify Functions (free tier)
- Netlify Blobs or Upstash Redis (free tier)
- Node.js crypto module

**Frontend:**
- React (existing)
- No new dependencies required

**Testing:**
- Jest (existing)
- fast-check (property-based testing library)

## Timeline Estimate

- Backend implementation: 3-4 days
- Frontend refactor: 2-3 days
- Testing: 2-3 days
- Migration and deployment: 1 day

**Total: ~8-11 days** for complete implementation with comprehensive testing

## Next Steps

1. Set up Netlify Functions infrastructure
2. Implement backend token management
3. Refactor frontend auth service
4. Add comprehensive tests
5. Deploy and migrate users

---

**Status**: Spec complete, ready for implementation
**Last Updated**: 2026-02-09
