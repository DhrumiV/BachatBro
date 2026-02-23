# BachatBro PWA Implementation

## Overview
BachatBro is now a fully functional Progressive Web App (PWA) that can be installed on mobile devices and works offline.

## Part 1 - PWA Setup ✅

### Manifest File
**Location:** `public/manifest.json`
- App name: "BachatBro - Personal Finance Tracker"
- Theme color: #4F6EF7 (accent blue)
- Background: #0A0A0F (dark)
- Display mode: standalone
- Orientation: portrait
- Icons: 192x192 and 512x512

### App Icons
**Location:** `public/icons/`
- icon-192.png (192x192)
- icon-512.png (512x512)
- Design: Dark background with blue circle and white ₹ symbol
- Generated via: `generate-icons.js` script

### Service Worker
**Location:** `public/sw.js`
- Cache name: 'bachatbro-v1'
- Caches static assets on install
- Cache-first strategy for static assets (CSS, JS, images)
- Network-first strategy for HTML pages
- Handles offline fallbacks
- Auto-updates on new version

### Service Worker Registration
**Location:** `src/index.js`
- Registers service worker on page load
- Checks for updates
- Prompts user to reload on new version

### HTML Meta Tags
**Location:** `public/index.html`
- PWA manifest link
- Apple touch icon
- Apple mobile web app capable
- Theme color
- Viewport with safe-area-inset support
- Mobile optimization meta tags

## Part 2 - Offline Experience ✅

### Offline Manager
**Location:** `src/utils/offlineManager.js`

**Features:**
- Detects online/offline status
- Caches transactions locally
- Manages sync queue for offline transactions
- Auto-syncs when back online
- Provides subscription API for components

**API:**
```javascript
// Subscribe to online/offline events
offlineManager.subscribe((status) => {
  console.log(status); // 'online' or 'offline'
});

// Cache transactions
offlineManager.cacheTransactions(transactions);

// Get cached transactions
const cached = offlineManager.getCachedTransactions();

// Add transaction to sync queue
offlineManager.addToSyncQueue(transaction);

// Sync pending transactions
await offlineManager.syncPendingTransactions();

// Check for pending transactions
const hasPending = offlineManager.hasPendingTransactions();
const count = offlineManager.getPendingCount();
```

### Offline Banner
**Location:** `src/components/Common/OfflineBanner.js`

**Features:**
- Shows yellow banner when offline
- Shows green banner when back online
- Auto-syncs pending transactions
- Shows sync progress
- Auto-dismisses after 3 seconds when online
- Manual sync button if pending transactions exist

**Messages:**
- Offline: "You're offline · Data will sync when reconnected"
- Online: "Back online · Syncing..."
- Synced: "Synced X transactions"

### Local Storage Keys
```javascript
{
  TRANSACTIONS: 'bachatbro_transactions_cache',
  SYNC_QUEUE: 'bachatbro_sync_queue',
  LAST_SYNC: 'bachatbro_last_sync'
}
```

## Part 3 - Mobile UI (TODO)

### Navigation
- [ ] Bottom tab bar for mobile (< 768px)
- [ ] 4 tabs: Home, Add, History, More
- [ ] Floating action button for Add
- [ ] Bottom sheet for More menu

### Dashboard Mobile
- [ ] Horizontal swipe between months
- [ ] 2x2 grid for summary cards
- [ ] FAB for Record Expense
- [ ] Card-based recent transactions

### Add Transaction Mobile
- [ ] Full screen page
- [ ] Large touch targets (48px min)
- [ ] Number keyboard for amount
- [ ] Grid of category icons
- [ ] Fixed submit button at bottom

### Transactions Mobile
- [ ] Card-based list view
- [ ] Swipe left for Edit/Delete
- [ ] Horizontal filter pills
- [ ] Pull to refresh

### Categories Mobile
- [ ] Full width cards
- [ ] Swipe left for Edit/Delete
- [ ] Touch-friendly progress bars

### General Mobile Rules
- [ ] 48x48px minimum tap targets
- [ ] 16px minimum font size
- [ ] No horizontal scroll
- [ ] Bottom sheet modals
- [ ] Pull to refresh
- [ ] Safe area insets
- [ ] Touch feedback (active:scale-95)

### Install Prompt
- [ ] Show after first expense added
- [ ] "Add to Home Screen" banner
- [ ] iOS manual instructions
- [ ] Store dismissed state

## Installation

### For Users

**Android/Chrome:**
1. Visit BachatBro in Chrome
2. Tap the "Install" prompt or
3. Menu → "Add to Home Screen"

**iOS/Safari:**
1. Visit BachatBro in Safari
2. Tap Share button
3. Tap "Add to Home Screen"
4. Tap "Add"

### For Developers

```bash
# Install dependencies
npm install

# Run development server
npm start

# Build for production
npm run build

# Test PWA locally
npm run build
npx serve -s build
```

## Testing PWA Features

### Test Offline Mode
1. Open DevTools → Application → Service Workers
2. Check "Offline" checkbox
3. Reload page - should load from cache
4. Add expense - should queue for sync
5. Uncheck "Offline" - should auto-sync

### Test Install
1. Open DevTools → Application → Manifest
2. Check manifest loads correctly
3. Click "Add to Home Screen"
4. Verify app opens in standalone mode

### Test Caching
1. Open DevTools → Application → Cache Storage
2. Verify 'bachatbro-static-v1' cache exists
3. Check cached assets

### Test Service Worker
1. Open DevTools → Application → Service Workers
2. Verify service worker is activated
3. Check for errors in console

## Browser Support

### Full PWA Support
- Chrome/Edge (Android)
- Samsung Internet
- Firefox (Android)
- Opera

### Partial Support (No Install)
- Safari (iOS) - Add to Home Screen manually
- Firefox (Desktop)
- Chrome (Desktop)

### Features by Browser
| Feature | Chrome | Safari | Firefox |
|---------|--------|--------|---------|
| Service Worker | ✅ | ✅ | ✅ |
| Manifest | ✅ | ✅ | ✅ |
| Install Prompt | ✅ | ❌ | ❌ |
| Offline | ✅ | ✅ | ✅ |
| Push Notifications | ✅ | ❌ | ✅ |

## Performance

### Lighthouse Scores (Target)
- Performance: 90+
- Accessibility: 90+
- Best Practices: 90+
- SEO: 90+
- PWA: 100

### Optimizations
- Service worker caching
- Code splitting
- Lazy loading
- Image optimization
- Minification

## Security

### HTTPS Required
PWA features require HTTPS in production. Development works on localhost.

### Data Privacy
- All data stored locally or in user's Google Sheet
- No server-side database
- Service worker only caches static assets
- Transactions cached locally with user consent

## Troubleshooting

### Service Worker Not Registering
- Check HTTPS (required in production)
- Check sw.js is in public folder
- Clear browser cache
- Check console for errors

### Offline Mode Not Working
- Verify service worker is activated
- Check cache storage in DevTools
- Ensure assets are cached
- Check network tab for failed requests

### Install Prompt Not Showing
- Ensure manifest.json is valid
- Check all required manifest fields
- Verify icons exist and load
- Check browser support
- May need user interaction first

### Sync Not Working
- Check online/offline detection
- Verify localStorage access
- Check Google Sheets API auth
- Look for errors in console

## Future Enhancements

- [ ] Background sync API
- [ ] Push notifications for budget alerts
- [ ] Periodic background sync
- [ ] Share target API
- [ ] File handling API
- [ ] Shortcuts API
- [ ] Badge API for pending count

## Resources

- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [Workbox](https://developers.google.com/web/tools/workbox)
