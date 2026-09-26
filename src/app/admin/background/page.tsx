'use client';

import React, { useState, useEffect } from 'react';
import { getThemeSettings, updateThemeSettings, getSiteSettings, updateSiteSettings } from '@/lib/firestore/settings';
import { AdminToggle } from '@/components/admin/AdminToggle';
import { AdminImageField } from '@/components/admin/AdminImageField';
import { AdminBreadcrumb } from '@/components/admin/AdminBreadcrumb';
import { AdminSaveBar } from '@/components/admin/AdminSaveBar';
import { ParticleCanvas, ParticleType } from '@/components/layout/ParticleCanvas';
import { Image as ImageIcon, Sparkles, Layers, Sliders, Eye, Wand2, Flame, Star, Snowflake, Zap, BookOpen } from 'lucide-react';
import { toast } from 'react-hot-toast';

// Curated high quality Minecraft backgrounds
const PRESET_WALLPAPERS = [
  {
    name: 'Obsidian Nether Fortress',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1920&q=80',
    description: 'Dark purple and crimson cosmic atmosphere'
  },
  {
    name: 'Twilight Mountain Fantasy',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=80',
    description: 'Deep midnight blue with starlight'
  },
  {
    name: 'Mystic Ender Void',
    url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1920&q=80',
    description: 'Nebula violet with subtle cosmic glow'
  },
  {
    name: 'Lush Cave Crystal Caverns',
    url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1920&q=80',
    description: 'Bioluminescent deep cave ambiance'
  }
];

// Particle style options with icons and descriptions
const PARTICLE_PRESETS: { type: ParticleType; name: string; icon: any; color: string; desc: string }[] = [
  {
    type: 'portal',
    name: 'Ender / Nether Portal',
    icon: Zap,
    color: 'text-purple-400 border-purple-500/40 bg-purple-500/10',
    desc: 'Rising mystical purple & magenta dimension motes'
  },
  {
    type: 'embers',
    name: 'Nether Sparks & Embers',
    icon: Flame,
    color: 'text-amber-400 border-amber-500/40 bg-amber-500/10',
    desc: 'Fiery rising sparks with realistic flicker and drift'
  },
  {
    type: 'stars',
    name: 'Twinkling Cosmic Stars',
    icon: Star,
    color: 'text-cyan-300 border-cyan-500/40 bg-cyan-500/10',
    desc: 'Deep space drifting stars with soft sparkle gleams'
  },
  {
    type: 'snow',
    name: 'Powder Snowfall',
    icon: Snowflake,
    color: 'text-blue-300 border-blue-500/40 bg-blue-500/10',
    desc: 'Gently falling Minecraft pixel snowflakes'
  },
  {
    type: 'fireflies',
    name: 'Mystic Glowing Fireflies',
    icon: Sparkles,
    color: 'text-lime-400 border-lime-500/40 bg-lime-500/10',
    desc: 'Organic wandering glowing firefly orbs with halos'
  },
  {
    type: 'glyphs',
    name: 'Enchantment Glyphs',
    icon: BookOpen,
    color: 'text-fuchsia-400 border-fuchsia-500/40 bg-fuchsia-500/10',
    desc: 'Standard Galactic alphabet runes floating upward'
  },
];

export default function AdminBackgroundPage() {
  const [bg, setBg] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [themeData, siteData] = await Promise.all([
        getThemeSettings(),
        getSiteSettings(),
      ]);

      const data = (themeData || {}) as any;
      const site = (siteData || {}) as any;

      setBg({
        enabled: site?.backgroundEnabled ?? data?.backgroundEnabled ?? true,
        imageUrl: site?.backgroundImageUrl || data?.backgroundImageUrl || '',
        opacity: site?.backgroundOpacity ?? data?.backgroundOpacity ?? 40,
        blur: site?.backgroundBlur ?? data?.backgroundBlur ?? 0,
        overlay: site?.backgroundOverlay ?? data?.backgroundOverlay ?? true,
        overlayOpacity: site?.backgroundOverlayOpacity ?? data?.backgroundOverlayOpacity ?? 75,
        particles: {
          enabled: site?.particlesEnabled ?? data?.particlesEnabled ?? true,
          type: site?.particlesType || data?.particlesType || 'portal',
          amount: site?.particlesAmount ?? data?.particlesAmount ?? 40,
          speed: site?.particlesSpeed ?? data?.particlesSpeed ?? 1,
          opacity: site?.particlesOpacity ?? data?.particlesOpacity ?? 70,
          size: site?.particlesSize ?? data?.particlesSize ?? 3,
          color: site?.particlesColor || data?.particlesColor || '',
        }
      });
    } catch (error) {
      toast.error('Failed to load background settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setBg((prev: any) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleParticleChange = (field: string, value: any) => {
    setBg((prev: any) => ({
      ...prev,
      particles: {
        ...(prev.particles || {}),
        [field]: value
      }
    }));
    setHasChanges(true);
  };

  const handleSelectPreset = (url: string) => {
    setBg((prev: any) => ({ ...prev, imageUrl: url, enabled: true }));
    setHasChanges(true);
    toast.success('Preset wallpaper selected! Click Save to apply.');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const [currentTheme, currentSite] = await Promise.all([
        getThemeSettings(),
        getSiteSettings(),
      ]);

      const p = bg.particles || {};

      const themePayload = {
        ...((currentTheme || {}) as any),
        background: bg,
        backgroundEnabled: bg.enabled,
        backgroundImageUrl: bg.imageUrl,
        backgroundOpacity: bg.opacity,
        backgroundBlur: bg.blur,
        backgroundOverlay: bg.overlay,
        backgroundOverlayOpacity: bg.overlayOpacity,
        particles: p,
        particlesEnabled: p.enabled,
        particlesType: p.type,
        particlesAmount: p.amount,
        particlesSpeed: p.speed,
        particlesOpacity: p.opacity,
        particlesSize: p.size,
        particlesColor: p.color,
      };

      const sitePayload = {
        backgroundImageUrl: bg.imageUrl,
        backgroundEnabled: bg.enabled,
        backgroundOpacity: bg.opacity,
        backgroundBlur: bg.blur,
        backgroundOverlay: bg.overlay,
        backgroundOverlayOpacity: bg.overlayOpacity,
        particlesEnabled: p.enabled,
        particlesType: p.type,
        particlesAmount: p.amount,
        particlesSpeed: p.speed,
        particlesOpacity: p.opacity,
        particlesSize: p.size,
        particlesColor: p.color,
      };

      // Save both to theme and site settings
      await Promise.all([
        updateThemeSettings(themePayload),
        updateSiteSettings(sitePayload),
      ]);

      toast.success('Background & Particles saved! Live website updated.');
      setHasChanges(false);
    } catch (error) {
      console.error(error);
      toast.error('Failed to save background settings');
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

  const opacityPercent = bg?.opacity ?? 40;
  const blurPixels = bg?.blur ?? 0;
  const overlayPercent = bg?.overlayOpacity ?? 75;
  const currentParticle = bg?.particles || {};

  return (
    <div className="p-6 max-w-5xl mx-auto pb-32 space-y-8">
      <AdminBreadcrumb
        items={[
          { label: 'Website', href: '/admin' },
          { label: 'Background & Particles' }
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-purple-400" />
            Global Website Background &amp; Selectable Particles
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Configure full-screen wallpaper artwork, opacity, blur, and choose from 6 dynamic animated particle styles
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Form Controls */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 1. Main Background Settings */}
          <div className="bg-[#111118] border border-zinc-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-purple-400" />
                  Custom Background Artwork
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Enable or disable the custom wallpaper across the storefront
                </p>
              </div>
              <AdminToggle
                checked={!!bg.enabled}
                onChange={(c) => handleChange('enabled', c)}
              />
            </div>

            {bg.enabled && (
              <div className="space-y-6 pt-4 border-t border-zinc-800/80">
                <AdminImageField
                  label="Direct Background Image URL *"
                  helpText="Paste any direct image URL (from Imgur, Discord CDN, Unsplash, or your host)"
                  value={bg.imageUrl || ''}
                  onChange={(v) => handleChange('imageUrl', v)}
                />

                {/* Preset Wallpapers Picker */}
                <div className="space-y-2.5">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Wand2 className="w-3.5 h-3.5 text-amber-400" />
                    Or Select a Curated Minecraft Wallpaper Preset
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {PRESET_WALLPAPERS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectPreset(preset.url)}
                        className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
                          bg.imageUrl === preset.url
                            ? 'border-purple-500 bg-purple-500/10 ring-1 ring-purple-500/50'
                            : 'border-zinc-800 bg-[#0a0a0f] hover:border-zinc-700 hover:bg-zinc-900/60'
                        }`}
                      >
                        <div
                          className="w-10 h-10 rounded-lg bg-cover bg-center shrink-0 border border-zinc-700/60"
                          style={{ backgroundImage: `url("${preset.url}")` }}
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">{preset.name}</p>
                          <p className="text-[10px] text-zinc-500 truncate">{preset.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sliders: Opacity & Blur */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                  <div className="bg-[#0a0a0f] border border-zinc-800 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-zinc-300">
                        Image Opacity
                      </label>
                      <span className="text-xs font-mono font-bold text-purple-400">
                        {opacityPercent}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="100"
                      value={opacityPercent}
                      onChange={(e) => handleChange('opacity', parseInt(e.target.value))}
                      className="w-full accent-purple-500 cursor-pointer"
                    />
                    <p className="text-[11px] text-zinc-500 mt-1">Recommended: 30% - 60% for optimal readability</p>
                  </div>

                  <div className="bg-[#0a0a0f] border border-zinc-800 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-zinc-300">
                        Image Blur
                      </label>
                      <span className="text-xs font-mono font-bold text-purple-400">
                        {blurPixels}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      value={blurPixels}
                      onChange={(e) => handleChange('blur', parseInt(e.target.value))}
                      className="w-full accent-purple-500 cursor-pointer"
                    />
                    <p className="text-[11px] text-zinc-500 mt-1">0px = Sharp, 4px - 8px = Soft artistic depth</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 2. Dark Overlay Layer */}
          <div className="bg-[#111118] border border-zinc-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-400" />
                  Dark Contrast Overlay Layer
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Dims the background behind text so packages and store cards are always 100% readable
                </p>
              </div>
              <AdminToggle
                checked={!!bg.overlay}
                onChange={(c) => handleChange('overlay', c)}
              />
            </div>

            {bg.overlay && (
              <div className="pt-2 border-t border-zinc-800">
                <div className="bg-[#0a0a0f] border border-zinc-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-zinc-300">
                      Dark Overlay Tint
                    </label>
                    <span className="text-xs font-mono font-bold text-blue-400">
                      {overlayPercent}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="95"
                    value={overlayPercent}
                    onChange={(e) => handleChange('overlayOpacity', parseInt(e.target.value))}
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                  <p className="text-[11px] text-zinc-500 mt-1">Recommended: 60% - 85%</p>
                </div>
              </div>
            )}
          </div>

          {/* 3. Selectable Particles Engine */}
          <div className="bg-[#111118] border border-zinc-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Dynamic Background Particles
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Real-time 60fps HTML5 canvas particles with 6 selectable themes
                </p>
              </div>
              <AdminToggle
                checked={!!currentParticle.enabled}
                onChange={(c) => handleParticleChange('enabled', c)}
              />
            </div>

            {currentParticle.enabled && (
              <div className="space-y-6 pt-4 border-t border-zinc-800">
                {/* Selectable Particle Presets */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                    Choose Particle Style (Selectable)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {PARTICLE_PRESETS.map((p) => {
                      const Icon = p.icon;
                      const isSelected = (currentParticle.type || 'portal') === p.type;
                      return (
                        <button
                          key={p.type}
                          type="button"
                          onClick={() => handleParticleChange('type', p.type)}
                          className={`p-3 rounded-xl border text-left transition-all flex items-start gap-3 ${
                            isSelected
                              ? 'border-purple-500 bg-purple-500/15 ring-2 ring-purple-500/30'
                              : 'border-zinc-800 bg-[#0a0a0f] hover:border-zinc-700 hover:bg-zinc-900/50'
                          }`}
                        >
                          <div className={`p-2 rounded-lg border ${p.color} shrink-0`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white flex items-center gap-1.5">
                              {p.name}
                              {isSelected && (
                                <span className="text-[10px] bg-purple-500 text-white px-1.5 py-0.2 rounded font-bold">
                                  ACTIVE
                                </span>
                              )}
                            </p>
                            <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-1">{p.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Particle Configuration Sliders */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Amount / Density */}
                  <div className="bg-[#0a0a0f] border border-zinc-800 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-zinc-300">
                        Particle Density (Amount)
                      </label>
                      <span className="text-xs font-mono font-bold text-amber-400">
                        {currentParticle.amount || 40}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={currentParticle.amount || 40}
                      onChange={(e) => handleParticleChange('amount', parseInt(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                    <p className="text-[10px] text-zinc-500 mt-1">Recommended: 30 - 60 particles</p>
                  </div>

                  {/* Speed */}
                  <div className="bg-[#0a0a0f] border border-zinc-800 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-zinc-300">
                        Movement Speed
                      </label>
                      <span className="text-xs font-mono font-bold text-amber-400">
                        {currentParticle.speed || 1}x
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.3"
                      max="2.5"
                      step="0.1"
                      value={currentParticle.speed || 1}
                      onChange={(e) => handleParticleChange('speed', parseFloat(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                    <p className="text-[10px] text-zinc-500 mt-1">0.5x = Calm &amp; slow, 1.5x = Energetic</p>
                  </div>

                  {/* Size */}
                  <div className="bg-[#0a0a0f] border border-zinc-800 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-zinc-300">
                        Particle Scale / Size
                      </label>
                      <span className="text-xs font-mono font-bold text-amber-400">
                        {currentParticle.size || 3}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1.5"
                      max="6"
                      step="0.5"
                      value={currentParticle.size || 3}
                      onChange={(e) => handleParticleChange('size', parseFloat(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>

                  {/* Opacity */}
                  <div className="bg-[#0a0a0f] border border-zinc-800 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-zinc-300">
                        Particle Opacity
                      </label>
                      <span className="text-xs font-mono font-bold text-amber-400">
                        {currentParticle.opacity || 70}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="100"
                      value={currentParticle.opacity || 70}
                      onChange={(e) => handleParticleChange('opacity', parseInt(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Optional Custom Particle Color Override */}
                <div className="bg-[#0a0a0f] border border-zinc-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <label className="text-xs font-bold text-zinc-200 block">
                      Custom Particle Color Override (Optional)
                    </label>
                    <p className="text-[11px] text-zinc-400">
                      Leave empty to use the authentic preset palette colors
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={currentParticle.color || '#cc33ff'}
                      onChange={(e) => handleParticleChange('color', e.target.value)}
                      className="w-8 h-8 rounded-lg bg-transparent border border-zinc-700 cursor-pointer"
                    />
                    <input
                      type="text"
                      placeholder="e.g. #cc33ff"
                      value={currentParticle.color || ''}
                      onChange={(e) => handleParticleChange('color', e.target.value)}
                      className="bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-white font-mono w-28"
                    />
                    {currentParticle.color && (
                      <button
                        type="button"
                        onClick={() => handleParticleChange('color', '')}
                        className="text-[11px] text-zinc-400 hover:text-white px-2 py-1 bg-zinc-800 rounded"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Live Background Simulation Preview */}
        <div className="space-y-4">
          <div className="bg-[#111118] border border-zinc-800 rounded-2xl p-5 sticky top-6">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
              <Eye className="w-4 h-4 text-purple-400" />
              Live Interactive Preview
            </h3>
            <p className="text-xs text-zinc-400 mb-4">
              Real-time rendering of your wallpaper, overlay, and moving particles:
            </p>

            {/* Simulated Store Viewport */}
            <div className="relative w-full h-84 rounded-2xl border-2 border-zinc-800 overflow-hidden flex flex-col justify-between p-4 shadow-2xl bg-[#07070d]">
              {/* Wallpaper Image */}
              {bg.enabled && bg.imageUrl && (
                <div
                  className="absolute inset-0 bg-cover bg-center transition-all duration-300"
                  style={{
                    backgroundImage: `url("${bg.imageUrl}")`,
                    opacity: opacityPercent / 100,
                    filter: `blur(${blurPixels}px)`,
                    transform: 'scale(1.05)',
                  }}
                />
              )}

              {/* Overlay */}
              {bg.enabled && bg.overlay && (
                <div
                  className="absolute inset-0 transition-opacity duration-300"
                  style={{
                    backgroundColor: `rgba(7, 7, 13, ${overlayPercent / 100})`,
                  }}
                />
              )}

              {/* LIVE Canvas Particles Preview */}
              {currentParticle.enabled && (
                <ParticleCanvas
                  type={currentParticle.type || 'portal'}
                  amount={Math.min(currentParticle.amount || 40, 50)}
                  speed={currentParticle.speed || 1}
                  size={currentParticle.size || 3}
                  opacity={(currentParticle.opacity || 70) / 100}
                  color={currentParticle.color || undefined}
                />
              )}

              {/* Sample Store Cards on top */}
              <div className="relative z-10 space-y-2 pointer-events-none">
                <div className="h-6 w-32 bg-white/20 backdrop-blur-md rounded-lg" />
                <div className="h-3 w-48 bg-white/10 backdrop-blur-md rounded" />
              </div>

              <div className="relative z-10 grid grid-cols-2 gap-2 pointer-events-none">
                <div className="p-2.5 rounded-xl bg-white/10 dark:bg-[#0e0e18]/80 backdrop-blur-md border border-white/20">
                  <div className="w-6 h-6 rounded bg-purple-500/50 mb-1" />
                  <div className="h-2.5 w-16 bg-white/40 rounded mb-1" />
                  <div className="h-2 w-10 bg-amber-400/90 rounded" />
                </div>
                <div className="p-2.5 rounded-xl bg-white/10 dark:bg-[#0e0e18]/80 backdrop-blur-md border border-white/20">
                  <div className="w-6 h-6 rounded bg-blue-500/50 mb-1" />
                  <div className="h-2.5 w-16 bg-white/40 rounded mb-1" />
                  <div className="h-2 w-10 bg-amber-400/90 rounded" />
                </div>
              </div>

              <div className="relative z-10 text-[10px] text-zinc-400 font-mono text-center bg-black/40 backdrop-blur-sm rounded py-1 border border-white/10 pointer-events-none">
                Particle Style: <span className="text-purple-400 font-bold uppercase">{currentParticle.type || 'portal'}</span>
              </div>
            </div>

            <p className="text-[11px] text-zinc-500 mt-3 text-center">
              Changes apply instantly across all public pages upon saving.
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
