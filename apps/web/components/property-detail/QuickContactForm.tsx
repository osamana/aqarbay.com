'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { submitLead } from '@/lib/api';
import { MessageSquare } from 'lucide-react';

interface QuickContactFormProps {
  propertyId: string;
  propertyTitle: string;
  locale: string;
}

export default function QuickContactForm({ propertyId, propertyTitle, locale }: QuickContactFormProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: locale === 'ar' 
      ? `مرحباً، أنا مهتم بـ ${propertyTitle}` 
      : `Hello, I'm interested in ${propertyTitle}`,
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      await submitLead({
        property_id: propertyId,
        ...formData,
      });
      setStatus('success');
      setFormData({
        name: '',
        phone: '',
        email: '',
        message: locale === 'ar' 
          ? `مرحباً، أنا مهتم بـ ${propertyTitle}` 
          : `Hello, I'm interested in ${propertyTitle}`,
      });
      setTimeout(() => {
        setStatus('idle');
        setIsExpanded(false);
      }, 3000);
    } catch (error) {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  if (!isExpanded) {
    return (
      <Button
        onClick={() => setIsExpanded(true)}
        variant="outline"
        className="w-full border-2 border-yellow-400 text-yellow-600 hover:bg-yellow-50 h-12"
      >
        <MessageSquare className="w-5 h-5 mr-2" />
        {locale === 'ar' ? 'إرسال استفسار' : 'Send Inquiry'}
      </Button>
    );
  }

  return (
    <div className="border-2 border-yellow-400 rounded-lg p-4 bg-yellow-50/30">
      <h4 className="font-semibold mb-3 text-gray-800">
        {locale === 'ar' ? 'إرسال استفسار' : 'Send Inquiry'}
      </h4>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <Input
            required
            placeholder={locale === 'ar' ? 'الاسم *' : 'Name *'}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="border-2 focus:ring-2 focus:ring-yellow-400 bg-white"
          />
        </div>

        <div>
          <Input
            required
            type="tel"
            placeholder={locale === 'ar' ? 'رقم الهاتف *' : 'Phone Number *'}
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="border-2 focus:ring-2 focus:ring-yellow-400 bg-white"
          />
        </div>

        <div>
          <Input
            type="email"
            placeholder={locale === 'ar' ? 'البريد الإلكتروني' : 'Email'}
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="border-2 focus:ring-2 focus:ring-yellow-400 bg-white"
          />
        </div>

        <div>
          <textarea
            className="w-full px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 bg-white resize-none"
            rows={3}
            placeholder={locale === 'ar' ? 'رسالتك...' : 'Your message...'}
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          />
        </div>

        {status === 'success' && (
          <div className="bg-green-100 border border-green-400 text-green-800 p-3 rounded-lg text-sm">
            {locale === 'ar' ? 'تم إرسال رسالتك بنجاح!' : 'Your message has been sent successfully!'}
          </div>
        )}

        {status === 'error' && (
          <div className="bg-red-100 border border-red-400 text-red-800 p-3 rounded-lg text-sm">
            {locale === 'ar' ? 'حدث خطأ. يرجى المحاولة مرة أخرى.' : 'An error occurred. Please try again.'}
          </div>
        )}

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsExpanded(false)}
            className="flex-1 border-2"
            disabled={status === 'loading'}
          >
            {locale === 'ar' ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600"
            disabled={status === 'loading'}
          >
            {status === 'loading' 
              ? (locale === 'ar' ? 'جاري الإرسال...' : 'Sending...') 
              : (locale === 'ar' ? 'إرسال' : 'Send')}
          </Button>
        </div>
      </form>
    </div>
  );
}

