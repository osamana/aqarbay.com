'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import * as adminApi from '@/lib/admin-api';

export default function AdminSettingsPage() {
  const params = useParams();
  const locale = params.locale as string;
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await adminApi.getSettings();
      setSettings(data);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await adminApi.updateSettings(settings);
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-1">Site Settings</h1>
        <p className="text-muted-foreground">Configure your website settings and preferences</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Site Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Site Name (English)</label>
                <Input
                  value={settings.site_name_en}
                  onChange={(e) => setSettings({ ...settings, site_name_en: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Site Name (Arabic)</label>
                <Input
                  value={settings.site_name_ar}
                  onChange={(e) => setSettings({ ...settings, site_name_ar: e.target.value })}
                  dir="rtl"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Primary Color</label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={settings.primary_color}
                  onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                  className="w-20"
                />
                <Input
                  value={settings.primary_color}
                  onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                  placeholder="#f5c325"
                  className="flex-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Contact Phone</label>
                <Input
                  type="tel"
                  value={settings.contact_phone || ''}
                  onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
                  placeholder="+970-599-123456"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">WhatsApp</label>
                <Input
                  type="tel"
                  value={settings.contact_whatsapp || ''}
                  onChange={(e) => setSettings({ ...settings, contact_whatsapp: e.target.value })}
                  placeholder="+970-599-123456"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Social Media</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Facebook URL</label>
                <Input
                  type="url"
                  value={settings.facebook_url || ''}
                  onChange={(e) => setSettings({ ...settings, facebook_url: e.target.value })}
                  placeholder="https://facebook.com/yourpage"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Instagram URL</label>
                <Input
                  type="url"
                  value={settings.instagram_url || ''}
                  onChange={(e) => setSettings({ ...settings, instagram_url: e.target.value })}
                  placeholder="https://instagram.com/yourpage"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>SEO Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Meta Title (English)</label>
                <Input
                  value={settings.meta_title_en || ''}
                  onChange={(e) => setSettings({ ...settings, meta_title_en: e.target.value })}
                  placeholder="Find Your Dream Property in Palestine"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Meta Title (Arabic)</label>
                <Input
                  value={settings.meta_title_ar || ''}
                  onChange={(e) => setSettings({ ...settings, meta_title_ar: e.target.value })}
                  placeholder="اعثر على عقارك المثالي في فلسطين"
                  dir="rtl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Meta Description (English)</label>
                <textarea
                  className="w-full px-3 py-2 border rounded-md"
                  rows={3}
                  value={settings.meta_desc_en || ''}
                  onChange={(e) => setSettings({ ...settings, meta_desc_en: e.target.value })}
                  placeholder="Browse properties for sale and rent across Palestine"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Meta Description (Arabic)</label>
                <textarea
                  className="w-full px-3 py-2 border rounded-md"
                  rows={3}
                  value={settings.meta_desc_ar || ''}
                  onChange={(e) => setSettings({ ...settings, meta_desc_ar: e.target.value })}
                  placeholder="تصفح العقارات للبيع والإيجار في جميع أنحاء فلسطين"
                  dir="rtl"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" disabled={saving} size="lg">
          {saving ? 'Saving...' : 'Save All Settings'}
        </Button>
      </form>
    </div>
  );
}
