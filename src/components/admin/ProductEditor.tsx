'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Save, 
  Trash2, 
  Plus, 
  Eye, 
  Image as ImageIcon, 
  Layers, 
  Package, 
  Sparkles, 
  Box, 
  AlertCircle,
  X,
  ExternalLink,
  ArrowRightLeft,
  Calculator,
  RefreshCw
} from 'lucide-react';
import { addProduct, updateProduct, deleteProduct } from '@/lib/firestore/products';
import { getCategories } from '@/lib/firestore/categories';
import type { Product, Category, ProductFeature, BundleItem } from '@/lib/types';
import { autoConvertAllPrices, DEFAULT_EXCHANGE_RATES } from '@/lib/utils';
import { AdminFormField } from '@/components/admin/AdminFormField';
import { AdminToggle } from '@/components/admin/AdminToggle';
import { AdminImageField } from '@/components/admin/AdminImageField';
import { AdminBreadcrumb } from '@/components/admin/AdminBreadcrumb';
import { AdminSaveBar } from '@/components/admin/AdminSaveBar';
import { AdminDeleteConfirm } from '@/components/admin/AdminDeleteConfirm';
import toast from 'react-hot-toast';

const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: '₹',
  USD: '$',
  PKR: 'Rs',
  BDT: '৳',
  NPR: 'रू',
  AED: 'AED',
  EUR: '€',
  GBP: '£',
};

interface ProductEditorProps {
  initialData?: Product;
  isNew?: boolean;
}

export function ProductEditor({ initialData, isNew }: ProductEditorProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Pricing mode: 'auto' (automatic converter) or 'manual' (line-by-line entry)
  const [pricingMode, setPricingMode] = useState<'auto' | 'manual'>('auto');
  const [baseCurrency, setBaseCurrency] = useState<string>('INR');
  const [basePriceInput, setBasePriceInput] = useState<string>(() => {
    const initPrices = initialData?.prices || (initialData as any)?.price;
    if (initPrices?.INR != null && initPrices.INR > 0) return String(initPrices.INR);
    if (initPrices?.USD != null && initPrices.USD > 0) return String(initPrices.USD);
    return '';
  });
  const [smartRounding, setSmartRounding] = useState<boolean>(true);
  const [liveAutoConvert, setLiveAutoConvert] = useState<boolean>(true);

  // Initialize form data
  const [formData, setFormData] = useState<Partial<Product>>({
    name: initialData?.name || '',
    slug: initialData?.slug || '',
    shortDescription: initialData?.shortDescription || '',
    fullDescription: initialData?.fullDescription || '',
    categoryId: initialData?.categoryId || '',
    categoryName: initialData?.categoryName || '',
    imageUrl: initialData?.imageUrl || '',
    iconUrl: initialData?.iconUrl || '',
    bannerUrl: initialData?.bannerUrl || '',
    prices: initialData?.prices || (initialData as any)?.price || { INR: 0, USD: 0 },
    badge: initialData?.badge || '',
    badgeColor: initialData?.badgeColor || '#ec4899',
    features: initialData?.features || [],
    enabled: initialData?.enabled !== false,
    featured: Boolean(initialData?.featured),
    popular: Boolean(initialData?.popular),
    isNew: Boolean(initialData?.isNew),
    onSale: Boolean(initialData?.onSale),
    limited: Boolean(initialData?.limited),
    comingSoon: Boolean(initialData?.comingSoon),
    stockStatus: initialData?.stockStatus || 'unlimited',
    quantityEnabled: Boolean(initialData?.quantityEnabled),
    minQuantity: initialData?.minQuantity || 1,
    maxQuantity: initialData?.maxQuantity || 10,
    availableQuantities: initialData?.availableQuantities || [1],
    sortOrder: initialData?.sortOrder ?? 0,
    isBundle: Boolean(initialData?.isBundle),
    bundleItems: initialData?.bundleItems || [],
    originalValue: initialData?.originalValue || {},
    kitContents: initialData?.kitContents || [],
    kitPreviewImageUrl: initialData?.kitPreviewImageUrl || '',
    galleryImages: initialData?.galleryImages || [],
    seoTitle: initialData?.seoTitle || '',
    seoDescription: initialData?.seoDescription || '',
  });

  useEffect(() => {
    getCategories().then(cats => {
      setCategories(cats);
      // Auto-set category if new and only one exists or not set yet
      if (isNew && cats.length > 0 && !formData.categoryId) {
        setFormData(prev => ({
          ...prev,
          categoryId: cats[0].id,
          categoryName: cats[0].name
        }));
      }
    }).catch(console.error);
  }, [isNew]);

  const handleChange = (field: keyof Product, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-generate slug from name if new
      if (isNew && field === 'name') {
        const generatedSlug = String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        if (!prev.slug || prev.slug === prev.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')) {
          updated.slug = generatedSlug;
        }
      }

      // If categoryId changes, update categoryName
      if (field === 'categoryId') {
        const cat = categories.find(c => c.id === value);
        if (cat) {
          updated.categoryName = cat.name;
        }
      }

      return updated;
    });
    setHasChanges(true);
  };

  const handlePriceChange = (currency: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      prices: {
        ...(prev.prices || {}),
        [currency]: isNaN(value) ? 0 : value
      }
    }));
    setHasChanges(true);
  };

  const applyAutoConversion = (amountStr: string, currency: string = baseCurrency, round: boolean = smartRounding) => {
    const num = parseFloat(amountStr);
    if (isNaN(num) || num <= 0) return;

    const convertedMap = autoConvertAllPrices(num, currency, DEFAULT_EXCHANGE_RATES, round);

    setFormData(prev => ({
      ...prev,
      prices: {
        ...(prev.prices || {}),
        ...convertedMap,
        [currency]: num,
      }
    }));
    setHasChanges(true);
  };

  const handleBasePriceInputChange = (val: string) => {
    setBasePriceInput(val);
    if (liveAutoConvert && val.trim() !== '') {
      applyAutoConversion(val, baseCurrency, smartRounding);
    }
  };

  const handleBaseCurrencyChange = (newCurr: string) => {
    setBaseCurrency(newCurr);
    if (basePriceInput.trim() !== '') {
      applyAutoConversion(basePriceInput, newCurr, smartRounding);
    }
  };

  // Feature list handlers
  const handleAddFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...(prev.features || []), { id: `feat-${Date.now()}`, text: '', enabled: true }]
    }));
    setHasChanges(true);
  };

  const handleUpdateFeature = (index: number, text: string) => {
    setFormData(prev => {
      const copy = [...(prev.features || [])];
      copy[index] = { ...copy[index], text };
      return { ...prev, features: copy };
    });
    setHasChanges(true);
  };

  const handleRemoveFeature = (index: number) => {
    setFormData(prev => {
      const copy = [...(prev.features || [])];
      copy.splice(index, 1);
      return { ...prev, features: copy };
    });
    setHasChanges(true);
  };

  // Gallery image handlers
  const handleAddGalleryImage = () => {
    setFormData(prev => ({
      ...prev,
      galleryImages: [...(prev.galleryImages || []), '']
    }));
    setHasChanges(true);
  };

  const handleUpdateGalleryImage = (index: number, url: string) => {
    setFormData(prev => {
      const copy = [...(prev.galleryImages || [])];
      copy[index] = url;
      return { ...prev, galleryImages: copy };
    });
    setHasChanges(true);
  };

  const handleRemoveGalleryImage = (index: number) => {
    setFormData(prev => {
      const copy = [...(prev.galleryImages || [])];
      copy.splice(index, 1);
      return { ...prev, galleryImages: copy };
    });
    setHasChanges(true);
  };

  // Kit contents handlers
  const handleAddKitContent = () => {
    setFormData(prev => ({
      ...prev,
      kitContents: [...(prev.kitContents || []), '']
    }));
    setHasChanges(true);
  };

  const handleUpdateKitContent = (index: number, item: string) => {
    setFormData(prev => {
      const copy = [...(prev.kitContents || [])];
      copy[index] = item;
      return { ...prev, kitContents: copy };
    });
    setHasChanges(true);
  };

  const handleRemoveKitContent = (index: number) => {
    setFormData(prev => {
      const copy = [...(prev.kitContents || [])];
      copy.splice(index, 1);
      return { ...prev, kitContents: copy };
    });
    setHasChanges(true);
  };

  // Save handler
  const handleSave = async (publish: boolean = true) => {
    if (!formData.name?.trim()) {
      toast.error('Product name is required');
      return;
    }
    if (!formData.slug?.trim()) {
      toast.error('Product slug is required');
      return;
    }
    if (!formData.categoryId) {
      toast.error('Please select a category');
      return;
    }

    setIsSaving(true);
    const categoryObj = categories.find(c => c.id === formData.categoryId);

    const payload = {
      ...formData,
      name: formData.name.trim(),
      slug: formData.slug.trim(),
      categoryName: categoryObj ? categoryObj.name : (formData.categoryName || 'General'),
      enabled: publish,
      sortOrder: typeof formData.sortOrder === 'number' ? formData.sortOrder : 0,
      galleryImages: (formData.galleryImages || []).filter(u => u && u.trim() !== ''),
      kitContents: (formData.kitContents || []).filter(k => k && k.trim() !== ''),
    };

    try {
      if (isNew) {
        await addProduct(payload as any);
        toast.success('Product created successfully!');
        router.refresh();
        router.push('/admin/products');
      } else {
        await updateProduct(initialData!.id, payload);
        toast.success('Product updated successfully!');
        router.refresh();
        setHasChanges(false);
      }
    } catch (error: any) {
      console.error('Save error:', error);
      toast.error(error.message || 'Failed to save product');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!initialData?.id) return;
    try {
      await deleteProduct(initialData.id);
      toast.success('Product deleted');
      router.push('/admin/products');
    } catch (err) {
      toast.error('Failed to delete product');
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 pb-32">
      <AdminBreadcrumb
        items={[
          { label: 'Products', href: '/admin/products' },
          { label: isNew ? 'New Product' : (formData.name || 'Edit Product') }
        ]}
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Package className="w-6 h-6 text-purple-400" />
            {isNew ? 'Create New Product' : `Edit: ${formData.name}`}
          </h1>
          <p className="text-zinc-400 text-sm">
            Configure package info, pricing in INR/USD, image gallery, and in-game kit previews
          </p>
        </div>
        <div className="flex items-center gap-3">
          {!isNew && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm font-semibold transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          )}
          <button
            onClick={() => handleSave(formData.enabled)}
            disabled={isSaving}
            className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-purple-500/25 transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Product'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Main Editor */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 1. Basic Info */}
          <div className="bg-[#111118] border border-zinc-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Package className="w-4 h-4 text-purple-400" />
              Basic Information
            </h2>

            <AdminFormField label="Product Name *" help="Display title in store (e.g. VIP Rank, Starter Kit)">
              <input
                type="text"
                required
                value={formData.name || ''}
                onChange={e => handleChange('name', e.target.value)}
                placeholder="e.g. MVP Rank"
                className="w-full bg-[#0a0a0f] border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </AdminFormField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AdminFormField label="Slug *" help="URL friendly identifier (e.g. mvp-rank)">
                <input
                  type="text"
                  required
                  value={formData.slug || ''}
                  onChange={e => handleChange('slug', e.target.value)}
                  placeholder="e.g. mvp-rank"
                  className="w-full bg-[#0a0a0f] border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </AdminFormField>

              <AdminFormField label="Store Category *" help="Select where this product belongs">
                <select
                  value={formData.categoryId || ''}
                  onChange={e => handleChange('categoryId', e.target.value)}
                  className="w-full bg-[#0a0a0f] border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                >
                  <option value="">Select a category...</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </AdminFormField>
            </div>

            <AdminFormField label="Short Description" help="Quick 1-2 sentence summary displayed on the product card">
              <input
                type="text"
                value={formData.shortDescription || ''}
                onChange={e => handleChange('shortDescription', e.target.value)}
                placeholder="e.g. Permanent VIP rank with lobby flight and weekly keys"
                className="w-full bg-[#0a0a0f] border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </AdminFormField>

            <AdminFormField label="Full Description" help="Detailed information shown in the modal popup">
              <textarea
                rows={4}
                value={formData.fullDescription || ''}
                onChange={e => handleChange('fullDescription', e.target.value)}
                placeholder="Explain the ranks, rules, commands, and terms..."
                className="w-full bg-[#0a0a0f] border border-zinc-800 rounded-xl p-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-y"
              />
            </AdminFormField>
          </div>

          {/* 2. Pricing & Currency Options */}
          <div className="bg-[#111118] border border-zinc-800 rounded-2xl p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="text-purple-400 font-mono font-bold">₹ / $</span>
                  Product Pricing
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Select Automatic Currency Converter or Manual Line-by-Line Pricing
                </p>
              </div>

              {/* Mode Toggle Pills */}
              <div className="flex items-center bg-[#0a0a0f] p-1 rounded-xl border border-zinc-800 shrink-0">
                <button
                  type="button"
                  onClick={() => setPricingMode('auto')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    pricingMode === 'auto'
                      ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-md shadow-purple-600/25'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Auto-Converter</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPricingMode('manual')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    pricingMode === 'manual'
                      ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-md shadow-purple-600/25'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Manual Mode</span>
                </button>
              </div>
            </div>

            {/* Auto-Converter Control Card */}
            {pricingMode === 'auto' && (
              <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/25 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    Automatic Price Converter
                  </span>
                  <div className="flex items-center gap-3 text-xs">
                    <label className="flex items-center gap-1.5 text-zinc-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={smartRounding}
                        onChange={e => {
                          setSmartRounding(e.target.checked);
                          if (basePriceInput) applyAutoConversion(basePriceInput, baseCurrency, e.target.checked);
                        }}
                        className="rounded accent-purple-600"
                      />
                      <span>Smart Rounding</span>
                    </label>
                    <label className="flex items-center gap-1.5 text-zinc-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={liveAutoConvert}
                        onChange={e => setLiveAutoConvert(e.target.checked)}
                        className="rounded accent-purple-600"
                      />
                      <span>Auto-Sync as I type</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center pt-1">
                  <div className="sm:col-span-4">
                    <label className="block text-[11px] font-bold text-zinc-400 mb-1">
                      Base Currency
                    </label>
                    <select
                      value={baseCurrency}
                      onChange={e => handleBaseCurrencyChange(e.target.value)}
                      className="w-full bg-[#0a0a0f] border border-zinc-700/80 rounded-xl px-3 py-2 text-white text-xs font-bold focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
                    >
                      <option value="INR">INR (₹ - Indian Rupee)</option>
                      <option value="USD">USD ($ - US Dollar)</option>
                      <option value="EUR">EUR (€ - Euro)</option>
                      <option value="GBP">GBP (£ - British Pound)</option>
                      <option value="PKR">PKR (Rs - Pakistani Rupee)</option>
                      <option value="BDT">BDT (৳ - Bangladeshi Taka)</option>
                      <option value="NPR">NPR (रू - Nepalese Rupee)</option>
                      <option value="AED">AED (AED - UAE Dirham)</option>
                    </select>
                  </div>

                  <div className="sm:col-span-5">
                    <label className="block text-[11px] font-bold text-zinc-400 mb-1">
                      Enter Base Price Amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400 font-bold text-xs">
                        {CURRENCY_SYMBOLS[baseCurrency] || '₹'}
                      </span>
                      <input
                        type="number"
                        step="any"
                        min="0"
                        value={basePriceInput}
                        onChange={e => handleBasePriceInputChange(e.target.value)}
                        placeholder="e.g. 499 or 9.99"
                        className="w-full pl-8 pr-3 py-2 bg-[#0a0a0f] border border-zinc-700/80 rounded-xl text-white font-mono text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3 sm:pt-5">
                    <button
                      type="button"
                      onClick={() => {
                        applyAutoConversion(basePriceInput, baseCurrency, smartRounding);
                        toast.success('Calculated and populated all 8 currencies!');
                      }}
                      disabled={!basePriceInput}
                      className="w-full py-2 px-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Convert All</span>
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-zinc-400">
                  ⚡ Type your price above in any currency, and all other international currencies will be calculated automatically. You can still adjust any currency individually below!
                </p>
              </div>
            )}

            {/* Currency Inputs Grid */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  {pricingMode === 'auto' ? 'Calculated Currency Prices (Editable)' : 'Manual Pricing (Line-by-Line)'}
                </label>
                <span className="text-[11px] text-zinc-500">
                  {pricingMode === 'auto' ? 'Edit any value to override' : 'Enter amount for each currency individually'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                {[
                  { code: 'INR', symbol: '₹', label: 'INR (Default)' },
                  { code: 'USD', symbol: '$', label: 'USD' },
                  { code: 'PKR', symbol: 'Rs', label: 'PKR' },
                  { code: 'BDT', symbol: '৳', label: 'BDT' },
                  { code: 'NPR', symbol: 'NPR', label: 'NPR' },
                  { code: 'AED', symbol: 'AED', label: 'AED' },
                  { code: 'EUR', symbol: '€', label: 'EUR' },
                  { code: 'GBP', symbol: '£', label: 'GBP' },
                ].map(curr => (
                  <div
                    key={curr.code}
                    className={`bg-[#0a0a0f] border rounded-xl p-3 transition-colors ${
                      pricingMode === 'auto' && curr.code === baseCurrency
                        ? 'border-purple-500/60 ring-1 ring-purple-500/20 bg-purple-500/5'
                        : 'border-zinc-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-bold text-zinc-400 uppercase">
                        {curr.label}
                      </label>
                      {pricingMode === 'auto' && curr.code === baseCurrency && (
                        <span className="text-[9px] font-black uppercase text-purple-400 bg-purple-500/20 px-1.5 py-0.2 rounded">
                          BASE
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-bold text-xs">
                        {curr.symbol}
                      </span>
                      <input
                        type="number"
                        step="any"
                        min="0"
                        value={formData.prices?.[curr.code] ?? ''}
                        onChange={e => handlePriceChange(curr.code, parseFloat(e.target.value))}
                        placeholder="0"
                        className="w-full pl-8 pr-3 py-1.5 bg-zinc-900 border border-zinc-700/60 rounded-lg text-white font-mono text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 3. IMAGES & PHOTO GALLERY (Way more images with URL) */}
          <div className="bg-[#111118] border border-zinc-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-purple-400" />
                  Product Images &amp; Gallery
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Add direct image URLs (from Imgur, Discord, or any web host)
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddGalleryImage}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-bold rounded-xl transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Gallery Image
              </button>
            </div>

            <AdminFormField label="Main Product Image URL *" help="Primary 3D render or package artwork">
              <input
                type="url"
                value={formData.imageUrl || ''}
                onChange={e => handleChange('imageUrl', e.target.value)}
                placeholder="https://i.imgur.com/example.png"
                className="w-full bg-[#0a0a0f] border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              {formData.imageUrl && (
                <div className="mt-2 w-28 h-28 rounded-xl bg-zinc-900 border border-zinc-800 p-2 flex items-center justify-center overflow-hidden">
                  <img src={formData.imageUrl} alt="Preview" className="max-h-full max-w-full object-contain" />
                </div>
              )}
            </AdminFormField>

            <AdminFormField label="Banner URL (Optional)" help="Wide banner shown at top of the popup">
              <input
                type="url"
                value={formData.bannerUrl || ''}
                onChange={e => handleChange('bannerUrl', e.target.value)}
                placeholder="https://i.imgur.com/banner.png"
                className="w-full bg-[#0a0a0f] border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </AdminFormField>

            {/* Dynamic Gallery URLs */}
            {formData.galleryImages && formData.galleryImages.length > 0 && (
              <div className="space-y-3 pt-2 border-t border-zinc-800/80">
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  Additional Gallery Images ({formData.galleryImages.length})
                </label>
                {formData.galleryImages.map((url, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-[#0a0a0f] border border-zinc-800 rounded-xl p-3">
                    <div className="w-12 h-12 rounded-lg bg-zinc-900 border border-zinc-800 shrink-0 overflow-hidden flex items-center justify-center">
                      {url ? (
                        <img src={url} alt={`Gallery ${idx + 1}`} className="max-h-full max-w-full object-contain p-0.5" />
                      ) : (
                        <ImageIcon className="w-4 h-4 text-zinc-600" />
                      )}
                    </div>
                    <input
                      type="url"
                      value={url}
                      onChange={e => handleUpdateGalleryImage(idx, e.target.value)}
                      placeholder={`Gallery photo URL #${idx + 1}...`}
                      className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveGalleryImage(idx)}
                      className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Remove image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 4. IN-GAME KIT & INVENTORY PREVIEW (Requested Feature!) */}
          <div className="bg-[#111118] border border-zinc-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Box className="w-4 h-4 text-amber-400" />
                  In-Game Kit / Inventory Preview
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Allows players to click &ldquo;Preview Kit Inventory&rdquo; to view the exact chest/inventory items
                </p>
              </div>
            </div>

            <AdminFormField
              label="In-Game Inventory Screenshot URL"
              help="Take a screenshot of the kit in a chest or player inventory in-game, upload it, and paste URL here"
            >
              <input
                type="url"
                value={formData.kitPreviewImageUrl || ''}
                onChange={e => handleChange('kitPreviewImageUrl', e.target.value)}
                placeholder="https://i.imgur.com/inventory-screenshot.png"
                className="w-full bg-[#0a0a0f] border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </AdminFormField>

            {/* Live Minecraft GUI Preview Frame */}
            {formData.kitPreviewImageUrl && (
              <div className="mt-3 bg-[#0a0a0f] border-2 border-amber-500/30 rounded-2xl p-4">
                <span className="text-[11px] font-black uppercase text-amber-400 tracking-wider block mb-2">
                  Live Kit Inventory Preview
                </span>
                <div className="relative max-h-64 rounded-xl overflow-hidden bg-black/60 flex items-center justify-center p-2 border border-zinc-800">
                  <img
                    src={formData.kitPreviewImageUrl}
                    alt="Kit Preview"
                    className="max-h-60 max-w-full object-contain rounded-lg"
                    onError={e => {
                      (e.target as HTMLImageElement).src = '';
                    }}
                  />
                </div>
              </div>
            )}

            {/* Kit Items List */}
            <div className="pt-2 border-t border-zinc-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  Itemized Kit Contents ({formData.kitContents?.length || 0})
                </label>
                <button
                  type="button"
                  onClick={handleAddKitContent}
                  className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Item
                </button>
              </div>

              {formData.kitContents && formData.kitContents.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={item}
                    onChange={e => handleUpdateKitContent(idx, e.target.value)}
                    placeholder="e.g. Diamond Helmet (Protection IV, Unbreaking III)"
                    className="flex-1 bg-[#0a0a0f] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveKitContent(idx)}
                    className="p-2 text-zinc-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 5. Features / Perks Checklist */}
          <div className="bg-[#111118] border border-zinc-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  Perks &amp; Features Checklist
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Displayed as checkmarks on the card and popup modal
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddFeature}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-bold rounded-xl transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Perk
              </button>
            </div>

            <div className="space-y-2">
              {formData.features && formData.features.map((feat, idx) => (
                <div key={feat.id || idx} className="flex items-center gap-2 bg-[#0a0a0f] border border-zinc-800 rounded-xl p-2.5">
                  <input
                    type="text"
                    value={feat.text}
                    onChange={e => handleUpdateFeature(idx, e.target.value)}
                    placeholder="e.g. Permanent Flight in Lobby (/fly)"
                    className="flex-1 bg-transparent border-none text-xs text-white focus:ring-0 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(idx)}
                    className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right 1 Column: Settings, Flags, and Live Card Preview */}
        <div className="space-y-6">
          
          {/* Status & Badges */}
          <div className="bg-[#111118] border border-zinc-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Status &amp; Flags
            </h3>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white">Enabled</p>
                  <p className="text-[11px] text-zinc-500">Show on public store</p>
                </div>
                <AdminToggle
                  checked={formData.enabled ?? true}
                  onChange={v => handleChange('enabled', v)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white">Featured</p>
                  <p className="text-[11px] text-zinc-500">Show in homepage featured grid</p>
                </div>
                <AdminToggle
                  checked={Boolean(formData.featured)}
                  onChange={v => handleChange('featured', v)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white">On Sale</p>
                  <p className="text-[11px] text-zinc-500">Show red SALE ribbon</p>
                </div>
                <AdminToggle
                  checked={Boolean(formData.onSale)}
                  onChange={v => handleChange('onSale', v)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white">Coming Soon</p>
                  <p className="text-[11px] text-zinc-500">Disable purchase</p>
                </div>
                <AdminToggle
                  checked={Boolean(formData.comingSoon)}
                  onChange={v => handleChange('comingSoon', v)}
                />
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-800/80">
              <AdminFormField label="Badge Text" help="e.g. VIP, HOT, BEST VALUE">
                <input
                  type="text"
                  value={formData.badge || ''}
                  onChange={e => handleChange('badge', e.target.value)}
                  placeholder="e.g. POPULAR"
                  className="w-full bg-[#0a0a0f] border border-zinc-800 rounded-xl px-3 py-2 text-white text-xs font-bold"
                />
              </AdminFormField>
            </div>
          </div>

          {/* Live Preview Card */}
          <div className="bg-[#111118] border border-zinc-800 rounded-2xl p-5 space-y-3">
            <span className="text-[10px] font-black uppercase text-purple-400 tracking-wider">
              Store Card Preview
            </span>
            <div className="bg-white dark:bg-[#0e0e18] border border-slate-200 dark:border-white/10 rounded-3xl p-5 shadow-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                  ✦ {formData.categoryName || 'CATEGORY'}
                </span>
                {formData.badge && (
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-pink-500 text-white">
                    {formData.badge}
                  </span>
                )}
              </div>

              <div className="h-28 flex items-center justify-center my-2">
                {formData.imageUrl ? (
                  <img src={formData.imageUrl} alt="Preview" className="max-h-full max-w-full object-contain" />
                ) : (
                  <Box className="w-10 h-10 text-zinc-600" />
                )}
              </div>

              <p className="font-black text-slate-900 dark:text-white text-sm truncate">
                {formData.name || 'Product Title'}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
                {formData.shortDescription || 'Short description will appear here'}
              </p>

              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-white/5 flex justify-between items-center">
                <span className="px-3 py-1 bg-amber-400 text-black font-black text-xs rounded-xl">
                  ₹{formData.prices?.INR ?? 0}
                </span>
                <span className="px-3 py-1 bg-blue-600 text-white font-bold text-xs rounded-xl">
                  Buy Now →
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>

      <AdminDeleteConfirm
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Product"
        itemName={formData.name}
      />
    </div>
  );
}
