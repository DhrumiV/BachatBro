# 🔑 Google OAuth Setup Guide

## ✅ What You Need

**ONLY Client ID** - No API Key needed!

Your `.env` file should look like this:
```
REACT_APP_GOOGLE_CLIENT_ID="your-client-id-here.apps.googleusercontent.com"
```

---

## 📋 Step-by-Step Setup

### 1. Go to Google Cloud Console
Visit: https://console.cloud.google.com/

### 2. Create/Select Project
- Click "Select a project" at the top
- Click "New Project"
- Name it: "Finance Dashboard" (or any name)
- Click "Create"

### 3. Enable Google Sheets API
- Go to: https://console.cloud.google.com/apis/library
- Search for "Google Sheets API"
- Click on it
- Click "Enable"

### 4. Create OAuth Credentials
- Go to: https://console.cloud.google.com/apis/credentials
- Click "Create Credentials" → "OAuth client ID"
- If prompted, configure OAuth consent screen first:
  - User Type: **External**
  - App name: "Finance Dashboard"
  - User support email: Your email
  - Developer contact: Your email
  - Click "Save and Continue"
  - Scopes: Skip (click "Save and Continue")
  - Test users: Add your Gmail (click "Add Users")
  - Click "Save and Continue"

### 5. Create OAuth Client ID
- Application type: **Web application**
- Name: "Finance Dashboard Web Client"
- Authorized JavaScript origins:
  ```
  http://localhost:3000
  ```
- Authorized redirect URIs:
  ```
  http://localhost:3000
  ```
- Click "Create"

### 6. Copy Client ID
- You'll see a popup with your Client ID
- It looks like: `123456789-abc123xyz.apps.googleusercontent.com`
- Copy this entire string

### 7. Add to .env File
Open your `.env` file and paste:
```
REACT_APP_GOOGLE_CLIENT_ID="123456789-abc123xyz.apps.googleusercontent.com"
```

### 8. Restart Development Server
```bash
# Stop the server (Ctrl+C)
npm start
```

---

## ✅ Your Current Setup

Based on your `.env` file:
```
REACT_APP_GOOGLE_CLIENT_ID="903372451290-tvful4srocgmcf24og3gccdtfmrov52p.apps.googleusercontent.com"
```

This looks correct! ✅

---

## 🚨 Important Notes

### ❌ You DO NOT Need:
- ❌ API Key
- ❌ Service Account
- ❌ JSON credentials file
- ❌ Backend server

### ✅ You ONLY Need:
- ✅ Client ID (already in your .env)
- ✅ Google Sheets API enabled
- ✅ OAuth consent screen configured

---

## 🧪 Test Your Setup

### 1. Start the app:
```bash
npm start
```

### 2. Create a user profile

### 3. Click "Connect Google Sheet"

### 4. You should see:
- Google sign-in popup
- Permission request for Google Sheets
- Success message after granting permission

### 5. If you see errors:
- Check browser console (F12)
- Verify Client ID is correct
- Ensure Google Sheets API is enabled
- Check authorized origins match your URL

---

## 🔧 Troubleshooting

### Error: "Client ID not configured"
**Fix:** Check your `.env` file has `REACT_APP_GOOGLE_CLIENT_ID`

### Error: "Popup blocked"
**Fix:** Allow popups for localhost in browser settings

### Error: "Access blocked: This app's request is invalid"
**Fix:** 
- Check authorized JavaScript origins in Google Console
- Must include: `http://localhost:3000`

### Error: "Google Sheets API has not been used"
**Fix:** 
- Go to Google Cloud Console
- Enable Google Sheets API
- Wait 1-2 minutes for activation

### Error: "The OAuth client was not found"
**Fix:**
- Verify Client ID is copied correctly
- No extra spaces or quotes
- Restart development server

---

## 📱 For Production Deployment

When you deploy to production (e.g., Netlify):

### 1. Update Authorized Origins
Add your production URL:
```
https://your-app.netlify.app
```

### 2. Update Environment Variable
In Netlify/Vercel dashboard:
- Add environment variable
- Name: `REACT_APP_GOOGLE_CLIENT_ID`
- Value: Your Client ID

### 3. Redeploy
The app will use the production Client ID

---

## ✅ Verification Checklist

- [x] Google Cloud project created
- [x] Google Sheets API enabled
- [x] OAuth consent screen configured
- [x] OAuth Client ID created
- [x] Client ID added to .env
- [x] Authorized origins set to localhost:3000
- [ ] App tested with Google sign-in
- [ ] Sheet connection works

---

## 🎯 Quick Reference

**What goes in .env:**
```
REACT_APP_GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
```

**Where it's used:**
- `src/services/googleSheetsService.js` - OAuth initialization

**What it does:**
- Identifies your app to Google
- Allows OAuth 2.0 authentication
- Grants access to Google Sheets API

**Security:**
- Client ID is public (safe to expose)
- No secret key needed for client-side OAuth
- Tokens stored in memory only

---

## 📞 Need Help?

Check these files:
- `INSTALLATION.md` - Full setup guide
- `GETTING_STARTED.md` - Quick start
- `FAQ.md` - Common questions
- `TROUBLESHOOTING.md` - Error solutions

---

**Your setup looks good! You're ready to test the app.** 🚀
