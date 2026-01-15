'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { getCurrentUser, updateUser, UserAccount } from '@/lib/api';
import { getUserToken, getUserData, logout as logoutUser } from '@/lib/auth';
import { Heart, Search, Mail, LogOut } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage({ params: { locale } }: { params: { locale: string } }) {
  const router = useRouter();
  const [user, setUser] = useState<UserAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const token = getUserToken();
    if (!token) {
      router.push(`/${locale}/login?redirect=/${locale}/profile`);
      return;
    }

    loadUser();
  }, []);

  const loadUser = async () => {
    const token = getUserToken();
    if (!token) return;

    try {
      const userData = await getCurrentUser(token);
      setUser(userData);
    } catch (err: any) {
      setError(err.message || 'Failed to load user data');
      // If token is invalid, logout
      if (err.message.includes('401') || err.message.includes('Unauthorized')) {
        logoutUser();
        router.push(`/${locale}/login`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const token = getUserToken();
    if (!token || !user) return;

    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const formData = new FormData(e.currentTarget);
      const updated = await updateUser(token, {
        name: formData.get('name') as string || undefined,
        phone: formData.get('phone') as string || undefined,
        locale: formData.get('locale') as string || undefined,
        currency: formData.get('currency') as string || undefined,
      });
      setUser(updated);
      setSuccess(locale === 'ar' ? 'تم التحديث بنجاح' : 'Updated successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logoutUser();
    router.push(`/${locale}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4">{locale === 'ar' ? 'جاري التحميل...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">
          {locale === 'ar' ? 'الملف الشخصي' : 'Profile'}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Profile Card */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>{locale === 'ar' ? 'معلومات الحساب' : 'Account Information'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdate} className="space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                    {success}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-1">
                    {locale === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                  </label>
                  <Input type="email" value={user.email} disabled />
                  <p className="text-xs text-gray-500 mt-1">
                    {locale === 'ar' ? 'لا يمكن تغيير البريد الإلكتروني' : 'Email cannot be changed'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    {locale === 'ar' ? 'الاسم' : 'Name'}
                  </label>
                  <Input
                    type="text"
                    name="name"
                    defaultValue={user.name || ''}
                    placeholder={locale === 'ar' ? 'اسمك الكامل' : 'Your full name'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    {locale === 'ar' ? 'الهاتف' : 'Phone'}
                  </label>
                  <Input
                    type="tel"
                    name="phone"
                    defaultValue={user.phone || ''}
                    placeholder={locale === 'ar' ? 'رقم الهاتف' : 'Phone number'}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {locale === 'ar' ? 'اللغة' : 'Language'}
                    </label>
                    <select
                      name="locale"
                      defaultValue={user.locale}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="en">English</option>
                      <option value="ar">العربية</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {locale === 'ar' ? 'العملة' : 'Currency'}
                    </label>
                    <select
                      name="currency"
                      defaultValue={user.currency}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="USD">USD</option>
                      <option value="ILS">ILS</option>
                      <option value="JOD">JOD</option>
                    </select>
                  </div>
                </div>

                <Button type="submit" disabled={saving}>
                  {saving
                    ? locale === 'ar' ? 'جاري الحفظ...' : 'Saving...'
                    : locale === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>{locale === 'ar' ? 'القائمة السريعة' : 'Quick Actions'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href={`/${locale}/favorites`}>
                <Button variant="outline" className="w-full justify-start">
                  <Heart className="w-4 h-4 mr-2" />
                  {locale === 'ar' ? 'المفضلة' : 'Favorites'}
                </Button>
              </Link>

              <Link href={`/${locale}/saved-searches`}>
                <Button variant="outline" className="w-full justify-start">
                  <Search className="w-4 h-4 mr-2" />
                  {locale === 'ar' ? 'البحوث المحفوظة' : 'Saved Searches'}
                </Button>
              </Link>

              <Link href={`/${locale}/email-alerts`}>
                <Button variant="outline" className="w-full justify-start">
                  <Mail className="w-4 h-4 mr-2" />
                  {locale === 'ar' ? 'تنبيهات البريد' : 'Email Alerts'}
                </Button>
              </Link>

              <Button
                variant="outline"
                className="w-full justify-start text-red-600 hover:text-red-700"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                {locale === 'ar' ? 'تسجيل الخروج' : 'Logout'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

