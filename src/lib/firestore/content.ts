import { db } from '../firebase/config';
import {
  collection, getDocs, doc, setDoc, updateDoc, deleteDoc,
  getDoc, addDoc, Timestamp, writeBatch
} from 'firebase/firestore';
import type {
  Announcement, VoteSettings, VoteLink, VoteReward,
  Rule, RuleCategory, Patron, PatronTier, Currency
} from '../types';

// Re-export site settings so vote page can access them directly from here
export { getSiteSettings, updateSiteSettings } from './settings';

// ─── Announcements ────────────────────────────────────────────────────────────

export const getAnnouncements = async (): Promise<Announcement[]> => {
  try {
    const colRef = collection(db, 'announcements');
    const snapshot = await getDocs(colRef);
    const announcements = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Announcement));
    return announcements.sort((a, b) => {
      const timeA = a.createdAt?.seconds ?? 0;
      const timeB = b.createdAt?.seconds ?? 0;
      return timeB - timeA;
    });
  } catch {
    return [];
  }
};

export const getActiveAnnouncements = async (): Promise<Announcement[]> => {
  const all = await getAnnouncements();
  const now = Date.now() / 1000;
  return all.filter(a => {
    if (!a.enabled) return false;
    if (a.startDate && a.startDate.seconds > now) return false;
    if (a.endDate && a.endDate.seconds < now) return false;
    return true;
  });
};

export const createAnnouncement = async (data: Omit<Announcement, 'id'>): Promise<string> => {
  const ref = await addDoc(collection(db, 'announcements'), {
    ...data,
    createdAt: Timestamp.now(),
  });
  return ref.id;
};
export const addAnnouncement = createAnnouncement;

export const updateAnnouncement = async (id: string, data: Partial<Announcement>): Promise<void> => {
  await updateDoc(doc(db, 'announcements', id), data);
};

export const deleteAnnouncement = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'announcements', id));
};

// ─── Vote Settings ─────────────────────────────────────────────────────────────

export const getVoteSettings = async (): Promise<VoteSettings | null> => {
  try {
    const docRef = doc(db, 'settings', 'vote');
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as VoteSettings) : null;
  } catch {
    return null;
  }
};

export const updateVoteSettings = async (data: Partial<VoteSettings>): Promise<void> => {
  const ref = doc(db, 'settings', 'vote');
  const snap = await getDoc(ref);
  if (snap.exists()) {
    await updateDoc(ref, data);
  } else {
    await setDoc(ref, data);
  }
};

// ─── Vote Links ────────────────────────────────────────────────────────────────

export const getVoteLinks = async (): Promise<VoteLink[]> => {
  try {
    const colRef = collection(db, 'voteLinks');
    const snapshot = await getDocs(colRef);
    const links = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as VoteLink));
    return links.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  } catch {
    return [];
  }
};

export const createVoteLink = async (data: Omit<VoteLink, 'id'>): Promise<string> => {
  const ref = await addDoc(collection(db, 'voteLinks'), {
    ...data,
    sortOrder: typeof data.sortOrder === 'number' ? data.sortOrder : 0,
    enabled: data.enabled !== false,
  });
  return ref.id;
};
export const addVoteLink = createVoteLink;

export const updateVoteLink = async (id: string, data: Partial<VoteLink>): Promise<void> => {
  await updateDoc(doc(db, 'voteLinks', id), data);
};

export const deleteVoteLink = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'voteLinks', id));
};

export const updateVoteLinksOrder = async (items: (string | { id: string })[]): Promise<void> => {
  const batch = writeBatch(db);
  items.forEach((item, idx) => {
    const id = typeof item === 'string' ? item : item?.id;
    if (id) {
      const ref = doc(db, 'voteLinks', id);
      batch.update(ref, { sortOrder: idx });
    }
  });
  await batch.commit();
};

// ─── Vote Rewards ──────────────────────────────────────────────────────────────

export const getVoteRewards = async (): Promise<VoteReward[]> => {
  try {
    const colRef = collection(db, 'voteRewards');
    const snapshot = await getDocs(colRef);
    const rewards = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as VoteReward));
    return rewards.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  } catch {
    return [];
  }
};

export const createVoteReward = async (data: Omit<VoteReward, 'id'>): Promise<string> => {
  const ref = await addDoc(collection(db, 'voteRewards'), {
    ...data,
    sortOrder: typeof data.sortOrder === 'number' ? data.sortOrder : 0,
    enabled: data.enabled !== false,
  });
  return ref.id;
};
export const addVoteReward = createVoteReward;

export const updateVoteReward = async (id: string, data: Partial<VoteReward>): Promise<void> => {
  await updateDoc(doc(db, 'voteRewards', id), data);
};

export const deleteVoteReward = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'voteRewards', id));
};

// ─── Rules ────────────────────────────────────────────────────────────────────

export const getRules = async (): Promise<Rule[]> => {
  try {
    const colRef = collection(db, 'rules');
    const snapshot = await getDocs(colRef);
    const rules = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Rule));
    return rules.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  } catch {
    return [];
  }
};

export const createRule = async (data: Omit<Rule, 'id'>): Promise<string> => {
  const ref = await addDoc(collection(db, 'rules'), {
    ...data,
    sortOrder: typeof data.sortOrder === 'number' ? data.sortOrder : 0,
    enabled: data.enabled !== false,
  });
  return ref.id;
};
export const addRule = createRule;

export const updateRule = async (id: string, data: Partial<Rule>): Promise<void> => {
  await updateDoc(doc(db, 'rules', id), data);
};

export const deleteRule = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'rules', id));
};

export const updateRulesOrder = async (items: (string | { id: string })[]): Promise<void> => {
  const batch = writeBatch(db);
  items.forEach((item, idx) => {
    const id = typeof item === 'string' ? item : item?.id;
    if (id) {
      const ref = doc(db, 'rules', id);
      batch.update(ref, { sortOrder: idx });
    }
  });
  await batch.commit();
};

export const getRuleCategories = async (): Promise<RuleCategory[]> => {
  try {
    const colRef = collection(db, 'ruleCategories');
    const snapshot = await getDocs(colRef);
    const cats = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as RuleCategory));
    return cats.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  } catch {
    return [];
  }
};

// ─── Patrons ──────────────────────────────────────────────────────────────────

export const getPatrons = async (): Promise<Patron[]> => {
  try {
    const colRef = collection(db, 'patrons');
    const snapshot = await getDocs(colRef);
    const patrons = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Patron));
    return patrons.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  } catch {
    return [];
  }
};

export const createPatron = async (data: Omit<Patron, 'id'>): Promise<string> => {
  const ref = await addDoc(collection(db, 'patrons'), {
    ...data,
    sortOrder: typeof data.sortOrder === 'number' ? data.sortOrder : 0,
    enabled: data.enabled !== false,
  });
  return ref.id;
};
export const addPatron = createPatron;

export const updatePatron = async (id: string, data: Partial<Patron>): Promise<void> => {
  await updateDoc(doc(db, 'patrons', id), data);
};

export const deletePatron = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'patrons', id));
};

export const updatePatronsOrder = async (items: (string | { id: string })[]): Promise<void> => {
  const batch = writeBatch(db);
  items.forEach((item, idx) => {
    const id = typeof item === 'string' ? item : item?.id;
    if (id) {
      const ref = doc(db, 'patrons', id);
      batch.update(ref, { sortOrder: idx });
    }
  });
  await batch.commit();
};

export const getPatronTiers = async (): Promise<PatronTier[]> => {
  try {
    const colRef = collection(db, 'patronTiers');
    const snapshot = await getDocs(colRef);
    if (!snapshot.empty) {
      const tiers = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as PatronTier));
      return tiers.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    }
    return [
      { id: 'diamond', name: 'Diamond Patron', icon: '💎', color: '#7dd3fc', minAmount: '500', enabled: true, sortOrder: 1 },
      { id: 'gold', name: 'Gold Patron', icon: '⭐', color: '#fbbf24', minAmount: '200', enabled: true, sortOrder: 2 },
      { id: 'iron', name: 'Iron Patron', icon: '🔘', color: '#9ca3af', minAmount: '100', enabled: true, sortOrder: 3 },
    ];
  } catch {
    return [
      { id: 'diamond', name: 'Diamond Patron', icon: '💎', color: '#7dd3fc', minAmount: '500', enabled: true, sortOrder: 1 },
      { id: 'gold', name: 'Gold Patron', icon: '⭐', color: '#fbbf24', minAmount: '200', enabled: true, sortOrder: 2 },
      { id: 'iron', name: 'Iron Patron', icon: '🔘', color: '#9ca3af', minAmount: '100', enabled: true, sortOrder: 3 },
    ];
  }
};

// ─── Currencies ───────────────────────────────────────────────────────────────

export const getCurrencies = async (): Promise<Currency[]> => {
  try {
    const colRef = collection(db, 'currencies');
    const snapshot = await getDocs(colRef);
    const currencies = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Currency));
    return currencies.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  } catch {
    return [];
  }
};

export const setCurrency = async (id: string, data: Omit<Currency, 'id'>): Promise<void> => {
  await setDoc(doc(db, 'currencies', id), data);
};
