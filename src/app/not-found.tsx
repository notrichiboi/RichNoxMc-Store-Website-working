import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#07070d] flex flex-col items-center justify-center px-4 text-center transition-colors">
      <div className="relative z-10 max-w-md mx-auto">
        {/* 404 */}
        <div className="mb-4">
          <h1 className="text-[100px] sm:text-[140px] font-black text-transparent bg-clip-text bg-gradient-to-b from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-500 leading-none select-none">
            404
          </h1>
        </div>

        {/* Error message */}
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-2">
            Lost in the Void?
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 leading-relaxed">
            Looks like you fell into the end void. This page doesn&apos;t exist — or maybe it got moved by staff.
          </p>
        </div>

        {/* CTA buttons */}
        <div className="flex flex-wrap gap-3 items-center justify-center">
          <Link
            href="/"
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm tracking-wide transition-all shadow-lg shadow-blue-500/25"
          >
            ← Back to Home
          </Link>
          <Link
            href="/store"
            className="px-6 py-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-700 font-bold text-xs sm:text-sm tracking-wide transition-all shadow-sm"
          >
            Browse Store
          </Link>
        </div>
      </div>
    </div>
  );
}
