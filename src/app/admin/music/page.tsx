'use client';

import React, { useState, useEffect } from 'react';
import { getSiteSettings, updateSiteSettings } from '@/lib/firestore/settings';
import { AdminFormField } from '@/components/admin/AdminFormField';
import { AdminToggle } from '@/components/admin/AdminToggle';
import { AdminBreadcrumb } from '@/components/admin/AdminBreadcrumb';
import { AdminSaveBar } from '@/components/admin/AdminSaveBar';
import { playItemPickupSound, playLevelUpSound, playClickSound } from '@/lib/utils/audio';
import {
  Music,
  Volume2,
  VolumeX,
  Disc3,
  Play,
  Pause,
  Wand2,
  Sparkles,
  Eye,
  Sliders,
  Radio
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// Curated Minecraft background music presets (YouTube links)
const MUSIC_PRESETS = [
  {
    title: 'C418 - Aria Math (Minecraft OST)',
    url: 'https://www.youtube.com/watch?v=0hO4jKzLhG0',
    desc: 'Classic enchanting Minecraft builder vibes'
  },
  {
    title: 'Lena Raine - Pigstep (Official)',
    url: 'https://www.youtube.com/watch?v=cQeA_tGzZ6M',
    desc: 'Upbeat funky Nether disc groove'
  },
  {
    title: 'C418 - Sweden (Calm Piano)',
    url: 'https://www.youtube.com/watch?v=aBkTkxKDduc',
    desc: 'Iconic nostalgic piano masterpiece'
  },
  {
    title: 'C418 - Subwoofer Lullaby',
    url: 'https://www.youtube.com/watch?v=7_hYmG8xM-A',
    desc: 'Peaceful ambient atmospheric music'
  },
  {
    title: 'C418 - Wet Hands (Water Theme)',
    url: 'https://www.youtube.com/watch?v=mukiMA8Kc5A',
    desc: 'Gentle piano melody from Minecraft Alpha'
  },
  {
    title: 'C418 - Cat (Green Music Disc)',
    url: 'https://www.youtube.com/watch?v=L1RkYfD4-p8',
    desc: 'Catchy upbeat vintage Minecraft jukebox disc'
  }
];

export default function AdminMusicPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const [formData, setFormData] = useState({
    // Game Audio Sound Effects
    soundEffectsEnabled: true,
    // Background Music
    bgMusicEnabled: true,
    bgMusicUrl: 'https://www.youtube.com/watch?v=0hO4jKzLhG0',
    bgMusicTitle: 'C418 - Aria Math (Minecraft OST)',
    bgMusicVolume: 30,
    bgMusicAutoplay: true,
    bgMusicLoop: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const siteData = await getSiteSettings();
      const s = (siteData || {}) as any;

      setFormData({
        soundEffectsEnabled: s?.soundEffectsEnabled !== false,
        bgMusicEnabled: s?.bgMusicEnabled !== false,
        bgMusicUrl: s?.bgMusicUrl || 'https://www.youtube.com/watch?v=0hO4jKzLhG0',
        bgMusicTitle: s?.bgMusicTitle || 'C418 - Aria Math (Minecraft OST)',
        bgMusicVolume: typeof s?.bgMusicVolume === 'number' ? s.bgMusicVolume : 30,
        bgMusicAutoplay: s?.bgMusicAutoplay !== false,
        bgMusicLoop: s?.bgMusicLoop !== false,
      });
    } catch (err) {
      console.error(err);
      toast.error('Failed to load music settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSelectPreset = (preset: typeof MUSIC_PRESETS[0]) => {
    setFormData(prev => ({
      ...prev,
      bgMusicUrl: preset.url,
      bgMusicTitle: preset.title,
      bgMusicEnabled: true,
    }));
    setHasChanges(true);
    toast.success(`Preset "${preset.title}" selected! Click Save to apply.`);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSiteSettings({
        soundEffectsEnabled: formData.soundEffectsEnabled,
        bgMusicEnabled: formData.bgMusicEnabled,
        bgMusicUrl: formData.bgMusicUrl,
        bgMusicTitle: formData.bgMusicTitle,
        bgMusicVolume: formData.bgMusicVolume,
        bgMusicAutoplay: formData.bgMusicAutoplay,
        bgMusicLoop: formData.bgMusicLoop,
      });

      toast.success('Audio & Music settings saved! Website updated in real-time.');
      setHasChanges(false);
    } catch (err) {
      console.error(err);
      toast.error('Failed to save music settings');
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

  return (
    <div className="p-6 max-w-5xl mx-auto pb-32 space-y-8">
      <AdminBreadcrumb
        items={[
          { label: 'Website', href: '/admin' },
          { label: 'Audio & Music' }
        ]}
      />

      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Music className="w-6 h-6 text-purple-400" />
          Game Audio &amp; Background Music Streamer
        </h1>
        <p className="text-zinc-400 text-sm mt-1">
          Configure authentic Minecraft sound effects and stream background music using any YouTube link (sound only, no ads or video)
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Form Controls */}
        <div className="lg:col-span-2 space-y-6">

          {/* 1. Minecraft Game Sound Effects */}
          <div className="bg-[#111118] border border-zinc-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-purple-400" />
                  Minecraft Game Sound Effects
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Synthesized item-pickup pop sounds, level-up chimes, and button clicks
                </p>
              </div>
              <AdminToggle
                checked={formData.soundEffectsEnabled}
                onChange={c => handleChange('soundEffectsEnabled', c)}
              />
            </div>

            {formData.soundEffectsEnabled && (
              <div className="pt-3 border-t border-zinc-800 space-y-3">
                <p className="text-xs text-zinc-400">
                  Test the synthesized Web Audio cues directly:
                </p>
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      playItemPickupSound();
                      toast.success('Pop sound played!');
                    }}
                    className="px-3.5 py-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 hover:bg-purple-500/20 text-xs font-bold transition-all flex items-center gap-2"
                  >
                    <span>📦 Test Item Pop</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      playLevelUpSound();
                      toast.success('Level Up Chime played!');
                    }}
                    className="px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 text-xs font-bold transition-all flex items-center gap-2"
                  >
                    <span>✨ Test Level Up Chime</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      playClickSound();
                      toast.success('Button click played!');
                    }}
                    className="px-3.5 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-200 hover:bg-zinc-700 text-xs font-bold transition-all flex items-center gap-2"
                  >
                    <span>🔘 Test Button Click</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 2. YouTube Background Music Streamer */}
          <div className="bg-[#111118] border border-zinc-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Radio className="w-4 h-4 text-pink-400" />
                  Background Music Streamer (YouTube / Audio Link)
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Plays ambient background music across the store with no ads or video displayed
                </p>
              </div>
              <AdminToggle
                checked={formData.bgMusicEnabled}
                onChange={c => handleChange('bgMusicEnabled', c)}
              />
            </div>

            {formData.bgMusicEnabled && (
              <div className="space-y-5 pt-4 border-t border-zinc-800">
                {/* Music Source URL */}
                <AdminFormField
                  label="Music Source Link (YouTube or Direct Audio) *"
                  help="Paste any YouTube video URL (e.g. https://www.youtube.com/watch?v=0hO4jKzLhG0 or youtu.be/...) or direct MP3 audio link"
                >
                  <input
                    type="text"
                    value={formData.bgMusicUrl}
                    onChange={e => handleChange('bgMusicUrl', e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=0hO4jKzLhG0"
                    className="w-full bg-[#0a0a0f] border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </AdminFormField>

                {/* 1-Click Curated Presets */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Wand2 className="w-3.5 h-3.5 text-amber-400" />
                    Or Select a Curated Minecraft Soundtrack Preset
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {MUSIC_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectPreset(preset)}
                        className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 ${
                          formData.bgMusicUrl === preset.url
                            ? 'border-purple-500 bg-purple-500/15 ring-2 ring-purple-500/30'
                            : 'border-zinc-800 bg-[#0a0a0f] hover:border-zinc-700 hover:bg-zinc-900/60'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                          <Disc3 className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">{preset.title}</p>
                          <p className="text-[10px] text-zinc-500 truncate">{preset.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Track Title */}
                <AdminFormField
                  label="Track Display Title"
                  help="Shown in the floating music disc widget on the public website"
                >
                  <input
                    type="text"
                    value={formData.bgMusicTitle}
                    onChange={e => handleChange('bgMusicTitle', e.target.value)}
                    placeholder="C418 - Aria Math (Minecraft OST)"
                    className="w-full bg-[#0a0a0f] border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </AdminFormField>

                {/* Volume Slider */}
                <div className="bg-[#0a0a0f] border border-zinc-800 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-zinc-200">
                      Default Playback Volume
                    </label>
                    <span className="text-xs font-mono font-bold text-purple-400 px-2 py-0.5 bg-purple-500/10 rounded border border-purple-500/20">
                      {formData.bgMusicVolume}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    step="5"
                    value={formData.bgMusicVolume}
                    onChange={e => handleChange('bgMusicVolume', parseInt(e.target.value))}
                    className="w-full accent-purple-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                    <span>Whisper (5%)</span>
                    <span>Recommended (30%)</span>
                    <span>Loud (100%)</span>
                  </div>
                </div>

                {/* Toggles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <AdminToggle
                    label="Autoplay on First Visitor Click"
                    description="Automatically starts music when player clicks anywhere on the page"
                    checked={formData.bgMusicAutoplay}
                    onChange={c => handleChange('bgMusicAutoplay', c)}
                  />

                  <AdminToggle
                    label="Loop Song Indefinitely"
                    description="Repeats track seamlessly when it finishes"
                    checked={formData.bgMusicLoop}
                    onChange={c => handleChange('bgMusicLoop', c)}
                  />
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Right Col: Live Music Widget Preview */}
        <div className="space-y-4">
          <div className="bg-[#111118] border border-zinc-800 rounded-2xl p-5 sticky top-6">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
              <Eye className="w-4 h-4 text-purple-400" />
              Live Music Widget Preview
            </h3>
            <p className="text-xs text-zinc-400 mb-4">
              Here is how the floating music disc widget appears to website visitors:
            </p>

            {/* Simulated Floating Widget */}
            <div className="p-3 rounded-2xl bg-[#0e0e18] border border-purple-500/30 shadow-2xl space-y-3">
              <div className="flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-700 via-pink-600 to-amber-500 p-0.5 shrink-0">
                    <div className="w-full h-full rounded-full bg-black flex items-center justify-center animate-spin [animation-duration:4s]">
                      <Disc3 className="w-4 h-4 text-pink-400" />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-black uppercase tracking-wider text-purple-400 flex items-center gap-1">
                      <Music className="w-2.5 h-2.5" />
                      Server Music
                    </span>
                    <p className="text-xs font-bold text-white truncate max-w-[150px]">
                      {formData.bgMusicTitle || 'C418 - Aria Math'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <span className="p-1.5 rounded-lg bg-purple-600/30 text-purple-300">
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </span>
                </div>
              </div>

              {/* Volume preview */}
              <div className="pt-2 border-t border-white/10 flex items-center gap-2">
                <Volume2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <div className="w-full h-1 bg-zinc-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full"
                    style={{ width: `${formData.bgMusicVolume}%` }}
                  />
                </div>
                <span className="text-[10px] font-mono text-zinc-400 shrink-0">
                  {formData.bgMusicVolume}%
                </span>
              </div>
            </div>

            <p className="text-[11px] text-zinc-500 mt-3 text-center">
              Visitors can pause, mute, or adjust volume at any time from this widget.
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
