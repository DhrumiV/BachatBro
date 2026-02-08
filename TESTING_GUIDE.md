# 🧪 Complete Testing Guide

Step-by-step guide to test your Finance Dashboard.

## 🎯 Testing Objectives

1. ✅ Verify Google authentication works
2. ✅ Test sheet connection and setup
3. ✅ Add and view transactions
4. ✅ Test all CRUD operations
5. ✅ Verify data persistence
6. ✅ Test on mobile devices

---

## 📋 Pre-Testing Setup

### 1. Google Cloud Console Setup (5 minutes)

#### Step 1: Create Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click project dropdown → "New Project"
3. Name: "Finance Dashboard Test"
4. Click "Create"

#### Step 2: Enable APIs
1. Go to "APIs & Services" → "Library"
2. Search "Google Sheets API"
3. Click "Enable"
4. Search "Google Drive API"
5. Click "Enable"

#### Step 3: Configure OAuth Consent
1. Go to "APIs & Services" → "OAuth consent screen"
2. Select "External"
3. Fill in:
   - App name: Finance Dashboard
   - User support email: your@email.com
   - Developer contact: your@email.com
4. Click "Save and Continue"
5. Scopes → "Add or Remove Scopes"
6. Add:
   - `https://www.googleapis.com/auth/spreadsheets`
   - `https://www.googleapis.com/auth/drive.file`
7. Click "Update" → "Save and Continue"
8. Test users → Add your email
9. Click "Save and Continue"

#### Step 4: Create Credentials
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Application type: "Web application"
4. Name: "Finance Dashboard Web"
5. Authorized JavaScript origins:
   ```
   http://localhost:3000
   ```
   (Add production URL later)
6. Click "Create"
7. **Copy the Client ID** (looks like: `xxxxx.apps.googleusercontent.com`)

#### Step 5: Configure App
1. Open `.env` file in your project
2. Add:
   ```
   REACT_APP_GOOGLE_CLIENT_ID=paste_your_client_id_here
   ```
3. Save file

---

## 🚀 Test 1: Local Setup (2 minutes)

### Start the App
```bash
# Install dependencies (first time only)
npm install

# Start development server
npm start
```

**Expected Result:**
- ✅ App opens at `http://localhost:3000`
- ✅ No console errors
- ✅ Login screen appears

**If it fails:**
- Check Node.js is installed: `node --version`
- Check npm is installed: `npm --version`
- Clear cache: `npm cache clean --force`
- Reinstall: `rm -rf node_modules && npm install`

---

## 👤 Test 2: User Profile Creation (1 minute)

### Steps:
1. Enter your name (e.g., "Test User")
2. Click "Continue"

**Expected Result:**
- ✅ Profile created
- ✅ Redirected to "Connect Sheet" screen
- ✅ Name appears in header

**Screenshot:**
```
┌─────────────────────────────────┐
│ 👤 Test User                    │
│    🔴 Not Authenticated         │
└─────────────────────────────────┘
```

---

## 🔐 Test 3: Google Authentication (2 minutes)

### Steps:
1. Click "Sign in with Google"
2. Google popup opens
3. Select your Google account
4. Review permissions:
   - View and manage Google Sheets
   - Create new files in Google Drive
5. Click "Allow"

**Expected Result:**
- ✅ Popup closes
- ✅ "✅ Successfully authenticated with Google" message
- ✅ Green checkmark appears
- ✅ Header shows "🟢 Authenticated"

**If popup blocked:**
- Allow popups for localhost
- Try again

**If authentication fails:**
- Check Client ID in `.env`
- Verify OAuth consent screen configured
- Check browser console for errors

---

## 📊 Test 4: Google Sheet Setup (3 minutes)

### Step 1: Create Google Sheet
1. Go to [Google Sheets](https://sheets.google.com)
2. Click "+ Blank" to create new sheet
3. Name it "Finance Test"
4. Copy the Sheet ID from URL:
   ```
   https://docs.google.com/spreadsheets/d/COPY_THIS_PART/edit
   ```

### Step 2: Connect Sheet
1. Paste Sheet ID in app
2. Click "Test Connection & Setup"

**Expected Result:**
- ✅ "Testing connection..." message
- ✅ "✅ Headers created successfully" or "✅ Sheet is ready"
- ✅ Redirected to Dashboard
- ✅ Sheet now has headers in row 1:
   ```
   | Date | Month | Category | SubCategory | PaymentMethod | CardName | Amount | Type | Notes |
   ```

**Verify in Google Sheet:**
- Open your sheet
- Check row 1 has exactly these headers
- All 9 columns present

---

## ⚙️ Test 5: Settings Configuration (2 minutes)

### Steps:
1. Click "⚙️ Settings" tab
2. Go to "📁 Categories" section
3. Add custom category: "Groceries"
4. Click "Add"
5. Go to "💳 Cards" section
6. Add your card: "HDFC Credit Card"
7. Click "Add"
8. Go to "💵 Monthly Income"
9. Enter: 50000
10. Click "Save Income"

**Expected Result:**
- ✅ Categories updated
- ✅ Cards updated
- ✅ Income saved
- ✅ Success messages shown

---

## 💰 Test 6: Add First Expense (2 minutes)

### Steps:
1. Click "➕ Add Expense" tab
2. Fill form:
   - Date: Today
   - Type: Expense
   - Category: Groceries
   - Sub Category: Vegetables
   - Payment Method: Card
   - Card Name: HDFC Credit Card
   - Amount: 500
   - Notes: Weekly groceries
3. Click "💾 Add Expense"

**Expected Result:**
- ✅ "💾 Saving to Google Sheets..." message
- ✅ "✅ Expense added successfully to Google Sheets!"
- ✅ Form resets

**Verify in Google Sheet:**
1. Open your Google Sheet
2. Check row 2 has your data:
   ```
   | 2026-02-08 | 2026-02 | Groceries | Vegetables | Card | HDFC Credit Card | 500 | Expense | Weekly groceries |
   ```

---

## 📊 Test 7: View Dashboard (2 minutes)

### Steps:
1. Click "📊 Dashboard" tab
2. Click refresh button (🔄)

**Expected Result:**
- ✅ Summary cards show:
  - Total Expense: ₹500.00
  - EMI: ₹0.00
  - Investment: ₹0.00
  - Savings: ₹0.00
  - Balance: ₹49,500.00
- ✅ Category breakdown table shows Groceries: ₹500
- ✅ No errors

**Test Chart Toggle:**
1. Click "📈 Show Chart"
2. Pie chart appears
3. Shows Groceries segment

---

## 📝 Test 8: Add More Transactions (3 minutes)

Add these transactions to test different types:

### Transaction 2: EMI
- Date: Today
- Type: EMI
- Category: Bills
- Amount: 5000
- Notes: Home loan EMI

### Transaction 3: Investment
- Date: Today
- Type: Investment
- Category: Other
- Amount: 10000
- Notes: Mutual fund SIP

### Transaction 4: Savings
- Date: Today
- Type: Savings
- Category: Other
- Amount: 15000
- Notes: Fixed deposit

**Expected Result:**
- ✅ All 4 transactions in Google Sheet
- ✅ Dashboard shows updated totals:
  - Total Expense: ₹500
  - EMI: ₹5,000
  - Investment: ₹10,000
  - Savings: ₹15,000
  - Balance: ₹19,500

---

## 📜 Test 9: History & Filters (2 minutes)

### Steps:
1. Click "📜 History" tab
2. Verify all 4 transactions appear
3. Test filters:
   - Filter by Category: "Groceries"
   - Should show only 1 transaction
   - Clear filter (select "All Categories")
4. Test month filter
5. Test payment method filter

**Expected Result:**
- ✅ All transactions listed
- ✅ Filters work correctly
- ✅ Transaction count updates

---

## ✏️ Test 10: Edit Transaction (2 minutes)

### Steps:
1. In History, find first transaction (Groceries)
2. Click "Edit"
3. Change amount to 600
4. Click "Save"

**Expected Result:**
- ✅ "Saving..." message
- ✅ "✅ Transaction updated"
- ✅ History refreshes
- ✅ Amount now shows ₹600

**Verify in Google Sheet:**
- Row 2 amount changed to 600

**Verify in Dashboard:**
- Click Dashboard tab
- Click refresh (🔄)
- Total Expense now ₹600

---

## 🗑️ Test 11: Delete Transaction (2 minutes)

### Steps:
1. In History, find a transaction
2. Click "Delete"
3. Confirm deletion

**Expected Result:**
- ✅ Confirmation dialog appears
- ✅ "✅ Transaction deleted"
- ✅ Transaction removed from list
- ✅ Row deleted from Google Sheet
- ✅ Dashboard totals update

---

## 📈 Test 12: Analytics (2 minutes)

### Steps:
1. Click "📈 Analytics" tab
2. Go to Settings → Set budgets:
   - Groceries: 1000
   - Bills: 6000
3. Return to Analytics

**Expected Result:**
- ✅ Budget vs Actual shows progress bars
- ✅ Top 3 Expenses listed
- ✅ Need vs Want analysis shown
- ✅ Monthly comparison (if multiple months)

---

## 🔄 Test 13: Page Refresh (Security Test)

### Steps:
1. Press F5 or refresh page
2. Observe behavior

**Expected Result:**
- ✅ Redirected to login screen
- ✅ "🔴 Not Authenticated" in header
- ✅ Must sign in again (by design)
- ✅ User profile still exists
- ✅ Settings preserved

**This is correct behavior!** Token stored in memory only for security.

---

## 👥 Test 14: Multiple Users (3 minutes)

### Steps:
1. Click "Logout"
2. Create new user: "User B"
3. Authenticate with Google
4. Connect different Google Sheet
5. Add expense
6. Logout
7. Login as first user
8. Verify data is separate

**Expected Result:**
- ✅ Each user has own sheet
- ✅ Data completely isolated
- ✅ Settings separate per user

---

## 📱 Test 15: Mobile Testing (5 minutes)

### Steps:
1. Open app on mobile browser
2. Test all features:
   - Login
   - Add expense
   - View dashboard
   - Edit transaction
   - View analytics

**Expected Result:**
- ✅ Responsive layout
- ✅ Touch-friendly buttons
- ✅ Mobile menu works
- ✅ Forms usable
- ✅ Charts display correctly

---

## 🐛 Test 16: Error Handling (3 minutes)

### Test 1: Invalid Sheet ID
1. Logout and login
2. Enter invalid Sheet ID: "invalid123"
3. Click "Test Connection"

**Expected:** ❌ Error message shown

### Test 2: No Internet
1. Disconnect internet
2. Try to add expense

**Expected:** ❌ Network error message

### Test 3: Expired Auth
1. Wait 1 hour (token expires)
2. Try to add expense

**Expected:** ❌ "Authentication expired" message

---

## ✅ Test Results Checklist

Mark each test as you complete it:

- [ ] Test 1: Local Setup
- [ ] Test 2: User Profile Creation
- [ ] Test 3: Google Authentication
- [ ] Test 4: Google Sheet Setup
- [ ] Test 5: Settings Configuration
- [ ] Test 6: Add First Expense
- [ ] Test 7: View Dashboard
- [ ] Test 8: Add More Transactions
- [ ] Test 9: History & Filters
- [ ] Test 10: Edit Transaction
- [ ] Test 11: Delete Transaction
- [ ] Test 12: Analytics
- [ ] Test 13: Page Refresh
- [ ] Test 14: Multiple Users
- [ ] Test 15: Mobile Testing
- [ ] Test 16: Error Handling

---

## 📊 Expected Final State

### Google Sheet
```
Row 1: Headers
Row 2-4: Your transactions
```

### Dashboard
- Summary cards with correct totals
- Category breakdown
- Charts displaying

### History
- All transactions listed
- Filters working
- Edit/Delete functional

### Analytics
- Budget comparison
- Top expenses
- Trends

---

## 🎉 Testing Complete!

If all tests pass, your Finance Dashboard is working perfectly!

### Next Steps:
1. ✅ Deploy to production (see DEPLOYMENT_GUIDE.md)
2. ✅ Add production URL to Google Cloud Console
3. ✅ Test on production
4. ✅ Start using for real finances!

---

## 🆘 Troubleshooting

### Common Issues:

**"Not authenticated" error**
- Sign in with Google again
- Check Client ID in `.env`

**Sheet connection fails**
- Verify Sheet ID is correct
- Check permissions granted
- Try creating new sheet

**Data not showing**
- Click refresh button (🔄)
- Check Google Sheet has data
- Verify authentication

**Charts not displaying**
- Add more transactions
- Check browser console
- Try different browser

---

**Need help?** Check FAQ.md or open an issue on GitHub.
