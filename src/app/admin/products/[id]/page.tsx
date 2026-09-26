'use client';

import React, { useEffect, useState } from 'react';
import { getProduct } from '@/lib/firestore/products';
import { ProductEditor } from '@/components/admin/ProductEditor';
import { Product } from '@/lib/types';
import { Loader2 } from 'lucide-react';

export default function EditProductPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getProduct(params.id);
        setProduct(data);
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!product) {
    return <div className="p-6 text-center text-red-500">Product not found</div>;
  }

  return <ProductEditor initialData={product} isNew={false} />;
}
