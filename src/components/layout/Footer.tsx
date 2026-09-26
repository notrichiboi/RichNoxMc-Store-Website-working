'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSettingsContext } from '@/contexts/SettingsContext';
import { SafeImage } from '../ui/SafeImage';
import { getServerSettings } from '@/lib/firestore/settings';
import type { ServerSettings } from '@/lib/types';
import { DEFAULT_SERVER_SETTINGS } from '@/lib/utils';
import toast from 'react-hot-toast';
import {
  Copy,
  Check,
  ExternalLink,
  Server,
  Cpu,
  Mail,
  Heart,
  ShieldCheck,
  Sparkles,
  Crown,
  ShoppingBag,
  Send,
  Code
} from 'lucide-react';

function CopyIpButton({ ip, label }: { ip: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(ip);
      setCopied(true);
      toast.success(`${label} copied!`);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error('Failed to copy');
    }
  };
  return (
    <button
      onClick={handleCopy}
      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 dark:text-zinc-500 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
      title={`Copy ${label}`}
    >
      {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

export function Footer() {
  const { settings } = useSettingsContext();
  const [server, setServer] = useState<ServerSettings>(DEFAULT_SERVER_SETTINGS);
  const [ownerEmailCopied, setOwnerEmailCopied] = useState(false);

  useEffect(() => {
    getServerSettings().then(s => {
      if (s) setServer(s);
    }).catch(() => {});
  }, []);

  const year = new Date().getFullYear();
  
  // Settings & Toggles
  const contactEmail = settings.contactEmail || 'support@nightmaremc.com';
  const showEmail = settings.showFooterEmail !== false;

  const showCredits = settings.showFooterCredits !== false;
  const creditsText = settings.creditsText || 'NightmareMC Network Development';
  const creditsUrl = settings.creditsUrl || 'https://discord.gg/nightmaremc';

  const showMadeBy = settings.showMadeBy !== false;
  const madeByText = settings.madeByText || 'NightmareMC Development Team';
  const madeByUrl = settings.madeByUrl || '';

  const showOwner = settings.showOwner !== false;
  const ownerName = settings.ownerName || 'NightmareMC Owner';
  const ownerTitle = settings.ownerTitle || 'Server Founder & Lead Administrator';
  const ownerDiscord = settings.ownerDiscord || '';

  const showBuyWebsite = settings.showBuyWebsite !== false;
  const buyWebsiteEmail = settings.buyWebsiteEmail || settings.contactEmail || 'business@nightmaremc.com';
  const buyWebsiteTitle = settings.buyWebsiteTitle || 'Want to Buy This Website or Custom Store?';
  const buyWebsiteText = settings.buyWebsiteText || 'Looking for a custom Minecraft store, website template, or tailored web design? Contact the website owner for purchase and commission details.';
  const buyWebsitePrice = settings.buyWebsitePrice || 'Custom Quote / Inquire for Rates';

  const disclaimerText = settings.disclaimerText || 'NightmareMC is not affiliated with Mojang Studios or Microsoft Corporation. Minecraft is a registered trademark of Mojang AB.';
  const copyrightText = settings.copyrightText || `${settings.siteName}. All rights reserved.`;

  const copyBuyEmail = () => {
    navigator.clipboard.writeText(buyWebsiteEmail);
    setOwnerEmailCopied(true);
    toast.success('Owner email copied to clipboard!');
    setTimeout(() => setOwnerEmailCopied(false), 2500);
  };

  return (
    <footer className="bg-white/85 dark:bg-[#07070d]/85 backdrop-blur-md border-t border-slate-200/80 dark:border-white/10 transition-colors duration-300">
      <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 py-14">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 mb-10">

          {/* Column 1: Brand, Owner & Direct Contact */}
          <div className="md:col-span-5 space-y-4">
            <Link href="/" className="flex items-center gap-3 group w-fit">
              {settings.logoUrl ? (
                <div className="relative h-10 w-10 rounded-xl overflow-hidden shadow-sm">
                  <SafeImage src={settings.logoUrl} alt={settings.siteName} fill />
                </div>
              ) : (
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-md">
                  <span className="text-sm font-black text-white">N</span>
                </div>
              )}
              <span className="font-black text-xl text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                {settings.siteName}
              </span>
            </Link>

            <p className="text-sm text-slate-500 dark:text-zinc-400 leading-relaxed max-w-sm">
              {settings.footerDescription || settings.siteDescription}
            </p>

            {/* Badges / Discord links */}
            <div className="flex flex-wrap items-center gap-2.5">
              {settings.discordUrl && (
                <a
                  href={settings.discordUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#5865F2]/10 dark:bg-[#5865F2]/20 border border-[#5865F2]/30 text-[#5865F2] dark:text-[#7289da] hover:bg-[#5865F2] hover:text-white text-xs font-bold transition-all shadow-sm"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Join Our Discord
                </a>
              )}
              {settings.additionalFooterInfo && (
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
                  {settings.additionalFooterInfo}
                </span>
              )}
            </div>

            {/* Website Owner Card (Toggleable) */}
            {showOwner && (
              <div className="p-3.5 rounded-2xl bg-slate-100/90 dark:bg-[#0e0e18] border border-slate-200/90 dark:border-white/10 max-w-md shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center shrink-0 border border-amber-500/20">
                    <Crown className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500 tracking-wider block">
                      Website &amp; Network Owner
                    </span>
                    <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-zinc-200">
                      {ownerName}
                      <span className="text-xs font-normal text-slate-500 dark:text-zinc-400 ml-1.5">
                        • {ownerTitle}
                      </span>
                    </p>
                    {ownerDiscord && (
                      <p className="text-[11px] text-purple-600 dark:text-purple-400 font-mono mt-0.5">
                        Discord: {ownerDiscord}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Official Support & Inquiries Email Card (Toggleable) */}
            {showEmail && (
              <div className="p-3.5 rounded-2xl bg-slate-100/90 dark:bg-[#0e0e18] border border-slate-200/90 dark:border-white/10 max-w-md shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500 tracking-wider block">
                        Official Support Email
                      </span>
                      <a
                        href={`mailto:${contactEmail}`}
                        className="text-xs sm:text-sm font-bold text-slate-800 dark:text-zinc-200 hover:text-purple-600 dark:hover:text-purple-400 transition-colors truncate block"
                        title="Click to send email"
                      >
                        {contactEmail}
                      </a>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(contactEmail);
                      toast.success('Support email copied to clipboard!');
                    }}
                    className="p-2 rounded-xl text-slate-400 hover:text-purple-600 dark:text-zinc-500 dark:hover:text-purple-400 hover:bg-slate-200/60 dark:hover:bg-zinc-800 transition-colors"
                    title="Copy Email Address"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                {settings.supportHours && (
                  <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-2 pt-2 border-t border-slate-200/60 dark:border-white/5 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                    <span>{settings.supportHours}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Column 2: Navigation Links */}
          <div className="md:col-span-3">
            <h4 className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-4">
              Store &amp; Community
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Store Packages', href: '/store', show: true },
                { label: 'Vote for Server', href: '/vote', show: settings.showVote },
                { label: 'Top Patrons', href: '/patrons', show: settings.showPatrons },
                { label: 'Server Rules', href: '/rules', show: settings.showRules },
                { label: 'Help & Support', href: '/support', show: settings.showSupport },
              ].filter(l => l.show).map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm font-medium text-slate-600 dark:text-zinc-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Server Connections */}
          <div className="md:col-span-4">
            <h4 className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-4">
              Server Connections
            </h4>
            <div className="space-y-2.5">
              {server.javaEnabled && (
                <div className="bg-slate-50 dark:bg-[#0e0e18] border border-slate-200/80 dark:border-white/10 rounded-2xl p-3.5">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Server className="h-3.5 w-3.5 text-green-500" />
                    <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                      Java Edition
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <code className="text-xs sm:text-sm text-slate-800 dark:text-zinc-200 font-mono font-bold">
                      {server.javaIp || 'play.nightmaremc.example'}
                    </code>
                    <CopyIpButton ip={server.javaIp || 'play.nightmaremc.example'} label="Java IP" />
                  </div>
                </div>
              )}
              {server.bedrockEnabled && (
                <div className="bg-slate-50 dark:bg-[#0e0e18] border border-slate-200/80 dark:border-white/10 rounded-2xl p-3.5">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Cpu className="h-3.5 w-3.5 text-blue-500" />
                    <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                      Bedrock Edition
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <code className="text-xs sm:text-sm text-slate-800 dark:text-zinc-200 font-mono font-bold">
                        {server.bedrockIp || 'play.nightmaremc.example'}
                      </code>
                      <span className="text-xs text-slate-400 dark:text-zinc-500 ml-1.5">
                        :{server.bedrockPort || '19132'}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <CopyIpButton ip={server.bedrockIp || 'play.nightmaremc.example'} label="Bedrock IP" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Feature: BUY THIS WEBSITE / TEMPLATE INQUIRIES CARD (Toggleable) */}
        {showBuyWebsite && (
          <div className="mb-10 p-5 rounded-2xl bg-gradient-to-r from-purple-900/20 via-indigo-900/20 to-purple-900/20 border border-purple-500/30 dark:border-purple-500/20 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              <div className="space-y-1.5 max-w-2xl">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400 text-[11px] font-bold tracking-wide uppercase border border-purple-500/30">
                  <Sparkles className="w-3 h-3" />
                  Website Purchase &amp; Inquiries
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  {buyWebsiteTitle}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
                  {buyWebsiteText}
                </p>
                {buyWebsitePrice && (
                  <p className="text-xs font-semibold text-amber-500 dark:text-amber-400 flex items-center gap-1">
                    <span>Pricing Estimate:</span>
                    <span className="font-mono">{buyWebsitePrice}</span>
                  </p>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
                <div className="bg-white/80 dark:bg-black/40 border border-purple-500/30 px-3 py-2 rounded-xl flex items-center gap-2">
                  <Mail className="w-4 h-4 text-purple-400 shrink-0" />
                  <span className="text-xs font-mono font-bold text-slate-800 dark:text-zinc-200 truncate max-w-[200px]">
                    {buyWebsiteEmail}
                  </span>
                  <button
                    onClick={copyBuyEmail}
                    className="p-1 rounded text-zinc-400 hover:text-white transition-colors"
                    title="Copy Owner Email"
                  >
                    {ownerEmailCopied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <a
                  href={`mailto:${buyWebsiteEmail}?subject=NightmareMC%20Website%20Purchase%20Inquiry`}
                  className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition-all flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  Email Owner
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Bottom Bar with Made By, Credits, Copyright and Legal Disclaimer */}
        <div className="pt-8 border-t border-slate-200/80 dark:border-white/10 flex flex-col md:flex-row items-center justify-between gap-5 text-center md:text-left">
          
          {/* Copyright, Made By & Credits */}
          <div className="space-y-1.5">
            <p className="text-xs text-slate-600 dark:text-zinc-400 font-medium">
              © {year} {copyrightText}
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-zinc-400">
              {/* Made By Toggleable */}
              {showMadeBy && madeByText && (
                <span className="inline-flex items-center gap-1">
                  <Code className="w-3.5 h-3.5 text-purple-400 inline" />
                  <span>Website made by</span>
                  {madeByUrl ? (
                    <a
                      href={madeByUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-purple-600 dark:text-purple-400 hover:underline inline-flex items-center gap-0.5"
                    >
                      {madeByText}
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  ) : (
                    <span className="font-bold text-slate-700 dark:text-zinc-300">{madeByText}</span>
                  )}
                </span>
              )}

              {/* Credits Toggleable */}
              {showCredits && creditsText && (
                <span className="inline-flex items-center gap-1">
                  <Heart className="w-3 h-3 text-pink-400 inline fill-pink-400/20" />
                  <span>Designed &amp; Developed by</span>
                  {creditsUrl ? (
                    <a
                      href={creditsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-purple-600 dark:text-purple-400 hover:underline inline-flex items-center gap-0.5"
                    >
                      {creditsText}
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  ) : (
                    <span className="font-bold text-slate-700 dark:text-zinc-300">{creditsText}</span>
                  )}
                </span>
              )}
            </div>
          </div>

          {/* Minecraft / Mojang Disclaimer */}
          <p className="text-xs text-slate-400 dark:text-zinc-600 max-w-md text-center md:text-right leading-relaxed">
            {disclaimerText}
          </p>
        </div>
      </div>
    </footer>
  );
}
