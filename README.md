# NightmareMC Store

A complete production-ready Minecraft server store website built with **Next.js 14**, **TypeScript**, **Tailwind CSS**, **Firebase Authentication**, and **Cloud Firestore**.

## 🚀 Features

- **Premium Store** — Dynamic product catalog with categories, badges, filters, and search
- **Manual Discord Checkout** — Cart → Checkout → Discord message generator → Copy → Open Discord
- **Firebase CMS Admin Panel** — Full control over the website from `/admin`
- **Real-time Theme Editor** — Customize colors, backgrounds, and fonts
- **Responsive Design** — Works on all devices from 390px to 1920px
- **Dark/Light Mode** — Full dark and light themes
- **No Automatic Payments** — All purchases handled via Discord tickets

## 📋 Tech Stack

| Technology | Purpose |
|---|---|
| Next.js 14 (App Router) | Frontend framework |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| Firebase Auth | Admin authentication |
| Cloud Firestore | CMS database |
| Framer Motion | Animations |
| Lucide React | Icons |
| @dnd-kit | Drag and drop ordering |
| react-hot-toast | Toast notifications |

## 🔧 Setup

### 1. Prerequisites

- Node.js 18+ installed
- A Firebase project (already configured)

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

The Firebase credentials are already pre-filled in `.env.local`.

### 4. Firebase Setup

#### Create Admin User

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Open your project: `nightmare-smp-fbc47`
3. Go to **Authentication** → **Users** → **Add user**
4. Create your admin email/password
5. Copy the User UID

#### Create Admin Firestore Document

In Firestore, create:

```
Collection: users
Document ID: {your-uid}
Fields:
  role: "admin"  (string)
```

#### Firestore Security Rules

Go to **Firestore** → **Rules** and paste:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper function to check admin role
    function isAdmin() {
      return request.auth != null &&
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Public read for published CMS content
    match /settings/{document=**} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /products/{document=**} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /categories/{document=**} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /announcements/{document=**} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /votes/{document=**} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /rules/{document=**} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /patrons/{document=**} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /menus/{document=**} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /homepage/{document=**} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /theme/{document=**} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /currencies/{document=**} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // Admin-only: user roles
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if isAdmin() && request.auth.uid != userId;
    }

    // Deny everything else
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### 5. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 6. Admin Panel

Go to [http://localhost:3000/admin](http://localhost:3000/admin)

Sign in with your admin email/password.

## 🌐 Deploy to Vercel

1. Push the project to GitHub
2. Import into [Vercel](https://vercel.com)
3. Add all environment variables from `.env.local` to Vercel project settings
4. Deploy

## 📁 Project Structure

```
src/
├── app/                     # Next.js App Router pages
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Homepage
│   ├── store/               # Store page
│   ├── vote/                # Vote page
│   ├── patrons/             # Patrons page
│   ├── rules/               # Rules page
│   ├── support/             # Support page
│   ├── admin/               # Admin panel (protected)
│   └── not-found.tsx        # Custom 404
│
├── components/              # Reusable components
│   ├── layout/              # Navbar, Footer
│   ├── store/               # ProductCard, CategorySidebar, etc.
│   ├── cart/                # CartDrawer, CartItem
│   ├── checkout/            # CheckoutModal, DiscordMessageBox
│   ├── home/                # Hero, ServerStatus, etc.
│   ├── ui/                  # Toast, Modal, Skeleton, etc.
│   └── admin/               # Admin panel components
│
├── lib/                     # Utilities
│   ├── firebase/            # Firebase initialization
│   ├── firestore/           # Firestore service functions
│   ├── hooks/               # Custom React hooks
│   ├── utils/               # Helper functions
│   └── types/               # TypeScript interfaces
│
└── styles/                  # Global styles
```

## 🛒 Purchase Flow

```
Product → Add to Cart → Cart → Checkout → Purchase Modal
→ Enter Username (optional) → Select Edition (optional)
→ Discord Message Generator → Copy Message → Open Discord
```

**No payment is processed on the website. All purchases are completed via Discord tickets.**

## 🔐 Admin Panel

The admin panel at `/admin` allows you to manage:

- **Store**: Products, Categories, Bundles
- **Website**: Homepage, Navigation, Theme, Background, Logo
- **Community**: Discord, Patrons, Vote, Rules
- **Server**: Java IP, Bedrock IP, Port
- **Payment Info**: Manual payment instructions (display only)
- **System**: Site settings, Admin users, Preview

## ⚙️ Admin Capabilities

| Feature | Can be changed from admin? |
|---|---|
| Logo | ✅ Yes |
| Server IP | ✅ Yes |
| Bedrock IP & Port | ✅ Yes |
| Discord URL | ✅ Yes |
| Products | ✅ Yes (create/edit/delete) |
| Categories | ✅ Yes (create/edit/delete) |
| Theme Colors | ✅ Yes |
| Background | ✅ Yes |
| Vote Links | ✅ Yes |
| Rules | ✅ Yes |
| Patrons | ✅ Yes |
| Announcements | ✅ Yes |
| Homepage Layout | ✅ Yes |
| Navigation | ✅ Yes |
| Footer | ✅ Yes |
| Payment Instructions | ✅ Yes (display only) |
| Discord Message Template | ✅ Yes |
| SEO | ✅ Yes |
| Maintenance Mode | ✅ Yes |

## 📦 Data Collections

| Collection | Purpose |
|---|---|
| `settings` | Site-wide settings |
| `products` | Store products |
| `categories` | Product categories |
| `announcements` | Site announcements |
| `votes` | Voting links and rewards |
| `rules` | Server rules |
| `patrons` | Patron list |
| `menus` | Navigation menus |
| `homepage` | Homepage section config |
| `theme` | Theme settings |
| `currencies` | Currency list |
| `users` | Admin role mapping |

> ⚠️ There is NO `orders` collection. Purchases are handled via Discord only.

## 🔒 Security

- Firebase Authentication for admin access
- Firestore Security Rules block unauthorized writes
- Environment variables for all credentials
- No private keys in frontend code
- URL validation to prevent XSS
- No customer data stored

## 📝 License

© 2024 NightmareMC. All rights reserved.

NightmareMC is not affiliated with Mojang Studios or Microsoft.
