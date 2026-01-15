'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { loginUser } from '@/lib/api';
import { setUserToken, setUserData } from '@/lib/auth';

export default function LoginPage({ params: { locale } }: { params: { locale: string } }) {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await loginUser({
        email: formData.email,
        password: formData.password,
      });

      // Store token and user data
      setUserToken(response.access_token);
      setUserData(response.user);

      // Redirect to profile or home
      const redirectTo = new URLSearchParams(window.location.search).get('redirect') || `/${locale}/profile`;
      router.push(redirectTo);
    } catch (err: any) {
      setError(err.message || (locale === 'ar' ? 'فشل تسجيل الدخول' : 'Login failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            {locale === 'ar' ? 'تسجيل الدخول' : 'Login'}
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
                {locale === 'ar' ? 'البريد الإلكتروني' : 'Email'}
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
                {locale === 'ar' ? 'كلمة المرور' : 'Password'}
              </label>
              <Input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder={locale === 'ar' ? 'كلمة المرور' : 'Password'}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading
                ? locale === 'ar' ? 'جاري تسجيل الدخول...' : 'Logging in...'
                : locale === 'ar' ? 'تسجيل الدخول' : 'Login'}
            </Button>

            <div className="text-center text-sm">
              <a
                href={`/${locale}/register`}
                className="text-primary hover:underline"
              >
                {locale === 'ar'
                  ? 'ليس لديك حساب؟ سجل الآن'
                  : "Don't have an account? Register"}
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

