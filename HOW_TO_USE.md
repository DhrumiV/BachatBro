# 📖 How to Use Finance Dashboard

Complete user guide from setup to daily use.

---

## 🎯 Overview

This Finance Dashboard helps you:
- Track all expenses in one place
- Categorize spending
- Monitor budgets
- Analyze financial patterns
- Make informed financial decisions

**Data Storage:** Everything is stored in YOUR Google Sheet. You have full control.

---

## 🚀 Getting Started

### Step 1: Setup (One-time, 10 minutes)

#### 1.1 Google Cloud Console Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project: "Finance Dashboard"
3. Enable APIs:
   - Google Sheets API
   - Google Drive API
4. Create OAuth 2.0 credentials
5. Copy Client ID

**Detailed guide:** [SETUP_GUIDE.md](./SETUP_GUIDE.md)

#### 1.2 Configure App
1. Open `.env` file
2. Add your Client ID:
   ```
   REACT_APP_GOOGLE_CLIENT_ID=your_client_id_here
   ```
3. Save file

#### 1.3 Start App
```bash
npm install
npm start
```

Or double-click `start.bat` (Windows)

---

## 👤 Step 2: Create Your Profile (1 minute)

1. App opens at `http://localhost:3000`
2. Enter your name (e.g., "John Doe")
3. Click "Continue"

**What happens:**
- Profile created locally
- Default categories added
- Ready to connect Google Sheet

---

## 🔐 Step 3: Authenticate with Google (1 minute)

1. Click "Sign in with Google"
2. Google popup opens
3. Select your Google account
4. Review permissions:
   - ✅ View and manage Google Sheets
   - ✅ Create files in Google Drive
5. Click "Allow"

**Security Note:** Your token is stored in memory only. You'll need to sign in again after refreshing the page (by design for security).

---

## 📊 Step 4: Connect Google Sheet (2 minutes)

### Option A: Create New Sheet
1. Go to [Google Sheets](https://sheets.google.com)
2. Click "+ Blank"
3. Name it "My Finances 2026"
4. Copy Sheet ID from URL:
   ```
   https://docs.google.com/spreadsheets/d/COPY_THIS_PART/edit
   ```
5. Paste in app
6. Click "Test Connection & Setup"

### Option B: Use Existing Sheet
1. Open your existing sheet
2. Copy Sheet ID
3. Paste in app
4. Click "Test Connection & Setup"
5. Headers will be created/validated

**What happens:**
- App connects to your sheet
- Headers created automatically:
  ```
  | Date | Month | Category | SubCategory | PaymentMethod | CardName | Amount | Type | Notes |
  ```
- You're redirected to Dashboard

---

## ⚙️ Step 5: Configure Settings (3 minutes)

### 5.1 Add Categories
1. Click "⚙️ Settings" tab
2. Go to "📁 Categories"
3. Add your categories:
   - Food
   - Transport
   - Shopping
   - Bills
   - Entertainment
   - Health
   - Education
4. Click "Add" for each

**Tip:** Keep it simple. 5-10 categories is ideal.

### 5.2 Add Cards
1. Go to "💳 Cards"
2. Add your cards:
   - HDFC Credit Card
   - SBI Debit Card
   - ICICI Credit Card
3. Click "Add" for each

### 5.3 Add Payment Methods
1. Go to "💰 Payment Methods"
2. Default methods:
   - Cash
   - UPI
   - Card
   - Net Banking
3. Add custom methods if needed

### 5.4 Set Monthly Income
1. Go to "💵 Monthly Income"
2. Enter your monthly income: 50000
3. Click "Save Income"

**What this does:** Calculates your balance (Income - Expenses)

---

## 💰 Daily Use: Adding Expenses

### Quick Add (30 seconds)

1. Click "➕ Add Expense" tab
2. Fill form:
   - **Date:** Today (auto-filled)
   - **Type:** Expense
   - **Category:** Food
   - **Sub Category:** Restaurant (optional)
   - **Payment Method:** Card
   - **Card Name:** HDFC Credit Card
   - **Amount:** 500
   - **Notes:** Lunch with team (optional)
3. Click "💾 Add Expense"

**What happens:**
- Data saved to Google Sheet instantly
- Row added to your sheet
- Dashboard updates (click refresh)

### Transaction Types

**Expense** - Regular spending
- Food, shopping, entertainment
- Deducted from balance

**EMI** - Loan payments
- Home loan, car loan, personal loan
- Deducted from balance

**Investment** - Money invested
- Mutual funds, stocks, gold
- Deducted from balance

**Savings** - Money saved
- Fixed deposits, savings account
- Deducted from balance

---

## 📊 Viewing Your Dashboard

### Access Dashboard
1. Click "📊 Dashboard" tab
2. Select month from dropdown
3. Click refresh (🔄) to load latest data

### What You See

**Summary Cards:**
- Total Expense: ₹15,000
- EMI: ₹5,000
- Investment: ₹10,000
- Savings: ₹15,000
- Balance: ₹5,000 (Income - All)

**Category Breakdown:**
- Table view: Categories with amounts and percentages
- Chart view: Pie chart (click "Show Chart")

**Payment Analysis:**
- Bar chart showing spending by payment method

**Monthly Trend:**
- Line chart showing spending over months

---

## 📜 Managing Transaction History

### View History
1. Click "📜 History" tab
2. All transactions listed

### Filter Transactions
- **By Month:** Select month from dropdown
- **By Category:** Select category
- **By Payment Method:** Select method
- Combine filters for specific results

### Edit Transaction
1. Find transaction
2. Click "Edit"
3. Modify details
4. Click "Save"
5. Changes saved to Google Sheet

### Delete Transaction
1. Find transaction
2. Click "Delete"
3. Confirm deletion
4. Row removed from Google Sheet

---

## 📈 Using Analytics

### Access Analytics
1. Click "📈 Analytics" tab
2. Select month

### Features

**Budget vs Actual:**
- Set budgets in Settings
- See progress bars
- Get overspending alerts

**Top 3 Expenses:**
- Biggest spends of the month
- Helps identify major costs

**Need vs Want:**
- Categorizes essential vs discretionary
- Shows percentage breakdown
- Financial health indicator

**Monthly Comparison:**
- Current vs previous month
- Increase/decrease tracking
- Percentage change

---

## 🔄 Daily Workflow

### Morning (1 minute)
- Open app
- Sign in with Google (if needed)
- Check yesterday's balance

### Throughout Day (30 seconds per expense)
- Make a purchase
- Open app immediately
- Add expense
- Done!

### Evening (2 minutes)
- Review today's expenses
- Check if any missed
- Add any cash expenses

### Weekly (5 minutes)
- Review dashboard
- Check spending patterns
- Identify overspending
- Adjust behavior

### Monthly (15 minutes)
- Review full month
- Compare with budget
- Analyze need vs want
- Set next month's budget
- Plan improvements

---

## 💡 Best Practices

### 1. Add Expenses Immediately
- Don't wait until end of day
- Memory fades quickly
- Accuracy is important

### 2. Use Sub-Categories
- Makes tracking detailed
- Example:
  - Category: Food
  - Sub-Category: Restaurant, Groceries, Delivery

### 3. Add Notes
- Helps remember context
- Useful for analysis
- Example: "Team lunch", "Birthday gift"

### 4. Review Weekly
- Stay aware of spending
- Catch errors early
- Adjust behavior quickly

### 5. Set Realistic Budgets
- Start conservative
- Adjust based on actual spending
- Don't be too strict

### 6. Keep Categories Simple
- 5-10 main categories
- Use sub-categories for details
- Don't over-complicate

### 7. Track Everything
- Even small expenses
- Cash transactions
- Online purchases
- All add up!

---

## 🎯 Common Use Cases

### Use Case 1: Monthly Budget Tracking
1. Set monthly income
2. Set category budgets
3. Add expenses daily
4. Check Analytics weekly
5. Stay within budget

### Use Case 2: Expense Analysis
1. Track for 3 months
2. Review Analytics
3. Identify patterns
4. Find areas to cut
5. Optimize spending

### Use Case 3: EMI Management
1. Add all EMIs as transactions
2. Type: EMI
3. Track monthly
4. See total EMI burden
5. Plan payoffs

### Use Case 4: Investment Tracking
1. Add investments as transactions
2. Type: Investment
3. Track monthly contributions
4. See total invested
5. Monitor savings rate

### Use Case 5: Family Finances
1. Create profile for each member
2. Each connects own sheet
3. Track separately
4. Compare spending
5. Discuss together

---

## 🔒 Security & Privacy

### Your Data is Safe
- Stored in YOUR Google Sheet
- You control access
- No third-party servers
- No data collection

### Keep It Secure
1. **Sheet Sharing:** Set to "Only Me"
2. **Google Account:** Use strong password
3. **2FA:** Enable on Google account
4. **Sheet ID:** Don't share publicly
5. **Token:** Stored in memory only

### What We DON'T Store
- ❌ Your transactions (only in your sheet)
- ❌ Your passwords
- ❌ Your personal info
- ❌ Your financial data

### What We DO Store (Locally)
- ✅ Your name
- ✅ Sheet ID
- ✅ Categories (your preferences)
- ✅ Cards (your list)
- ✅ Payment methods (your list)

---

## 🐛 Troubleshooting

### "Not authenticated" Error
**Solution:** Sign in with Google again (token expired)

### Data not showing
**Solution:** Click refresh button (🔄) on Dashboard

### Can't add expense
**Solution:** 
1. Check authentication status
2. Verify sheet connected
3. Check internet connection

### Sheet connection fails
**Solution:**
1. Verify Sheet ID is correct
2. Check permissions granted
3. Try creating new sheet

### Charts not displaying
**Solution:**
1. Add more transactions
2. Check browser console
3. Try different browser

---

## 📱 Mobile Usage

### Access on Mobile
1. Open browser on phone
2. Go to your app URL
3. Works like desktop!

### Add to Home Screen

**iOS:**
1. Safari → Share → Add to Home Screen

**Android:**
1. Chrome → Menu → Add to Home screen

### Mobile Tips
- Use number keyboard for amounts
- Date picker is touch-friendly
- Swipe to navigate
- Works offline (after loading)

---

## 🎓 Learning Resources

### Understand Your Finances
- **50/30/20 Rule:**
  - 50% Needs (Food, Bills, Transport)
  - 30% Wants (Entertainment, Shopping)
  - 20% Savings/Investment

- **Emergency Fund:**
  - Save 6 months expenses
  - Keep in liquid form
  - Use Savings type

- **Debt Management:**
  - Track all EMIs
  - Pay high-interest first
  - Avoid new debt

### Financial Goals
1. **Short-term (1-12 months):**
   - Emergency fund
   - Vacation
   - Gadget purchase

2. **Medium-term (1-5 years):**
   - Car purchase
   - Home down payment
   - Education

3. **Long-term (5+ years):**
   - Retirement
   - Children's education
   - Financial independence

---

## 🎉 Success Stories

### Example 1: Reduced Spending by 30%
"I tracked for 3 months and realized I was spending ₹15,000 on food delivery. Cut it to ₹5,000 by cooking more. Saved ₹10,000/month!"

### Example 2: Paid Off Debt
"Tracked all EMIs in one place. Realized I could pay extra ₹5,000/month. Cleared personal loan 2 years early!"

### Example 3: Built Emergency Fund
"Set Savings goal of ₹1,00,000. Tracked progress monthly. Reached goal in 10 months!"

---

## 📞 Getting Help

### Documentation
- [FAQ.md](./FAQ.md) - 80+ questions
- [TESTING_GUIDE.md](./TESTING_GUIDE.md) - Testing help
- [CHECKLIST.md](./CHECKLIST.md) - Troubleshooting

### Community
- GitHub Issues
- Discussions
- Pull Requests

---

## 🎯 Next Steps

Now that you know how to use it:

1. ✅ Set up your profile
2. ✅ Connect your sheet
3. ✅ Configure settings
4. ✅ Add your first expense
5. ✅ Track for a week
6. ✅ Review your dashboard
7. ✅ Set budgets
8. ✅ Track for a month
9. ✅ Analyze patterns
10. ✅ Optimize spending

---

**Start your financial journey today!** 💰📊🚀
