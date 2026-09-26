# 🚀 NightmareMC Store — Vercel Deployment Guide

Deploying your NightmareMC Store to **Vercel** takes under 2 minutes.

---

## Method 1: Deploy with Git & Vercel Dashboard (Recommended)

### Step 1: Push your project to GitHub
If you haven't pushed yet:
1. Initialize git and commit:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - NightmareMC Store"
   ```
2. Create a new repository on GitHub (private or public).
3. Push to your repo:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/nightmaremc-store.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Import Project on Vercel
1. Go to [https://vercel.com](https://vercel.com) and log in.
2. Click **"Add New..."** -> **"Project"**.
3. Select your `nightmaremc-store` GitHub repository and click **Import**.

### Step 3: Configure Environment Variables
Before clicking Deploy, expand **"Environment Variables"** and paste the keys from your `.env.local`:

| Variable Name | Description |
|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API Key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase Project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase Storage Bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase Messaging Sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase App ID |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Firebase Measurement ID (optional) |

> 💡 **Tip:** You can open your local `.env.local` file, copy all the lines, and paste them directly into the first key field in Vercel — Vercel will auto-populate all fields!

### Step 4: Click Deploy
Click **Deploy**!
Vercel will build the Next.js project and give you a live production URL (e.g., `https://nightmaremc-store.vercel.app`).

---

## Method 2: Deploy using Vercel CLI

If you prefer terminal deployment:
1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```
2. Run deploy command:
   ```bash
   vercel
   ```
3. Follow the prompts to link your project.
4. Deploy to production:
   ```bash
   vercel --prod
   ```

---

## Firebase Configuration Note for Production
In your **Firebase Console** ([console.firebase.google.com](https://console.firebase.google.com)):
1. Go to **Authentication** -> **Settings** -> **Authorized domains**.
2. Add your Vercel domain (e.g. `nightmaremc-store.vercel.app` or your custom domain).
3. This ensures admin login works smoothly on your live domain!

---

## Features Verified Working
- ✅ Dynamic Minecraft Server Status (mcsrvstat.us v3 proxy)
- ✅ Ambient Background Music Streaming (YouTube & MP3)
- ✅ Shopping Cart & Multi-Step Discord Checkout Generator
- ✅ Multi-Currency Converter
- ✅ CMS Admin Panel with Firestore real-time synchronization
- ✅ Custom Logo & Favicon Management
- ✅ Responsive Dark Minecraft Theme
