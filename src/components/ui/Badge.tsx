import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2',
  {
    variants: {
      variant: {
        purple: 'border-transparent bg-purple-600 text-white shadow hover:bg-purple-700',
        red: 'border-transparent bg-red-600 text-white shadow hover:bg-red-700',
        yellow: 'border-transparent bg-yellow-500 text-zinc-950 shadow hover:bg-yellow-600',
        green: 'border-transparent bg-green-600 text-white shadow hover:bg-green-700',
        blue: 'border-transparent bg-blue-600 text-white shadow hover:bg-blue-700',
        gray: 'border-transparent bg-zinc-800 text-zinc-100 hover:bg-zinc-700',
        outline: 'text-zinc-100 border-zinc-700',
      },
      size: {
        sm: 'text-[10px] px-2 py-0',
        md: 'text-xs px-2.5 py-0.5',
      },
    },
    defaultVariants: {
      variant: 'purple',
      size: 'md',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  );
}
