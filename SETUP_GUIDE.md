# 🔧 Google Cloud Console Setup Guide

This guide will walk you through setting up Google Sheets API access for the Finance Dashboard.

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click "New Project"
4. Enter project name: "Finance Dashboard"
5. Click "Create"

## Step 2: Enable Google Sheets API

1. In the left sidebar, go to "APIs & Services" > "Library"
2. Search for "Google Sheets API"
3. Click on it
4. Click "Enable"

## Step 3: Create OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Select "External" user type
3. Click "Create"
4. Fill in the required fields:
   - **App name**: Finance Dashboard
   - **User support email**: Your email
   - **Developer contact**: Your email
5. Click "Save and Continue"
6. On "Scopes" page, click "Add or Remove Scopes"
7. Add these scopes:
   - `https://www.googleapis.com/auth/spreadsheets`
   - `https://www.googleapis.com/auth/drive.file`
8. Click "Update" then "Save and Continue"
9. On "Test users" page, add your email
10. Click "Save and Continue"

## Step 4: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Select "Web application"
4. Enter name: "Finance Dashboard Web Client"
5. Under "Authorized JavaScript origins", add:
   ```
   http://localhost:3000
   ```
6. If deploying to production, also add your production URL:
   ```
   https://yourdomain.com
   ```
7. Click "Create"
8. Copy the **Client ID** (looks like: `xxxxx.apps.googleusercontent.com`)

## Step 5: Configure Your App

1. In your project folder, create `.env` file:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and add your Client ID:
   ```
   REACT_APP_GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
   ```

3. Save the file

## Step 6: Load Google Identity Services

The app automatically loads Google Identity Services library. Make sure you have internet connection when running the app.

## Step 7: Test the Setup

1. Start your app:
   ```bash
   npm start
   ```

2. Create a user profile

3. Click "Sign in with Google"

4. You should see Google's OAuth consent screen

5. Grant the requested permissions

6. You should see "✅ Authenticated"

## Troubleshooting

### Error: "redirect_uri_mismatch"
- Go back to Google Cloud Console > Credentials
- Edit your OAuth client
- Make sure `http://localhost:3000` is in "Authorized JavaScript origins"
- Save and try again

### Error: "Access blocked: This app's request is invalid"
- Make sure you completed the OAuth consent screen setup
- Add your email as a test user
- Try again

### Error: "API key not valid"
- You don't need an API key for this app
- Only the Client ID is required
- Check if your `.env` file has the correct Client ID

### Authentication popup blocked
- Allow popups for localhost in your browser
- Try again

### "Failed to connect to sheet"
- Make sure the Sheet ID is correct
- Check if you have access to the sheet
- Verify you granted all required permissions

## Security Best Practices

1. **Never commit `.env` file**
   - It's already in `.gitignore`
   - Never share your Client ID publicly

2. **Keep sheets private**
   - Set sharing to "Only Me"
   - Don't share the Sheet ID publicly

3. **Use HTTPS in production**
   - Always use HTTPS for production deployments
   - Update authorized origins accordingly

4. **Limit OAuth scopes**
   - Only request necessary permissions
   - Current scopes are minimal and safe

## Production Deployment

When deploying to production:

1. Add your production URL to "Authorized JavaScript origins"
2. Update OAuth consent screen if needed
3. Consider publishing the OAuth app (removes "unverified app" warning)
4. Use environment variables for the Client ID
5. Enable HTTPS

## API Quotas

Google Sheets API has these limits:
- **Read requests**: 300 per minute per project
- **Write requests**: 300 per minute per project

For personal use, these limits are more than sufficient.

## Need Help?

- [Google Sheets API Documentation](https://developers.google.com/sheets/api)
- [OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)

---

✅ Once setup is complete, you're ready to use the Finance Dashboard!
