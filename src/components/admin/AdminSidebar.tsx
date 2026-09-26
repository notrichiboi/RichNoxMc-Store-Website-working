'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  Layers, 
  Box,
  Home,
  Navigation,
  Palette,
  Image as ImageIcon,
  MessageSquare,
  Users,
  ThumbsUp,
  BookOpen,
  Server,
  CreditCard,
  Settings,
  Shield,
  Eye,
  LogOut,
  Menu,
  X,
  Type,
  Mail,
  Music
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/hooks/useAuth';

const sections = [
  {
    title: 'STORE',
    items: [
      { label: 'Products', href: '/admin/products', icon: Package },
      { label: 'Categories', href: '/admin/categories', icon: Layers },
      { label: 'Bundles', href: '/admin/bundles', icon: Box },
    ]
  },
  {
    title: 'WEBSITE',
    items: [
      { label: 'Homepage', href: '/admin/homepage', icon: Home },
      { label: 'Navigation', href: '/admin/navigation', icon: Navigation },
      { label: 'Theme', href: '/admin/theme', icon: Palette },
      { label: 'Background & Particles', href: '/admin/background', icon: ImageIcon },
      { label: 'Logo', href: '/admin/logo', icon: Type },
      { label: 'Music & Audio', href: '/admin/music', icon: Music },
      { label: 'Footer, Owner & Buy', href: '/admin/footer', icon: Mail },
    ]
  },
  {
    title: 'COMMUNITY',
    items: [
      { label: 'Discord', href: '/admin/discord', icon: MessageSquare },
      { label: 'Patrons', href: '/admin/patrons', icon: Users },
      { label: 'Vote', href: '/admin/vote', icon: ThumbsUp },
      { label: 'Rules', href: '/admin/rules', icon: BookOpen },
    ]
  },
  {
    title: 'SERVER',
    items: [
      { label: 'Server Settings', href: '/admin/server', icon: Server },
    ]
  },
  {
    title: 'PAYMENT INFORMATION',
    items: [
      { label: 'Payment Instructions', href: '/admin/payment', icon: CreditCard },
    ]
  },
  {
    title: 'SYSTEM',
    items: [
      { label: 'Site Settings', href: '/admin/settings', icon: Settings },
      { label: 'Admins', href: '/admin/admins', icon: Shield },
      { label: 'Preview', href: '/admin/preview', icon: Eye },
    ]
  }
];

// ─── Sidebar inner content as a standalone component (NOT inline) ────────────
function SidebarContent({ pathname, onClose, onLogout }: {
  pathname: string;
  onClose: () => void;
  onLogout: () => void;
}) {
  return (
    <div className="flex flex-col h-full bg-[#0d0d14] border-r border-zinc-800/50 w-64 flex-shrink-0 text-zinc-300">
      <div className="p-6 border-b border-zinc-800/50 flex items-center justify-between">
        <Link href="/admin" onClick={onClose} className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded bg-purple-600 flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(204,51,255,0.4)]">
            N
          </div>
          <div>
            <div className="font-bold text-white tracking-wide text-sm">NIGHTMARE</div>
            <div className="text-[10px] font-medium text-purple-400 tracking-wider">ADMIN PANEL</div>
          </div>
        </Link>
        <button className="md:hidden text-zinc-400 hover:text-white" onClick={onClose}>
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
        <div className="px-3">
          <Link 
            href="/admin" 
            onClick={onClose}
            className={cn(
              "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors group",
              pathname === '/admin' 
                ? "bg-purple-600/10 text-purple-400 font-medium" 
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
            )}
          >
            <LayoutDashboard size={18} className={pathname === '/admin' ? "text-purple-400" : "text-zinc-500 group-hover:text-zinc-400"} />
            <span>Dashboard</span>
          </Link>
        </div>

        {sections.map((section, idx) => (
          <div key={idx} className="px-3">
            <h3 className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2 px-3">
              {section.title}
            </h3>
            <div className="space-y-1">
              {section.items.map((item, itemIdx) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link 
                    key={itemIdx}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors group",
                      isActive 
                        ? "bg-purple-600/10 text-purple-400 font-medium" 
                        : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                    )}
                  >
                    <item.icon size={18} className={isActive ? "text-purple-400" : "text-zinc-500 group-hover:text-zinc-400"} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-zinc-800/50">
        <button 
          onClick={onLogout} 
          className="flex items-center justify-center space-x-2 w-full py-2.5 rounded-lg bg-zinc-800/50 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          <LogOut size={16} />
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
}

// ─── Main exported sidebar shell ─────────────────────────────────────────────
export function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  
  const handleLogout = () => logout();
  const closeSidebar = () => setIsOpen(false);
  const toggleSidebar = () => setIsOpen(prev => !prev);

  return (
    <>
      <button 
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-[#0d0d14] border border-zinc-800 rounded-md text-zinc-400"
        onClick={toggleSidebar}
      >
        <Menu size={20} />
      </button>

      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          onClick={closeSidebar}
        />
      )}

      <div className={cn(
        "fixed inset-y-0 left-0 z-50 md:z-0 md:static transform transition-transform duration-300 ease-in-out h-screen",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <SidebarContent
          pathname={pathname}
          onClose={closeSidebar}
          onLogout={handleLogout}
        />
      </div>
    </>
  );
}
