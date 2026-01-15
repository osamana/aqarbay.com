'use client';

import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Home, 
  MapPin, 
  Users, 
  MessageSquare, 
  Settings,
  X
} from 'lucide-react';

const menuItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/properties', label: 'Properties', icon: Home },
  { href: '/admin/locations', label: 'Locations', icon: MapPin },
  { href: '/admin/agents', label: 'Agents', icon: Users },
  { href: '/admin/leads', label: 'Leads', icon: MessageSquare },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

interface AdminSidebarProps {
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

export default function AdminSidebar({ isMobileOpen, onMobileClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const params = useParams();
  const locale = params.locale as string;

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40 top-16"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar - Full height on desktop, below header on mobile */}
      <aside
        className={cn(
          "fixed left-0 w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm",
          "lg:top-16 lg:h-[calc(100vh-4rem)] lg:z-30",
          "top-16 h-[calc(100vh-4rem)] z-50",
          "lg:translate-x-0 transition-transform duration-300 ease-in-out",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Mobile Close Button */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <span className="text-sm font-semibold text-gray-700">Menu</span>
          <button
            onClick={onMobileClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-4 lg:py-6 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const href = `/${locale}${item.href}`;
            const isActive = pathname === href || pathname?.startsWith(href + '/');
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={href}
                onClick={onMobileClose}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group",
                  isActive
                    ? "bg-gradient-to-r from-yellow-400 to-amber-500 text-white shadow-sm"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <Icon className={cn(
                  "w-5 h-5 flex-shrink-0",
                  isActive ? "text-white" : "text-gray-600"
                )} />
                <span className={cn(
                  "font-medium text-sm",
                  isActive ? "text-white" : "text-gray-700"
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
