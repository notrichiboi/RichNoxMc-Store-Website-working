import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { AdminFormField } from './AdminFormField';

interface AdminColorPickerProps {
  label: string;
  helpText?: string;
  value: string;
  onChange: (color: string) => void;
  presetColors?: string[];
  className?: string;
}

const DEFAULT_PRESETS = [
  '#cc33ff', '#ff3366', '#33ccff', '#33ff99',
  '#ffcc33', '#ffffff', '#000000', '#111118'
];

export function AdminColorPicker({
  label,
  helpText,
  value,
  onChange,
  presetColors = DEFAULT_PRESETS,
  className
}: AdminColorPickerProps) {
  const [inputValue, setInputValue] = useState(value);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (e.target.value.match(/^#[0-9A-Fa-f]{6}$/)) {
      onChange(e.target.value);
    }
  };

  return (
    <AdminFormField label={label} helpText={helpText} className={className}>
      <div className="flex flex-col space-y-2">
        <div className="flex items-center space-x-2">
          <div 
            className="w-10 h-10 rounded border border-zinc-700 flex-shrink-0"
            style={{ backgroundColor: value }}
          />
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={() => setInputValue(value)}
            className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="#000000"
          />
        </div>
        {presetColors.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {presetColors.map((color) => (
              <button
                key={color}
                type="button"
                className="w-6 h-6 rounded-full border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                style={{ backgroundColor: color }}
                onClick={() => {
                  setInputValue(color);
                  onChange(color);
                }}
                aria-label={`Select color ${color}`}
              />
            ))}
          </div>
        )}
      </div>
    </AdminFormField>
  );
}
