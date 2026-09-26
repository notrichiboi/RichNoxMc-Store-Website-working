'use client';

import React, { useEffect, useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { getRules, getRuleCategories } from '@/lib/firestore/content';
import type { Rule, RuleCategory } from '@/lib/types';
import { BookOpen, Shield, AlertTriangle } from 'lucide-react';

export const dynamic = 'force-dynamic';

function RuleCard({ rule }: { rule: Rule }) {
  return (
    <div className="flex gap-4 p-5 bg-white dark:bg-[#0e0e18] border border-slate-200/90 dark:border-white/10 rounded-3xl hover:border-blue-500/40 dark:hover:border-blue-500/40 transition-all shadow-sm">
      <div className="shrink-0">
        <div className="w-9 h-9 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/40 flex items-center justify-center">
          <span className="text-xs font-black text-blue-600 dark:text-blue-400">{rule.number}</span>
        </div>
      </div>
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-base">{rule.icon || '📋'}</span>
          <h3 className="font-black text-slate-900 dark:text-white text-sm">{rule.title}</h3>
        </div>
        <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">{rule.description}</p>
      </div>
    </div>
  );
}

export default function RulesPage() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [categories, setCategories] = useState<RuleCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  useEffect(() => {
    Promise.all([getRules(), getRuleCategories()])
      .then(([r, c]) => {
        setRules(r.filter(x => x.enabled));
        setCategories(c.filter(x => x.enabled));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const categoriesWithRules = [
    { id: 'all', name: 'All Rules', icon: '📜' },
    ...categories,
  ];

  const filteredRules = activeCategory === 'all'
    ? rules
    : rules.filter(r => r.category === activeCategory);

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-slate-900 dark:text-white transition-colors duration-300">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/40 mb-4 shadow-sm">
            <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
            Server Guidelines &amp; Rules
          </h1>
          <p className="text-slate-600 dark:text-zinc-400 max-w-lg mx-auto text-xs sm:text-sm leading-relaxed">
            Please review our community guidelines to ensure a fair, respectful, and safe Minecraft environment for all players.
          </p>
        </div>

        {/* Warning banner */}
        <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 rounded-3xl p-4 sm:p-5 mb-8">
          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-300 font-medium leading-relaxed">
            Violating server rules may result in mutes, kicks, temporary bans, or permanent removal from NightmareMC. Ignorance of the rules is not an excuse.
          </p>
        </div>

        {/* Category tabs */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {categoriesWithRules.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
                  activeCategory === cat.id
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'bg-white dark:bg-[#0e0e18] text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-white/10 hover:border-slate-300'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-20 rounded-3xl bg-white dark:bg-[#0e0e18] border border-slate-200 dark:border-white/10 animate-pulse" />
            ))}
          </div>
        ) : filteredRules.length === 0 ? (
          <div className="bg-white dark:bg-[#0e0e18] border border-slate-200/90 dark:border-white/10 rounded-3xl p-16 text-center shadow-sm">
            <BookOpen className="h-12 w-12 text-slate-300 dark:text-zinc-700 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 dark:text-zinc-200 mb-1">No rules defined yet</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-500">Rules are configured from the admin panel.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRules.map(rule => (
              <RuleCard key={rule.id} rule={rule} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
