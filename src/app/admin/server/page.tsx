'use client';

import React, { useState, useEffect } from 'react';
import { getServerSettings, updateServerSettings } from '@/lib/firestore/settings';
import { AdminFormField } from '@/components/admin/AdminFormField';
import { AdminToggle } from '@/components/admin/AdminToggle';
import { AdminSaveBar } from '@/components/admin/AdminSaveBar';
import { Server, Cpu, Activity, Signal } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AdminServerPage() {
  const [data, setData] = useState({
    javaEnabled: true,
    javaIp: 'play.nightmaremc.com',
    javaVersion: '1.20+',
    bedrockEnabled: true,
    bedrockIp: 'bedrock.nightmaremc.com',
    bedrockPort: 19132,
    bedrockVersion: 'Latest',
    statusMode: 'live' as 'live' | 'manual',
    manualStatus: 'online' as 'online' | 'offline' | 'maintenance',
    manualPlayerCount: 120,
    manualMaxPlayers: 500,
    liveApiUrl: 'https://api.mcsrvstat.us/3/play.nightmaremc.com',
    showStatus: true,
    showPlayerCount: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const info: any = await getServerSettings();
      if (info) {
        setData({
          javaEnabled: info.javaEnabled ?? info.java?.enabled ?? true,
          javaIp: info.javaIp || info.java?.ip || 'play.nightmaremc.com',
          javaVersion: info.javaVersion || info.java?.version || '1.20+',
          bedrockEnabled: info.bedrockEnabled ?? info.bedrock?.enabled ?? true,
          bedrockIp: info.bedrockIp || info.bedrock?.ip || 'bedrock.nightmaremc.com',
          bedrockPort: info.bedrockPort || info.bedrock?.port || 19132,
          bedrockVersion: info.bedrockVersion || info.bedrock?.version || 'Latest',
          statusMode: info.statusMode || 'live',
          manualStatus: info.manualStatus || 'online',
          manualPlayerCount: info.manualPlayerCount ?? info.manualPlayers ?? 120,
          manualMaxPlayers: info.manualMaxPlayers ?? info.manualMax ?? 500,
          liveApiUrl: info.liveApiUrl || info.apiUrl || 'https://api.mcsrvstat.us/3/play.nightmaremc.com',
          showStatus: info.showStatus !== false,
          showPlayerCount: info.showPlayerCount !== false,
        });
      }
    } catch (error) {
      toast.error('Failed to load server settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save both flat and nested keys for 100% interoperability across all components
      const payload = {
        ...data,
        java: {
          enabled: data.javaEnabled,
          ip: data.javaIp,
          version: data.javaVersion,
        },
        bedrock: {
          enabled: data.bedrockEnabled,
          ip: data.bedrockIp,
          port: data.bedrockPort,
          version: data.bedrockVersion,
        },
        manualPlayers: data.manualPlayerCount,
        manualMax: data.manualMaxPlayers,
        apiUrl: data.liveApiUrl,
      };

      await updateServerSettings(payload);
      toast.success('Server settings saved successfully');
      setHasChanges(false);
    } catch (error) {
      console.error(error);
      toast.error('Failed to save server settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null;

  return (
    <div className="p-6 max-w-4xl mx-auto pb-24">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Server className="w-6 h-6 text-purple-400" />
          Server Connection Settings
        </h1>
        <p className="text-zinc-400 text-sm">
          Configure your Java &amp; Bedrock server IP addresses, ports, and live status monitor
        </p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Java Edition */}
          <div className="bg-[#111118] border border-zinc-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Server className="w-4 h-4 text-green-400" />
                Java Edition
              </h2>
              <AdminToggle
                checked={data.javaEnabled}
                onChange={(c) => handleChange('javaEnabled', c)}
              />
            </div>
            
            <div className="space-y-4">
              <AdminFormField label="Server IP Address *">
                <input
                  type="text"
                  value={data.javaIp}
                  onChange={(e) => handleChange('javaIp', e.target.value)}
                  placeholder="play.nightmaremc.com"
                  className="w-full bg-[#0a0a0f] border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </AdminFormField>

              <AdminFormField label="Supported Version">
                <input
                  type="text"
                  value={data.javaVersion}
                  onChange={(e) => handleChange('javaVersion', e.target.value)}
                  placeholder="1.20 - 1.21"
                  className="w-full bg-[#0a0a0f] border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </AdminFormField>
            </div>
          </div>

          {/* Bedrock Edition */}
          <div className="bg-[#111118] border border-zinc-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-blue-400" />
                Bedrock Edition
              </h2>
              <AdminToggle
                checked={data.bedrockEnabled}
                onChange={(c) => handleChange('bedrockEnabled', c)}
              />
            </div>
            
            <div className="space-y-4">
              <AdminFormField label="Bedrock Server IP *">
                <input
                  type="text"
                  value={data.bedrockIp}
                  onChange={(e) => handleChange('bedrockIp', e.target.value)}
                  placeholder="bedrock.nightmaremc.com"
                  className="w-full bg-[#0a0a0f] border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </AdminFormField>

              <div className="grid grid-cols-2 gap-3">
                <AdminFormField label="Bedrock Port *">
                  <input
                    type="number"
                    value={data.bedrockPort}
                    onChange={(e) => handleChange('bedrockPort', parseInt(e.target.value) || 19132)}
                    placeholder="19132"
                    className="w-full bg-[#0a0a0f] border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </AdminFormField>

                <AdminFormField label="Bedrock Version">
                  <input
                    type="text"
                    value={data.bedrockVersion}
                    onChange={(e) => handleChange('bedrockVersion', e.target.value)}
                    placeholder="Latest"
                    className="w-full bg-[#0a0a0f] border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </AdminFormField>
              </div>
            </div>
          </div>
        </div>

        {/* Status & Player Count Widget Settings */}
        <div className="bg-[#111118] border border-zinc-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-400" />
                Live Status &amp; Player Counter
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Controls the live server ping dot and player count shown on the site
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AdminToggle
              label="Show Server Status Dot"
              description="Display online/offline status badge on cards and header"
              checked={data.showStatus}
              onChange={(c) => handleChange('showStatus', c)}
            />
            <AdminToggle
              label="Show Player Count"
              description="Display total online player numbers"
              checked={data.showPlayerCount}
              onChange={(c) => handleChange('showPlayerCount', c)}
            />
          </div>

          <div className="border-t border-zinc-800 pt-5 space-y-4">
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Status Source Mode
            </label>

            <div className="flex flex-wrap gap-6 text-sm">
              <label className="flex items-center space-x-2 text-zinc-300 cursor-pointer">
                <input
                  type="radio"
                  name="statusMode"
                  checked={data.statusMode === 'live'}
                  onChange={() => handleChange('statusMode', 'live')}
                  className="text-purple-500 bg-zinc-900 border-zinc-800"
                />
                <span>Live API Ping (mcsrvstat.us)</span>
              </label>

              <label className="flex items-center space-x-2 text-zinc-300 cursor-pointer">
                <input
                  type="radio"
                  name="statusMode"
                  checked={data.statusMode === 'manual'}
                  onChange={() => handleChange('statusMode', 'manual')}
                  className="text-purple-500 bg-zinc-900 border-zinc-800"
                />
                <span>Manual Status &amp; Player Count</span>
              </label>
            </div>

            {data.statusMode === 'live' ? (
              <AdminFormField 
                label="Custom Status API URL (Optional)" 
                helpText="Powered by official mcsrvstat.us API v3 with automatic server proxy and User-Agent headers"
              >
                <input
                  type="text"
                  value={data.liveApiUrl}
                  onChange={(e) => handleChange('liveApiUrl', e.target.value)}
                  placeholder={`https://api.mcsrvstat.us/3/${data.javaIp || 'play.nightmaremc.com'}`}
                  className="w-full bg-[#0a0a0f] border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </AdminFormField>
            ) : (
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <AdminFormField label="Manual Server Status">
                    <select
                      value={data.manualStatus}
                      onChange={(e) => handleChange('manualStatus', e.target.value)}
                      className="w-full bg-[#0a0a0f] border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                    >
                      <option value="online">Online</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="offline">Offline</option>
                    </select>
                  </AdminFormField>

                  <AdminFormField label="Manual Player Count">
                    <input
                      type="number"
                      min="0"
                      value={data.manualPlayerCount}
                      onChange={(e) => handleChange('manualPlayerCount', parseInt(e.target.value) || 0)}
                      className="w-full bg-[#0a0a0f] border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm"
                    />
                  </AdminFormField>

                  <AdminFormField label="Manual Max Slots">
                    <input
                      type="number"
                      min="1"
                      value={data.manualMaxPlayers}
                      onChange={(e) => handleChange('manualMaxPlayers', parseInt(e.target.value) || 500)}
                      className="w-full bg-[#0a0a0f] border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm"
                    />
                  </AdminFormField>
                </div>
              </div>
            )}
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
