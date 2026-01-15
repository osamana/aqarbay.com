'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function AdminIndexPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    
    if (token) {
      // If logged in, go to dashboard
      router.replace(`/${locale}/admin/dashboard`);
    } else {
      // If not logged in, go to login
      router.replace(`/${locale}/admin/login`);
    }
  }, [locale, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div>Redirecting...</div>
    </div>
  );
}

