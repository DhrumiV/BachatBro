# ⚡ Quick Start Guide

Get up and running with the Finance Dashboard in 5 minutes!

## 🎯 Prerequisites Check

Before starting, make sure you have:
- [ ] Node.js installed (check: `node --version`)
- [ ] npm installed (check: `npm --version`)
- [ ] Google account
- [ ] Modern web browser

## 🚀 5-Minute Setup

### Step 1: Install Dependencies (1 min)
```bash
npm install
```

### Step 2: Get Google Client ID (2 min)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project → "Finance Dashboard"
3. Enable "Google Sheets API"
4. Create OAuth credentials → Web application
5. Add origin: `http://localhost:3000`
6. Copy Client ID

### Step 3: Configure App (30 sec)
```bash
# Edit .env file
REACT_APP_GOOGLE_CLIENT_ID=your_client_id_here
```

### Step 4: Start App (30 sec)
```bash
npm start
```

### Step 5: First Use (1 min)
1. Enter your name
2. Click "Sign in with Google"
3. Create a Google Sheet
4. Copy Sheet ID from URL
5. Paste and connect

## ✅ You're Done!

Start adding expenses and tracking your finances!

## 🎬 Quick Demo Flow

```
1. Add User → "John"
2. Connect Sheet → Paste Sheet ID
3. Settings → Add categories
4. Add Expense → ₹500 for Food
5. Dashboard → See your first expense!
```

## 🆘 Quick Troubleshooting

**Can't install?**
```bash
npm cache clean --force
npm install
```

**Port 3000 busy?**
```bash
PORT=3001 npm start
```

**Google auth fails?**
- Check Client ID in `.env`
- Clear browser cache
- Try incognito mode

**Sheet won't connect?**
- Verify Sheet ID (no spaces)
- Check permissions granted
- Create new sheet and try again

## 📚 Next Steps

After quick start:
1. ✅ Read [README.md](./README.md) for full overview
2. ✅ Check [FEATURES.md](./FEATURES.md) for all features
3. ✅ Review [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed Google setup
4. ✅ Explore [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) for code structure

## 💡 Pro Tips

1. **Set up categories first** - Makes expense entry faster
2. **Set monthly income** - See your balance automatically
3. **Use sub-categories** - Better expense tracking
4. **Check dashboard weekly** - Stay on top of spending
5. **Review analytics monthly** - Understand patterns

## 🎯 Common First Tasks

### Add Your First Expense
```
Dashboard → Add Expense
Date: Today
Category: Food
Amount: 500
Type: Expense
Submit
```

### Set Up Categories
```
Settings → Categories
Add: Food, Transport, Shopping, Bills
```

### Set Monthly Income
```
Settings → Monthly Income
Enter: 50000
Save
```

### View Your Dashboard
```
Dashboard → Select current month
See summary cards
Toggle chart view
```

## 📱 Mobile Quick Start

1. Open on mobile browser
2. Same steps as desktop
3. Add to home screen (optional)
4. Use anywhere!

## 🔗 Important Links

- [Google Cloud Console](https://console.cloud.google.com/)
- [Google Sheets](https://sheets.google.com/)
- [Node.js Download](https://nodejs.org/)

## ⏱️ Time Estimates

| Task | Time |
|------|------|
| Install dependencies | 1-2 min |
| Google Cloud setup | 2-3 min |
| Configure app | 30 sec |
| First run | 30 sec |
| First expense | 1 min |
| **Total** | **5-7 min** |

## 🎉 Success Checklist

After quick start, you should be able to:
- [ ] Login with Google
- [ ] Connect to a sheet
- [ ] Add an expense
- [ ] See it in dashboard
- [ ] View it in history
- [ ] Edit/delete it

If all checked, you're ready to go! 🚀

---

**Need more help?** Check the detailed [INSTALLATION.md](./INSTALLATION.md) guide.
