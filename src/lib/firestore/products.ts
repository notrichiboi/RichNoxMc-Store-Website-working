import { db } from '../firebase/config';
import { 
  collection, doc, getDoc, getDocs, setDoc, updateDoc, 
  deleteDoc, writeBatch, Timestamp 
} from 'firebase/firestore';
import type { Product } from '../types';

export const getProducts = async (): Promise<Product[]> => {
  try {
    const colRef = collection(db, 'products');
    // Fetch all documents directly to prevent Firestore from omitting documents missing an indexed field
    const snapshot = await getDocs(colRef);
    const products = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || '',
        slug: data.slug || '',
        categoryId: data.categoryId || '',
        categoryName: data.categoryName || '',
        shortDescription: data.shortDescription || '',
        fullDescription: data.fullDescription || '',
        imageUrl: data.imageUrl || '',
        iconUrl: data.iconUrl || '',
        bannerUrl: data.bannerUrl || '',
        prices: data.prices || data.price || { INR: 0, USD: 0 },
        badge: data.badge || '',
        badgeColor: data.badgeColor || '#ec4899',
        features: Array.isArray(data.features) ? data.features : [],
        enabled: data.enabled !== false,
        featured: Boolean(data.featured),
        popular: Boolean(data.popular || data.isPopular),
        isNew: Boolean(data.isNew),
        onSale: Boolean(data.onSale),
        limited: Boolean(data.limited || data.isLimited),
        comingSoon: Boolean(data.comingSoon),
        stockStatus: data.stockStatus || 'unlimited',
        quantityEnabled: Boolean(data.quantityEnabled || data.quantity?.enabled),
        minQuantity: data.minQuantity || data.quantity?.min || 1,
        maxQuantity: data.maxQuantity || data.quantity?.max || 10,
        availableQuantities: Array.isArray(data.availableQuantities) ? data.availableQuantities : [1],
        sortOrder: typeof data.sortOrder === 'number' ? data.sortOrder : 0,
        isBundle: Boolean(data.isBundle),
        bundleItems: Array.isArray(data.bundleItems) ? data.bundleItems : [],
        originalValue: data.originalValue || {},
        kitContents: Array.isArray(data.kitContents) ? data.kitContents : [],
        kitPreviewImageUrl: data.kitPreviewImageUrl || '',
        galleryImages: Array.isArray(data.galleryImages) ? data.galleryImages : [],
        seoTitle: data.seoTitle || data.seo?.title || '',
        seoDescription: data.seoDescription || data.seo?.description || '',
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      } as Product;
    });

    // Sort in memory safely by sortOrder or newest
    return products.sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) {
        return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
      }
      const timeA = a.createdAt?.seconds ?? 0;
      const timeB = b.createdAt?.seconds ?? 0;
      return timeB - timeA;
    });
  } catch (error) {
    console.error('Error fetching products from Firestore:', error);
    return [];
  }
};

export const getProductById = async (id: string): Promise<Product | null> => {
  try {
    const docRef = doc(db, 'products', id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    const data = docSnap.data();
    return {
      id: docSnap.id,
      name: data.name || '',
      slug: data.slug || '',
      categoryId: data.categoryId || '',
      categoryName: data.categoryName || '',
      shortDescription: data.shortDescription || '',
      fullDescription: data.fullDescription || '',
      imageUrl: data.imageUrl || '',
      iconUrl: data.iconUrl || '',
      bannerUrl: data.bannerUrl || '',
      prices: data.prices || data.price || { INR: 0, USD: 0 },
      badge: data.badge || '',
      badgeColor: data.badgeColor || '#ec4899',
      features: Array.isArray(data.features) ? data.features : [],
      enabled: data.enabled !== false,
      featured: Boolean(data.featured),
      popular: Boolean(data.popular || data.isPopular),
      isNew: Boolean(data.isNew),
      onSale: Boolean(data.onSale),
      limited: Boolean(data.limited || data.isLimited),
      comingSoon: Boolean(data.comingSoon),
      stockStatus: data.stockStatus || 'unlimited',
      quantityEnabled: Boolean(data.quantityEnabled || data.quantity?.enabled),
      minQuantity: data.minQuantity || data.quantity?.min || 1,
      maxQuantity: data.maxQuantity || data.quantity?.max || 10,
      availableQuantities: Array.isArray(data.availableQuantities) ? data.availableQuantities : [1],
      sortOrder: typeof data.sortOrder === 'number' ? data.sortOrder : 0,
      isBundle: Boolean(data.isBundle),
      bundleItems: Array.isArray(data.bundleItems) ? data.bundleItems : [],
      originalValue: data.originalValue || {},
      kitContents: Array.isArray(data.kitContents) ? data.kitContents : [],
      kitPreviewImageUrl: data.kitPreviewImageUrl || '',
      galleryImages: Array.isArray(data.galleryImages) ? data.galleryImages : [],
      seoTitle: data.seoTitle || data.seo?.title || '',
      seoDescription: data.seoDescription || data.seo?.description || '',
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    } as Product;
  } catch (error) {
    console.error('Error fetching product by id:', error);
    return null;
  }
};

export const getProduct = getProductById;

export const getProductsByCategory = async (categoryId: string): Promise<Product[]> => {
  const all = await getProducts();
  return all.filter(p => p.categoryId === categoryId);
};

export const getFeaturedProducts = async (): Promise<Product[]> => {
  const all = await getProducts();
  return all.filter(p => p.featured && p.enabled);
};

export const createProduct = async (productData: any): Promise<string> => {
  const colRef = collection(db, 'products');
  const docRef = doc(colRef);

  // Normalize prices
  const normalizedPrices = productData.prices || productData.price || { INR: 0, USD: 0 };

  const cleanData = {
    ...productData,
    prices: normalizedPrices,
    sortOrder: typeof productData.sortOrder === 'number' ? productData.sortOrder : 0,
    features: Array.isArray(productData.features) ? productData.features : [],
    kitContents: Array.isArray(productData.kitContents) ? productData.kitContents : [],
    galleryImages: Array.isArray(productData.galleryImages) ? productData.galleryImages : [],
    kitPreviewImageUrl: productData.kitPreviewImageUrl || '',
    enabled: productData.enabled !== false,
    featured: Boolean(productData.featured),
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

export const addProduct = createProduct;

export const updateProduct = async (id: string, productData: any): Promise<void> => {
  const docRef = doc(db, 'products', id);

  const cleanData = { ...productData };
  if (productData.price && !productData.prices) {
    cleanData.prices = productData.price;
  }
  cleanData.updatedAt = Timestamp.now();

  // Remove undefined values to avoid Firestore errors
  Object.keys(cleanData).forEach(key => {
    if (cleanData[key] === undefined) {
      delete cleanData[key];
    }
  });

  await updateDoc(docRef, cleanData);
};

export const deleteProduct = async (id: string): Promise<void> => {
  const docRef = doc(db, 'products', id);
  await deleteDoc(docRef);
};

export const updateProductsOrder = async (orderedIds: string[]): Promise<void> => {
  try {
    const batch = writeBatch(db);
    orderedIds.forEach((id, index) => {
      const docRef = doc(db, 'products', id);
      batch.update(docRef, { sortOrder: index, updatedAt: Timestamp.now() });
    });
    await batch.commit();
  } catch (error) {
    console.error('Error updating products order:', error);
    throw error;
  }
};

