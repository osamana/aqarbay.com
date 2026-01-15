'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname, useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { LogOut, User, Menu } from 'lucide-react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Button } from '@/components/ui/button';

export default function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const router = useRouter();
  const pathname = usePathname();
  const routerParams = useParams();
  const locale = routerParams.locale as string;
  const isLoginPage = pathname?.includes('/admin/login');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('access_token');
    
    // Skip auth check for login page
    if (typeof window !== 'undefined' && !isLoginPage) {
      if (!token) {
        router.push(`/${params.locale}/admin/login`);
      }
    }
  }, [params.locale, router, isLoginPage]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.href = `/${locale}/admin/login`;
  };

  // Don't show sidebar on login page
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Get page title from pathname
  const getPageTitle = () => {
    if (pathname?.includes('/dashboard')) return 'Dashboard';
    if (pathname?.includes('/properties')) return 'Properties';
    if (pathname?.includes('/locations')) return 'Locations';
    if (pathname?.includes('/agents')) return 'Agents';
    if (pathname?.includes('/leads')) return 'Leads';
    if (pathname?.includes('/settings')) return 'Settings';
    return 'Admin Panel';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar - Full height on desktop, below header on mobile */}
      <AdminSidebar isMobileOpen={isMobileMenuOpen} onMobileClose={() => setIsMobileMenuOpen(false)} />
      
      {/* Mobile Header - Fixed at top, full width */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50 shadow-sm">
        <div className="h-full px-4 flex items-center justify-between">
          {/* Left: Logo and Branding */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5 text-gray-700" />
            </button>

            {/* Logo */}
            <Link href={`/${locale}`} className="flex items-center gap-3 min-w-0 flex-shrink-0">
              <div className="flex-shrink-0 w-8 h-8 relative">
                <Image
                  src="/logo.png"
                  alt="Logo"
                  width={32}
                  height={32}
                  className="object-contain"
                  priority
                />
              </div>
              <div className="font-semibold text-sm text-gray-900 truncate">
                {getPageTitle()}
              </div>
            </Link>
          </div>

          {/* Right: User Actions */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Logout Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="gap-2 hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="lg:ml-64 min-h-screen">
        {/* Desktop Header - Sticky, only spans main content area */}
        <header className="hidden lg:block sticky top-0 h-16 bg-white border-b border-gray-200 z-40 shadow-sm">
          <div className="h-full px-6 flex items-center justify-between">
            {/* Left: Logo and Branding */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {/* Logo */}
              <Link href={`/${locale}`} className="flex items-center gap-3 min-w-0 flex-shrink-0">
                <div className="flex-shrink-0 w-8 h-8 relative">
                  <Image
                    src="/logo.png"
                    alt="Logo"
                    width={32}
                    height={32}
                    className="object-contain"
                    priority
                  />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-base text-gray-900 truncate">
                    Palestine Real Estate
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {getPageTitle()}
                  </div>
                </div>
              </Link>
            </div>

            {/* Right: User Actions */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {/* User Info */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50">
                <User className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Admin</span>
              </div>

              {/* Logout Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="gap-2 hover:bg-red-50 hover:text-red-600"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="pt-16 lg:pt-0">
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
