# ❓ Frequently Asked Questions (FAQ)

Complete answers to common questions about the Finance Dashboard.

## 🔐 Security & Privacy

### Q: Is my financial data safe?
**A:** Yes! Your data is stored in your own Google Sheet, which you control. The app only accesses sheets you explicitly grant permission to. No data is sent to any third-party servers.

### Q: Can someone hack my sheet?
**A:** Only if your Google account is compromised. Keep your Google account secure with:
- Strong password
- Two-factor authentication
- Regular security checkups
- Keep sheet sharing set to "Only Me"

### Q: Where is my data stored?
**A:** All transaction data is stored in your Google Sheet. User preferences (categories, cards) are stored in your browser's localStorage. No backend database exists.

### Q: Can the app developer see my data?
**A:** No. The app runs entirely in your browser and connects directly to your Google Sheet. There's no backend server collecting data.

### Q: What happens if I clear my browser data?
**A:** You'll lose your user profile and preferences (categories, cards, income), but your transaction data in Google Sheets remains safe. You can reconnect to the same sheet.

## 🔗 Google Sheets Integration

### Q: Do I need a Google Workspace account?
**A:** No, a free Gmail account works perfectly.

### Q: Can I use an existing sheet?
**A:** Yes! If it's empty, the app will create headers. If it has data, make sure it matches the required format.

### Q: What if I accidentally delete the sheet?
**A:** Your data is gone unless you have Google Drive version history. Always keep backups of important data.

### Q: Can multiple users share one sheet?
**A:** Not recommended. Each user should have their own sheet for data isolation and security.

### Q: How do I backup my data?
**A:** Google Sheets automatically saves and has version history. You can also:
- Download as Excel/CSV from Google Sheets
- Make a copy of the sheet
- Use Google Drive backup

### Q: What are the Google API limits?
**A:** 
- Read requests: 300 per minute
- Write requests: 300 per minute
For personal use, you'll never hit these limits.

### Q: Can I use multiple sheets per user?
**A:** Currently, each user profile connects to one sheet. You can create multiple user profiles for different sheets.

## 💰 Financial Tracking

### Q: What's the difference between Expense, EMI, Investment, and Savings?
**A:**
- **Expense**: Regular spending (food, shopping, etc.)
- **EMI**: Loan payments (car, home, personal loans)
- **Investment**: Money put into investments (stocks, mutual funds)
- **Savings**: Money saved (fixed deposits, savings account)

All types are deducted from your monthly balance.

### Q: How do I track recurring expenses?
**A:** Currently, you need to add them manually each month. Recurring expenses feature is planned for the future.

### Q: Can I track income?
**A:** You set a monthly income in Settings. Individual income transactions aren't tracked yet.

### Q: How do I handle split payments?
**A:** Add them as separate transactions. For example, if you split ₹1000 with a friend, add ₹500 as your expense.

### Q: Can I track multiple currencies?
**A:** Not currently. The app uses ₹ (INR) by default. Multi-currency support is a future feature.

### Q: How do I categorize mixed expenses?
**A:** Use the SubCategory field or split into multiple transactions. For example:
- Category: Shopping
- SubCategory: Groceries + Household items

## 📊 Dashboard & Analytics

### Q: Why is my balance negative?
**A:** You've spent more than your monthly income. Review your expenses and adjust your budget.

### Q: How is "Need vs Want" calculated?
**A:** Categories like Food, Bills, Health, Transport are "Needs". Others are "Wants". You can customize this logic in the code.

### Q: Can I see yearly reports?
**A:** Not yet. Currently, you can view monthly data and trends across months. Yearly reports are planned.

### Q: Why don't my charts show?
**A:** Make sure you have transactions for the selected month. Charts only appear when there's data to display.

### Q: Can I export reports?
**A:** You can export data directly from Google Sheets as Excel, CSV, or PDF.

## ⚙️ Settings & Customization

### Q: Can I rename categories?
**A:** Currently, you can only add or delete. To rename, delete the old one and add a new one. Note: This won't update existing transactions.

### Q: How many categories can I add?
**A:** Unlimited! Add as many as you need.

### Q: Can I set different budgets for different categories?
**A:** Yes! Go to Settings and set budgets for each category. These are used in Analytics.

### Q: Can I customize the app colors?
**A:** Yes, if you're comfortable with code. Edit `tailwind.config.js` to change colors.

### Q: Can I add custom transaction types?
**A:** Currently limited to Expense, EMI, Investment, Savings. Custom types require code changes.

## 👥 Multi-User Features

### Q: How many users can I add?
**A:** Unlimited! Each user gets their own profile and can connect to their own sheet.

### Q: Is there password protection?
**A:** No. This is designed for personal/family use on trusted devices. Each user profile is just a name selector.

### Q: Can I delete a user?
**A:** Not through the UI currently. You can manually edit localStorage or clear all data.

### Q: Can users see each other's data?
**A:** No, if each user connects to their own sheet. Data is completely isolated.

## 🔧 Technical Questions

### Q: What technology is this built with?
**A:**
- Frontend: React 18
- Styling: Tailwind CSS
- Charts: Chart.js
- API: Google Sheets API v4
- Auth: Google OAuth 2.0

### Q: Can I run this offline?
**A:** No, it requires internet to connect to Google Sheets. Offline support is a future feature.

### Q: Can I self-host this?
**A:** Yes! Build the app (`npm run build`) and host the `build` folder on any static hosting service.

### Q: Is this open source?
**A:** Check the repository license. Typically MIT licensed for free use and modification.

### Q: Can I contribute to development?
**A:** Yes! Fork the repository, make changes, and submit a pull request.

### Q: Does this work on mobile?
**A:** Yes! It's mobile-first and fully responsive. Works on all modern mobile browsers.

### Q: Can I install it as an app?
**A:** PWA features can be enabled for "Add to Home Screen" functionality.

## 🚀 Deployment & Hosting

### Q: How do I deploy to production?
**A:** 
1. Build: `npm run build`
2. Upload `build` folder to hosting service
3. Update Google OAuth origins with production URL
4. Done!

### Q: What hosting services work?
**A:** Any static hosting:
- Netlify (recommended)
- Vercel
- GitHub Pages
- Firebase Hosting
- AWS S3 + CloudFront

### Q: Do I need a backend server?
**A:** No! This is a completely client-side application.

### Q: What about HTTPS?
**A:** Required for production. All modern hosting services provide free HTTPS.

## 💡 Best Practices

### Q: How often should I add expenses?
**A:** Daily is best for accuracy. At minimum, weekly.

### Q: Should I use SubCategory?
**A:** Optional but recommended for detailed tracking. Example:
- Category: Food
- SubCategory: Restaurant, Groceries, Delivery

### Q: How do I organize categories?
**A:** Keep it simple:
- 5-10 main categories
- Use SubCategory for details
- Common categories: Food, Transport, Shopping, Bills, Entertainment, Health

### Q: What's a good budget strategy?
**A:** Follow the 50/30/20 rule:
- 50% Needs (Food, Bills, Transport)
- 30% Wants (Entertainment, Shopping)
- 20% Savings/Investment

### Q: How do I track cash expenses?
**A:** Add them as soon as possible. Keep receipts or use your phone to note them down.

## 🐛 Troubleshooting

### Q: App won't start?
**A:**
```bash
rm -rf node_modules package-lock.json
npm install
npm start
```

### Q: Google login fails?
**A:**
- Check Client ID in `.env`
- Verify authorized origins in Google Cloud Console
- Clear browser cache
- Try incognito mode

### Q: Sheet connection fails?
**A:**
- Verify Sheet ID is correct
- Check you granted all permissions
- Make sure sheet exists
- Try creating a new sheet

### Q: Transactions not saving?
**A:**
- Check internet connection
- Verify sheet permissions
- Check browser console for errors
- Try reconnecting to sheet

### Q: Charts not rendering?
**A:**
- Ensure you have data for selected month
- Check browser console for errors
- Try refreshing the page
- Clear browser cache

### Q: Mobile menu not working?
**A:**
- Try refreshing the page
- Check if JavaScript is enabled
- Try a different browser

## 📱 Mobile-Specific Questions

### Q: Does it work on iPhone?
**A:** Yes! Works on iOS 12+ with Safari or Chrome.

### Q: Does it work on Android?
**A:** Yes! Works on Android 8+ with any modern browser.

### Q: Can I use it on tablet?
**A:** Yes! Fully responsive on tablets.

### Q: Is there a native app?
**A:** No, but the web app works great on mobile. You can add it to your home screen.

### Q: Does it work on mobile data?
**A:** Yes, but uses data for Google Sheets API calls. WiFi recommended for initial setup.

## 💳 Payment & Cost

### Q: Is this free?
**A:** Yes! Completely free to use.

### Q: Are there any hidden costs?
**A:** No. Google Sheets API is free within generous limits.

### Q: Do I need to pay for Google Sheets?
**A:** No, free Google account includes Google Sheets.

### Q: What if I exceed Google API limits?
**A:** Very unlikely for personal use. Limits are 300 requests per minute.

## 🔄 Updates & Maintenance

### Q: How do I update the app?
**A:**
```bash
git pull
npm install
npm start
```

### Q: Will my data be lost on update?
**A:** No. Data is in Google Sheets. Only update the app code.

### Q: How often is it updated?
**A:** Check the repository for latest releases and updates.

### Q: Can I request features?
**A:** Yes! Open an issue on GitHub with your feature request.

## 🎓 Learning & Support

### Q: I'm new to finance tracking. Where do I start?
**A:**
1. Set up basic categories
2. Track all expenses for one month
3. Review your spending patterns
4. Set realistic budgets
5. Adjust and improve

### Q: How do I improve my financial health?
**A:**
1. Track every expense
2. Review dashboard weekly
3. Set and follow budgets
4. Reduce "Want" spending
5. Increase savings rate

### Q: Where can I get help?
**A:**
- Read documentation files
- Check GitHub issues
- Open a new issue
- Community forums

### Q: Is there a tutorial?
**A:** Check [QUICK_START.md](./QUICK_START.md) for a quick tutorial.

## 🌟 Advanced Usage

### Q: Can I customize the code?
**A:** Yes! It's open source. Fork and modify as needed.

### Q: Can I add new features?
**A:** Yes! Contribute back via pull requests.

### Q: Can I integrate with other services?
**A:** Yes! The code is modular. Add new services in the `services` folder.

### Q: Can I change the database from Google Sheets?
**A:** Yes, but requires significant code changes. You'd need to replace `googleSheetsService.js`.

---

## 📞 Still Have Questions?

If your question isn't answered here:
1. Check other documentation files
2. Search GitHub issues
3. Open a new issue
4. Contact the community

---

**Last Updated:** Check repository for latest version
**Total Questions:** 80+
