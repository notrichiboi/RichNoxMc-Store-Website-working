import type { Metadata, Viewport } from 'next';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { PlayerProvider } from '@/contexts/PlayerContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { CurrencyProvider } from '@/contexts/CurrencyContext';
import { CartProvider } from '@/contexts/CartContext';
import { PlayerLoginModal } from '@/components/layout/PlayerLoginModal';
import { GlobalBackground } from '@/components/layout/GlobalBackground';
import { FlashSaleBanner } from '@/components/home/FlashSaleBanner';
import { FaviconManager } from '@/components/layout/FaviconManager';
import { BackgroundMusicPlayer } from '@/components/layout/BackgroundMusicPlayer';
import { Toaster } from 'react-hot-toast';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'NightmareMC Store',
    template: '%s | NightmareMC',
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
      { url: '/favicon.png', type: 'image/png', sizes: '64x64' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    shortcut: '/favicon.svg',
    apple: '/apple-touch-icon.png',
  },
  description: 'The ultimate Minecraft server store. Upgrade your journey, unlock exclusive rewards, and support the server.',
  keywords: ['minecraft', 'server', 'store', 'nightmaremc', 'ranks', 'kits', 'crate keys'],
  openGraph: {
    title: 'NightmareMC Store',
    description: 'The ultimate Minecraft server store.',
    type: 'website',
    siteName: 'NightmareMC',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className="min-h-screen bg-slate-50 dark:bg-[#07070d] text-slate-900 dark:text-[#f4f4f8] antialiased transition-colors duration-300">
        {/* Instant theme check script placed directly in body for zero flash without head reconciliation conflicts */}
        <script
          id="nightmaremc-theme-init"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `
              try {
                // Ignore third-party browser extension errors (e.g. Urban VPN, Grammarly)
                window.addEventListener('error', function(e) {
                  if (
                    (e.filename && (e.filename.indexOf('extension://') !== -1 || e.filename.indexOf('executors') !== -1)) ||
                    (e.message && (e.message.indexOf('M_ID') !== -1 || e.message.indexOf('ResizeObserver') !== -1))
                  ) {
                    e.stopImmediatePropagation();
                    e.preventDefault();
                    return true;
                  }
                }, true);

                window.addEventListener('unhandledrejection', function(e) {
                  var reason = String(e.reason || '');
                  if (reason.indexOf('extension://') !== -1 || reason.indexOf('M_ID') !== -1) {
                    e.stopImmediatePropagation();
                    e.preventDefault();
                  }
                }, true);

                var storedTheme = localStorage.getItem('nightmaremc_theme');
                if (storedTheme === 'light') {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.classList.add('light');
                  document.documentElement.setAttribute('data-theme', 'light');
                } else {
                  document.documentElement.classList.add('dark');
                  document.documentElement.classList.remove('light');
                  document.documentElement.setAttribute('data-theme', 'dark');
                }
              } catch(e) {}
            `,
          }}
        />
        <ThemeProvider>
          <SettingsProvider>
            <FaviconManager />
            <GlobalBackground />
            <CurrencyProvider>
              <PlayerProvider>
                <CartProvider>
                  <FlashSaleBanner />
                  <BackgroundMusicPlayer />
                  {children}
                  <PlayerLoginModal />
                  <Toaster
                    position="bottom-right"
                    gutter={8}
                    toastOptions={{
                      duration: 4000,
                      style: {
                        borderRadius: '0.75rem',
                        fontSize: '0.875rem',
                        fontFamily: "'Inter', sans-serif",
                        boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                      },
                    }}
                  />
                </CartProvider>
              </PlayerProvider>
            </CurrencyProvider>
          </SettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
