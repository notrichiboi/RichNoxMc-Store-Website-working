import { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import type { Product } from '../types';

interface UseProductsOptions {
  categoryId?: string;
  featured?: boolean;
}

export function useProducts(options?: UseProductsOptions) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let q = query(collection(db, 'products'), orderBy('sortOrder', 'asc'));

        if (options?.categoryId) {
          q = query(collection(db, 'products'), where('categoryId', '==', options.categoryId), orderBy('sortOrder', 'asc'));
        } else if (options?.featured !== undefined) {
          q = query(collection(db, 'products'), where('featured', '==', options.featured), orderBy('sortOrder', 'asc'));
        }

        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        setProducts(data);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [options?.categoryId, options?.featured]);

  return { products, loading, error };
}
