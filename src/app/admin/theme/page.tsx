'use client';

import React, { useState, useEffect } from 'react';
import { getThemeSettings, updateThemeSettings } from '@/lib/firestore/settings';
import { AdminColorPicker } from '@/components/admin/AdminColorPicker';
import { AdminToggle } from '@/components/admin/AdminToggle';
import { AdminSaveBar } from '@/components/admin/AdminSaveBar';
import { toast } from 'react-hot-toast';

export default function AdminThemePage() {
  const [theme, setTheme] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const data = await getThemeSettings();
      setTheme(data || {
        colors: {
          primary: '#cc33ff',
          secondary: '#33ccff',
          background: '#09090b',
          card: '#111118',
          border: '#27272a',
          text: '#ffffff',
        },
        borderRadius: '0.5rem',
        glow: true,
        blur: true
      });
    } catch (error) {
      toast.error('Failed to load theme');
    } finally {
      setLoading(false);
    }
  };

  const handleColorChange = (key: string, value: string) => {
    setTheme((prev: any) => ({
      ...prev,
      colors: {
        ...(prev.colors || {}),
        [key]: value
      }
    }));
    setHasChanges(true);
  };

  const handleChange = (key: string, value: any) => {
    setTheme((prev: any) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateThemeSettings(theme);
      toast.success('Theme saved successfully');
      setHasChanges(false);
    } catch (error) {
      toast.error('Failed to save theme');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null;

  return (
    <div className="p-6 max-w-4xl mx-auto pb-24">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Theme Editor</h1>
        <p className="text-zinc-400">Customize the look and feel of your store</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-[#111118] border border-zinc-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Colors</h2>
            <div className="space-y-4">
              <AdminColorPicker
                label="Primary Accent"
                value={theme.colors?.primary || '#cc33ff'}
                onChange={(c) => handleColorChange('primary', c)}
              />
              <AdminColorPicker
                label="Secondary Accent"
                value={theme.colors?.secondary || '#33ccff'}
                onChange={(c) => handleColorChange('secondary', c)}
              />
              <AdminColorPicker
                label="Background"
                value={theme.colors?.background || '#09090b'}
                onChange={(c) => handleColorChange('background', c)}
              />
              <AdminColorPicker
                label="Card Background"
                value={theme.colors?.card || '#111118'}
                onChange={(c) => handleColorChange('card', c)}
              />
            </div>
          </div>

          <div className="bg-[#111118] border border-zinc-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Effects</h2>
            <div className="space-y-4">
              <AdminToggle
                label="Glow Effects"
                description="Enable neon glows on buttons and cards"
                checked={!!theme.glow}
                onChange={(c) => handleChange('glow', c)}
              />
              <AdminToggle
                label="Blur Effects"
                description="Enable backdrop blurs on modals and nav"
                checked={!!theme.blur}
                onChange={(c) => handleChange('blur', c)}
              />
            </div>
          </div>
        </div>

        <div className="bg-[#111118] border border-zinc-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Live Preview</h2>
          <div className="p-4 rounded-lg" style={{ backgroundColor: theme.colors?.background }}>
            <div 
              className="p-4 rounded-xl border mb-4"
              style={{ 
                backgroundColor: theme.colors?.card, 
                borderColor: theme.colors?.border,
                boxShadow: theme.glow ? `0 0 20px ${theme.colors?.primary}20` : 'none'
              }}
            >
              <h3 style={{ color: theme.colors?.text }} className="font-bold mb-2">Example Card</h3>
              <p style={{ color: theme.colors?.text }} className="text-sm opacity-70 mb-4">
                This is how your content will look.
              </p>
              <button 
                className="px-4 py-2 rounded-md font-medium text-white transition-all w-full"
                style={{ 
                  backgroundColor: theme.colors?.primary,
                  boxShadow: theme.glow ? `0 0 15px ${theme.colors?.primary}60` : 'none'
                }}
              >
                Primary Button
              </button>
            </div>
          </div>
        </div>
      </div>

      <AdminSaveBar
        isVisible={hasChanges}
        onSave={handleSave}
        onDiscard={() => {
          loadTheme();
          setHasChanges(false);
        }}
        isSaving={saving}
      />
    </div>
  );
}
