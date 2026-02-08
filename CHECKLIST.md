# ✅ Setup & Usage Checklist

Use this checklist to ensure everything is set up correctly and you're using the app effectively.

## 📦 Installation Checklist

### Prerequisites
- [ ] Node.js installed (v14+)
- [ ] npm installed
- [ ] Google account created
- [ ] Modern web browser installed

### Installation Steps
- [ ] Project files downloaded/cloned
- [ ] Dependencies installed (`npm install`)
- [ ] No installation errors
- [ ] All packages installed successfully

## 🔧 Google Cloud Setup Checklist

### Project Creation
- [ ] Google Cloud Console accessed
- [ ] New project created
- [ ] Project name set (e.g., "Finance Dashboard")

### API Configuration
- [ ] Google Sheets API enabled
- [ ] Google Drive API enabled (optional but recommended)

### OAuth Setup
- [ ] OAuth consent screen configured
- [ ] App name set
- [ ] User support email added
- [ ] Developer contact email added
- [ ] Scopes added:
  - [ ] `https://www.googleapis.com/auth/spreadsheets`
  - [ ] `https://www.googleapis.com/auth/drive.file`
- [ ] Test user added (your email)

### Credentials
- [ ] OAuth 2.0 Client ID created
- [ ] Application type: Web application
- [ ] Authorized JavaScript origins added: `http://localhost:3000`
- [ ] Client ID copied
- [ ] Client ID added to `.env` file

## ⚙️ App Configuration Checklist

### Environment Setup
- [ ] `.env` file created (from `.env.example`)
- [ ] Google Client ID added to `.env`
- [ ] No syntax errors in `.env`
- [ ] File saved

### First Run
- [ ] App starts without errors (`npm start`)
- [ ] Browser opens automatically
- [ ] App loads at `http://localhost:3000`
- [ ] No console errors
- [ ] UI displays correctly

## 👤 User Setup Checklist

### Profile Creation
- [ ] User name entered
- [ ] Profile created successfully
- [ ] User appears in profile list

### Google Authentication
- [ ] "Sign in with Google" button clicked
- [ ] Google login popup appeared
- [ ] Correct Google account selected
- [ ] Permissions screen shown
- [ ] All permissions granted
- [ ] "Authenticated" message shown
- [ ] No authentication errors

### Sheet Connection
- [ ] Google Sheet created
- [ ] Sheet ID copied from URL
- [ ] Sheet ID pasted in app
- [ ] "Test Connection" clicked
- [ ] Connection successful
- [ ] Headers created (if sheet was empty)
- [ ] No connection errors

## ⚙️ Settings Configuration Checklist

### Categories
- [ ] Default categories reviewed
- [ ] Custom categories added (if needed)
- [ ] Unnecessary categories removed
- [ ] At least 5-10 categories configured

**Recommended Categories:**
- [ ] Food
- [ ] Transport
- [ ] Shopping
- [ ] Bills
- [ ] Entertainment
- [ ] Health
- [ ] Education
- [ ] Other

### Cards
- [ ] Default cards reviewed
- [ ] Your cards added
- [ ] Card names are clear
- [ ] Unused cards removed

**Example Cards:**
- [ ] Credit Card - Bank Name
- [ ] Debit Card - Bank Name
- [ ] Specific card names

### Payment Methods
- [ ] Default methods reviewed
- [ ] Custom methods added (if needed)
- [ ] All your payment methods included

**Common Methods:**
- [ ] Cash
- [ ] UPI
- [ ] Card
- [ ] Net Banking
- [ ] Wallet

### Monthly Income
- [ ] Monthly income amount entered
- [ ] Amount is accurate
- [ ] Income saved successfully

## 💰 First Transaction Checklist

### Adding Expense
- [ ] "Add Expense" tab opened
- [ ] Date selected
- [ ] Type selected (Expense/EMI/Investment/Savings)
- [ ] Category selected
- [ ] Sub-category entered (optional)
- [ ] Payment method selected
- [ ] Card selected (if payment method is Card)
- [ ] Amount entered
- [ ] Notes added (optional)
- [ ] Form submitted
- [ ] Success message shown
- [ ] No errors

### Verification
- [ ] Transaction appears in Google Sheet
- [ ] Data is correct in sheet
- [ ] Dashboard updated
- [ ] Transaction shows in History

## 📊 Dashboard Verification Checklist

### Summary Cards
- [ ] Total Expense shows correct amount
- [ ] EMI shows correct amount
- [ ] Investment shows correct amount
- [ ] Savings shows correct amount
- [ ] Balance calculated correctly

### Category Breakdown
- [ ] Table shows all categories
- [ ] Amounts are correct
- [ ] Percentages calculated correctly
- [ ] "Show Chart" button works
- [ ] Pie chart displays correctly
- [ ] Chart colors are distinct

### Payment Analysis
- [ ] Bar chart displays
- [ ] All payment methods shown
- [ ] Amounts are correct
- [ ] Chart is readable

### Monthly Trend
- [ ] Line chart displays (if multiple months)
- [ ] Trend line is smooth
- [ ] Data points are accurate
- [ ] Months are labeled correctly

## 📜 History Verification Checklist

### Transaction List
- [ ] All transactions displayed
- [ ] Sorted by date (newest first)
- [ ] All columns visible
- [ ] Data is accurate

### Filters
- [ ] Month filter works
- [ ] Category filter works
- [ ] Payment method filter works
- [ ] Filters can be combined
- [ ] "All" option clears filter

### Edit Function
- [ ] Edit button works
- [ ] Edit modal opens
- [ ] Fields are pre-filled
- [ ] Changes can be made
- [ ] Save button works
- [ ] Changes reflected in sheet
- [ ] Dashboard updates

### Delete Function
- [ ] Delete button works
- [ ] Confirmation dialog appears
- [ ] Delete confirmed
- [ ] Transaction removed from sheet
- [ ] Dashboard updates
- [ ] History updates

## 📈 Analytics Verification Checklist

### Budget vs Actual
- [ ] Budgets set in Settings
- [ ] Progress bars display
- [ ] Percentages calculated
- [ ] Overspending alerts show
- [ ] Colors indicate status (green/red)

### Top 3 Expenses
- [ ] Top 3 transactions shown
- [ ] Sorted by amount (highest first)
- [ ] Details are complete
- [ ] Amounts are correct

### Need vs Want
- [ ] Needs calculated correctly
- [ ] Wants calculated correctly
- [ ] Percentages add up to 100%
- [ ] Tip message displays

### Monthly Comparison
- [ ] Previous month data shown
- [ ] Current month data shown
- [ ] Change calculated correctly
- [ ] Percentage change shown
- [ ] Increase/decrease indicated

## 🔒 Security Verification Checklist

### Google Sheet
- [ ] Sheet sharing set to "Only Me"
- [ ] No public link created
- [ ] Sheet ID not shared publicly
- [ ] Sheet accessible only to you

### Browser
- [ ] Using HTTPS (in production)
- [ ] Browser is up to date
- [ ] No security warnings
- [ ] Cookies enabled

### Authentication
- [ ] OAuth token stored securely
- [ ] Can logout successfully
- [ ] Can re-authenticate
- [ ] No token in URL

## 📱 Mobile Verification Checklist

### Responsive Design
- [ ] App opens on mobile browser
- [ ] Layout adjusts to screen size
- [ ] All buttons are tappable
- [ ] Text is readable
- [ ] Forms are usable
- [ ] Charts display correctly

### Mobile Navigation
- [ ] Menu button works
- [ ] Navigation menu opens
- [ ] All tabs accessible
- [ ] Menu closes after selection

### Mobile Forms
- [ ] Date picker works
- [ ] Dropdowns work
- [ ] Number keyboard appears for amount
- [ ] Submit button accessible
- [ ] No horizontal scrolling

## 🎯 Usage Best Practices Checklist

### Daily Habits
- [ ] Add expenses daily
- [ ] Use correct categories
- [ ] Add notes for clarity
- [ ] Keep receipts (optional)

### Weekly Review
- [ ] Check dashboard weekly
- [ ] Review spending patterns
- [ ] Identify overspending
- [ ] Adjust behavior if needed

### Monthly Review
- [ ] Review full month at end
- [ ] Check budget adherence
- [ ] Analyze need vs want
- [ ] Set next month's budget
- [ ] Compare with previous months

### Data Maintenance
- [ ] Verify transactions are accurate
- [ ] Fix any errors immediately
- [ ] Delete duplicate entries
- [ ] Keep categories organized
- [ ] Update income if changed

## 🐛 Troubleshooting Checklist

### If App Won't Start
- [ ] Check Node.js is installed
- [ ] Check npm is installed
- [ ] Run `npm install` again
- [ ] Check for error messages
- [ ] Try different port
- [ ] Clear npm cache

### If Authentication Fails
- [ ] Check Client ID in `.env`
- [ ] Verify authorized origins
- [ ] Clear browser cache
- [ ] Try incognito mode
- [ ] Check Google account access
- [ ] Verify OAuth consent screen

### If Sheet Won't Connect
- [ ] Verify Sheet ID is correct
- [ ] Check sheet exists
- [ ] Verify permissions granted
- [ ] Try creating new sheet
- [ ] Check internet connection
- [ ] Verify API is enabled

### If Data Not Saving
- [ ] Check internet connection
- [ ] Verify sheet permissions
- [ ] Check browser console
- [ ] Try reconnecting sheet
- [ ] Verify sheet not deleted
- [ ] Check API quotas

### If Charts Not Showing
- [ ] Verify data exists for month
- [ ] Check browser console
- [ ] Refresh the page
- [ ] Clear browser cache
- [ ] Try different browser
- [ ] Check Chart.js loaded

## 🎓 Learning Checklist

### Understanding the App
- [ ] Read README.md
- [ ] Read QUICK_START.md
- [ ] Understand data flow
- [ ] Know where data is stored
- [ ] Understand security model

### Using Features
- [ ] Can add expenses
- [ ] Can view dashboard
- [ ] Can filter history
- [ ] Can edit transactions
- [ ] Can delete transactions
- [ ] Can view analytics
- [ ] Can change settings

### Advanced Usage
- [ ] Multiple user profiles created
- [ ] Budgets set for categories
- [ ] Using sub-categories effectively
- [ ] Tracking different payment methods
- [ ] Analyzing spending patterns
- [ ] Making financial decisions based on data

## 🚀 Production Deployment Checklist

### Pre-Deployment
- [ ] App tested thoroughly
- [ ] All features working
- [ ] No console errors
- [ ] Mobile tested
- [ ] Different browsers tested

### Build Process
- [ ] Run `npm run build`
- [ ] Build completes successfully
- [ ] No build errors
- [ ] Build folder created

### Hosting Setup
- [ ] Hosting service selected
- [ ] Account created
- [ ] Build folder uploaded
- [ ] Custom domain configured (optional)
- [ ] HTTPS enabled

### Google Cloud Update
- [ ] Production URL added to authorized origins
- [ ] OAuth consent screen updated
- [ ] Test users added (if needed)
- [ ] App published (if needed)

### Post-Deployment
- [ ] Production URL accessible
- [ ] HTTPS working
- [ ] Authentication works
- [ ] Sheet connection works
- [ ] All features working
- [ ] Mobile tested on production

## ✅ Final Verification

### Complete Setup
- [ ] All installation steps completed
- [ ] Google Cloud configured
- [ ] App running successfully
- [ ] User profile created
- [ ] Sheet connected
- [ ] Settings configured
- [ ] First transaction added
- [ ] Dashboard showing data
- [ ] All features tested

### Ready to Use
- [ ] Comfortable adding expenses
- [ ] Understand dashboard
- [ ] Can use filters
- [ ] Can edit/delete
- [ ] Can view analytics
- [ ] Can change settings
- [ ] Know how to get help

### Documentation Read
- [ ] README.md
- [ ] QUICK_START.md
- [ ] INSTALLATION.md (if needed)
- [ ] SETUP_GUIDE.md
- [ ] FAQ.md (relevant sections)

## 🎉 Success!

If all items are checked, congratulations! You're ready to take control of your finances with the Personal Finance Dashboard.

---

## 📞 Need Help?

If any items are not checked:
1. Review relevant documentation
2. Check FAQ.md
3. Search GitHub issues
4. Open new issue with details

---

**Keep this checklist handy for reference and troubleshooting!**
