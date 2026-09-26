import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type {
  SiteSettings,
  ServerSettings,
  ThemeSettings,
  HeroSettings,
  Currency,
  CartItem,
  Product,
} from '../types';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number, currency: Currency): string {
  try {
    return `${currency.symbol}${amount.toFixed(2)}`;
  } catch {
    return `$${amount.toFixed(2)}`;
  }
}

export function validateUrl(url: string): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Generate a Discord message from the admin-configured template.
 * Template variables: {{cart_items}}, {{edition}}, {{username}}, {{currency}}, {{total}}, {{site_name}}
 * The message is generated client-side only and is NEVER stored in Firebase.
 */
export function generateDiscordMessage(
  template: string,
  items: CartItem[],
  currency: Currency,
  username: string,
  edition: string,
  total: string,
  siteName: string = 'NightmareMC'
): string {
  const cartItemsText = items
    .map(item => `• ${item.productName} ×${item.selectedQuantity}`)
    .join('\n');

  return template
    .replace('{{cart_items}}', cartItemsText)
    .replace('{{edition}}', edition || 'Not specified')
    .replace('{{username}}', username || 'Not provided')
    .replace('{{currency}}', currency.code)
    .replace('{{total}}', total)
    .replace('{{site_name}}', siteName);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export function getProductPrice(
  product: Product,
  currencyCode: string
): number {
  if (!product) return 0;
  const p = product.prices || (product as any).price || {};
  const val = p[currencyCode] ?? p['INR'] ?? p['USD'];
  return typeof val === 'number' && !isNaN(val) ? val : 0;
}

export const DEFAULT_EXCHANGE_RATES: Record<string, number> = {
  USD: 1,
  INR: 86.5,
  PKR: 280.0,
  BDT: 121.5,
  NPR: 138.5,
  AED: 3.67,
  EUR: 0.92,
  GBP: 0.78,
};

export function convertPrice(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  rates: Record<string, number> = DEFAULT_EXCHANGE_RATES,
  smartRound: boolean = true
): number {
  if (isNaN(amount) || amount <= 0) return 0;
  if (fromCurrency === toCurrency) return amount;

  const fromRate = rates[fromCurrency] || 1;
  const toRate = rates[toCurrency] || 1;

  // Convert to USD base first, then to target currency
  const inUSD = amount / fromRate;
  const converted = inUSD * toRate;

  if (!smartRound) {
    return parseFloat(converted.toFixed(2));
  }

  // Smart rounding:
  // For currencies like INR, PKR, BDT, NPR: round to integer
  if (['INR', 'PKR', 'BDT', 'NPR'].includes(toCurrency)) {
    return Math.round(converted);
  } else {
    return parseFloat(converted.toFixed(2));
  }
}

export function autoConvertAllPrices(
  baseAmount: number,
  baseCurrency: string,
  rates: Record<string, number> = DEFAULT_EXCHANGE_RATES,
  smartRound: boolean = true
): Record<string, number> {
  const result: Record<string, number> = {};
  const currencies = ['INR', 'USD', 'PKR', 'BDT', 'NPR', 'AED', 'EUR', 'GBP'];

  currencies.forEach((code) => {
    if (code === baseCurrency) {
      result[code] = baseAmount;
    } else {
      result[code] = convertPrice(baseAmount, baseCurrency, code, rates, smartRound);
    }
  });

  return result;
}

export const DEFAULT_DISCORD_MESSAGE_TEMPLATE = `Hello NightmareMC Staff! 👋

I would like to purchase:

{{cart_items}}

Minecraft Edition: {{edition}}
Minecraft Username: {{username}}
Currency: {{currency}}
Displayed Store Total: {{total}}

Please confirm the final amount and payment instructions.

Thank you!`;

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  siteName: 'NightmareMC',
  siteDescription: 'Enter the Nightmare. Upgrade your journey, unlock exclusive rewards, and support the server.',
  siteUrl: 'https://store.nightmaremc.com',
  logoUrl: '',
  faviconUrl: '/favicon.ico',
  ogImageUrl: '',
  keywords: 'minecraft, server, store, nightmaremc, ranks, kits, crate keys',
  maintenanceMode: false,
  maintenanceMessage: 'We are currently upgrading the server. Check back soon!',
  defaultCurrency: 'INR',
  defaultTheme: 'dark',
  discordUrl: 'https://discord.gg/nightmaremc',
  discordMessageTemplate: DEFAULT_DISCORD_MESSAGE_TEMPLATE,
  showCart: true,
  showCurrencySelector: true,
  showServerStatus: true,
  showPlayerCount: true,
  showDiscordStatus: true,
  showVote: true,
  showPatrons: true,
  showRules: true,
  showSupport: true,
  showBackgroundParticles: false,
  showLogoAnimation: true,
  showDarkLightToggle: true,
  showAnnouncements: true,
  showCommunityGoal: false,
  showFeaturedProducts: true,
  communityGoalEnabled: false,
  communityGoalTitle: 'Monthly Goal',
  communityGoalDescription: 'Help us reach our monthly goal to unlock server-wide rewards!',
  communityGoalCurrent: 0,
  communityGoalTarget: 10000,
  communityGoalCurrency: 'INR',
  // Background defaults
  backgroundImageUrl: '',
  backgroundEnabled: true,
  backgroundOpacity: 40,
  backgroundBlur: 0,
  backgroundOverlay: true,
  backgroundOverlayOpacity: 75,
  backgroundPosition: 'center',
  backgroundSize: 'cover',
  backgroundFixed: true,
  particlesEnabled: true,
  particlesType: 'portal',
  particlesAmount: 40,
  particlesSpeed: 1,
  particlesOpacity: 70,
  particlesSize: 3,
  particlesColor: '',
  // Footer defaults
  contactEmail: 'support@nightmaremc.com',
  creditsText: 'NightmareMC Network Development',
  creditsUrl: 'https://discord.gg/nightmaremc',
  disclaimerText: 'NightmareMC is not affiliated with Mojang Studios or Microsoft Corporation. Minecraft is a registered trademark of Mojang AB.',
  copyrightText: 'NightmareMC. All rights reserved.',
  footerDescription: 'The ultimate Minecraft server store. Upgrade your journey, unlock exclusive rewards, and support the server.',
  additionalFooterInfo: '⚡ 24/7 Discord Ticket Support • Instant Delivery',
  supportHours: '24/7 Response via Discord Tickets',
  showFooterEmail: true,
  showFooterCredits: true,
  showMadeBy: true,
  madeByText: 'NightmareMC Development Team',
  madeByUrl: 'https://discord.gg/nightmaremc',
  showOwner: true,
  ownerName: 'NightmareMC Owner',
  ownerTitle: 'Server Founder & Lead Administrator',
  ownerDiscord: 'discord.gg/nightmaremc',
  showBuyWebsite: true,
  buyWebsiteEmail: 'business@nightmaremc.com',
  buyWebsiteTitle: 'Want to Buy This Website or Custom Store?',
  buyWebsiteText: 'Looking for a custom Minecraft store, website template, or tailored web design? Contact the website owner for purchase and commission details.',
  buyWebsitePrice: 'Custom Quote / Inquire for Rates',
  // Floating Logo Sizing & Animation
  heroLogoSize: 200,
  navbarLogoSize: 38,
  floatingLogoEnabled: true,
  floatingLogoGlow: true,
  floatingLogoSpeed: 5,
  // Game Audio & Background Music
  soundEffectsEnabled: true,
  bgMusicEnabled: true,
  bgMusicUrl: 'https://www.youtube.com/watch?v=0hO4jKzLhG0',
  bgMusicTitle: 'C418 - Aria Math (Minecraft OST)',
  bgMusicVolume: 30,
  bgMusicAutoplay: true,
  bgMusicLoop: true,
};

export const DEFAULT_SERVER_SETTINGS: ServerSettings = {
  javaEnabled: true,
  javaIp: 'play.nightmaremc.example',
  javaVersion: '1.20+',
  bedrockEnabled: true,
  bedrockIp: 'play.nightmaremc.example',
  bedrockPort: '19132',
  bedrockVersion: 'Latest',
  statusMode: 'manual',
  manualStatus: 'online',
  manualPlayerCount: 0,
  manualMaxPlayers: 500,
  liveApiUrl: '',
  showStatus: true,
  showPlayerCount: true,
};

export const DEFAULT_THEME_SETTINGS: ThemeSettings = {
  id: 'nightmare',
  preset: 'nightmare',
  primaryColor: '#cc33ff',
  secondaryColor: '#8b5cf6',
  accentColor: '#cc33ff',
  backgroundColor: '#07070d',
  cardColor: '#0d0d14',
  surfaceColor: '#111118',
  borderColor: '#1f1f2e',
  textColor: '#f4f4f8',
  mutedTextColor: '#71717a',
  successColor: '#22c55e',
  warningColor: '#f59e0b',
  dangerColor: '#ef4444',
  borderRadius: '0.75rem',
  shadowStyle: 'lg',
  glowEnabled: true,
  blurEnabled: true,
  buttonStyle: 'gradient',
  buttonRadius: '0.75rem',
  gradientEnabled: true,
  gradientFrom: '#cc33ff',
  gradientTo: '#8b5cf6',
  backgroundImageUrl: '',
  backgroundEnabled: false,
  backgroundOpacity: 0.15,
  backgroundBlur: 0,
  backgroundOverlay: true,
  backgroundOverlayOpacity: 0.6,
  backgroundPosition: 'center',
  backgroundSize: 'cover',
  backgroundFixed: true,
  particlesEnabled: false,
  particlesAmount: 30,
  particlesSpeed: 1,
  particlesOpacity: 0.3,
  particlesSize: 2,
};

export const DEFAULT_HERO_SETTINGS: HeroSettings = {
  headline: 'Enter the Nightmare.',
  subheadline: 'Upgrade your journey, unlock exclusive rewards, and support the server.',
  alignment: 'center',
  showLogo: true,
  logoSize: 'lg',
  showPlayButton: true,
  playButtonText: 'PLAY NOW',
  playButtonUrl: '',
  showStoreButton: true,
  storeButtonText: 'EXPLORE STORE',
  showDiscordButton: true,
  discordButtonText: 'JOIN DISCORD',
  floatingLogo: true,
  glowLogo: true,
  animationSpeed: 'medium',
};

export const DEFAULT_CURRENCIES: Currency[] = [
  { id: 'inr', code: 'INR', name: 'Indian Rupee', symbol: '₹', enabled: true, sortOrder: 1 },
  { id: 'usd', code: 'USD', name: 'US Dollar', symbol: '$', enabled: true, sortOrder: 2 },
  { id: 'pkr', code: 'PKR', name: 'Pakistani Rupee', symbol: 'Rs', enabled: true, sortOrder: 3 },
  { id: 'bdt', code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳', enabled: true, sortOrder: 4 },
  { id: 'npr', code: 'NPR', name: 'Nepalese Rupee', symbol: 'रू', enabled: true, sortOrder: 5 },
  { id: 'aed', code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', enabled: true, sortOrder: 6 },
  { id: 'eur', code: 'EUR', name: 'Euro', symbol: '€', enabled: false, sortOrder: 7 },
  { id: 'gbp', code: 'GBP', name: 'British Pound', symbol: '£', enabled: false, sortOrder: 8 },
];
