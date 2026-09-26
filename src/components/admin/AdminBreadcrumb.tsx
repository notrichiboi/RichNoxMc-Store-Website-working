import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface AdminBreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function AdminBreadcrumb({ items, className }: AdminBreadcrumbProps) {
  return (
    <nav className={cn("flex items-center space-x-2 text-sm text-zinc-400 mb-6", className)}>
      <Link href="/admin" className="hover:text-purple-400 transition-colors flex items-center">
        <Home className="h-4 w-4" />
      </Link>
      
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="h-4 w-4 text-zinc-600" />
          {item.href ? (
            <Link href={item.href} className="hover:text-purple-400 transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-zinc-200">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
