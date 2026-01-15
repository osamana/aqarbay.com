'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { formatPrice, getImageUrl } from '@/lib/utils';
import { Property } from '@/lib/api';
import { BedDouble, Bath, Maximize, MapPin, Navigation, Heart, Share2 } from 'lucide-react';
import { isFavorite, toggleFavorite } from '@/lib/favorites';
import { shareProperty } from '@/lib/sharing';

interface PropertyCardProps {
  property: Property;
  locale: string;
  onLocate?: () => void;
  onFavoriteChange?: () => void;
}

export default function PropertyCard({ property, locale, onLocate, onFavoriteChange }: PropertyCardProps) {
  const t = useTranslations('common');
  const [favorited, setFavorited] = useState(false);
  
  useEffect(() => {
    setFavorited(isFavorite(property.id));
  }, [property.id]);
  
  const title = locale === 'ar' ? property.title_ar : property.title_en;
  const slug = locale === 'ar' ? property.slug_ar : property.slug_en;
  const imageUrl = getImageUrl(property.first_image || property.images?.[0]?.file_key);
  
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newState = toggleFavorite(property.id);
    setFavorited(newState);
    if (onFavoriteChange) {
      onFavoriteChange();
    }
  };
  
  const handleShareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    shareProperty(property, locale);
  };

  // Get property type label
  const getTypeLabel = (type: string) => {
    const types: Record<string, { en: string; ar: string }> = {
      apartment: { en: 'Apartment', ar: 'شقة' },
      house: { en: 'House', ar: 'منزل' },
      villa: { en: 'Villa', ar: 'فيلا' },
      land: { en: 'Land', ar: 'أرض' },
      commercial: { en: 'Commercial', ar: 'تجاري' },
      office: { en: 'Office', ar: 'مكتب' },
      store: { en: 'Store', ar: 'متجر' },
    };
    return locale === 'ar' ? types[type]?.ar : types[type]?.en;
  };

  return (
    <Link href={`/${locale}/listings/${slug}`}>
      <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-yellow-400/30 group h-full">
        <div className="aspect-video relative overflow-hidden bg-gradient-to-br from-muted to-muted/50">
          <img
            src={imageUrl}
            alt={title}
            className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
          />
          
          {/* Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {property.featured && (
              <div className="bg-white/95 backdrop-blur-md text-amber-600 px-3 py-1.5 rounded-full text-xs font-medium shadow-sm border border-amber-100/50 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 fill-amber-500" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {t('featured')}
              </div>
            )}
            {property.type && (
              <div className="bg-white/95 backdrop-blur-md text-gray-700 px-3 py-1.5 rounded-full text-xs font-medium shadow-sm border border-gray-200/50">
                {getTypeLabel(property.type)}
              </div>
            )}
          </div>

          {/* Purpose Badge */}
          <div className="absolute top-3 right-3">
            <div className={`px-3 py-1.5 rounded-full text-xs font-medium shadow-sm border backdrop-blur-md ${
              property.purpose === 'sell' 
                ? 'bg-emerald-50/95 text-emerald-700 border-emerald-200/50' 
                : 'bg-amber-50/95 text-amber-700 border-amber-200/50'
            }`}>
              {property.purpose === 'sell' 
                ? (locale === 'ar' ? 'للبيع' : 'For Sale')
                : (locale === 'ar' ? 'للإيجار' : 'For Rent')
              }
            </div>
          </div>

          {/* Action Buttons - Bottom Right Corner */}
          <div className="absolute bottom-3 right-3 flex gap-2">
            {/* Favorite Button */}
            <button
              onClick={handleFavoriteClick}
              className={`w-9 h-9 rounded-full backdrop-blur-md border shadow-lg flex items-center justify-center transition-all duration-200 group-hover:scale-110 ${
                favorited
                  ? 'bg-red-50/95 border-red-400/60 text-red-600 hover:bg-red-100'
                  : 'bg-white/95 border-yellow-400/60 text-yellow-700 hover:bg-yellow-50 hover:border-yellow-500'
              }`}
              title={locale === 'ar' ? (favorited ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة') : (favorited ? 'Remove from favorites' : 'Add to favorites')}
            >
              <Heart className={`w-4 h-4 ${favorited ? 'fill-current' : ''}`} />
            </button>
            
            {/* Share Button */}
            <button
              onClick={handleShareClick}
              className="w-9 h-9 rounded-full bg-white/95 backdrop-blur-md border border-yellow-400/60 text-yellow-700 hover:bg-yellow-50 hover:border-yellow-500 hover:text-yellow-800 shadow-lg flex items-center justify-center transition-all duration-200 group-hover:scale-110"
              title={locale === 'ar' ? 'مشاركة' : 'Share'}
            >
              <Share2 className="w-4 h-4" />
            </button>
            
            {/* Locate on Map Button */}
          {onLocate && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onLocate();
                }}
                disabled={!property.lat && !property.lng && (!property.location?.lat || !property.location?.lng)}
                className="w-9 h-9 rounded-full bg-white/95 backdrop-blur-md border border-yellow-400/60 text-yellow-700 hover:bg-yellow-50 hover:border-yellow-500 hover:text-yellow-800 shadow-lg flex items-center justify-center transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white/95 group-hover:scale-110"
                title={locale === 'ar' ? 'تحديد على الخريطة' : 'Locate on Map'}
              >
                <Navigation className="w-4 h-4" />
              </button>
            )}
            </div>
        </div>

        <CardContent className="p-5">
          {/* Title */}
          <h3 className="font-bold text-lg mb-3 line-clamp-2 group-hover:text-yellow-600 transition-colors min-h-[3.5rem]">
            {title}
          </h3>

          {/* Location */}
          {property.location && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span className="line-clamp-1">
                {locale === 'ar' ? property.location.name_ar : property.location.name_en}
              </span>
            </div>
          )}

          {/* Features */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4 pb-4 border-b">
            {property.bedrooms && (
              <div className="flex items-center gap-1.5">
                <BedDouble className="w-4 h-4" />
                <span className="font-medium">{property.bedrooms}</span>
              </div>
            )}
            {property.bathrooms && (
              <div className="flex items-center gap-1.5">
                <Bath className="w-4 h-4" />
                <span className="font-medium">{property.bathrooms}</span>
              </div>
            )}
            {property.area_m2 && (
              <div className="flex items-center gap-1.5">
                <Maximize className="w-4 h-4" />
                <span className="font-medium">{property.area_m2} {t('m2')}</span>
              </div>
            )}
          </div>

          {/* Price */}
          <div className="flex items-center justify-between">
            <div className="text-yellow-600 text-2xl font-bold">
              {formatPrice(Number(property.price_amount), property.price_currency)}
            </div>
            <div className="text-xs text-muted-foreground">
              {property.purpose === 'rent' && (locale === 'ar' ? '/شهر' : '/month')}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
