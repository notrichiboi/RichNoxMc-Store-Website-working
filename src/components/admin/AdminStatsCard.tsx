import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface AdminStatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  colorVariant?: 'purple' | 'blue' | 'green' | 'orange' | 'red' | 'zinc';
  className?: string;
}

export function AdminStatsCard({
  title,
  value,
  icon: Icon,
  colorVariant = 'purple',
  className
}: AdminStatsCardProps) {
  const colorStyles = {
    purple: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
    blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    green: 'text-green-500 bg-green-500/10 border-green-500/20',
    orange: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
    red: 'text-red-500 bg-red-500/10 border-red-500/20',
    zinc: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20',
  };

  return (
    <div className={cn("bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex items-center space-x-4", className)}>
      <div className={cn("p-3 rounded-lg border", colorStyles[colorVariant])}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-sm font-medium text-zinc-400">{title}</p>
        <p className="text-2xl font-bold text-white mt-1">{value}</p>
      </div>
    </div>
  );
}
