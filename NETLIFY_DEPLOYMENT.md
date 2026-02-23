# Netlify Deployment Guide

This guide walks you through deploying BachatBro with Netlify Functions for persistent authentication.

## Prerequisites

- GitHub account
- Netlify account (free tier)
- Google Cloud Console project with OAuth credentials

## Step 1: Prepare Your Repository

1. Ensure all changes are committed:
```bash
git add .
git commit -m "Add Netlify Functions for persistent auth"
git push origin main
```

## Step 2: Connect to Netlify

1. Go to [Netlify](https://app.netlify.com/)
2. Click "Add new site" → "Import an existing project"
3. Choose "GitHub" and authorize Netlify
4. Select your BachatBro repository
5. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `build`
   - **Functions directory**: `netlify/functions`

## Step 3: Configure Environment Variables

In Netlify dashboard → Site settings → Environment variables, add:

### Required Variables

```
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
GOOGLE_REDIRECT_URI=https://your-site-name.netlify.app/api/auth/callback
ENCRYPTION_KEY=<generate-with-openssl-rand-hex-32>
SESSION_SECRET=<generate-with-openssl-rand-hex-32>
TOKEN_STORE_TYPE=netlify-blobs
NODE_ENV=production
```

### Generate Security Keys

Run these commands locally to generate secure keys:

```bash
# Encryption key
openssl rand -hex 32

# Session secret
openssl rand -hex 32
```

Copy the output and paste into Netlify environment variables.

## Step 4: Update Google OAuth Settings

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to your OAuth 2.0 Client ID
3. Add your Netlify URL to authorized origins:
   - `https://your-site-name.netlify.app`
4. Add callback URL to authorized redirect URIs:
   - `https://your-site-name.netlify.app/api/auth/callback`
5. Save changes

## Step 5: Deploy

1. Click "Deploy site" in Netlify
2. Wait for build to complete (~2-3 minutes)
3. Once deployed, test the health endpoint:
   ```
   https://your-site-name.netlify.app/api/health
   ```
   Should return: `{"status":"ok","message":"Netlify Functions are operational"}`

## Step 6: Test Authentication

1. Visit your deployed site
2. Click "Sign in with Google"
3. Complete OAuth flow
4. Verify you're logged in
5. Close browser and reopen → Should still be logged in (persistent session)

## Troubleshooting

### Functions not working

- Check Netlify function logs: Site → Functions → View logs
- Verify environment variables are set correctly
- Ensure `netlify.toml` is in repository root

### OAuth errors

- Verify redirect URI matches exactly in Google Console
- Check that authorized origins include your Netlify domain
- Ensure HTTPS is used (Netlify provides this automatically)

### Build failures

- Check build logs in Netlify dashboard
- Verify all dependencies are in `package.json`
- Ensure Node.js version is compatible (18+)

## Custom Domain (Optional)

1. In Netlify: Site settings → Domain management
2. Add custom domain
3. Update DNS records as instructed
4. Update environment variables:
   - `GOOGLE_REDIRECT_URI=https://yourdomain.com/api/auth/callback`
5. Update Google OAuth authorized URIs to use custom domain
6. Redeploy site

## Monitoring

- **Function logs**: Netlify dashboard → Functions → Logs
- **Analytics**: Netlify dashboard → Analytics
- **Error tracking**: Check function logs for auth failures

## Security Checklist

- [ ] Environment variables set in Netlify (not in code)
- [ ] HTTPS enforced (automatic with Netlify)
- [ ] Google OAuth redirect URIs match exactly
- [ ] Security headers configured in `netlify.toml`
- [ ] `.env` file in `.gitignore` (never commit secrets)
- [ ] Encryption keys are random and unique
- [ ] OAuth scope limited to `spreadsheets` only

## Cost

Netlify Free Tier includes:
- 125K function invocations/month
- 100 hours function runtime/month
- 1GB Netlify Blobs storage
- Automatic HTTPS
- Continuous deployment

This is more than sufficient for personal use and small teams.

## Next Steps

After successful deployment:
1. Test all authentication flows
2. Monitor function logs for errors
3. Set up alerts for function failures (Netlify Pro feature)
4. Consider adding custom domain for professional appearance
