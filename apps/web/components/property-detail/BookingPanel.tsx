'use client';

import { Property } from '@/lib/api';
import { formatPrice, getImageUrl } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Phone, MessageCircle } from 'lucide-react';
import QuickContactForm from './QuickContactForm';
import ScheduleVisitForm from './ScheduleVisitForm';

interface BookingPanelProps {
  property: Property;
  locale: string;
}

export default function BookingPanel({ property, locale }: BookingPanelProps) {
  const title = locale === 'ar' ? property.title_ar : property.title_en;

  return (
    <div className="lg:sticky lg:top-4 space-y-4">
      {/* Price Card */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-yellow-400/30 p-6">
        <div className="mb-4">
          <div className="text-sm text-muted-foreground mb-1">
            {locale === 'ar' ? 'السعر' : 'Price'}
          </div>
          <div className="text-yellow-600 text-3xl font-bold">
            {formatPrice(Number(property.price_amount), property.price_currency)}
          </div>
          {property.purpose === 'rent' && (
            <div className="text-sm text-muted-foreground">
              {locale === 'ar' ? '/شهر' : '/month'}
            </div>
          )}
        </div>

        {/* Purpose Badge */}
        <div className="mb-4">
          <span className={`inline-block px-4 py-2 rounded-lg text-sm font-semibold ${
            property.purpose === 'sell' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {property.purpose === 'sell' 
              ? (locale === 'ar' ? 'للبيع' : 'For Sale')
              : (locale === 'ar' ? 'للإيجار' : 'For Rent')
            }
          </span>
        </div>

        {/* Schedule Visit Form */}
        <div className="mb-3">
          <ScheduleVisitForm
            propertyId={property.id}
            propertyTitle={title}
            locale={locale}
          />
        </div>

        {/* Quick Contact Form */}
        <div className="mb-4">
          <QuickContactForm
            propertyId={property.id}
            propertyTitle={title}
            locale={locale}
          />
        </div>

        {/* Quick Action Buttons */}
        {property.agent && (
          <div className="space-y-2 pt-4 border-t">
            {property.agent.phone && (
              <Button
                className="w-full bg-green-600 hover:bg-green-700 h-11"
                asChild
              >
                <a href={`tel:${property.agent.phone}`}>
                  <Phone className="w-5 h-5 mr-2" />
                  {locale === 'ar' ? 'اتصل الآن' : 'Call Now'}
                </a>
              </Button>
            )}
            {property.agent.whatsapp && (
              <Button
                className="w-full bg-[#25D366] hover:bg-[#20BD5A] h-11"
                asChild
              >
                <a
                  href={`https://wa.me/${property.agent.whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  WhatsApp
                </a>
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Agent Card */}
      {property.agent && (
        <div className="bg-white rounded-xl shadow-lg border p-6">
          <h3 className="font-semibold text-lg mb-4 text-gray-800">
            {locale === 'ar' ? 'الوكيل العقاري' : 'Real Estate Agent'}
          </h3>
          
          <div className="flex items-start gap-4">
            {property.agent.photo_key ? (
              <img
                src={getImageUrl(property.agent.photo_key)}
                alt={property.agent.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-yellow-400"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-white font-bold text-xl">
                {property.agent.name.charAt(0).toUpperCase()}
              </div>
            )}
            
            <div className="flex-1">
              <div className="font-semibold text-gray-800 mb-1">
                {property.agent.name}
              </div>
              {property.agent.phone && (
                <a 
                  href={`tel:${property.agent.phone}`}
                  className="text-sm text-muted-foreground hover:text-yellow-600 block"
                >
                  {property.agent.phone}
                </a>
              )}
              {property.agent.email && (
                <a 
                  href={`mailto:${property.agent.email}`}
                  className="text-sm text-muted-foreground hover:text-yellow-600 block"
                >
                  {property.agent.email}
                </a>
              )}
            </div>
          </div>

          {property.agent.bio_en || property.agent.bio_ar ? (
            <p className="text-sm text-muted-foreground mt-4 line-clamp-3">
              {locale === 'ar' ? property.agent.bio_ar : property.agent.bio_en}
            </p>
          ) : null}
        </div>
      )}

      {/* Trust Indicators */}
      <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl border border-yellow-200 p-4">
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-gray-700">
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">
              {locale === 'ar' ? 'عقار موثق' : 'Verified Property'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">
              {locale === 'ar' ? 'دعم مجاني' : 'Free Support'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

