'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { registerUser, loginUser } from '@/lib/api';
import { setUserToken, setUserData } from '@/lib/auth';
import { useTranslations } from 'next-intl';

export default function RegisterPage({ params: { locale } }: { params: { locale: string } }) {
  const router = useRouter();
  const t = useTranslations();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      setError(locale === 'ar' ? 'كلمات المرور غير متطابقة' : 'Passwords do not match');
      return;
    }
    
    if (formData.password.length < 6) {
      setError(locale === 'ar' ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      // Register user
      await registerUser({
        email: formData.email,
        password: formData.password,
        name: formData.name || undefined,
        phone: formData.phone || undefined,
        locale,
        currency: 'USD',
      });

      // Auto-login after registration
      const loginResponse = await loginUser({
        email: formData.email,
        password: formData.password,
      });

      // Store token and user data
      setUserToken(loginResponse.access_token);
      setUserData(loginResponse.user);

      // Redirect to profile or home
      router.push(`/${locale}/profile`);
    } catch (err: any) {
      setError(err.message || (locale === 'ar' ? 'فشل التسجيل' : 'Registration failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            {locale === 'ar' ? 'إنشاء حساب جديد' : 'Create Account'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">
                {locale === 'ar' ? 'الاسم' : 'Name'} (اختياري / Optional)
              </label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={locale === 'ar' ? 'اسمك الكامل' : 'Your full name'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {locale === 'ar' ? 'البريد الإلكتروني' : 'Email'} *
              </label>
              <Input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder={locale === 'ar' ? 'example@email.com' : 'example@email.com'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {locale === 'ar' ? 'الهاتف' : 'Phone'} (اختياري / Optional)
              </label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder={locale === 'ar' ? 'رقم الهاتف' : 'Phone number'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {locale === 'ar' ? 'كلمة المرور' : 'Password'} *
              </label>
              <Input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder={locale === 'ar' ? '6 أحرف على الأقل' : 'At least 6 characters'}
                minLength={6}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {locale === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'} *
              </label>
              <Input
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder={locale === 'ar' ? 'أعد إدخال كلمة المرور' : 'Re-enter password'}
                minLength={6}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading
                ? locale === 'ar' ? 'جاري التسجيل...' : 'Registering...'
                : locale === 'ar' ? 'تسجيل' : 'Register'}
            </Button>

            <div className="text-center text-sm">
              <a
                href={`/${locale}/login`}
                className="text-primary hover:underline"
              >
                {locale === 'ar'
                  ? 'لديك حساب بالفعل؟ تسجيل الدخول'
                  : 'Already have an account? Login'}
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

