'use client';

import Link from 'next/link';
import { Property } from '@/lib/api';
import { getImageUrl } from '@/lib/utils';
import { MapPin, Home, Bed, Bath } from 'lucide-react';

interface PropertyMarkerPopupProps {
  property: Property;
  locale: string;
}

export default function PropertyMarkerPopup({ property, locale }: PropertyMarkerPopupProps) {
  const title = locale === 'ar' ? property.title_ar : property.title_en;
  const slug = locale === 'ar' ? property.slug_ar : property.slug_en;
  const imageUrl = getImageUrl(property.first_image || property.images?.[0]?.file_key);
  const locationName = property.location 
    ? (locale === 'ar' ? property.location.name_ar : property.location.name_en)
    : '';

  const formatPrice = (amount: number, currency: string) => {
    const symbols: { [key: string]: string } = {
      'ILS': '₪',
      'USD': '$',
      'JOD': 'JOD'
    };
    return `${symbols[currency] || currency} ${amount.toLocaleString()}`;
  };

  return (
    <div className="p-2">
      {/* Image */}
      <div className="relative h-32 mb-3 rounded-md overflow-hidden">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover"
        />
        {property.featured && (
          <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium">
            {locale === 'ar' ? 'مميز' : 'Featured'}
          </div>
        )}
      </div>

      {/* Title */}
      <h3 className="font-bold text-base mb-2 line-clamp-2">{title}</h3>

      {/* Price */}
      <div className="text-primary font-bold text-lg mb-2">
        {formatPrice(property.price_amount, property.price_currency)}
        {property.purpose === 'rent' && (
          <span className="text-sm text-muted-foreground">
            {locale === 'ar' ? '/شهر' : '/month'}
          </span>
        )}
      </div>

      {/* Location */}
      {locationName && (
        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
          <MapPin className="h-3 w-3" />
          <span>{locationName}</span>
        </div>
      )}

      {/* Features */}
      <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
        {property.area_m2 && (
          <div className="flex items-center gap-1">
            <Home className="h-3 w-3" />
            <span>{property.area_m2} {locale === 'ar' ? 'م²' : 'm²'}</span>
          </div>
        )}
        {property.bedrooms && (
          <div className="flex items-center gap-1">
            <Bed className="h-3 w-3" />
            <span>{property.bedrooms}</span>
          </div>
        )}
        {property.bathrooms && (
          <div className="flex items-center gap-1">
            <Bath className="h-3 w-3" />
            <span>{property.bathrooms}</span>
          </div>
        )}
      </div>

      {/* View Details Link */}
      <Link
        href={`/${locale}/listings/${slug}`}
        className="block w-full text-center bg-primary text-primary-foreground py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
      >
        {locale === 'ar' ? 'عرض التفاصيل' : 'View Details'}
      </Link>
    </div>
  );
}

