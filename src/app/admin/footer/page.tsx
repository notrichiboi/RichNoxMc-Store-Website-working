'use client';

import React, { useState, useEffect } from 'react';
import { getSiteSettings, updateSiteSettings, getFooterSettings, updateFooterSettings } from '@/lib/firestore/settings';
import { AdminFormField } from '@/components/admin/AdminFormField';
import { AdminToggle } from '@/components/admin/AdminToggle';
import { AdminBreadcrumb } from '@/components/admin/AdminBreadcrumb';
import { AdminSaveBar } from '@/components/admin/AdminSaveBar';
import {
  Mail,
  Heart,
  Shield,
  Sparkles,
  ExternalLink,
  Crown,
  Code,
  ShoppingBag,
  Send,
  Eye,
  Check,
  Copy
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AdminFooterPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const [formData, setFormData] = useState({
    // Support Email
    contactEmail: 'support@nightmaremc.com',
    supportHours: '24/7 Response via Discord Tickets',
    showFooterEmail: true,
    
    // Website Made By
    showMadeBy: true,
    madeByText: 'NightmareMC Development Team',
    madeByUrl: 'https://discord.gg/nightmaremc',

    // Website Owner
    showOwner: true,
    ownerName: 'NightmareMC Owner',
    ownerTitle: 'Server Founder & Lead Administrator',
    ownerDiscord: 'discord.gg/nightmaremc',

    // Buy This Website / Inquiries
    showBuyWebsite: true,
    buyWebsiteEmail: 'business@nightmaremc.com',
    buyWebsiteTitle: 'Want to Buy This Website or Custom Store?',
    buyWebsiteText: 'Looking for a custom Minecraft store, website template, or tailored web design? Contact the website owner for purchase and commission details.',
    buyWebsitePrice: 'Custom Quote / Inquire for Rates',

    // Credits
    creditsText: 'NightmareMC Network Development',
    creditsUrl: 'https://discord.gg/nightmaremc',
    showFooterCredits: true,

    // Copyright & Legal
    copyrightText: 'NightmareMC. All rights reserved.',
    disclaimerText: 'NightmareMC is not affiliated with Mojang Studios or Microsoft Corporation. Minecraft is a registered trademark of Mojang AB.',
    additionalFooterInfo: '⚡ 24/7 Discord Ticket Support • Instant Delivery',
    footerDescription: 'The ultimate Minecraft server store. Upgrade your journey, unlock exclusive rewards, and support the server.',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [siteData, footerData] = await Promise.all([
        getSiteSettings(),
        getFooterSettings(),
      ]);

      const s = (siteData || {}) as any;
      const f = (footerData || {}) as any;

      setFormData({
        contactEmail: s.contactEmail || f.contactEmail || 'support@nightmaremc.com',
        supportHours: s.supportHours || f.supportHours || '24/7 Response via Discord Tickets',
        showFooterEmail: s.showFooterEmail !== false && f.showFooterEmail !== false,

        showMadeBy: s.showMadeBy !== false && f.showMadeBy !== false,
        madeByText: s.madeByText || f.madeByText || 'NightmareMC Development Team',
        madeByUrl: s.madeByUrl || f.madeByUrl || '',

        showOwner: s.showOwner !== false && f.showOwner !== false,
        ownerName: s.ownerName || f.ownerName || 'NightmareMC Owner',
        ownerTitle: s.ownerTitle || f.ownerTitle || 'Server Founder & Lead Administrator',
        ownerDiscord: s.ownerDiscord || f.ownerDiscord || '',

        showBuyWebsite: s.showBuyWebsite !== false && f.showBuyWebsite !== false,
        buyWebsiteEmail: s.buyWebsiteEmail || f.buyWebsiteEmail || s.contactEmail || 'business@nightmaremc.com',
        buyWebsiteTitle: s.buyWebsiteTitle || f.buyWebsiteTitle || 'Want to Buy This Website or Custom Store?',
        buyWebsiteText: s.buyWebsiteText || f.buyWebsiteText || 'Looking for a custom Minecraft store, website template, or tailored web design? Contact the website owner for purchase and commission details.',
        buyWebsitePrice: s.buyWebsitePrice || f.buyWebsitePrice || 'Custom Quote / Inquire for Rates',

        creditsText: s.creditsText || f.creditsText || 'NightmareMC Network Development',
        creditsUrl: s.creditsUrl || f.creditsUrl || 'https://discord.gg/nightmaremc',
        showFooterCredits: s.showFooterCredits !== false && f.showFooterCredits !== false,

        copyrightText: s.copyrightText || f.copyrightText || 'NightmareMC. All rights reserved.',
        disclaimerText: s.disclaimerText || f.disclaimer || 'NightmareMC is not affiliated with Mojang Studios or Microsoft Corporation. Minecraft is a registered trademark of Mojang AB.',
        additionalFooterInfo: s.additionalFooterInfo || f.additionalInfo || '⚡ 24/7 Discord Ticket Support • Instant Delivery',
        footerDescription: s.footerDescription || f.description || s.siteDescription || 'The ultimate Minecraft server store. Upgrade your journey, unlock exclusive rewards, and support the server.',
      });
    } catch (err) {
      console.error(err);
      toast.error('Failed to load footer settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // 1. Sync to settings/site for real-time frontend listener
      await updateSiteSettings({
        contactEmail: formData.contactEmail,
        supportHours: formData.supportHours,
        showFooterEmail: formData.showFooterEmail,

        showMadeBy: formData.showMadeBy,
        madeByText: formData.madeByText,
        madeByUrl: formData.madeByUrl,

        showOwner: formData.showOwner,
        ownerName: formData.ownerName,
        ownerTitle: formData.ownerTitle,
        ownerDiscord: formData.ownerDiscord,

        showBuyWebsite: formData.showBuyWebsite,
        buyWebsiteEmail: formData.buyWebsiteEmail,
        buyWebsiteTitle: formData.buyWebsiteTitle,
        buyWebsiteText: formData.buyWebsiteText,
        buyWebsitePrice: formData.buyWebsitePrice,

        creditsText: formData.creditsText,
        creditsUrl: formData.creditsUrl,
        showFooterCredits: formData.showFooterCredits,

        copyrightText: formData.copyrightText,
        disclaimerText: formData.disclaimerText,
        additionalFooterInfo: formData.additionalFooterInfo,
        footerDescription: formData.footerDescription,
      });

      // 2. Also sync to settings/footer collection doc
      await updateFooterSettings({
        description: formData.footerDescription,
        disclaimer: formData.disclaimerText,
        copyrightText: formData.copyrightText,
        contactEmail: formData.contactEmail,
        supportHours: formData.supportHours,
        showFooterEmail: formData.showFooterEmail,

        showMadeBy: formData.showMadeBy,
        madeByText: formData.madeByText,
        madeByUrl: formData.madeByUrl,

        showOwner: formData.showOwner,
        ownerName: formData.ownerName,
        ownerTitle: formData.ownerTitle,
        ownerDiscord: formData.ownerDiscord,

        showBuyWebsite: formData.showBuyWebsite,
        buyWebsiteEmail: formData.buyWebsiteEmail,
        buyWebsiteTitle: formData.buyWebsiteTitle,
        buyWebsiteText: formData.buyWebsiteText,
        buyWebsitePrice: formData.buyWebsitePrice,

        creditsText: formData.creditsText,
        creditsUrl: formData.creditsUrl,
        showFooterCredits: formData.showFooterCredits,
        additionalInfo: formData.additionalFooterInfo,
      } as any);

      toast.success('Footer, Owner & Buy Website settings saved successfully!');
      setHasChanges(false);
    } catch (err) {
      console.error(err);
      toast.error('Failed to save footer settings');
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

  const currentYear = new Date().getFullYear();

  return (
    <div className="p-6 max-w-6xl mx-auto pb-32 space-y-8">
      <AdminBreadcrumb
        items={[
          { label: 'Website', href: '/admin' },
          { label: 'Footer, Owner & Buy Website' },
        ]}
      />

      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Mail className="w-6 h-6 text-purple-400" />
          Footer, Website Owner &amp; Template Sales
        </h1>
        <p className="text-zinc-400 text-sm mt-1">
          Configure down-side options: Website Made By, Server Owner info, Buy Website inquiries, support email, and credits
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Form Fields */}
        <div className="lg:col-span-2 space-y-6">

          {/* 1. Website Owner Information */}
          <div className="bg-[#111118] border border-zinc-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Crown className="w-4 h-4 text-amber-400" />
                  Website &amp; Server Owner
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Display server owner identity in the footer
                </p>
              </div>
              <AdminToggle
                checked={formData.showOwner}
                onChange={c => handleChange('showOwner', c)}
              />
            </div>

            {formData.showOwner && (
              <div className="space-y-4 pt-4 border-t border-zinc-800">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <AdminFormField label="Owner Name / Alias *" help="e.g. Jahir or NightmareMC Owner">
                    <input
                      type="text"
                      value={formData.ownerName}
                      onChange={e => handleChange('ownerName', e.target.value)}
                      placeholder="NightmareMC Owner"
                      className="w-full bg-[#0a0a0f] border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </AdminFormField>

                  <AdminFormField label="Owner Role / Title" help="e.g. Server Founder & Lead Administrator">
                    <input
                      type="text"
                      value={formData.ownerTitle}
                      onChange={e => handleChange('ownerTitle', e.target.value)}
                      placeholder="Server Founder & Lead Administrator"
                      className="w-full bg-[#0a0a0f] border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </AdminFormField>
                </div>

                <AdminFormField label="Owner Discord Tag or Link (Optional)" help="e.g. discordtag#0001 or discord.gg/invite">
                  <input
                    type="text"
                    value={formData.ownerDiscord}
                    onChange={e => handleChange('ownerDiscord', e.target.value)}
                    placeholder="discord.gg/nightmaremc"
                    className="w-full bg-[#0a0a0f] border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </AdminFormField>
              </div>
            )}
          </div>

          {/* 2. Buy This Website / Webmaster Inquiries */}
          <div className="bg-[#111118] border border-zinc-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  &quot;Buy This Website&quot; Inquiry Banner
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Allows visitors to contact you to purchase this website or commission a store
                </p>
              </div>
              <AdminToggle
                checked={formData.showBuyWebsite}
                onChange={c => handleChange('showBuyWebsite', c)}
              />
            </div>

            {formData.showBuyWebsite && (
              <div className="space-y-4 pt-4 border-t border-zinc-800">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <AdminFormField label="Owner / Sales Email *" help="Email address for website inquiries">
                    <input
                      type="email"
                      value={formData.buyWebsiteEmail}
                      onChange={e => handleChange('buyWebsiteEmail', e.target.value)}
                      placeholder="business@nightmaremc.com"
                      className="w-full bg-[#0a0a0f] border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </AdminFormField>

                  <AdminFormField label="Price Note / Estimate (Optional)" help="e.g. Custom Quote or Starting from $50">
                    <input
                      type="text"
                      value={formData.buyWebsitePrice}
                      onChange={e => handleChange('buyWebsitePrice', e.target.value)}
                      placeholder="Custom Quote / Inquire for Rates"
                      className="w-full bg-[#0a0a0f] border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </AdminFormField>
                </div>

                <AdminFormField label="Banner Title" help="Headline displayed on the inquiry card">
                  <input
                    type="text"
                    value={formData.buyWebsiteTitle}
                    onChange={e => handleChange('buyWebsiteTitle', e.target.value)}
                    placeholder="Want to Buy This Website or Custom Store?"
                    className="w-full bg-[#0a0a0f] border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </AdminFormField>

                <AdminFormField label="Banner Description Text" help="Explanation message for potential buyers">
                  <textarea
                    rows={2}
                    value={formData.buyWebsiteText}
                    onChange={e => handleChange('buyWebsiteText', e.target.value)}
                    placeholder="Looking for a custom Minecraft store, website template, or tailored web design? Contact the website owner for purchase and commission details."
                    className="w-full bg-[#0a0a0f] border border-zinc-800 rounded-xl p-3.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </AdminFormField>
              </div>
            )}
          </div>

          {/* 3. Website Made By */}
          <div className="bg-[#111118] border border-zinc-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Code className="w-4 h-4 text-emerald-400" />
                  &quot;Website Made By&quot; Option
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Display who created or coded the website in the footer bottom bar
                </p>
              </div>
              <AdminToggle
                checked={formData.showMadeBy}
                onChange={c => handleChange('showMadeBy', c)}
              />
            </div>

            {formData.showMadeBy && (
              <div className="space-y-4 pt-4 border-t border-zinc-800">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <AdminFormField label="Made By Text *" help="Developer or agency name">
                    <input
                      type="text"
                      value={formData.madeByText}
                      onChange={e => handleChange('madeByText', e.target.value)}
                      placeholder="NightmareMC Development Team"
                      className="w-full bg-[#0a0a0f] border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </AdminFormField>

                  <AdminFormField label="Made By Target Link (Optional)" help="Portfolio or Discord link">
                    <input
                      type="url"
                      value={formData.madeByUrl}
                      onChange={e => handleChange('madeByUrl', e.target.value)}
                      placeholder="https://discord.gg/nightmaremc"
                      className="w-full bg-[#0a0a0f] border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </AdminFormField>
                </div>
              </div>
            )}
          </div>

          {/* 4. Support Contact & Inquiries Email */}
          <div className="bg-[#111118] border border-zinc-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Mail className="w-4 h-4 text-purple-400" />
                  Support Contact Email Box
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Official support contact email with 1-click clipboard copy
                </p>
              </div>
              <AdminToggle
                checked={formData.showFooterEmail}
                onChange={c => handleChange('showFooterEmail', c)}
              />
            </div>

            {formData.showFooterEmail && (
              <div className="space-y-4 pt-4 border-t border-zinc-800">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <AdminFormField label="Official Contact Email *" help="Players can mail or copy in 1 click">
                    <input
                      type="email"
                      value={formData.contactEmail}
                      onChange={e => handleChange('contactEmail', e.target.value)}
                      placeholder="support@nightmaremc.com"
                      className="w-full bg-[#0a0a0f] border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </AdminFormField>

                  <AdminFormField label="Support Hours / Availability" help="e.g. 24/7 Response via Discord Tickets">
                    <input
                      type="text"
                      value={formData.supportHours}
                      onChange={e => handleChange('supportHours', e.target.value)}
                      placeholder="24/7 Response via Discord Tickets"
                      className="w-full bg-[#0a0a0f] border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </AdminFormField>
                </div>
              </div>
            )}
          </div>

          {/* 5. Credits & Authorship */}
          <div className="bg-[#111118] border border-zinc-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Heart className="w-4 h-4 text-pink-400" />
                  Developer Credits &amp; Attribution
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Attribution line displayed in bottom bar
                </p>
              </div>
              <AdminToggle
                checked={formData.showFooterCredits}
                onChange={c => handleChange('showFooterCredits', c)}
              />
            </div>

            {formData.showFooterCredits && (
              <div className="space-y-4 pt-4 border-t border-zinc-800">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <AdminFormField label="Credits Text *" help="e.g. NightmareMC Network Development">
                    <input
                      type="text"
                      value={formData.creditsText}
                      onChange={e => handleChange('creditsText', e.target.value)}
                      placeholder="NightmareMC Network Development"
                      className="w-full bg-[#0a0a0f] border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </AdminFormField>

                  <AdminFormField label="Credits Link (Optional)" help="Portfolio or Discord URL">
                    <input
                      type="url"
                      value={formData.creditsUrl}
                      onChange={e => handleChange('creditsUrl', e.target.value)}
                      placeholder="https://discord.gg/nightmaremc"
                      className="w-full bg-[#0a0a0f] border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </AdminFormField>
                </div>
              </div>
            )}
          </div>

          {/* 6. Legal, Copyright & Badges */}
          <div className="bg-[#111118] border border-zinc-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              Copyright &amp; Disclaimers
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AdminFormField label="Copyright Line" help="Displayed next to current year">
                <input
                  type="text"
                  value={formData.copyrightText}
                  onChange={e => handleChange('copyrightText', e.target.value)}
                  placeholder="NightmareMC. All rights reserved."
                  className="w-full bg-[#0a0a0f] border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </AdminFormField>

              <AdminFormField label="Additional Assurance Badge" help="Badges shown next to Discord button">
                <input
                  type="text"
                  value={formData.additionalFooterInfo}
                  onChange={e => handleChange('additionalFooterInfo', e.target.value)}
                  placeholder="⚡ 24/7 Discord Ticket Support • Instant Delivery"
                  className="w-full bg-[#0a0a0f] border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </AdminFormField>
            </div>

            <AdminFormField label="Footer Description" help="Short blurb under your store logo">
              <textarea
                rows={2}
                value={formData.footerDescription}
                onChange={e => handleChange('footerDescription', e.target.value)}
                placeholder="The ultimate Minecraft server store..."
                className="w-full bg-[#0a0a0f] border border-zinc-800 rounded-xl p-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </AdminFormField>

            <AdminFormField label="Mojang / Minecraft Legal Disclaimer" help="Required legally for all Minecraft community stores">
              <textarea
                rows={2}
                value={formData.disclaimerText}
                onChange={e => handleChange('disclaimerText', e.target.value)}
                placeholder="NightmareMC is not affiliated with Mojang Studios..."
                className="w-full bg-[#0a0a0f] border border-zinc-800 rounded-xl p-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </AdminFormField>
          </div>

        </div>

        {/* Right Col: Live Simulation Preview */}
        <div className="space-y-4">
          <div className="bg-[#111118] border border-zinc-800 rounded-2xl p-5 sticky top-6">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
              <Eye className="w-4 h-4 text-purple-400" />
              Live Footer Simulation
            </h3>
            <p className="text-xs text-zinc-400 mb-4">
              Real-time preview of your configured footer down-side elements:
            </p>

            {/* Simulated Footer Card */}
            <div className="p-4 rounded-xl bg-[#09090f] border border-zinc-800 space-y-4 text-xs">
              
              {/* Owner Preview */}
              {formData.showOwner && (
                <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center gap-2">
                  <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] text-zinc-500 uppercase font-bold">Server Owner</p>
                    <p className="text-xs font-bold text-white truncate">{formData.ownerName}</p>
                    <p className="text-[10px] text-zinc-400 truncate">{formData.ownerTitle}</p>
                  </div>
                </div>
              )}

              {/* Support Email Preview */}
              {formData.showFooterEmail && (
                <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <Mail className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] text-zinc-500 uppercase font-bold">Support Email</p>
                      <p className="text-xs font-mono font-bold text-zinc-200 truncate">{formData.contactEmail}</p>
                    </div>
                  </div>
                  <Copy className="w-3 h-3 text-zinc-500" />
                </div>
              )}

              {/* Buy Website Banner Preview */}
              {formData.showBuyWebsite && (
                <div className="p-3 rounded-lg bg-purple-950/30 border border-purple-500/30 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-purple-300 font-bold text-[11px]">
                    <Sparkles className="w-3 h-3 text-purple-400" />
                    <span>{formData.buyWebsiteTitle}</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 line-clamp-2">{formData.buyWebsiteText}</p>
                  <div className="pt-1 flex items-center justify-between text-[10px] font-mono text-zinc-300">
                    <span className="truncate">{formData.buyWebsiteEmail}</span>
                    <span className="text-amber-400 font-bold">{formData.buyWebsitePrice}</span>
                  </div>
                </div>
              )}

              {/* Bottom Bar Preview */}
              <div className="pt-3 border-t border-zinc-800 space-y-1 text-[10px] text-zinc-400">
                <p>© {currentYear} {formData.copyrightText}</p>
                {formData.showMadeBy && (
                  <p className="text-emerald-400">
                    Website made by <span className="font-bold underline">{formData.madeByText}</span>
                  </p>
                )}
                {formData.showFooterCredits && (
                  <p className="text-pink-400">
                    Designed &amp; Developed by <span className="font-bold underline">{formData.creditsText}</span>
                  </p>
                )}
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
