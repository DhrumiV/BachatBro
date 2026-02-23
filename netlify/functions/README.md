# Netlify Functions - Authentication Backend

This directory contains serverless functions for handling OAuth authentication and token management.

## Setup Instructions

### 1. Generate Security Keys

Run these commands to generate secure random keys:

```bash
# Generate encryption key
openssl rand -hex 32

# Generate session secret
openssl rand -hex 32
```

### 2. Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google Sheets API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Choose "Web application"
6. Add authorized JavaScript origins:
   - `http://localhost:3000` (for development)
   - `https://yourdomain.com` (for production)
7. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback` (for development)
   - `https://yourdomain.com/api/auth/callback` (for production)
8. Copy the Client ID and Client Secret

### 3. Set Environment Variables in Netlify

Go to your Netlify site dashboard → Site settings → Environment variables

Add the following variables:

```
GOOGLE_CLIENT_ID=<your-client-id>
GOOGLE_CLIENT_SECRET=<your-client-secret>
GOOGLE_REDIRECT_URI=https://yourdomain.com/api/auth/callback
ENCRYPTION_KEY=<generated-hex-key>
SESSION_SECRET=<generated-hex-key>
TOKEN_STORE_TYPE=netlify-blobs
NODE_ENV=production
```

### 4. Local Development

For local testing, create a `.env` file in the project root (copy from `.env.example`):

```bash
cp .env.example .env
```

Then fill in your values.

**Important:** Never commit `.env` to version control!

### 5. Install Netlify CLI (Optional)

For local testing of functions:

```bash
npm install -g netlify-cli
netlify dev
```

## Function Endpoints

- `POST /api/auth/login` - Initiate OAuth flow
- `GET /api/auth/callback` - Handle OAuth callback
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Soft logout (clear session)
- `POST /api/auth/disconnect` - Hard disconnect (revoke tokens)
- `GET /api/auth/status` - Check authentication status

## Security Notes

- All tokens are encrypted at rest using AES-256-GCM
- Session cookies are HttpOnly, Secure, and SameSite=Strict
- Refresh tokens never sent to frontend
- Rate limiting enforced on token refresh endpoint
- All auth events logged for security monitoring

## Testing

Run tests with:

```bash
npm test
```

Property-based tests use fast-check library with 100+ iterations per property.
