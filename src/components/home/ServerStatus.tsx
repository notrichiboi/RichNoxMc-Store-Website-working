'use client';

import React, { useState, useEffect } from 'react';
import { Server, Users, Activity, Check, Copy, Wifi, Shield, Globe } from 'lucide-react';
import { getServerSettings } from '@/lib/firestore/settings';
import type { ServerSettings } from '@/lib/types';
import { DEFAULT_SERVER_SETTINGS } from '@/lib/utils';
import toast from 'react-hot-toast';
import { playItemPickupSound } from '@/lib/utils/audio';

interface ServerData {
  online: boolean;
  players: {
    online: number;
    max: number;
    list?: Array<{ name: string; uuid: string }>;
  };
  motd?: {
    clean?: string[];
    html?: string[];
  };
  version?: string;
  icon?: string | null;
  hostname?: string;
  ip?: string;
  port?: number;
}

function ServerIpCard({
  title,
  ip,
  port,
  isOnline,
  version,
  icon,
  playerCount,
  maxPlayers,
  motdLine,
  type = 'java',
}: {
  title: string;
  ip: string;
  port?: string | number;
  isOnline: boolean;
  version?: string;
  icon?: string | null;
  playerCount?: number;
  maxPlayers?: number;
  motdLine?: string;
  type?: 'java' | 'bedrock';
}) {
  const [copied, setCopied] = useState(false);
  const fullAddress = port ? `${ip}:${port}` : ip;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullAddress);
      setCopied(true);
      playItemPickupSound();
      toast.success(`${title} address copied!`);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error('Failed to copy address');
    }
  };

  return (
    <div className="bg-white/80 dark:bg-[#0d0d16]/90 backdrop-blur-md border border-slate-200/90 dark:border-white/10 rounded-2xl p-5 flex flex-col justify-between gap-4 hover:border-purple-500/50 dark:hover:border-purple-500/40 transition-all shadow-md hover:shadow-xl group relative overflow-hidden">
      {/* Background subtle glow */}
      <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl pointer-events-none transition-opacity ${
        isOnline ? 'bg-emerald-500/10 dark:bg-emerald-500/15' : 'bg-red-500/10'
      }`} />

      {/* Top Details */}
      <div className="flex items-start justify-between gap-3 relative z-10">
        <div className="flex items-center gap-3.5 min-w-0">
          {/* Server Icon or Custom Badge */}
          <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-black/40 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
            {icon ? (
              <img
                src={icon}
                alt={`${title} Icon`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : type === 'java' ? (
              <Server className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            ) : (
              <Globe className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            )}
            
            {/* Live Indicator Dot */}
            <span className="absolute bottom-1 right-1 flex h-2.5 w-2.5">
              {isOnline && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              )}
              <span
                className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  isOnline ? 'bg-emerald-500 ring-2 ring-white dark:ring-black' : 'bg-red-500 ring-2 ring-white dark:ring-black'
                }`}
              />
            </span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-black uppercase tracking-wider">
                {title}
              </span>
              {version && (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-zinc-300">
                  {version}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-mono text-slate-900 dark:text-white text-sm font-bold truncate">
                {fullAddress}
              </span>
            </div>
          </div>
        </div>

        {/* Copy Button */}
        <button
          onClick={handleCopy}
          className={`p-2.5 rounded-xl border transition-all shrink-0 cursor-pointer ${
            copied
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
              : 'bg-slate-100 dark:bg-zinc-800/80 border-slate-200 dark:border-zinc-700/60 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-700'
          }`}
          title="Click to copy server address"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>

      {/* Bottom Metadata: MOTD / Players status */}
      <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs relative z-10">
        <div className="text-slate-500 dark:text-zinc-400 truncate max-w-[200px] sm:max-w-xs font-medium">
          {motdLine || (isOnline ? 'Minecraft Server Online' : 'Server is currently offline')}
        </div>
        
        {typeof playerCount === 'number' && (
          <div className="flex items-center gap-1.5 shrink-0 font-bold text-slate-700 dark:text-zinc-300 bg-slate-100/80 dark:bg-black/30 px-2 py-1 rounded-lg">
            <Users className="w-3.5 h-3.5 text-purple-500" />
            <span>{isOnline ? `${playerCount}${maxPlayers ? `/${maxPlayers}` : ''}` : '0'}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function ServerStatus() {
  const [server, setServer] = useState<ServerSettings>(DEFAULT_SERVER_SETTINGS);
  const [javaData, setJavaData] = useState<ServerData | null>(null);
  const [bedrockData, setBedrockData] = useState<ServerData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadStatus() {
      try {
        const settings = await getServerSettings();
        if (!settings || !isMounted) return;
        setServer(settings);

        if (settings.statusMode === 'manual') {
          const manualOnline = settings.manualStatus === 'online';
          setJavaData({
            online: manualOnline,
            players: {
              online: settings.manualPlayerCount || 0,
              max: settings.manualMaxPlayers || 500,
            },
            motd: { clean: ['NightmareMC Network • Official Minecraft Store'] },
            version: settings.javaVersion || '1.20+',
          });
          setLoading(false);
          return;
        }

        // Live API Mode via official mcsrvstat.us v3 proxy
        const javaIpToQuery = settings.javaIp || 'play.nightmaremc.com';
        const bedrockIpToQuery = settings.bedrockIp || 'bedrock.nightmaremc.com';

        // 1. Fetch Java Status
        try {
          const res = await fetch(`/api/server-status?address=${encodeURIComponent(javaIpToQuery)}&type=java`);
          if (res.ok) {
            const data = await res.json();
            if (isMounted) {
              setJavaData(data);
            }
          }
        } catch (err) {
          console.error('Failed to fetch Java status:', err);
        }

        // 2. Fetch Bedrock Status if enabled
        if (settings.bedrockEnabled) {
          try {
            const fullBedrockAddr = settings.bedrockPort
              ? `${bedrockIpToQuery}:${settings.bedrockPort}`
              : bedrockIpToQuery;
            const res = await fetch(`/api/server-status?address=${encodeURIComponent(fullBedrockAddr)}&type=bedrock`);
            if (res.ok) {
              const bData = await res.json();
              if (isMounted) {
                setBedrockData(bData);
              }
            }
          } catch (err) {
            console.error('Failed to fetch Bedrock status:', err);
          }
        }
      } catch (err) {
        console.error('Failed to load server settings:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadStatus();
    // Poll every 60 seconds (mcsrvstat caches for 5 mins)
    const interval = setInterval(loadStatus, 60000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  if (!server.showStatus) return null;

  const isJavaOnline = javaData ? Boolean(javaData.online) : server.manualStatus === 'online';
  const isBedrockOnline = bedrockData ? Boolean(bedrockData.online) : server.manualStatus === 'online';
  const totalPlayers = (javaData?.players?.online || 0) + (bedrockData?.players?.online || 0);
  const totalMax = (javaData?.players?.max || server.manualMaxPlayers || 500);

  const motdClean = javaData?.motd?.clean?.[0] || 'NightmareMC Network • Official Minecraft Server';

  return (
    <section className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. Java Edition Card */}
        {server.javaEnabled && (
          <ServerIpCard
            title="Java Edition"
            ip={server.javaIp || 'play.nightmaremc.com'}
            version={javaData?.version || server.javaVersion || '1.20+'}
            isOnline={isJavaOnline}
            icon={javaData?.icon}
            playerCount={javaData?.players?.online}
            maxPlayers={javaData?.players?.max}
            motdLine={motdClean}
            type="java"
          />
        )}

        {/* 2. Bedrock Edition Card */}
        {server.bedrockEnabled && (
          <ServerIpCard
            title="Bedrock Edition"
            ip={server.bedrockIp || 'bedrock.nightmaremc.com'}
            port={server.bedrockPort || '19132'}
            version={bedrockData?.version || server.bedrockVersion || 'Latest'}
            isOnline={isBedrockOnline}
            playerCount={bedrockData?.players?.online}
            maxPlayers={bedrockData?.players?.max}
            motdLine={bedrockData?.motd?.clean?.[0] || 'Crossplay Supported on Bedrock'}
            type="bedrock"
          />
        )}

        {/* 3. Server Network Counter Card */}
        {server.showPlayerCount && (
          <div className="bg-white/80 dark:bg-[#0d0d16]/90 backdrop-blur-md border border-slate-200/90 dark:border-white/10 rounded-2xl p-5 flex flex-col justify-between gap-4 hover:border-purple-500/50 dark:hover:border-purple-500/40 transition-all shadow-md hover:shadow-xl group relative overflow-hidden">
            <div className="flex items-center gap-3.5">
              <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl shrink-0 group-hover:scale-105 transition-transform">
                <Activity className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <div className="text-[11px] text-slate-500 dark:text-zinc-400 font-black uppercase tracking-wider mb-0.5">
                  Network Status (v3)
                </div>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    {isJavaOnline && (
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    )}
                    <span
                      className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                        isJavaOnline ? 'bg-emerald-500' : 'bg-red-500'
                      }`}
                    />
                  </span>
                  <span className="font-extrabold text-slate-900 dark:text-white text-base">
                    {isJavaOnline ? `${totalPlayers} / ${totalMax} Playing` : 'Server Offline'}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
              <span className="flex items-center gap-1.5">
                <Wifi className="w-3.5 h-3.5 text-emerald-500" />
                <span>Live Ping Sync</span>
              </span>
              <span className="font-mono text-[11px] bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded text-slate-600 dark:text-zinc-400">
                mcsrvstat v3
              </span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
