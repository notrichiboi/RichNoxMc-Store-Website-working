import { db } from '../firebase/config';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  writeBatch,
  Timestamp 
} from 'firebase/firestore';
import type { Category } from '../types';

export const getCategories = async (): Promise<Category[]> => {
  try {
    const colRef = collection(db, 'categories');
    // Fetch all documents directly to prevent Firestore from omitting documents missing sortOrder
    const snapshot = await getDocs(colRef);
    const categories = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || '',
        slug: data.slug || '',
        description: data.description || '',
        icon: data.icon || 'Package',
        iconUrl: data.iconUrl || '',
        bannerUrl: data.bannerUrl || '',
        color: data.color || '#3b82f6',
        enabled: data.enabled !== false,
        sortOrder: typeof data.sortOrder === 'number' ? data.sortOrder : 0,
        announcementEnabled: Boolean(data.announcementEnabled),
        announcementTitle: data.announcementTitle || '',
        announcementMessage: data.announcementMessage || '',
        announcementIcon: data.announcementIcon || '',
        announcementColor: data.announcementColor || '',
        announcementButtonText: data.announcementButtonText || '',
        announcementButtonUrl: data.announcementButtonUrl || '',
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      } as Category;
    });

    return categories.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  } catch (error) {
    console.error('Error fetching categories from Firestore:', error);
    return [];
  }
};

export const getCategoryById = async (id: string): Promise<Category | null> => {
  try {
    const docRef = doc(db, 'categories', id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    const data = docSnap.data();
    return {
      id: docSnap.id,
      name: data.name || '',
      slug: data.slug || '',
      description: data.description || '',
      icon: data.icon || 'Package',
      iconUrl: data.iconUrl || '',
      bannerUrl: data.bannerUrl || '',
      color: data.color || '#3b82f6',
      enabled: data.enabled !== false,
      sortOrder: typeof data.sortOrder === 'number' ? data.sortOrder : 0,
      announcementEnabled: Boolean(data.announcementEnabled),
      announcementTitle: data.announcementTitle || '',
      announcementMessage: data.announcementMessage || '',
      announcementIcon: data.announcementIcon || '',
      announcementColor: data.announcementColor || '',
      announcementButtonText: data.announcementButtonText || '',
      announcementButtonUrl: data.announcementButtonUrl || '',
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    } as Category;
  } catch (error) {
    console.error('Error fetching category by id:', error);
    return null;
  }
};

// Aliases so both getCategory and getCategoryById work
export const getCategory = getCategoryById;

export const createCategory = async (categoryData: any): Promise<string> => {
  const colRef = collection(db, 'categories');
  const docRef = doc(colRef);
  
  const cleanData = {
    ...categoryData,
    sortOrder: typeof categoryData.sortOrder === 'number' ? categoryData.sortOrder : 0,
    enabled: categoryData.enabled !== false,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  // Remove undefined values to avoid Firestore errors
  Object.keys(cleanData).forEach(key => {
    if ((cleanData as any)[key] === undefined) {
      delete (cleanData as any)[key];
    }
  });

  await setDoc(docRef, cleanData);
  return docRef.id;
};

// Aliases so both addCategory and createCategory work
export const addCategory = createCategory;

export const updateCategory = async (id: string, categoryData: Partial<Category>): Promise<void> => {
  const docRef = doc(db, 'categories', id);
  const cleanData: any = { ...categoryData, updatedAt: Timestamp.now() };

  // Remove undefined values
  Object.keys(cleanData).forEach(key => {
    if (cleanData[key] === undefined) {
      delete cleanData[key];
    }
  });

  await updateDoc(docRef, cleanData);
};

export const updateCategoriesOrder = async (orderedIds: string[]): Promise<void> => {
  try {
    const batch = writeBatch(db);
    orderedIds.forEach((id, index) => {
      const docRef = doc(db, 'categories', id);
      batch.update(docRef, { sortOrder: index, updatedAt: Timestamp.now() });
    });
    await batch.commit();
  } catch (error) {
    console.error('Error updating categories order:', error);
    throw error;
  }
};

export const deleteCategory = async (id: string): Promise<void> => {
  const docRef = doc(db, 'categories', id);
  await deleteDoc(docRef);
};
