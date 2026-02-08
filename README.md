# 💰 Personal Finance Dashboard

A secure, mobile-first personal finance dashboard that uses Google Sheets as a database. Track expenses, EMI, investments, and savings with beautiful visualizations and analytics.

## ✨ Features

- 📊 **Dashboard**: Monthly summaries with category breakdowns and charts
- ➕ **Expense Entry**: Quick and easy expense tracking
- 📜 **History**: View, edit, and delete past transactions
- 📈 **Analytics**: Budget vs actual, spending trends, need vs want analysis
- ⚙️ **Settings**: Customize categories, cards, payment methods
- 🔗 **Google Sheets Integration**: Your data stays in your Google Sheet
- 👥 **Multi-User Support**: Unlimited user profiles with separate sheets
- 📱 **Mobile-First**: Responsive design for all devices

## 🚀 Quick Start

### Local Development (5 minutes)
```bash
# 1. Install dependencies
npm install

# 2. Configure Google Client ID (see SETUP_GUIDE.md)
# Edit .env file:
REACT_APP_GOOGLE_CLIENT_ID=your_client_id_here

# 3. Start the app
npm start
```

### Deploy to Production (5 minutes)
**Fastest way:** [QUICK_DEPLOY.md](./QUICK_DEPLOY.md) - Deploy to Netlify in 5 minutes

**All options:** [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Netlify, Vercel, GitHub Pages, Firebase

### Testing
**Complete guide:** [TESTING_GUIDE.md](./TESTING_GUIDE.md) - Step-by-step testing instructions

**Quick test:**
1. Create user profile
2. Sign in with Google  
3. Connect a Google Sheet
4. Add an expense
5. View dashboard

## 📖 User Guide

### First Time Setup

1. **Create User Profile**
   - Enter your name
   - Click Continue

2. **Connect Google Sheet**
   - Click "Sign in with Google"
   - Grant permissions to access Google Sheets
   - Create a new Google Sheet
   - Copy the Sheet ID from the URL
   - Paste it and click "Test Connection"

3. **Configure Settings**
   - Add your categories (Food, Transport, etc.)
   - Add your cards (Credit Card, Debit Card)
   - Add payment methods (Cash, UPI, Card)
   - Set your monthly income

4. **Start Tracking**
   - Go to "Add Expense"
   - Fill in the details
   - Submit to save to Google Sheet

### Google Sheet Structure

The app uses a single sheet with these columns:

| Date | Month | Category | SubCategory | PaymentMethod | CardName | Amount | Type | Notes |
|------|-------|----------|-------------|---------------|----------|--------|------|-------|

- **Date**: Transaction date (YYYY-MM-DD)
- **Month**: Auto-calculated (YYYY-MM)
- **Category**: Main category
- **SubCategory**: Optional subcategory
- **PaymentMethod**: Cash, UPI, Card, etc.
- **CardName**: Card name if payment method is Card
- **Amount**: Transaction amount
- **Type**: Expense, EMI, Investment, or Savings
- **Notes**: Optional notes

## 🔒 Security

- **OAuth 2.0**: Secure Google authentication
- **Local Storage**: User preferences stored locally
- **No Backend**: Direct client-to-Google communication
- **Private Sheets**: Keep your sheet sharing set to "Only Me"

## 🛠️ Tech Stack

- **Frontend**: React 18
- **Styling**: Tailwind CSS
- **Charts**: Chart.js + react-chartjs-2
- **Date Handling**: date-fns
- **API**: Google Sheets API v4
- **Authentication**: Google OAuth 2.0

## 📱 Mobile Support

The app is fully responsive and works great on:
- 📱 Mobile phones
- 📱 Tablets
- 💻 Desktops

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## ❓ FAQ

**Q: Can someone hack my sheet?**  
A: Only if your Google account is compromised. Keep your sheet sharing set to "Only Me".

**Q: Do entries update instantly?**  
A: Yes, changes are written directly to Google Sheets.

**Q: Do I need a business account?**  
A: No, a regular Gmail account works fine.

**Q: Are there any paid services?**  
A: No, everything is free within Google's API limits.

**Q: How many users can I add?**  
A: Unlimited. Each user connects their own Google Sheet.

## 🐛 Troubleshooting

**Authentication fails:**
- Check if your Client ID is correct in `.env`
- Verify authorized JavaScript origins in Google Cloud Console
- Clear browser cache and try again

**Sheet connection fails:**
- Verify the Sheet ID is correct
- Check if you granted all required permissions
- Make sure the sheet exists and is accessible

**Charts not showing:**
- Ensure you have transactions for the selected month
- Check browser console for errors
- Try refreshing the page

## 📚 Complete Documentation

This project includes comprehensive documentation:

- **[📚 INDEX.md](./INDEX.md)** - Complete documentation index
- **[⚡ QUICK_START.md](./QUICK_START.md)** - Get started in 5 minutes
- **[🚀 QUICK_DEPLOY.md](./QUICK_DEPLOY.md)** - Deploy to Netlify in 5 minutes
- **[📦 INSTALLATION.md](./INSTALLATION.md)** - Detailed installation guide
- **[🔧 SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Google Cloud Console setup
- **[🧪 TESTING_GUIDE.md](./TESTING_GUIDE.md)** - Complete testing instructions
- **[🌐 DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - All deployment options
- **[✨ FEATURES.md](./FEATURES.md)** - Complete feature list (50+)
- **[❓ FAQ.md](./FAQ.md)** - 80+ frequently asked questions
- **[🏗️ PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)** - Code organization
- **[📋 PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** - Complete project overview
- **[✅ CHECKLIST.md](./CHECKLIST.md)** - Setup & verification checklist

**Total Documentation**: 12 files, 60+ pages, 400+ topics covered

## 📞 Support

For issues and questions:
1. Check [FAQ.md](./FAQ.md) - 80+ questions answered
2. Review [CHECKLIST.md](./CHECKLIST.md) - Troubleshooting steps
3. Search GitHub issues
4. Open a new issue

---

Made with ❤️ for better financial management
