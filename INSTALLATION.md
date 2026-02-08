# 📦 Installation Guide

Complete step-by-step installation guide for the Personal Finance Dashboard.

## Prerequisites

Before you begin, ensure you have:
- ✅ Node.js (v14 or higher) - [Download](https://nodejs.org/)
- ✅ npm (comes with Node.js)
- ✅ Google Account
- ✅ Modern web browser (Chrome, Firefox, Safari, Edge)

## Installation Steps

### 1. Download the Project

```bash
# Clone or download the project
cd finance-dashboard
```

### 2. Install Dependencies

```bash
npm install
```

This will install:
- React 18
- Tailwind CSS
- Chart.js & react-chartjs-2
- date-fns
- axios

### 3. Set Up Google Cloud Console

Follow the detailed guide in [SETUP_GUIDE.md](./SETUP_GUIDE.md) to:
1. Create a Google Cloud project
2. Enable Google Sheets API
3. Create OAuth 2.0 credentials
4. Get your Client ID

### 4. Configure Environment Variables

```bash
# Copy the example env file
cp .env.example .env
```

Edit `.env` and add your Google Client ID:
```
REACT_APP_GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
```

### 5. Start the Development Server

```bash
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000)

## First Time Usage

### 1. Create Your Profile
- Enter your name
- Click "Continue"

### 2. Authenticate with Google
- Click "Sign in with Google"
- Select your Google account
- Grant permissions for:
  - View and manage Google Sheets
  - Create new sheets

### 3. Connect Your Google Sheet

**Option A: Create New Sheet**
1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new blank sheet
3. Copy the Sheet ID from URL:
   ```
   https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit
   ```
4. Paste it in the app
5. Click "Test Connection"

**Option B: Use Template**
1. Download the CSV template from the app
2. Import it to Google Sheets
3. Follow steps 3-5 from Option A

### 4. Configure Settings
- Go to Settings tab
- Add your categories (Food, Transport, Shopping, etc.)
- Add your cards (Credit Card, Debit Card, etc.)
- Add payment methods (Cash, UPI, Card, etc.)
- Set your monthly income

### 5. Start Tracking
- Go to "Add Expense" tab
- Fill in transaction details
- Submit to save to Google Sheet

## Verification

After installation, verify everything works:

✅ **Authentication**
- Google login popup appears
- Successfully authenticated message shows

✅ **Sheet Connection**
- Sheet ID accepted
- Headers created automatically (if empty)
- Connection successful message

✅ **Add Expense**
- Form submits successfully
- Data appears in Google Sheet
- Dashboard updates with new data

✅ **Dashboard**
- Summary cards show correct totals
- Charts render properly
- Month selector works

## Troubleshooting

### npm install fails
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Port 3000 already in use
```bash
# Use a different port
PORT=3001 npm start
```

### Google authentication fails
- Check if Client ID is correct in `.env`
- Verify authorized origins in Google Cloud Console
- Clear browser cache and cookies
- Try incognito/private mode

### Sheet connection fails
- Verify Sheet ID is correct (no extra spaces)
- Check if you have access to the sheet
- Ensure you granted all permissions
- Try creating a new sheet

### Charts not displaying
```bash
# Reinstall chart dependencies
npm install chart.js react-chartjs-2 --force
```

### Tailwind styles not working
```bash
# Rebuild Tailwind
npm run build
npm start
```

## Building for Production

```bash
# Create optimized production build
npm run build
```

The build folder will contain optimized files ready for deployment.

## Deployment Options

### Option 1: Netlify
1. Push code to GitHub
2. Connect repository to Netlify
3. Add environment variables in Netlify dashboard
4. Deploy

### Option 2: Vercel
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Option 3: GitHub Pages
```bash
# Install gh-pages
npm install --save-dev gh-pages

# Add to package.json
"homepage": "https://yourusername.github.io/finance-dashboard",
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d build"
}

# Deploy
npm run deploy
```

**Important**: Update authorized JavaScript origins in Google Cloud Console with your production URL.

## Updating the App

```bash
# Pull latest changes
git pull

# Install any new dependencies
npm install

# Restart the app
npm start
```

## Uninstallation

```bash
# Remove node_modules
rm -rf node_modules

# Remove build files
rm -rf build

# Remove environment file
rm .env
```

## System Requirements

### Minimum
- 2 GB RAM
- 500 MB free disk space
- Internet connection

### Recommended
- 4 GB RAM
- 1 GB free disk space
- Stable internet connection

## Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## Mobile Support

The app is fully responsive and works on:
- 📱 iOS 12+
- 📱 Android 8+
- 📱 All modern mobile browsers

## Getting Help

If you encounter issues:

1. Check [README.md](./README.md) for general information
2. Review [SETUP_GUIDE.md](./SETUP_GUIDE.md) for Google setup
3. Check browser console for errors
4. Open an issue on GitHub

## Next Steps

After successful installation:

1. ✅ Customize categories for your needs
2. ✅ Set realistic monthly budgets
3. ✅ Start tracking daily expenses
4. ✅ Review dashboard weekly
5. ✅ Analyze spending patterns monthly

---

🎉 Congratulations! You're ready to take control of your finances!
