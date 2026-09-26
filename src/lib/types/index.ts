export interface SiteSettings {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  logoUrl: string;
  faviconUrl: string;
  ogImageUrl: string;
  keywords: string;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  defaultCurrency: string;
  defaultTheme: 'dark' | 'light' | 'system';
  discordUrl: string;
  discordMessageTemplate: string;
  // Feature toggles
  showCart: boolean;
  showCurrencySelector: boolean;
  showServerStatus: boolean;
  showPlayerCount: boolean;
  showDiscordStatus: boolean;
  showVote: boolean;
  showPatrons: boolean;
  showRules: boolean;
  showSupport: boolean;
  showBackgroundParticles: boolean;
  showLogoAnimation: boolean;
  showDarkLightToggle: boolean;
  showAnnouncements: boolean;
  showCommunityGoal: boolean;
  showFeaturedProducts: boolean;
  // Community goal
  communityGoalEnabled: boolean;
  communityGoalTitle: string;
  communityGoalDescription: string;
  communityGoalCurrent: number;
  communityGoalTarget: number;
  communityGoalCurrency: string;
  // Dynamic sections
  homepageSections?: any[];
  // Background configuration
  backgroundImageUrl?: string;
  backgroundEnabled?: boolean;
  backgroundOpacity?: number;
  backgroundBlur?: number;
  backgroundOverlay?: boolean;
  backgroundOverlayOpacity?: number;
  backgroundPosition?: string;
  backgroundSize?: string;
  backgroundFixed?: boolean;
  particlesEnabled?: boolean;
  particlesType?: 'portal' | 'embers' | 'stars' | 'snow' | 'fireflies' | 'glyphs';
  particlesAmount?: number;
  particlesSpeed?: number;
  particlesOpacity?: number;
  particlesSize?: number;
  particlesColor?: string;
  // Footer, Owner, Made By & Buy Website Inquiries
  contactEmail?: string;
  creditsText?: string;
  creditsUrl?: string;
  disclaimerText?: string;
  copyrightText?: string;
  footerDescription?: string;
  additionalFooterInfo?: string;
  supportHours?: string;
  showFooterEmail?: boolean;
  showFooterCredits?: boolean;
  showMadeBy?: boolean;
  madeByText?: string;
  madeByUrl?: string;
  showOwner?: boolean;
  ownerName?: string;
  ownerTitle?: string;
  ownerDiscord?: string;
  showBuyWebsite?: boolean;
  buyWebsiteEmail?: string;
  buyWebsiteTitle?: string;
  buyWebsiteText?: string;
  buyWebsitePrice?: string;
  // Flash Sale / Announcement Promo
  flashSaleEnabled?: boolean;
  flashSaleTitle?: string;
  flashSaleSubtitle?: string;
  flashSaleBadge?: string;
  flashSaleButtonText?: string;
  flashSaleButtonUrl?: string;
  flashSaleEndDate?: string;
  // Floating Logo Sizing & Animation
  heroLogoSize?: number;
  navbarLogoSize?: number;
  floatingLogoEnabled?: boolean;
  floatingLogoGlow?: boolean;
  floatingLogoSpeed?: number;
  // Game Audio & Background Music
  soundEffectsEnabled?: boolean;
  bgMusicEnabled?: boolean;
  bgMusicUrl?: string;
  bgMusicTitle?: string;
  bgMusicVolume?: number;
  bgMusicAutoplay?: boolean;
  bgMusicLoop?: boolean;
  // SEO
  createdAt?: import('firebase/firestore').Timestamp;
  updatedAt?: import('firebase/firestore').Timestamp;
  [key: string]: any;
}

export interface ServerSettings {
  javaEnabled: boolean;
  javaIp: string;
  javaVersion: string;
  bedrockEnabled: boolean;
  bedrockIp: string;
  bedrockPort: string | number;
  bedrockVersion: string;
  statusMode: 'live' | 'manual';
  manualStatus: 'online' | 'offline' | 'maintenance';
  manualPlayerCount: number;
  manualMaxPlayers: number;
  liveApiUrl: string;
  showStatus: boolean;
  showPlayerCount: boolean;
  [key: string]: any;
}

export interface DiscordSettings {
  discordUrl: string;
  inviteUrl?: string;
  serverId: string;
  statusMode: 'live' | 'manual';
  manualOnlineCount: number;
  showOnlineCount: boolean;
  enabled: boolean;
  messageTemplate?: string;
  discordMessageTemplate?: string;
  [key: string]: any;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  iconUrl: string;
  bannerUrl: string;
  color: string;
  enabled: boolean;
  sortOrder: number;
  announcementEnabled?: boolean;
  announcementTitle?: string;
  announcementMessage?: string;
  announcementIcon?: string;
  announcementColor?: string;
  announcementButtonText?: string;
  announcementButtonUrl?: string;
  announcement?: {
    enabled?: boolean;
    title?: string;
    message?: string;
    icon?: string;
    color?: string;
    buttonText?: string;
    buttonUrl?: string;
    [key: string]: any;
  };
  createdAt?: import('firebase/firestore').Timestamp;
  updatedAt?: import('firebase/firestore').Timestamp;
  [key: string]: any;
}

export interface ProductPrice {
  INR?: number;
  USD?: number;
  PKR?: number;
  BDT?: number;
  NPR?: number;
  AED?: number;
  EUR?: number;
  GBP?: number;
  [key: string]: number | undefined;
}

export interface ProductFeature {
  id: string;
  text: string;
  enabled: boolean;
}

export interface BundleItem {
  productId: string;
  productName: string;
  quantity: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  categoryName: string;
  shortDescription: string;
  fullDescription: string;
  imageUrl: string;
  iconUrl: string;
  bannerUrl: string;
  prices: ProductPrice;
  badge: string;
  badgeColor: string;
  features: ProductFeature[];
  enabled: boolean;
  featured: boolean;
  popular: boolean;
  isNew: boolean;
  onSale: boolean;
  limited: boolean;
  comingSoon: boolean;
  stockStatus: 'unlimited' | 'instock' | 'outofstock' | 'comingsoon';
  quantityEnabled: boolean;
  minQuantity: number;
  maxQuantity: number;
  availableQuantities: number[];
  sortOrder: number;
  // Bundle fields
  isBundle: boolean;
  bundleItems: BundleItem[];
  originalValue: ProductPrice;
  // Kit & Gallery fields
  kitContents: string[];
  kitPreviewImageUrl?: string;
  galleryImages?: string[];
  // SEO
  seoTitle: string;
  seoDescription: string;
  createdAt?: import('firebase/firestore').Timestamp;
  updatedAt?: import('firebase/firestore').Timestamp;
}

export interface CartItem {
  productId: string;
  productName: string;
  imageUrl: string;
  categoryName: string;
  quantity: number;
  selectedQuantity: number;
  prices: ProductPrice;
  badge: string;
}

export interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  enabled: boolean;
  sortOrder: number;
}

export interface Announcement {
  id: string;
  title: string;
  description: string;
  icon: string;
  imageUrl: string;
  buttonText: string;
  buttonUrl: string;
  color: string;
  enabled: boolean;
  startDate?: import('firebase/firestore').Timestamp;
  endDate?: import('firebase/firestore').Timestamp;
  createdAt?: import('firebase/firestore').Timestamp;
}

export interface VoteLink {
  id: string;
  name: string;
  description: string;
  url: string;
  icon: string;
  reward: string;
  enabled: boolean;
  sortOrder: number;
}

export interface VoteReward {
  id: string;
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
  sortOrder: number;
}

export interface VoteSettings {
  enabled: boolean;
  title: string;
  description: string;
  announcementEnabled: boolean;
  announcementTitle: string;
  announcementMessage: string;
}

export interface Rule {
  id: string;
  title: string;
  description: string;
  category: string;
  number: number;
  icon: string;
  enabled: boolean;
  sortOrder: number;
}

export interface RuleCategory {
  id: string;
  name: string;
  icon: string;
  enabled: boolean;
  sortOrder: number;
}

export interface Patron {
  id: string;
  username: string;
  avatarUrl: string;
  amount: string | number;
  tier?: string;
  tierId?: string;
  badge?: string;
  enabled: boolean;
  sortOrder: number;
  createdAt?: import('firebase/firestore').Timestamp;
  updatedAt?: import('firebase/firestore').Timestamp;
  [key: string]: any;
}

export interface PatronTier {
  id: string;
  name: string;
  icon: string;
  color: string;
  minAmount: string | number;
  enabled: boolean;
  sortOrder: number;
  [key: string]: any;
}

export interface NavigationItem {
  id: string;
  label: string;
  url: string;
  icon: string;
  enabled: boolean;
  sortOrder: number;
  children?: NavigationItem[];
  isExternal: boolean;
}

export interface HomepageSection {
  id: string;
  type: 'hero' | 'server_status' | 'featured_products' | 'categories' | 'announcement' | 'discord' | 'patrons' | 'vote_cta' | 'support_cta' | 'custom';
  enabled: boolean;
  sortOrder: number;
  // Custom section fields
  title?: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
  buttonText?: string;
  buttonUrl?: string;
  icon?: string;
}

export interface HeroSettings {
  headline: string;
  subheadline: string;
  alignment: 'left' | 'center' | 'right';
  showLogo: boolean;
  logoSize: 'sm' | 'md' | 'lg' | 'xl';
  showPlayButton: boolean;
  playButtonText: string;
  playButtonUrl: string;
  showStoreButton: boolean;
  storeButtonText: string;
  showDiscordButton: boolean;
  discordButtonText: string;
  floatingLogo: boolean;
  glowLogo: boolean;
  animationSpeed: 'slow' | 'medium' | 'fast';
}

export interface ThemeSettings {
  id: string;
  preset: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  cardColor: string;
  surfaceColor: string;
  borderColor: string;
  textColor: string;
  mutedTextColor: string;
  successColor: string;
  warningColor: string;
  dangerColor: string;
  borderRadius: string;
  shadowStyle: string;
  glowEnabled: boolean;
  blurEnabled: boolean;
  buttonStyle: 'solid' | 'outline' | 'gradient';
  buttonRadius: string;
  gradientEnabled: boolean;
  gradientFrom: string;
  gradientTo: string;
  // Background
  backgroundImageUrl: string;
  backgroundEnabled: boolean;
  backgroundOpacity: number;
  backgroundBlur: number;
  backgroundOverlay: boolean;
  backgroundOverlayOpacity: number;
  backgroundPosition: string;
  backgroundSize: string;
  backgroundFixed: boolean;
  // Particles
  particlesEnabled: boolean;
  particlesType?: 'portal' | 'embers' | 'stars' | 'snow' | 'fireflies' | 'glyphs';
  particlesAmount: number;
  particlesSpeed: number;
  particlesOpacity: number;
  particlesSize: number;
  particlesColor?: string;
  // Compatibility
  background?: any;
  particles?: any;
  [key: string]: any;
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon: string;
  enabled: boolean;
}

export interface FooterSettings {
  description: string;
  disclaimer: string;
  showServerIp: boolean;
  showDiscord: boolean;
  showSocialLinks: boolean;
  copyrightText: string;
  contactEmail?: string;
  creditsText?: string;
  creditsUrl?: string;
  additionalInfo?: string;
  supportHours?: string;
  showFooterEmail?: boolean;
  showFooterCredits?: boolean;
  showMadeBy?: boolean;
  madeByText?: string;
  madeByUrl?: string;
  showOwner?: boolean;
  ownerName?: string;
  ownerTitle?: string;
  ownerDiscord?: string;
  showBuyWebsite?: boolean;
  buyWebsiteEmail?: string;
  buyWebsiteTitle?: string;
  buyWebsiteText?: string;
  buyWebsitePrice?: string;
  [key: string]: any;
}

export interface PaymentSettings {
  enabled: boolean;
  upiId: string;
  upiName: string;
  qrImageUrl: string;
  instructions: string;
  methods: PaymentMethod[];
}

export interface PaymentMethod {
  id: string;
  name: string;
  enabled: boolean;
  icon: string;
}

export interface AdminUser {
  uid: string;
  email: string;
  role: 'admin' | 'moderator';
  createdAt?: import('firebase/firestore').Timestamp;
}

export type StoreCategory = Category;
