'use client';

import React, { useState, useEffect } from 'react';
import { getThemeSettings, updateThemeSettings, getSiteSettings, updateSiteSettings } from '@/lib/firestore/settings';
import { AdminImageField } from '@/components/admin/AdminImageField';
import { AdminToggle } from '@/components/admin/AdminToggle';
import { AdminBreadcrumb } from '@/components/admin/AdminBreadcrumb';
import { AdminSaveBar } from '@/components/admin/AdminSaveBar';
import { Type, Sparkles, Sliders, Eye, Wand2, Maximize2, Globe, Link as LinkIcon, Check, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';

const PRESET_SIZES = [
  { label: 'Small', size: 120, desc: 'Compact & subtle' },
  { label: 'Medium', size: 180, desc: 'Standard balance' },
  { label: 'Large (Recommended)', size: 240, desc: 'Prominent & bold' },
  { label: 'Extra Large', size: 300, desc: 'Hero statement' },
  { label: 'Giant', size: 380, desc: 'Maximum impact' },
];

// Curated Minecraft Favicon Presets
const FAVICON_PRESETS = [
  {
    name: 'NightmareMC Crest',
    url: '/favicon.svg',
    desc: 'Default glowing purple N shield'
  },
  {
    name: 'Minecraft Diamond',
    url: 'https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.20.2/assets/minecraft/textures/item/diamond.png',
    desc: 'Classic sparkling blue diamond'
  },
  {
    name: 'Nether Star',
    url: 'https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.20.2/assets/minecraft/textures/item/nether_star.png',
    desc: 'Luminous glowing boss star'
  },
  {
    name: 'Eye of Ender',
    url: 'https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.20.2/assets/minecraft/textures/item/ender_eye.png',
    desc: 'Mystic green & purple ender eye'
  },
  {
    name: 'Golden Apple',
    url: 'https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.20.2/assets/minecraft/textures/item/golden_apple.png',
    desc: 'Shimmering enchanted apple'
  }
];

export default function AdminLogoPage() {
  const [logo, setLogo] = useState({
    url: '',
    faviconUrl: '/favicon.svg',
    heroLogoSize: 240,
    navbarLogoSize: 38,
    floatingLogoEnabled: true,
    floatingLogoGlow: true,
    floatingLogoSpeed: 5,
    showInNavbar: true,
    showInHero: true,
    showInFooter: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [tabApplied, setTabApplied] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [themeData, siteData] = await Promise.all([
        getThemeSettings(),
        getSiteSettings(),
      ]);

      const t = (themeData || {}) as any;
      const s = (siteData || {}) as any;

      setLogo({
        url: s?.logoUrl || t?.logo?.url || '',
        faviconUrl: s?.faviconUrl || t?.logo?.faviconUrl || '/favicon.svg',
        heroLogoSize: s?.heroLogoSize ?? t?.logo?.heroLogoSize ?? 240,
        navbarLogoSize: s?.navbarLogoSize ?? t?.logo?.navbarLogoSize ?? 38,
        floatingLogoEnabled: s?.floatingLogoEnabled !== false && t?.logo?.float !== false,
        floatingLogoGlow: s?.floatingLogoGlow !== false && t?.logo?.glow !== false,
        floatingLogoSpeed: s?.floatingLogoSpeed ?? 5,
        showInNavbar: s?.showInNavbar !== false && t?.logo?.showInNavbar !== false,
        showInHero: s?.showInHero !== false && t?.logo?.showInHero !== false,
        showInFooter: s?.showInFooter !== false && t?.logo?.showInFooter !== false,
      });
    } catch (error) {
      toast.error('Failed to load logo settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setLogo(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleApplyTabFaviconNow = () => {
    const url = logo.faviconUrl?.trim() || '/favicon.svg';
    try {
      const existingIcons = document.querySelectorAll(
        "link[rel='icon'], link[rel='shortcut icon'], link[rel='apple-touch-icon'], link[rel*='icon']"
      );
      if (existingIcons.length > 0) {
        existingIcons.forEach(el => {
          (el as HTMLLinkElement).href = url + '?v=' + Date.now();
        });
      } else {
        const newIcon = document.createElement('link');
        newIcon.rel = 'icon';
        newIcon.href = url + '?v=' + Date.now();
        document.head.appendChild(newIcon);
      }

      setTabApplied(true);
      toast.success('Favicon applied to your active browser tab!');
      setTimeout(() => setTabApplied(false), 3000);
    } catch (e) {
      toast.error('Could not apply to tab');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const [currentTheme, currentSite] = await Promise.all([
        getThemeSettings(),
        getSiteSettings(),
      ]);

      const finalFavicon = logo.faviconUrl?.trim() || '/favicon.svg';

      // 1. Update site settings
      await updateSiteSettings({
        logoUrl: logo.url || '',
        faviconUrl: finalFavicon,
        heroLogoSize: logo.heroLogoSize,
        navbarLogoSize: logo.navbarLogoSize,
        floatingLogoEnabled: logo.floatingLogoEnabled,
        floatingLogoGlow: logo.floatingLogoGlow,
        floatingLogoSpeed: logo.floatingLogoSpeed,
      });

      // 2. Update theme settings for backwards compatibility
      await updateThemeSettings({
        ...((currentTheme || {}) as any),
        logo: {
          url: logo.url,
          faviconUrl: finalFavicon,
          heroLogoSize: logo.heroLogoSize,
          navbarLogoSize: logo.navbarLogoSize,
          float: logo.floatingLogoEnabled,
          glow: logo.floatingLogoGlow,
          showInNavbar: logo.showInNavbar,
          showInHero: logo.showInHero,
          showInFooter: logo.showInFooter,
        }
      });

      // 3. Immediately apply to active tab
      handleApplyTabFaviconNow();

      toast.success('Logo & Favicon saved! Website updated in real-time.');
      setHasChanges(false);
    } catch (error) {
      console.error(error);
      toast.error('Failed to save logo settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
      </div>
    );
  }

  const currentFavicon = logo.faviconUrl || '/favicon.svg';

  return (
    <div className="p-6 max-w-5xl mx-auto pb-32 space-y-8">
      <AdminBreadcrumb
        items={[
          { label: 'Website', href: '/admin' },
          { label: 'Logo & Favicon' }
        ]}
      />

      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Type className="w-6 h-6 text-purple-400" />
          Logo Artwork, Sizing &amp; Website Favicon
        </h1>
        <p className="text-zinc-400 text-sm mt-1">
          Customize your main store emblem, scale the floating hero logo size, and set your custom browser tab favicon image URL
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Form Controls */}
        <div className="lg:col-span-2 space-y-6">

          {/* 1. DEDICATED WEBSITE FAVICON CONFIGURATION */}
          <div className="bg-[#111118] border border-purple-500/30 rounded-2xl p-6 space-y-5 shadow-lg shadow-purple-950/20">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Globe className="w-4 h-4 text-purple-400" />
                  Website Favicon (Browser Tab Icon)
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  The small icon shown in browser tabs, favorites, and search bookmarks
                </p>
              </div>

              {/* Instant Tab Test Button */}
              <button
                type="button"
                onClick={handleApplyTabFaviconNow}
                className="px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-bold transition-all flex items-center gap-1.5"
                title="Test how this icon looks in your current browser tab right now"
              >
                {tabApplied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <RefreshCw className="w-3.5 h-3.5" />}
                <span>Test in Tab</span>
              </button>
            </div>

            {/* Favicon URL Input with Live Preview */}
            <AdminImageField
              label="Favicon Image URL *"
              helpText="Paste any direct image URL (PNG, SVG, ICO, JPG, or WebP). Recommended size: 32x32px or 64x64px square image."
              value={logo.faviconUrl || ''}
              onChange={v => handleChange('faviconUrl', v)}
            />

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {logo.url && (
                <button
                  type="button"
                  onClick={() => {
                    handleChange('faviconUrl', logo.url);
                    toast.success('Copied Main Logo URL to Favicon!');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 transition-colors flex items-center gap-1.5"
                >
                  <LinkIcon className="w-3 h-3 text-purple-400" />
                  <span>Use Same as Main Logo</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  handleChange('faviconUrl', '/favicon.svg');
                  toast.success('Restored default glowing NightmareMC SVG favicon!');
                }}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 transition-colors"
              >
                Restore Default SVG Favicon
              </button>
            </div>

            {/* 1-Click Curated Minecraft Icon Presets */}
            <div className="space-y-2 pt-2 border-t border-zinc-800">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <Wand2 className="w-3.5 h-3.5 text-amber-400" />
                Or Pick a 1-Click Minecraft Favicon Preset
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {FAVICON_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      handleChange('faviconUrl', p.url);
                      toast.success(`Selected "${p.name}" favicon! Click Save to apply.`);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
                      logo.faviconUrl === p.url
                        ? 'border-purple-500 bg-purple-500/15 ring-2 ring-purple-500/30'
                        : 'border-zinc-800 bg-[#0a0a0f] hover:border-zinc-700 hover:bg-zinc-900/50'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-700/60 p-1 flex items-center justify-center shrink-0">
                      <img src={p.url} alt={p.name} className="w-full h-full object-contain" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{p.name}</p>
                      <p className="text-[10px] text-zinc-500 truncate">{p.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Live Browser Tab Mockup */}
            <div className="pt-2 border-t border-zinc-800">
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                Live Browser Tab Mockup
              </label>
              <div className="bg-[#181824] border border-zinc-800 rounded-xl p-3 flex items-center gap-3 max-w-sm shadow-md">
                <div className="bg-[#0e0e18] px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2.5 min-w-0 shadow-inner">
                  <div className="w-4 h-4 shrink-0 flex items-center justify-center">
                    <img
                      src={currentFavicon}
                      alt="Favicon Tab"
                      className="w-4 h-4 object-contain"
                      onError={e => {
                        (e.target as HTMLImageElement).src = '/favicon.svg';
                      }}
                    />
                  </div>
                  <span className="text-xs font-medium text-white truncate">
                    NightmareMC Store
                  </span>
                  <span className="text-[11px] text-zinc-500 ml-2">×</span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. MAIN LOGO ARTWORK & SIZING */}
          <div className="bg-[#111118] border border-zinc-800 rounded-2xl p-6 space-y-5">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Maximize2 className="w-4 h-4 text-purple-400" />
                Main Store Logo &amp; Floating Scale
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Set the store crest image and adjust how large the floating emblem appears on the homepage
              </p>
            </div>

            <AdminImageField
              label="Main Logo Image URL"
              helpText="Transparent PNG image used in the hero crest, navbar, and footer. Leave empty to use the 3D Zenith crystal crest."
              value={logo.url || ''}
              onChange={v => handleChange('url', v)}
            />

            {/* Quick 1-Click Size Presets */}
            <div className="space-y-2 pt-2 border-t border-zinc-800">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                Floating Logo Size Presets
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PRESET_SIZES.map(preset => (
                  <button
                    key={preset.size}
                    type="button"
                    onClick={() => handleChange('heroLogoSize', preset.size)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      logo.heroLogoSize === preset.size
                        ? 'border-purple-500 bg-purple-500/15 ring-2 ring-purple-500/30'
                        : 'border-zinc-800 bg-[#0a0a0f] hover:border-zinc-700 hover:bg-zinc-900/50'
                    }`}
                  >
                    <p className="text-xs font-bold text-white">{preset.label}</p>
                    <p className="text-[10px] text-zinc-400 font-mono">{preset.size}px • {preset.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Range Slider */}
            <div className="bg-[#0a0a0f] border border-zinc-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-200">
                  Custom Floating Hero Logo Size
                </label>
                <span className="text-xs font-mono font-bold text-purple-400 px-2 py-0.5 bg-purple-500/10 rounded border border-purple-500/20">
                  {logo.heroLogoSize}px
                </span>
              </div>
              <input
                type="range"
                min="80"
                max="450"
                step="10"
                value={logo.heroLogoSize}
                onChange={e => handleChange('heroLogoSize', parseInt(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                <span>Small (80px)</span>
                <span>Balanced (240px)</span>
                <span>Giant (450px)</span>
              </div>
            </div>

            {/* Navbar Logo Size Slider */}
            <div className="bg-[#0a0a0f] border border-zinc-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-200">
                  Navbar Logo Size
                </label>
                <span className="text-xs font-mono font-bold text-purple-400 px-2 py-0.5 bg-purple-500/10 rounded border border-purple-500/20">
                  {logo.navbarLogoSize}px
                </span>
              </div>
              <input
                type="range"
                min="28"
                max="64"
                step="2"
                value={logo.navbarLogoSize}
                onChange={e => handleChange('navbarLogoSize', parseInt(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                <span>28px (Compact)</span>
                <span>38px (Standard)</span>
                <span>64px (Large)</span>
              </div>
            </div>
          </div>

          {/* 3. Floating Animation & Glow Effects */}
          <div className="bg-[#111118] border border-zinc-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Floating Animation &amp; Aura
            </h2>

            <div className="space-y-3">
              <AdminToggle
                label="Floating Bobbing Animation"
                description="Make the hero logo float up and down with sine-wave physics"
                checked={logo.floatingLogoEnabled}
                onChange={c => handleChange('floatingLogoEnabled', c)}
              />

              <AdminToggle
                label="Glowing Radial Shadow / Aura"
                description="Surround the logo with a luminous purple & violet neon drop-shadow"
                checked={logo.floatingLogoGlow}
                onChange={c => handleChange('floatingLogoGlow', c)}
              />

              {logo.floatingLogoEnabled && (
                <div className="bg-[#0a0a0f] border border-zinc-800 rounded-xl p-4 mt-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-zinc-300">
                      Hover Speed (Cycle Duration)
                    </label>
                    <span className="text-xs font-mono font-bold text-amber-400">
                      {logo.floatingLogoSpeed}s
                    </span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="10"
                    step="0.5"
                    value={logo.floatingLogoSpeed}
                    onChange={e => handleChange('floatingLogoSpeed', parseFloat(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <p className="text-[10px] text-zinc-500 mt-1">3s = Fast float, 5s = Smooth cinematic, 8s = Gentle sway</p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Col: Live Logo Simulation Preview */}
        <div className="space-y-4">
          <div className="bg-[#111118] border border-zinc-800 rounded-2xl p-5 sticky top-6 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
                <Eye className="w-4 h-4 text-purple-400" />
                Live Scale &amp; Favicon Preview
              </h3>
              <p className="text-xs text-zinc-400">
                Real-time preview of your logo and browser favicon:
              </p>
            </div>

            {/* Favicon Preview Card */}
            <div className="p-3 rounded-xl bg-[#09090f] border border-zinc-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-700/60 p-1.5 flex items-center justify-center shrink-0">
                <img
                  src={currentFavicon}
                  alt="Active Favicon"
                  className="w-full h-full object-contain"
                  onError={e => {
                    (e.target as HTMLImageElement).src = '/favicon.svg';
                  }}
                />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-zinc-500 uppercase font-bold">Active Favicon</p>
                <p className="text-xs font-bold text-white truncate max-w-[170px]">{currentFavicon}</p>
                <p className="text-[10px] text-purple-400">Displays on browser tabs</p>
              </div>
            </div>

            {/* Simulated Hero Viewport */}
            <div className="relative w-full h-72 rounded-2xl border-2 border-zinc-800 overflow-hidden flex flex-col items-center justify-center p-4 shadow-2xl bg-[#07070d] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/30 via-[#07070d] to-black">
              
              {/* Scaled Floating Logo */}
              <div
                style={{
                  width: `${Math.min(logo.heroLogoSize, 240)}px`,
                  height: `${Math.min(logo.heroLogoSize, 240)}px`,
                }}
                className={`flex items-center justify-center transition-all duration-300 ${
                  logo.floatingLogoGlow ? 'drop-shadow-[0_15px_35px_rgba(168,85,247,0.7)]' : ''
                } ${logo.floatingLogoEnabled ? 'animate-bounce' : ''}`}
              >
                {logo.url ? (
                  <img
                    src={logo.url}
                    alt="Preview"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-indigo-600 to-blue-600 rounded-3xl rotate-45 shadow-2xl border-2 border-white/40" />
                    <span
                      style={{ fontSize: `${Math.round(Math.min(logo.heroLogoSize, 240) * 0.35)}px` }}
                      className="relative z-10 font-black text-white"
                    >
                      N
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-4 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[11px] font-mono text-white/90 border border-white/10">
                Hero Logo: <span className="text-purple-400 font-bold">{logo.heroLogoSize}px</span>
              </div>
            </div>

            <p className="text-[11px] text-zinc-500 text-center">
              All settings update in real-time across your website.
            </p>
          </div>
        </div>
      </div>

      <AdminSaveBar
        isVisible={hasChanges}
        onSave={handleSave}
        onDiscard={() => {
          loadData();
          setHasChanges(false);
        }}
        isSaving={saving}
      />
    </div>
  );
}
