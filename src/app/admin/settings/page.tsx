'use client';

import React, { useState, useEffect } from 'react';
import { getSiteSettings, updateSiteSettings } from '@/lib/firestore/settings';
import { AdminFormField } from '@/components/admin/AdminFormField';
import { AdminToggle } from '@/components/admin/AdminToggle';
import { AdminImageField } from '@/components/admin/AdminImageField';
import { AdminSaveBar } from '@/components/admin/AdminSaveBar';
import { Settings, Target, Eye, Globe, Shield, Sparkles, Mail, Heart, FileText, Info } from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { SiteSettings } from '@/lib/types';
import { DEFAULT_SITE_SETTINGS } from '@/lib/utils';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await getSiteSettings();
      if (data) {
        setSettings({ ...DEFAULT_SITE_SETTINGS, ...data });
      }
    } catch (error) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof SiteSettings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSiteSettings(settings);
      toast.success('Site settings saved successfully');
      setHasChanges(false);
    } catch (error) {
      console.error(error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto pb-28 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-purple-400" />
          Site Settings &amp; Configuration
        </h1>
        <p className="text-zinc-400 text-sm mt-1">
          Manage brand details, default currencies, maintenance mode, community goals, and page visibility
        </p>
      </div>

      <div className="space-y-6">
        {/* 1. Basic Store Info */}
        <div className="bg-[#111118] border border-zinc-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-purple-400" />
            General Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AdminFormField label="Store Name *">
              <input
                type="text"
                value={settings.siteName || ''}
                onChange={e => handleChange('siteName', e.target.value)}
                placeholder="NightmareMC"
                className="w-full bg-[#0a0a0f] border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </AdminFormField>

            <AdminFormField label="Store URL">
              <input
                type="text"
                value={settings.siteUrl || ''}
                onChange={e => handleChange('siteUrl', e.target.value)}
                placeholder="https://store.nightmaremc.com"
                className="w-full bg-[#0a0a0f] border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </AdminFormField>
          </div>

          <AdminFormField label="Store Description (SEO)">
            <textarea
              rows={3}
              value={settings.siteDescription || ''}
              onChange={e => handleChange('siteDescription', e.target.value)}
              placeholder="The ultimate Minecraft server store. Upgrade your journey..."
              className="w-full bg-[#0a0a0f] border border-zinc-800 rounded-xl p-3.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </AdminFormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AdminFormField label="Default Currency">
              <select
                value={settings.defaultCurrency || 'INR'}
                onChange={e => handleChange('defaultCurrency', e.target.value)}
                className="w-full bg-[#0a0a0f] border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
              >
                <option value="INR">INR (₹ - Indian Rupee)</option>
                <option value="USD">USD ($ - US Dollar)</option>
                <option value="PKR">PKR (Rs - Pakistani Rupee)</option>
                <option value="BDT">BDT (৳ - Bangladeshi Taka)</option>
                <option value="NPR">NPR (Nepalese Rupee)</option>
                <option value="AED">AED (UAE Dirham)</option>
                <option value="EUR">EUR (€ - Euro)</option>
                <option value="GBP">GBP (£ - British Pound)</option>
              </select>
            </AdminFormField>

            <AdminFormField label="Discord Invite URL">
              <input
                type="text"
                value={settings.discordUrl || ''}
                onChange={e => handleChange('discordUrl', e.target.value)}
                placeholder="https://discord.gg/nightmaremc"
                className="w-full bg-[#0a0a0f] border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </AdminFormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <AdminImageField
              label="Logo Image URL"
              helpText="Transparent PNG recommended for navbar and crest"
              value={settings.logoUrl || ''}
              onChange={v => handleChange('logoUrl', v)}
            />
            <AdminImageField
              label="Website Favicon URL"
              helpText="Direct image URL for the browser tab icon (.png, .ico, .svg)"
              value={settings.faviconUrl || ''}
              onChange={v => handleChange('faviconUrl', v)}
            />
            <AdminImageField
              label="Social Share / OG Banner URL"
              helpText="Image shown when link is shared on Discord or Twitter"
              value={settings.ogImageUrl || ''}
              onChange={v => handleChange('ogImageUrl', v)}
            />
          </div>
        </div>

        {/* 2. Community Donation Goal */}
        <div className="bg-[#111118] border border-zinc-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-amber-400" />
                Community Goal Tracker
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Displays a monthly progress bar on the store sidebar to encourage community support
              </p>
            </div>
            <AdminToggle
              checked={settings.communityGoalEnabled}
              onChange={c => handleChange('communityGoalEnabled', c)}
            />
          </div>

          {settings.communityGoalEnabled && (
            <div className="space-y-4 pt-2 border-t border-zinc-800">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <AdminFormField label="Goal Title">
                  <input
                    type="text"
                    value={settings.communityGoalTitle || 'Monthly Goal'}
                    onChange={e => handleChange('communityGoalTitle', e.target.value)}
                    className="w-full bg-[#0a0a0f] border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm"
                  />
                </AdminFormField>
                <AdminFormField label="Goal Currency Symbol / Code">
                  <input
                    type="text"
                    value={settings.communityGoalCurrency || 'INR'}
                    onChange={e => handleChange('communityGoalCurrency', e.target.value)}
                    className="w-full bg-[#0a0a0f] border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm"
                  />
                </AdminFormField>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <AdminFormField label="Current Amount Raised">
                  <input
                    type="number"
                    min="0"
                    value={settings.communityGoalCurrent || 0}
                    onChange={e => handleChange('communityGoalCurrent', parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#0a0a0f] border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm"
                  />
                </AdminFormField>
                <AdminFormField label="Target Goal Amount">
                  <input
                    type="number"
                    min="1"
                    value={settings.communityGoalTarget || 10000}
                    onChange={e => handleChange('communityGoalTarget', parseFloat(e.target.value) || 10000)}
                    className="w-full bg-[#0a0a0f] border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm"
                  />
                </AdminFormField>
              </div>

              <AdminFormField label="Goal Description">
                <input
                  type="text"
                  value={settings.communityGoalDescription || ''}
                  onChange={e => handleChange('communityGoalDescription', e.target.value)}
                  placeholder="Help us reach our monthly goal to unlock server-wide events!"
                  className="w-full bg-[#0a0a0f] border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm"
                />
              </AdminFormField>
            </div>
          )}
        </div>

        {/* 3. Navigation & Section Visibility Toggles */}
        <div className="bg-[#111118] border border-zinc-800 rounded-2xl p-6 space-y-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-purple-400" />
              Navigation &amp; Feature Visibility
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Enable or disable public pages and store components in 1 click
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <AdminToggle
              label="Vote Page (/vote)"
              description="Show vote link in navbar and footer"
              checked={settings.showVote}
              onChange={c => handleChange('showVote', c)}
            />
            <AdminToggle
              label="Patrons / Hall of Fame (/patrons)"
              description="Show patrons link in navbar and footer"
              checked={settings.showPatrons}
              onChange={c => handleChange('showPatrons', c)}
            />
            <AdminToggle
              label="Rules Page (/rules)"
              description="Show server rules in navbar and footer"
              checked={settings.showRules}
              onChange={c => handleChange('showRules', c)}
            />
            <AdminToggle
              label="Support Portal (/support)"
              description="Show support page link in navbar and footer"
              checked={settings.showSupport}
              onChange={c => handleChange('showSupport', c)}
            />
            <AdminToggle
              label="Cart Drawer &amp; Checkout"
              description="Allow players to add packages to cart"
              checked={settings.showCart}
              onChange={c => handleChange('showCart', c)}
            />
            <AdminToggle
              label="Currency Switcher"
              description="Allow players to toggle INR, USD, etc."
              checked={settings.showCurrencySelector}
              onChange={c => handleChange('showCurrencySelector', c)}
            />
            <AdminToggle
              label="Dark / Light Mode Toggle"
              description="Allow players to switch theme mode"
              checked={settings.showDarkLightToggle}
              onChange={c => handleChange('showDarkLightToggle', c)}
            />
            <AdminToggle
              label="Top Announcement Banner"
              description="Show global announcement at top of the site"
              checked={settings.showAnnouncements}
              onChange={c => handleChange('showAnnouncements', c)}
            />
            <AdminToggle
              label="Game Sound Effects"
              description="Synthesized item pickup pops and level-up chimes"
              checked={settings.soundEffectsEnabled !== false}
              onChange={c => handleChange('soundEffectsEnabled', c)}
            />
            <AdminToggle
              label="Background Music Streamer"
              description="Stream YouTube song audio across the storefront"
              checked={!!settings.bgMusicEnabled}
              onChange={c => handleChange('bgMusicEnabled', c)}
            />
          </div>

          {settings.bgMusicEnabled && (
            <div className="pt-4 border-t border-zinc-800 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <AdminFormField label="YouTube / Music Link" help="Paste YouTube video link or direct MP3 audio">
                  <input
                    type="text"
                    value={settings.bgMusicUrl || ''}
                    onChange={e => handleChange('bgMusicUrl', e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=0hO4jKzLhG0"
                    className="w-full bg-[#0a0a0f] border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm font-mono"
                  />
                </AdminFormField>
                <AdminFormField label="Music Title" help="Shown in the floating music disc widget">
                  <input
                    type="text"
                    value={settings.bgMusicTitle || ''}
                    onChange={e => handleChange('bgMusicTitle', e.target.value)}
                    placeholder="C418 - Aria Math (Minecraft OST)"
                    className="w-full bg-[#0a0a0f] border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm"
                  />
                </AdminFormField>
              </div>
            </div>
          )}
        </div>

        {/* Flash Sale Banner Configuration */}
        <div className="bg-[#111118] border border-zinc-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Flash Sale &amp; Promotional Campaign Banner
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Display an eye-catching top banner with a live countdown timer and discount badge
              </p>
            </div>
            <AdminToggle
              checked={!!settings.flashSaleEnabled}
              onChange={c => handleChange('flashSaleEnabled', c)}
            />
          </div>

          {settings.flashSaleEnabled && (
            <div className="space-y-4 pt-2 border-t border-zinc-800">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <AdminFormField label="Sale Headline / Title">
                  <input
                    type="text"
                    value={settings.flashSaleTitle || ''}
                    onChange={e => handleChange('flashSaleTitle', e.target.value)}
                    placeholder="Weekend Server Sale: 40% OFF All Packages!"
                    className="w-full bg-[#0a0a0f] border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm"
                  />
                </AdminFormField>
                <AdminFormField label="Sale Badge">
                  <input
                    type="text"
                    value={settings.flashSaleBadge || ''}
                    onChange={e => handleChange('flashSaleBadge', e.target.value)}
                    placeholder="40% OFF"
                    className="w-full bg-[#0a0a0f] border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm"
                  />
                </AdminFormField>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <AdminFormField label="Subtitle / Details">
                  <input
                    type="text"
                    value={settings.flashSaleSubtitle || ''}
                    onChange={e => handleChange('flashSaleSubtitle', e.target.value)}
                    placeholder="Limited time ranks and crate discounts active now"
                    className="w-full bg-[#0a0a0f] border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm"
                  />
                </AdminFormField>
                <AdminFormField label="Button Text">
                  <input
                    type="text"
                    value={settings.flashSaleButtonText || ''}
                    onChange={e => handleChange('flashSaleButtonText', e.target.value)}
                    placeholder="Explore Deals"
                    className="w-full bg-[#0a0a0f] border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm"
                  />
                </AdminFormField>
                <AdminFormField label="Button URL">
                  <input
                    type="text"
                    value={settings.flashSaleButtonUrl || ''}
                    onChange={e => handleChange('flashSaleButtonUrl', e.target.value)}
                    placeholder="/store"
                    className="w-full bg-[#0a0a0f] border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm font-mono"
                  />
                </AdminFormField>
              </div>
            </div>
          )}
        </div>

        {/* 4. Footer, Contact Email & Credits (Down-Side Configuration) */}
        <div className="bg-[#111118] border border-zinc-800 rounded-2xl p-6 space-y-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Mail className="w-4 h-4 text-purple-400" />
              Footer, Contact Email &amp; Credits (Down-Side Configuration)
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Customize the support contact email, developer credits, copyright, and legal disclaimer shown at the bottom of every page
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <AdminFormField label="Official Contact / Support Email" help="Displayed in the footer with one-click copy and mailto: link">
              <input
                type="email"
                value={settings.contactEmail || ''}
                onChange={e => handleChange('contactEmail', e.target.value)}
                placeholder="support@nightmaremc.com"
                className="w-full bg-[#0a0a0f] border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
              />
            </AdminFormField>

            <AdminFormField label="Support Hours / Availability" help="e.g. 24/7 Response via Discord Tickets or Mon-Fri 9AM-8PM">
              <input
                type="text"
                value={settings.supportHours || ''}
                onChange={e => handleChange('supportHours', e.target.value)}
                placeholder="24/7 Response via Discord Tickets"
                className="w-full bg-[#0a0a0f] border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </AdminFormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AdminFormField label="Developer / Designer Credits Text" help="Credit person or network development team (e.g. NightmareMC Network Team)">
              <input
                type="text"
                value={settings.creditsText || ''}
                onChange={e => handleChange('creditsText', e.target.value)}
                placeholder="NightmareMC Network Development"
                className="w-full bg-[#0a0a0f] border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </AdminFormField>

            <AdminFormField label="Credits Link / URL" help="Link to portfolio, Discord, or agency website (optional)">
              <input
                type="url"
                value={settings.creditsUrl || ''}
                onChange={e => handleChange('creditsUrl', e.target.value)}
                placeholder="https://discord.gg/nightmaremc"
                className="w-full bg-[#0a0a0f] border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </AdminFormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AdminFormField label="Custom Copyright Text" help="Defaults to: NightmareMC. All rights reserved.">
              <input
                type="text"
                value={settings.copyrightText || ''}
                onChange={e => handleChange('copyrightText', e.target.value)}
                placeholder="NightmareMC. All rights reserved."
                className="w-full bg-[#0a0a0f] border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </AdminFormField>

            <AdminFormField label="Additional Footer Assurance / Badges" help="e.g. ⚡ 24/7 Discord Ticket Support • Instant Delivery">
              <input
                type="text"
                value={settings.additionalFooterInfo || ''}
                onChange={e => handleChange('additionalFooterInfo', e.target.value)}
                placeholder="⚡ 24/7 Discord Ticket Support • Instant Delivery"
                className="w-full bg-[#0a0a0f] border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </AdminFormField>
          </div>

          <AdminFormField label="Custom Legal Disclaimer" help="Legal statement regarding Mojang/Microsoft affiliation">
            <textarea
              rows={2}
              value={settings.disclaimerText || ''}
              onChange={e => handleChange('disclaimerText', e.target.value)}
              placeholder="NightmareMC is not affiliated with Mojang Studios or Microsoft Corporation. Minecraft is a registered trademark of Mojang AB."
              className="w-full bg-[#0a0a0f] border border-zinc-800 rounded-xl p-3.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </AdminFormField>

          {/* Website Owner Configuration */}
          <div className="pt-2 border-t border-zinc-800/80 space-y-4">
            <AdminToggle
              label="Display Server Owner in Footer"
              description="Show owner name, title, and Discord in the footer"
              checked={settings.showOwner !== false}
              onChange={c => handleChange('showOwner', c)}
            />

            {settings.showOwner !== false && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <AdminFormField label="Owner Name / Alias">
                  <input
                    type="text"
                    value={settings.ownerName || ''}
                    onChange={e => handleChange('ownerName', e.target.value)}
                    placeholder="NightmareMC Owner"
                    className="w-full bg-[#0a0a0f] border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm"
                  />
                </AdminFormField>
                <AdminFormField label="Owner Title">
                  <input
                    type="text"
                    value={settings.ownerTitle || ''}
                    onChange={e => handleChange('ownerTitle', e.target.value)}
                    placeholder="Server Founder & Lead Admin"
                    className="w-full bg-[#0a0a0f] border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm"
                  />
                </AdminFormField>
                <AdminFormField label="Owner Discord (Optional)">
                  <input
                    type="text"
                    value={settings.ownerDiscord || ''}
                    onChange={e => handleChange('ownerDiscord', e.target.value)}
                    placeholder="discord.gg/nightmaremc"
                    className="w-full bg-[#0a0a0f] border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm font-mono"
                  />
                </AdminFormField>
              </div>
            )}
          </div>

          {/* Buy This Website Banner Configuration */}
          <div className="pt-2 border-t border-zinc-800/80 space-y-4">
            <AdminToggle
              label="Display 'Buy This Website' / Template Sales Banner"
              description="Promote website purchase & custom design inquiries to visitors"
              checked={settings.showBuyWebsite !== false}
              onChange={c => handleChange('showBuyWebsite', c)}
            />

            {settings.showBuyWebsite !== false && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <AdminFormField label="Owner / Sales Email">
                    <input
                      type="email"
                      value={settings.buyWebsiteEmail || ''}
                      onChange={e => handleChange('buyWebsiteEmail', e.target.value)}
                      placeholder="business@nightmaremc.com"
                      className="w-full bg-[#0a0a0f] border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm font-mono"
                    />
                  </AdminFormField>
                  <AdminFormField label="Price Estimate / Note">
                    <input
                      type="text"
                      value={settings.buyWebsitePrice || ''}
                      onChange={e => handleChange('buyWebsitePrice', e.target.value)}
                      placeholder="Custom Quote / Inquire for Rates"
                      className="w-full bg-[#0a0a0f] border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm"
                    />
                  </AdminFormField>
                </div>
                <AdminFormField label="Banner Title">
                  <input
                    type="text"
                    value={settings.buyWebsiteTitle || ''}
                    onChange={e => handleChange('buyWebsiteTitle', e.target.value)}
                    placeholder="Want to Buy This Website or Custom Store?"
                    className="w-full bg-[#0a0a0f] border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm"
                  />
                </AdminFormField>
                <AdminFormField label="Banner Description">
                  <textarea
                    rows={2}
                    value={settings.buyWebsiteText || ''}
                    onChange={e => handleChange('buyWebsiteText', e.target.value)}
                    placeholder="Looking for a custom Minecraft store, website template, or tailored web design? Contact the website owner for purchase and commission details."
                    className="w-full bg-[#0a0a0f] border border-zinc-800 rounded-xl p-3 text-white text-sm"
                  />
                </AdminFormField>
              </div>
            )}
          </div>

          {/* Website Made By */}
          <div className="pt-2 border-t border-zinc-800/80 space-y-4">
            <AdminToggle
              label="Display 'Website Made By' in Bottom Bar"
              description="Show who built or developed the site"
              checked={settings.showMadeBy !== false}
              onChange={c => handleChange('showMadeBy', c)}
            />

            {settings.showMadeBy !== false && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <AdminFormField label="Made By Text">
                  <input
                    type="text"
                    value={settings.madeByText || ''}
                    onChange={e => handleChange('madeByText', e.target.value)}
                    placeholder="NightmareMC Development Team"
                    className="w-full bg-[#0a0a0f] border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm"
                  />
                </AdminFormField>
                <AdminFormField label="Made By Link (Optional)">
                  <input
                    type="url"
                    value={settings.madeByUrl || ''}
                    onChange={e => handleChange('madeByUrl', e.target.value)}
                    placeholder="https://discord.gg/nightmaremc"
                    className="w-full bg-[#0a0a0f] border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm font-mono"
                  />
                </AdminFormField>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-zinc-800/80">
            <AdminToggle
              label="Show Official Email in Footer"
              description="Displays email box with 1-click copy"
              checked={settings.showFooterEmail !== false}
              onChange={c => handleChange('showFooterEmail', c)}
            />
            <AdminToggle
              label="Show Credits in Bottom Bar"
              description="Displays 'Designed & Developed by [Credits]'"
              checked={settings.showFooterCredits !== false}
              onChange={c => handleChange('showFooterCredits', c)}
            />
          </div>
        </div>

        {/* 5. Maintenance Mode */}
        <div className="bg-[#111118] border border-zinc-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-red-400" />
                Maintenance Mode
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                When active, all visitors are redirected to /maintenance. Admin panel remains accessible.
              </p>
            </div>
            <AdminToggle
              checked={settings.maintenanceMode}
              onChange={c => handleChange('maintenanceMode', c)}
            />
          </div>

          {settings.maintenanceMode && (
            <div className="pt-2 border-t border-zinc-800">
              <AdminFormField label="Custom Maintenance Message">
                <textarea
                  rows={3}
                  value={settings.maintenanceMessage || ''}
                  onChange={e => handleChange('maintenanceMessage', e.target.value)}
                  placeholder="We are currently upgrading server systems. Please check our Discord for updates."
                  className="w-full bg-[#0a0a0f] border border-zinc-800 rounded-xl p-3.5 text-white text-sm"
                />
              </AdminFormField>
            </div>
          )}
        </div>
      </div>

      <AdminSaveBar
        isVisible={hasChanges}
        onSave={handleSave}
        onDiscard={() => {
          loadSettings();
          setHasChanges(false);
        }}
        isSaving={saving}
      />
    </div>
  );
}
