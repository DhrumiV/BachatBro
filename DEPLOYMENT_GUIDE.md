# 🚀 Deployment Guide

Complete guide to deploy your Finance Dashboard to production.

## 📋 Pre-Deployment Checklist

- [ ] Google Cloud Console project created
- [ ] Google Sheets API enabled
- [ ] OAuth 2.0 credentials created
- [ ] Client ID obtained
- [ ] App tested locally

## 🌐 Deployment Options

### Option 1: Netlify (Recommended - Easiest)

#### Step 1: Prepare for Deployment
```bash
# Install dependencies
npm install

# Test build locally
npm run build
```

#### Step 2: Deploy to Netlify

**Method A: Drag & Drop (Fastest)**
1. Run `npm run build`
2. Go to [Netlify Drop](https://app.netlify.com/drop)
3. Drag the `build` folder
4. Done! You'll get a URL like: `https://random-name.netlify.app`

**Method B: GitHub Integration (Best for Updates)**
1. Push code to GitHub
2. Go to [Netlify](https://app.netlify.com)
3. Click "New site from Git"
4. Connect your GitHub repository
5. Build settings:
   - Build command: `npm run build`
   - Publish directory: `build`
6. Click "Deploy site"

#### Step 3: Configure Environment Variables
1. In Netlify dashboard, go to Site settings → Environment variables
2. Add variable:
   - Key: `REACT_APP_GOOGLE_CLIENT_ID`
   - Value: Your Google Client ID
3. Redeploy the site

#### Step 4: Update Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to APIs & Services → Credentials
3. Edit your OAuth 2.0 Client ID
4. Add to "Authorized JavaScript origins":
   ```
   https://your-site-name.netlify.app
   ```
5. Save

#### Step 5: Test Production
1. Visit your Netlify URL
2. Test authentication
3. Test all features

---

### Option 2: Vercel

#### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

#### Step 2: Deploy
```bash
# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? finance-dashboard
# - Directory? ./
# - Override settings? No
```

#### Step 3: Add Environment Variable
```bash
vercel env add REACT_APP_GOOGLE_CLIENT_ID
# Paste your Client ID when prompted
# Select: Production, Preview, Development
```

#### Step 4: Redeploy
```bash
vercel --prod
```

#### Step 5: Update Google Cloud Console
Add your Vercel URL to authorized origins:
```
https://your-project.vercel.app
```

---

### Option 3: GitHub Pages

#### Step 1: Install gh-pages
```bash
npm install --save-dev gh-pages
```

#### Step 2: Update package.json
Add these lines:
```json
{
  "homepage": "https://yourusername.github.io/finance-dashboard",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d build"
  }
}
```

#### Step 3: Deploy
```bash
npm run deploy
```

#### Step 4: Configure GitHub Pages
1. Go to your repository on GitHub
2. Settings → Pages
3. Source: gh-pages branch
4. Save

#### Step 5: Add Environment Variable
Create `.env.production`:
```
REACT_APP_GOOGLE_CLIENT_ID=your_client_id_here
```

Commit and redeploy:
```bash
git add .env.production
git commit -m "Add production env"
npm run deploy
```

#### Step 6: Update Google Cloud Console
Add GitHub Pages URL:
```
https://yourusername.github.io
```

---

### Option 4: Firebase Hosting

#### Step 1: Install Firebase CLI
```bash
npm install -g firebase-tools
```

#### Step 2: Login and Initialize
```bash
firebase login
firebase init hosting

# Select:
# - Use existing project or create new
# - Public directory: build
# - Single-page app: Yes
# - GitHub deploys: No (or Yes if you want)
```

#### Step 3: Build and Deploy
```bash
npm run build
firebase deploy
```

#### Step 4: Set Environment Variable
```bash
firebase functions:config:set google.client_id="your_client_id"
```

Or add to `.env.production`

#### Step 5: Update Google Cloud Console
Add Firebase URL:
```
https://your-project.web.app
```

---

## 🔧 Post-Deployment Configuration

### 1. Test Authentication
- [ ] Visit production URL
- [ ] Click "Sign in with Google"
- [ ] Verify popup opens
- [ ] Grant permissions
- [ ] Verify authentication succeeds

### 2. Test Sheet Connection
- [ ] Create a test Google Sheet
- [ ] Copy Sheet ID
- [ ] Paste in app
- [ ] Click "Test Connection"
- [ ] Verify headers created

### 3. Test All Features
- [ ] Add expense
- [ ] View dashboard
- [ ] Check history
- [ ] View analytics
- [ ] Update settings
- [ ] Edit transaction
- [ ] Delete transaction

### 4. Test on Mobile
- [ ] Open on mobile browser
- [ ] Test all features
- [ ] Verify responsive design

## 🔒 Security Checklist

- [ ] HTTPS enabled (automatic on all platforms)
- [ ] Environment variables set correctly
- [ ] Google OAuth origins updated
- [ ] No API keys in code
- [ ] `.env` file in `.gitignore`

## 🐛 Troubleshooting

### "redirect_uri_mismatch" Error
**Solution:** Add your production URL to Google Cloud Console authorized origins

### Environment Variable Not Working
**Solution:** 
- Verify variable name starts with `REACT_APP_`
- Rebuild after adding variable
- Clear browser cache

### Authentication Fails
**Solution:**
- Check Client ID is correct
- Verify authorized origins include your domain
- Try incognito mode

### Build Fails
**Solution:**
```bash
# Clear cache and rebuild
rm -rf node_modules build
npm install
npm run build
```

## 📊 Monitoring

### Netlify
- View deploy logs in dashboard
- Check function logs
- Monitor bandwidth usage

### Vercel
- View deployment logs
- Check analytics
- Monitor performance

### Firebase
- View hosting metrics
- Check usage quotas
- Monitor performance

## 🔄 Updating Your App

### Netlify (GitHub Integration)
```bash
git add .
git commit -m "Update feature"
git push
# Auto-deploys!
```

### Vercel
```bash
git push
# Auto-deploys!
# Or manually: vercel --prod
```

### GitHub Pages
```bash
npm run deploy
```

### Firebase
```bash
npm run build
firebase deploy
```

## 💰 Cost Breakdown

| Platform | Free Tier | Cost After |
|----------|-----------|------------|
| Netlify | 100GB bandwidth/month | $19/month |
| Vercel | 100GB bandwidth/month | $20/month |
| GitHub Pages | Unlimited (public repos) | Free |
| Firebase | 10GB storage, 360MB/day | Pay as you go |

**Recommendation:** Start with Netlify or Vercel free tier.

## 🎯 Custom Domain (Optional)

### Buy Domain
- Namecheap: ~$10/year
- Google Domains: ~$12/year
- GoDaddy: ~$15/year

### Configure DNS

**For Netlify:**
1. Domain settings → Add custom domain
2. Update DNS records at your registrar
3. Enable HTTPS (automatic)

**For Vercel:**
1. Project settings → Domains
2. Add domain
3. Update DNS records
4. HTTPS enabled automatically

**For GitHub Pages:**
1. Add CNAME file to repository
2. Update DNS A records
3. Enable HTTPS in settings

## 📱 Progressive Web App (Optional)

To make it installable:

1. Update `public/manifest.json`:
```json
{
  "short_name": "Finance",
  "name": "Finance Dashboard",
  "icons": [
    {
      "src": "icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "start_url": ".",
  "display": "standalone",
  "theme_color": "#3b82f6",
  "background_color": "#ffffff"
}
```

2. Add icons to `public/` folder

3. Register service worker (optional for offline)

## ✅ Deployment Complete!

Your Finance Dashboard is now live! 🎉

Share your URL:
```
https://your-app-name.netlify.app
```

---

**Need help?** Check the troubleshooting section or open an issue on GitHub.
