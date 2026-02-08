# Testing on Localhost ✅

## Server Status
🟢 **Development server is running!**

**URL:** http://localhost:3000

## What to Test

### 1. Persistent Authentication Flow
1. Open http://localhost:3000 in your browser
2. Login with a username (e.g., "TestUser")
3. Click "Sign in with Google"
4. Grant permissions in the OAuth popup
5. Enter your Google Sheet ID
6. Click "Test Connection & Setup"
7. Should redirect to Dashboard ✅

### 2. Page Refresh Test
1. Once on Dashboard, **refresh the page** (F5 or Ctrl+R)
2. Should stay on Dashboard (no re-login needed) ✅
3. Check header - should show "🟢 Authenticated"

### 3. Tab Close/Reopen Test
1. Close the browser tab
2. Open http://localhost:3000 again
3. Should automatically redirect to Dashboard ✅
4. No need to re-enter sheet ID or re-authenticate

### 4. Browser Close Test
1. Close entire browser (all windows)
2. Open browser and go to http://localhost:3000
3. Should show "Sign in with Google" button
4. Sheet ID should be pre-filled (if you entered it before)
5. After signing in → Auto-redirect to Dashboard ✅

### 5. Add Expense Test
1. Click "➕ Add Expense" tab
2. Fill in the form
3. Click "Add Expense"
4. Should save to Google Sheets
5. Go to Dashboard → Should see the new expense

### 6. History Test
1. Click "📜 History" tab
2. Should see all transactions from Google Sheets
3. Try editing a transaction
4. Try deleting a transaction

### 7. Analytics Test
1. Click "📈 Analytics" tab
2. Should see budget vs actual
3. Should see top 3 expenses
4. Should see need vs want analysis

## Important Notes

### Google OAuth Setup
Make sure your Google Cloud Console has:
- **Authorized JavaScript origins:** `http://localhost:3000`
- **Authorized redirect URIs:** `http://localhost:3000`

If you get `redirect_uri_mismatch` error:
1. Go to https://console.cloud.google.com/apis/credentials
2. Edit your OAuth 2.0 Client ID
3. Add the URLs above
4. Save and wait 5 minutes
5. Clear browser cache and try again

### Session Persistence
- ✅ Token stored in `sessionStorage` (survives page refresh)
- ✅ Auto-clears when browser closes (security)
- ✅ Sheet ID stored in `localStorage` (persists forever)
- ✅ No financial data stored locally

### Expected Behavior

| Action | Expected Result |
|--------|----------------|
| First login | Sign in with Google → Enter Sheet ID → Dashboard |
| Page refresh | Stay on Dashboard (no re-login) ✅ |
| Close tab, reopen | Auto-redirect to Dashboard ✅ |
| Close browser, reopen | Need to re-auth (sheet ID remembered) |
| Logout | Clear token → Back to login page |

## Troubleshooting

### Issue: "redirect_uri_mismatch"
**Solution:** Update Google OAuth settings (see above)

### Issue: "Authentication expired"
**Solution:** Token expired (1 hour). Click "Sign in with Google" again.

### Issue: "Sheet not found"
**Solution:** Check Sheet ID is correct and you have access to the sheet.

### Issue: Styles not loading
**Solution:** 
```bash
# Stop server (Ctrl+C in terminal)
rmdir /s /q node_modules\.cache
npm start
```

### Issue: Changes not reflecting
**Solution:** Hard refresh browser (Ctrl+Shift+R)

## Stop the Server

To stop the development server:
1. Go to terminal where server is running
2. Press `Ctrl+C`

Or use the Kiro process manager to stop it.

## Next Steps

Once testing is complete:
1. ✅ Verify all features work
2. ✅ Test persistent auth flow
3. 🚀 Deploy to Vercel (see VERCEL_DEPLOY.md)

---

**Current Status:** 🟢 Server running on http://localhost:3000

**Ready to test!** Open the URL in your browser.
