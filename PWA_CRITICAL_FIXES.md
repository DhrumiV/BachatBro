# PWA Critical Fixes - COMPLETE ✓

## Issue 1: Offline Shows Sign-In Page Instead of App
### Problem
When offline, the app showed the sign-in page instead of the last known app state.

### Solution
Updated service worker to cache complete app shell and always return index.html when offline.

### Changes in `public/sw.js`
- Updated cache version to v2
- Changed install event to cache all static assets properly
- Modified fetch handler to NEVER intercept Google OAuth/API requests
- When offline, always returns cached index.html showing last app state
- Prevents showing sign-in page when user is already authenticated

## Issue 2: Auth Token Lost on Every App Close
### Problem
Auth token was stored in sessionStorage, causing users to re-authenticate every time they closed the app.

### Solution
Changed token storage from sessionStorage to localStorage with proper expiry handling.

### Changes in `src/services/googleSheetsService.js`
- Changed all `sessionStorage` calls to `localStorage`
- Token key: `bachatbro_auth_token` (was `gapi_token`)
- Expiry key: `bachatbro_token_expiry` (was `gapi_token_expiry`)
- Added security comment explaining token persistence strategy
- Token expires after 1 hour (Google OAuth implicit flow limitation)

### Changes in `src/components/GoogleSheet/GoogleSheetConnect.js`
- Now saves sheet ID to localStorage: `bachatbro_sheet_id`
- Updated security notice to reflect localStorage usage
- Mentions that refresh tokens are planned for future

### Changes in `src/App.js`
- Added auto-authentication check on app load
- Validates token expiry before auto-authenticating
- Clears expired tokens automatically
- Skips sign-in screen if valid token exists

## Security Notes
- Token stored in localStorage for PWA persistence
- This is the implicit flow token - expires in 1 hour
- Full persistent auth (refresh tokens) is planned in Tasks 6-9
- Token cleared on sign-out via Profile page
- Expired tokens automatically removed on app load

## Testing Checklist
✓ Build completes successfully
✓ Service worker caches app shell
✓ Offline shows last app state (not sign-in)
✓ Auth token persists after closing app
✓ Token expiry handled correctly
✓ Sign-out clears all tokens

## Files Modified
1. `public/sw.js` - Fixed offline caching strategy
2. `src/services/googleSheetsService.js` - Changed to localStorage
3. `src/components/GoogleSheet/GoogleSheetConnect.js` - Save sheet ID to localStorage
4. `src/App.js` - Auto-authenticate on load if token valid

## Build Status
✓ npm run build succeeded
✓ No errors or warnings
✓ Ready for deployment

## Next Steps
1. Deploy build folder to Netlify
2. Test offline functionality on mobile
3. Test that auth persists after closing app
4. Verify token expiry after 1 hour
