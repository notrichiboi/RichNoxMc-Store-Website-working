import { db } from '../firebase/config';
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, Timestamp } from 'firebase/firestore';
import type { 
  SiteSettings, 
  ServerSettings, 
  DiscordSettings, 
  ThemeSettings, 
  FooterSettings, 
  PaymentSettings, 
  HeroSettings, 
  SocialLink, 
  NavigationItem, 
  HomepageSection 
} from '../types';

export const getSiteSettings = async (): Promise<SiteSettings | null> => {
  const docRef = doc(db, 'settings', 'site');
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() as SiteSettings : null;
};

export const updateSiteSettings = async (data: Partial<SiteSettings>): Promise<void> => {
  const docRef = doc(db, 'settings', 'site');
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    await updateDoc(docRef, { ...data, updatedAt: Timestamp.now() });
  } else {
    await setDoc(docRef, { ...data, createdAt: Timestamp.now(), updatedAt: Timestamp.now() });
  }
};

export const getServerSettings = async (): Promise<ServerSettings | null> => {
  const docRef = doc(db, 'settings', 'server');
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() as ServerSettings : null;
};

export const updateServerSettings = async (data: Partial<ServerSettings>): Promise<void> => {
  const docRef = doc(db, 'settings', 'server');
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    await updateDoc(docRef, { ...data });
  } else {
    await setDoc(docRef, { ...data });
  }
};

export const getDiscordSettings = async (): Promise<DiscordSettings | null> => {
  const docRef = doc(db, 'settings', 'discord');
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() as DiscordSettings : null;
};

export const updateDiscordSettings = async (data: any): Promise<void> => {
  const docRef = doc(db, 'settings', 'discord');
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    await updateDoc(docRef, { ...data });
  } else {
    await setDoc(docRef, { ...data });
  }

  // Also sync discordUrl and discordMessageTemplate to site settings
  const siteUrl = data.discordUrl || data.inviteUrl;
  const updates: Record<string, any> = {};
  if (siteUrl) updates.discordUrl = siteUrl;
  if (data.discordMessageTemplate) updates.discordMessageTemplate = data.discordMessageTemplate;
  if (Object.keys(updates).length > 0) {
    await updateSiteSettings(updates);
  }
};

export const getThemeSettings = async (): Promise<ThemeSettings | null> => {
  const docRef = doc(db, 'settings', 'theme');
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as ThemeSettings : null;
};

export const updateThemeSettings = async (data: Partial<ThemeSettings>): Promise<void> => {
  const docRef = doc(db, 'settings', 'theme');
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    await updateDoc(docRef, { ...data });
  } else {
    await setDoc(docRef, { ...data });
  }
};

export const getFooterSettings = async (): Promise<FooterSettings | null> => {
  const docRef = doc(db, 'settings', 'footer');
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() as FooterSettings : null;
};

export const updateFooterSettings = async (data: Partial<FooterSettings>): Promise<void> => {
  const docRef = doc(db, 'settings', 'footer');
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    await updateDoc(docRef, { ...data });
  } else {
    await setDoc(docRef, { ...data });
  }
};

export const getPaymentSettings = async (): Promise<PaymentSettings | null> => {
  const docRef = doc(db, 'settings', 'payment');
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() as PaymentSettings : null;
};

// Aliases so both getPaymentInfo and getPaymentSettings work
export const getPaymentInfo = getPaymentSettings;

export const updatePaymentSettings = async (data: Partial<PaymentSettings>): Promise<void> => {
  const docRef = doc(db, 'settings', 'payment');
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    await updateDoc(docRef, { ...data });
  } else {
    await setDoc(docRef, { ...data });
  }
};

// Aliases so both updatePaymentInfo and updatePaymentSettings work
export const updatePaymentInfo = updatePaymentSettings;

export const getHeroSettings = async (): Promise<HeroSettings | null> => {
  const docRef = doc(db, 'settings', 'hero');
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() as HeroSettings : null;
};

export const updateHeroSettings = async (data: Partial<HeroSettings>): Promise<void> => {
  const docRef = doc(db, 'settings', 'hero');
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    await updateDoc(docRef, { ...data });
  } else {
    await setDoc(docRef, { ...data });
  }
};

export const getSocialLinks = async (): Promise<SocialLink[]> => {
  const colRef = collection(db, 'socialLinks');
  const snapshot = await getDocs(colRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SocialLink));
};

export const getNavigationItems = async (): Promise<NavigationItem[]> => {
  const colRef = collection(db, 'navigation');
  const snapshot = await getDocs(colRef);
  return snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() } as NavigationItem))
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
};

export const getHomepageSections = async (): Promise<HomepageSection[]> => {
  const colRef = collection(db, 'homepageSections');
  const snapshot = await getDocs(colRef);
  return snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() } as HomepageSection))
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
};

