'use client';

import React, { useState, useEffect } from 'react';
import { getDiscordSettings, updateDiscordSettings, getSiteSettings } from '@/lib/firestore/settings';
import { AdminFormField } from '@/components/admin/AdminFormField';
import { AdminToggle } from '@/components/admin/AdminToggle';
import { AdminSaveBar } from '@/components/admin/AdminSaveBar';
import { DEFAULT_DISCORD_MESSAGE_TEMPLATE } from '@/lib/utils';
import { MessageSquare, Copy, Sparkles, RotateCcw } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AdminDiscordPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [discordInfo, siteInfo] = await Promise.all([
        getDiscordSettings(),
        getSiteSettings(),
      ]);

      setData({
        enabled: discordInfo?.enabled !== false,
        inviteUrl: discordInfo?.inviteUrl || discordInfo?.discordUrl || siteInfo?.discordUrl || 'https://discord.gg/nightmaremc',
        serverId: discordInfo?.serverId || '',
        statusMode: discordInfo?.statusMode || 'live',
        manualOnlineCount: discordInfo?.manualOnlineCount || 150,
        showOnlineCount: discordInfo?.showOnlineCount !== false,
        discordMessageTemplate: siteInfo?.discordMessageTemplate || (discordInfo as any)?.discordMessageTemplate || DEFAULT_DISCORD_MESSAGE_TEMPLATE,
      });
    } catch (error) {
      toast.error('Failed to load discord settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setData((prev: any) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleInsertToken = (token: string) => {
    setData((prev: any) => ({
      ...prev,
      discordMessageTemplate: (prev.discordMessageTemplate || '') + token,
    }));
    setHasChanges(true);
  };

  const handleResetTemplate = () => {
    setData((prev: any) => ({
      ...prev,
      discordMessageTemplate: DEFAULT_DISCORD_MESSAGE_TEMPLATE,
    }));
    setHasChanges(true);
    toast.success('Reset template to default');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateDiscordSettings(data);
      toast.success('Discord settings and ticket template saved');
      setHasChanges(false);
    } catch (error) {
      toast.error('Failed to save discord settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null;

  const previewMessage = (data.discordMessageTemplate || DEFAULT_DISCORD_MESSAGE_TEMPLATE)
    .replace('{{cart_items}}', '• VIP Rank ×1\n• Legendary Key ×3')
    .replace('{{edition}}', 'Java')
    .replace('{{username}}', 'Steve')
    .replace('{{currency}}', 'INR')
    .replace('{{total}}', '₹799.00')
    .replace('{{site_name}}', 'NightmareMC');

  return (
    <div className="p-6 max-w-4xl mx-auto pb-24">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-[#5865F2]" />
          Discord &amp; Ticket Integration
        </h1>
        <p className="text-zinc-400 text-sm">
          Configure your server invite URL, online member tracker, and ticket checkout message
        </p>
      </div>

      <div className="space-y-6">
        {/* 1. Invite and Server Connection */}
        <div className="bg-[#111118] border border-zinc-800 rounded-2xl p-6">
          <AdminToggle
            label="Enable Discord Integration"
            checked={!!data.enabled}
            onChange={(c) => handleChange('enabled', c)}
            className="mb-6"
          />

          <div className="space-y-4">
            <AdminFormField 
              label="Discord Invite URL *" 
              helpText="This URL is used across the website on all Discord join & support buttons"
            >
              <input
                type="text"
                value={data.inviteUrl || ''}
                onChange={(e) => handleChange('inviteUrl', e.target.value)}
                placeholder="https://discord.gg/nightmaremc"
                className="w-full bg-[#0a0a0f] border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </AdminFormField>
            
            <AdminFormField 
              label="Discord Server ID (Guild ID)" 
              helpText="Used to fetch live online member counts via the Discord widget API (optional)"
            >
              <input
                type="text"
                value={data.serverId || ''}
                onChange={(e) => handleChange('serverId', e.target.value)}
                placeholder="e.g. 123456789012345678"
                className="w-full bg-[#0a0a0f] border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </AdminFormField>
          </div>
        </div>

        {/* 2. Online Count Display */}
        <div className="bg-[#111118] border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-base font-bold text-white mb-2">Online Member Counter</h2>
          <p className="text-xs text-zinc-400 mb-4">
            Show visitors how active your Discord community is
          </p>
          
          <AdminToggle
            label="Show Online Count"
            description="Display the count in the Discord section and server widgets"
            checked={!!data.showOnlineCount}
            onChange={(c) => handleChange('showOnlineCount', c)}
            className="mb-4"
          />

          {data.showOnlineCount && (
            <div className="space-y-4 border-t border-zinc-800 pt-4">
              <div className="flex space-x-6 text-sm">
                <label className="flex items-center space-x-2 text-zinc-300 cursor-pointer">
                  <input
                    type="radio"
                    name="statusMode"
                    checked={data.statusMode === 'live'}
                    onChange={() => handleChange('statusMode', 'live')}
                    className="text-purple-500 bg-zinc-900 border-zinc-800"
                  />
                  <span>Live API (Requires Server ID)</span>
                </label>
                <label className="flex items-center space-x-2 text-zinc-300 cursor-pointer">
                  <input
                    type="radio"
                    name="statusMode"
                    checked={data.statusMode === 'manual'}
                    onChange={() => handleChange('statusMode', 'manual')}
                    className="text-purple-500 bg-zinc-900 border-zinc-800"
                  />
                  <span>Manual Counter</span>
                </label>
              </div>

              {data.statusMode === 'manual' && (
                <AdminFormField label="Manual Online Count">
                  <input
                    type="number"
                    min="0"
                    value={data.manualOnlineCount || 0}
                    onChange={(e) => handleChange('manualOnlineCount', parseInt(e.target.value) || 0)}
                    className="w-full bg-[#0a0a0f] border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm"
                  />
                </AdminFormField>
              )}
            </div>
          )}
        </div>

        {/* 3. Discord Checkout Message Template Editor */}
        <div className="bg-[#111118] border border-zinc-800 rounded-2xl p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                Discord Ticket Purchase Message Template
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                The formatted message copied to players&apos; clipboard during checkout to paste into your Discord ticket
              </p>
            </div>

            <button
              type="button"
              onClick={handleResetTemplate}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-semibold transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Default
            </button>
          </div>

          {/* Clickable Variable Pills */}
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
              Click to insert dynamic variables:
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { tag: '{{cart_items}}', desc: 'List of products & quantities' },
                { tag: '{{edition}}', desc: 'Java or Bedrock' },
                { tag: '{{username}}', desc: 'Player Minecraft ign' },
                { tag: '{{currency}}', desc: 'Selected currency code' },
                { tag: '{{total}}', desc: 'Total formatted price' },
                { tag: '{{site_name}}', desc: 'NightmareMC' },
              ].map(v => (
                <button
                  key={v.tag}
                  type="button"
                  onClick={() => handleInsertToken(v.tag)}
                  className="px-2.5 py-1 rounded-lg bg-purple-950/40 hover:bg-purple-900/50 border border-purple-500/30 text-purple-300 text-xs font-mono transition-colors"
                  title={v.desc}
                >
                  {v.tag}
                </button>
              ))}
            </div>
          </div>

          {/* Template Textarea */}
          <AdminFormField label="Message Template">
            <textarea
              rows={10}
              value={data.discordMessageTemplate || ''}
              onChange={(e) => handleChange('discordMessageTemplate', e.target.value)}
              className="w-full bg-[#0a0a0f] border border-zinc-800 rounded-xl p-4 text-white text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </AdminFormField>

          {/* Live Preview Box */}
          <div className="bg-[#0a0a0f] border border-zinc-800/90 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              <span>Live Preview with Sample Order</span>
              <span className="text-purple-400 font-mono">Example Output</span>
            </div>
            <pre className="p-3 bg-black/60 rounded-xl text-zinc-200 text-xs font-mono whitespace-pre-wrap leading-relaxed border border-zinc-800">
              {previewMessage}
            </pre>
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
