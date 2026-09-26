'use client';

import React, { useState } from 'react';
import { Monitor, Smartphone, Tablet, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function AdminPreviewPage() {
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [path, setPath] = useState('/');

  const getIframeWidth = () => {
    switch (device) {
      case 'mobile': return 'w-[375px]';
      case 'tablet': return 'w-[768px]';
      case 'desktop': return 'w-full';
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] lg:h-screen">
      <div className="flex-shrink-0 p-4 border-b border-zinc-800 bg-[#111118] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Live Preview</h1>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <select
            value={path}
            onChange={(e) => setPath(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-md px-3 py-1.5 text-sm text-white focus:outline-none focus:border-purple-500"
          >
            <option value="/">Homepage</option>
            <option value="/store">Store</option>
            <option value="/rules">Rules</option>
            <option value="/vote">Vote</option>
            <option value="/patrons">Patrons</option>
          </select>

          <div className="flex bg-zinc-900 border border-zinc-800 rounded-md p-1">
            <button
              onClick={() => setDevice('desktop')}
              className={`p-1.5 rounded-sm transition-colors ${device === 'desktop' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
              title="Desktop"
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDevice('tablet')}
              className={`p-1.5 rounded-sm transition-colors ${device === 'tablet' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
              title="Tablet"
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDevice('mobile')}
              className={`p-1.5 rounded-sm transition-colors ${device === 'mobile' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
              title="Mobile"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>

          <Link
            href={path}
            target="_blank"
            className="flex items-center text-sm px-3 py-1.5 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Open in new tab
          </Link>
        </div>
      </div>

      <div className="flex-1 bg-black p-4 md:p-8 overflow-auto flex justify-center">
        <div className={`h-full ${getIframeWidth()} transition-all duration-300 bg-white rounded-md overflow-hidden shadow-2xl`}>
          <iframe
            src={path}
            className="w-full h-full border-0"
            title="Preview"
          />
        </div>
      </div>
    </div>
  );
}
