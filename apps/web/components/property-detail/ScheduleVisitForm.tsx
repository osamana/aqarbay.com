'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { submitLead } from '@/lib/api';
import { Calendar } from 'lucide-react';

interface ScheduleVisitFormProps {
  propertyId: string;
  propertyTitle: string;
  locale: string;
}

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'
];

export default function ScheduleVisitForm({ propertyId, propertyTitle, locale }: ScheduleVisitFormProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    date: '',
    time: '',
    notes: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // Get minimum date (tomorrow)
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateString = minDate.toISOString().split('T')[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const message = locale === 'ar'
        ? `طلب موعد لمعاينة: ${propertyTitle}\nالتاريخ: ${formData.date}\nالوقت: ${formData.time}\n${formData.notes ? `ملاحظات: ${formData.notes}` : ''}`
        : `Visit scheduling request for: ${propertyTitle}\nDate: ${formData.date}\nTime: ${formData.time}\n${formData.notes ? `Notes: ${formData.notes}` : ''}`;

      await submitLead({
        property_id: propertyId,
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        message,
      });

      setStatus('success');
      setFormData({
        name: '',
        phone: '',
        email: '',
        date: '',
        time: '',
        notes: '',
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
        className="w-full bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 h-12"
      >
        <Calendar className="w-5 h-5 mr-2" />
        {locale === 'ar' ? 'حجز موعد معاينة' : 'Schedule a Visit'}
      </Button>
    );
  }

  return (
    <div className="border-2 border-yellow-400 rounded-lg p-4 bg-gradient-to-br from-yellow-50 to-amber-50">
      <h4 className="font-semibold mb-3 text-gray-800">
        {locale === 'ar' ? 'حجز موعد معاينة' : 'Schedule a Visit'}
      </h4>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {locale === 'ar' ? 'تاريخ المعاينة *' : 'Visit Date *'}
            </label>
            <Input
              required
              type="date"
              min={minDateString}
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="border-2 focus:ring-2 focus:ring-yellow-400 bg-white"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {locale === 'ar' ? 'الوقت المفضل *' : 'Preferred Time *'}
            </label>
            <select
              required
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              className="w-full px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 bg-white"
            >
              <option value="">{locale === 'ar' ? 'اختر الوقت' : 'Select Time'}</option>
              {timeSlots.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            {locale === 'ar' ? 'الاسم *' : 'Name *'}
          </label>
          <Input
            required
            placeholder={locale === 'ar' ? 'اسمك الكامل' : 'Your full name'}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="border-2 focus:ring-2 focus:ring-yellow-400 bg-white"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            {locale === 'ar' ? 'رقم الهاتف *' : 'Phone Number *'}
          </label>
          <Input
            required
            type="tel"
            placeholder={locale === 'ar' ? 'رقم هاتفك' : 'Your phone number'}
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="border-2 focus:ring-2 focus:ring-yellow-400 bg-white"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            {locale === 'ar' ? 'البريد الإلكتروني' : 'Email'}
          </label>
          <Input
            type="email"
            placeholder={locale === 'ar' ? 'بريدك الإلكتروني' : 'Your email'}
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="border-2 focus:ring-2 focus:ring-yellow-400 bg-white"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            {locale === 'ar' ? 'ملاحظات إضافية' : 'Additional Notes'}
          </label>
          <textarea
            className="w-full px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 bg-white resize-none"
            rows={2}
            placeholder={locale === 'ar' ? 'أي ملاحظات أو طلبات خاصة...' : 'Any special notes or requests...'}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
        </div>

        {status === 'success' && (
          <div className="bg-green-100 border border-green-400 text-green-800 p-3 rounded-lg text-sm">
            {locale === 'ar' 
              ? 'تم حجز موعدك بنجاح! سنتواصل معك قريباً.' 
              : 'Your visit has been scheduled successfully! We will contact you soon.'}
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
              ? (locale === 'ar' ? 'جاري الحجز...' : 'Scheduling...') 
              : (locale === 'ar' ? 'تأكيد الحجز' : 'Confirm Booking')}
          </Button>
        </div>
      </form>
    </div>
  );
}

