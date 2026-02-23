# BachatBro Landing Page

## Overview
A professional landing page has been added to BachatBro that serves as the first touchpoint for new visitors.

## Routes
- `/` - Landing page (public, shows before user selection)
- `/app` - Main application (user selection → dashboard)

## Features

### Hero Section
- Premium dark theme matching the app design
- Clear value proposition: "Your finances. Your Google Sheet. Zero compromise."
- Trust indicators: Free Forever, No Database, Your Data
- Dual CTAs: "Start Tracking Free" and "See How It Works"
- Dashboard mockup preview with subtle glow effect

### How It Works (3 Steps)
1. Sign in with Google - One click authentication
2. Connect your Sheet - Your data, your file, your control
3. Start tracking - Everything syncs instantly

### Features Grid (6 Features)
- Budget Tracking
- Category Analysis
- Transaction History
- Need vs Want (50/30/20 rule)
- Real-time Sync
- Works Offline

### Privacy Focus Section
- Prominent "Privacy First" badge
- 4 key privacy points with checkmarks
- Visual diagram showing data flow (App → Your Sheet, No Server)
- Dark blue tinted background for emphasis

### Final CTA
- "Start in 60 seconds" headline
- Large CTA button
- Link for existing users

### Footer
- Minimal design
- "Made in India 🇮🇳" branding
- Quick links to How it works and Open App
- Privacy reminder: "Your data never leaves your Google account"

## Technical Implementation

### Smart Routing
- Authenticated users are automatically redirected from landing to app
- "Open App" button navigates to `/app` route
- Unknown routes redirect to landing page

### Mobile Responsive
- All sections stack properly on mobile
- Touch-friendly button sizes
- Readable text sizes across devices
- Optimized dashboard mockup for small screens

### Design System
- Uses same dark theme as main app (#0A0A0F)
- Consistent accent color (#4F6EF7)
- Rounded corners (rounded-xl, rounded-2xl)
- Subtle borders and glows
- No external images needed (emojis + CSS only)

### Performance
- Single page component
- Smooth scroll between sections
- No heavy animations
- Fast load times

## User Flow
1. New visitor lands on `/`
2. Reads about BachatBro's privacy-first approach
3. Clicks "Start Tracking Free" or "Open App"
4. Navigates to `/app` for user selection
5. Proceeds to Google authentication
6. Connects Google Sheet
7. Starts using the dashboard

## Future Enhancements
- Add actual dashboard screenshot instead of mockup
- A/B test different headlines
- Add testimonials section
- Include demo video
- Add FAQ section
- Implement analytics tracking
