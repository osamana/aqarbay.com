'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  subscribeEmailAlert,
  getMyEmailAlerts,
  updateEmailAlert,
  deleteEmailAlert,
  EmailAlert,
  EmailAlertCreate,
} from '@/lib/api';
import { getUserToken } from '@/lib/auth';
import { X, Plus } from 'lucide-react';

export default function EmailAlertsPage({ params: { locale } }: { params: { locale: string } }) {
  const router = useRouter();
  const [alerts, setAlerts] = useState<EmailAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<EmailAlertCreate>({
    email: '',
    name: '',
    query: '',
    frequency: 'daily',
    notify_featured: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = getUserToken();
    if (token) {
      loadAlerts();
    } else {
      // If not logged in, still allow subscribing with email
      setLoading(false);
    }
  }, []);

  const loadAlerts = async () => {
    const token = getUserToken();
    if (!token) return;

    try {
      const data = await getMyEmailAlerts(token);
      setAlerts(data);
    } catch (err: any) {
      console.error('Failed to load alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await subscribeEmailAlert(formData);
      setFormData({
        email: '',
        name: '',
        query: '',
        frequency: 'daily',
        notify_featured: true,
      });
      setShowForm(false);
      if (getUserToken()) {
        loadAlerts();
      } else {
        alert(locale === 'ar' ? 'تم الاشتراك بنجاح! تحقق من بريدك الإلكتروني' : 'Subscribed successfully! Check your email');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to subscribe');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (alertId: string) => {
    const token = getUserToken();
    if (!token) return;

    if (!confirm(locale === 'ar' ? 'هل أنت متأكد من حذف هذا التنبيه؟' : 'Are you sure you want to delete this alert?')) {
      return;
    }

    try {
      await deleteEmailAlert(token, alertId);
      loadAlerts();
    } catch (err: any) {
      alert(err.message || 'Failed to delete');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">
            {locale === 'ar' ? 'تنبيهات البريد الإلكتروني' : 'Email Alerts'}
          </h1>
          {!showForm && (
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              {locale === 'ar' ? 'اشتراك جديد' : 'New Alert'}
            </Button>
          )}
        </div>

        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>
                  {locale === 'ar' ? 'اشتراك في تنبيهات جديدة' : 'Subscribe to New Alerts'}
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubscribe} className="space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-1">
                    {locale === 'ar' ? 'البريد الإلكتروني' : 'Email'} *
                  </label>
                  <Input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="example@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    {locale === 'ar' ? 'اسم التنبيه' : 'Alert Name'} (اختياري / Optional)
                  </label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={locale === 'ar' ? 'مثل: شقق في رام الله' : 'e.g., Apartments in Ramallah'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    {locale === 'ar' ? 'كلمات البحث' : 'Search Keywords'} (اختياري / Optional)
                  </label>
                  <Input
                    type="text"
                    value={formData.query}
                    onChange={(e) => setFormData({ ...formData, query: e.target.value })}
                    placeholder={locale === 'ar' ? 'ابحث عن...' : 'Search for...'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    {locale === 'ar' ? 'تكرار الإشعارات' : 'Notification Frequency'}
                  </label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="instant">
                      {locale === 'ar' ? 'فوري' : 'Instant'}
                    </option>
                    <option value="daily">
                      {locale === 'ar' ? 'يومي' : 'Daily'}
                    </option>
                    <option value="weekly">
                      {locale === 'ar' ? 'أسبوعي' : 'Weekly'}
                    </option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="notify_featured"
                    checked={formData.notify_featured}
                    onChange={(e) => setFormData({ ...formData, notify_featured: e.target.checked })}
                    className="mr-2"
                  />
                  <label htmlFor="notify_featured" className="text-sm">
                    {locale === 'ar'
                      ? 'إشعارات للعقارات المميزة'
                      : 'Notifications for featured properties'}
                  </label>
                </div>

                <Button type="submit" disabled={submitting}>
                  {submitting
                    ? locale === 'ar' ? 'جاري الاشتراك...' : 'Subscribing...'
                    : locale === 'ar' ? 'اشتراك' : 'Subscribe'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : alerts.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-gray-500">
              {locale === 'ar'
                ? 'لا توجد تنبيهات نشطة'
                : 'No active alerts'}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <Card key={alert.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">
                        {alert.name || alert.email}
                      </h3>
                      {alert.query && (
                        <p className="text-sm text-gray-600 mb-2">
                          <strong>{locale === 'ar' ? 'البحث:' : 'Search:'}</strong> {alert.query}
                        </p>
                      )}
                      <div className="flex gap-4 text-sm text-gray-500">
                        <span>
                          <strong>{locale === 'ar' ? 'التكرار:' : 'Frequency:'}</strong>{' '}
                          {alert.frequency === 'instant'
                            ? locale === 'ar' ? 'فوري' : 'Instant'
                            : alert.frequency === 'daily'
                            ? locale === 'ar' ? 'يومي' : 'Daily'
                            : locale === 'ar' ? 'أسبوعي' : 'Weekly'}
                        </span>
                        {alert.notify_featured && (
                          <span>
                            {locale === 'ar' ? '✓ إشعارات مميزة' : '✓ Featured notifications'}
                          </span>
                        )}
                      </div>
                    </div>
                    {getUserToken() && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(alert.id)}
                        className="text-red-600"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

