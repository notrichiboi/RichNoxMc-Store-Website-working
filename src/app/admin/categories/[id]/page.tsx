'use client';

import React, { useEffect, useState } from 'react';
import { getCategory } from '@/lib/firestore/categories';
import { CategoryEditor } from '@/components/admin/CategoryEditor';
import { Category } from '@/lib/types';
import { Loader2 } from 'lucide-react';

export default function EditCategoryPage({ params }: { params: { id: string } }) {
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const data = await getCategory(params.id);
        setCategory(data);
      } catch (error) {
        console.error('Error fetching category:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategory();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!category) {
    return <div className="p-6 text-center text-red-500">Category not found</div>;
  }

  return <CategoryEditor initialData={category} isNew={false} />;
}
