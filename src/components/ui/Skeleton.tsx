import React from 'react';
import { cn } from '@/lib/utils';

export function SkeletonBox({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-2xl bg-slate-200 dark:bg-zinc-800/80', className)}
      {...props}
    />
  );
}

export function SkeletonText({
  className,
  lines = 1,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { lines?: number }) {
  return (
    <div className={cn('space-y-2', className)} {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBox
          key={i}
          className={cn('h-4 w-full', i === lines - 1 && lines > 1 ? 'w-2/3' : '')}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col gap-4 p-5 rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0e0e18] shadow-sm', className)}>
      <SkeletonBox className="aspect-[4/3] w-full rounded-2xl" />
      <SkeletonText lines={2} className="mt-2" />
      <div className="flex items-center justify-between mt-4">
        <SkeletonBox className="h-6 w-16" />
        <SkeletonBox className="h-8 w-24 rounded-xl" />
      </div>
    </div>
  );
}

export function SkeletonAvatar({ className }: { className?: string }) {
  return <SkeletonBox className={cn('h-10 w-10 rounded-2xl', className)} />;
}
