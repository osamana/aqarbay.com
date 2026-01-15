'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Shield, User, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getUserToken, getUserData, logout } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function Header({ locale }: { locale: string }) {
  const t = useTranslations('common');
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const token = getUserToken();
    const user = getUserData();
    setIsAuthenticated(!!token);
    setUserData(user);
  }, []);

  const handleLogout = () => {
    logout();
    setIsAuthenticated(false);
    setUserData(null);
    router.push(`/${locale}`);
  };

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-16">
          <Link href={`/${locale}`} className="flex items-center gap-3">
            <Image 
              src="/logo.png" 
              alt="Palestine Real Estate" 
              width={40} 
              height={40}
              className="object-contain"
            />
            <span className="text-xl font-bold hidden sm:block">
              Palestine Real Estate
            </span>
          </Link>

          <div className="flex items-center gap-6">
            <Link href={`/${locale}`} className="hover:text-primary">
              {t('home')}
            </Link>
            <Link href={`/${locale}/listings`} className="hover:text-primary">
              {t('listings')}
            </Link>
            <Link href={`/${locale}/locations`} className="hover:text-primary">
              {t('locations')}
            </Link>
            <Link href={`/${locale}/contact`} className="hover:text-primary">
              {t('contact')}
            </Link>

            {/* User Account Section */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 hover:border-gray-400 transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    {userData?.name || userData?.email?.split('@')[0] || 'User'}
                  </span>
                </button>
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                    <Link
                      href={`/${locale}/profile`}
                      className="block px-4 py-2 text-sm hover:bg-gray-50"
                      onClick={() => setShowUserMenu(false)}
                    >
                      {locale === 'ar' ? 'الملف الشخصي' : 'Profile'}
                    </Link>
                    <Link
                      href={`/${locale}/favorites`}
                      className="block px-4 py-2 text-sm hover:bg-gray-50"
                      onClick={() => setShowUserMenu(false)}
                    >
                      {locale === 'ar' ? 'المفضلة' : 'Favorites'}
                    </Link>
                    <Link
                      href={`/${locale}/saved-searches`}
                      className="block px-4 py-2 text-sm hover:bg-gray-50"
                      onClick={() => setShowUserMenu(false)}
                    >
                      {locale === 'ar' ? 'البحوث المحفوظة' : 'Saved Searches'}
                    </Link>
                    <Link
                      href={`/${locale}/email-alerts`}
                      className="block px-4 py-2 text-sm hover:bg-gray-50"
                      onClick={() => setShowUserMenu(false)}
                    >
                      {locale === 'ar' ? 'تنبيهات البريد' : 'Email Alerts'}
                    </Link>
                    <div className="border-t border-gray-200">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        {locale === 'ar' ? 'تسجيل الخروج' : 'Logout'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href={`/${locale}/login`}
                  className="px-3 py-1.5 text-sm hover:text-primary"
                >
                  {locale === 'ar' ? 'تسجيل الدخول' : 'Login'}
                </Link>
                <Link
                  href={`/${locale}/register`}
                  className="px-3 py-1.5 text-sm border border-primary text-primary rounded-md hover:bg-primary hover:text-white transition-colors"
                >
                  {locale === 'ar' ? 'تسجيل' : 'Register'}
                </Link>
              </div>
            )}

            <Link 
              href={`/${locale}/admin/dashboard`} 
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 hover:border-gray-400 transition-colors"
            >
              <Shield className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{locale === 'ar' ? 'الإدارة' : 'Admin'}</span>
            </Link>

            {/* Language Toggle */}
            <Link
              href={locale === 'en' ? '/ar' : '/en'}
              className="px-3 py-1 border rounded-md hover:bg-accent"
            >
              {locale === 'en' ? 'العربية' : 'English'}
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
