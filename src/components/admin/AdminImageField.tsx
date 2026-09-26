import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { AdminFormField } from './AdminFormField';
import { Image as ImageIcon, X } from 'lucide-react';

interface AdminImageFieldProps {
  label: string;
  helpText?: string;
  value: string;
  onChange: (url: string) => void;
  required?: boolean;
  className?: string;
}

export function AdminImageField({
  label,
  helpText,
  value,
  onChange,
  required,
  className
}: AdminImageFieldProps) {
  const [error, setError] = useState<string | undefined>();

  return (
    <AdminFormField label={label} helpText={helpText} required={required} error={error} className={className}>
      <div className="space-y-3">
        <div className="flex relative">
          <input
            type="text"
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              setError(undefined);
            }}
            placeholder="https://..."
            className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500 pr-10"
          />
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute right-2 top-2 text-zinc-500 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
        
        {value ? (
          <div className="relative rounded-md overflow-hidden border border-zinc-800 bg-zinc-900 h-32 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={value} 
              alt="Preview" 
              className="max-h-full max-w-full object-contain"
              onError={() => setError('Invalid image URL')}
              onLoad={() => setError(undefined)}
            />
          </div>
        ) : (
          <div className="rounded-md border border-dashed border-zinc-800 bg-zinc-900/50 h-32 flex flex-col items-center justify-center text-zinc-500">
            <ImageIcon className="h-8 w-8 mb-2" />
            <span className="text-sm">No image URL provided</span>
          </div>
        )}
      </div>
    </AdminFormField>
  );
}
