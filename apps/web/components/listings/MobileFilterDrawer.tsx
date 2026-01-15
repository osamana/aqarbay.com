'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, SlidersHorizontal } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

interface MobileFilterDrawerProps {
  locale: string;
  locations: Array<{ id: string; name_en: string; name_ar: string; slug_en: string; slug_ar: string }>;
}

const propertyTypes = [
  { value: 'apartment', labelEn: 'Apartment', labelAr: 'شقة' },
  { value: 'house', labelEn: 'House', labelAr: 'منزل' },
  { value: 'villa', labelEn: 'Villa', labelAr: 'فيلا' },
  { value: 'land', labelEn: 'Land', labelAr: 'أرض' },
  { value: 'commercial', labelEn: 'Commercial', labelAr: 'تجاري' },
  { value: 'office', labelEn: 'Office', labelAr: 'مكتب' },
  { value: 'store', labelEn: 'Store', labelAr: 'متجر' },
];

export default function MobileFilterDrawer({ locale, locations }: MobileFilterDrawerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  
  const [purpose, setPurpose] = useState(searchParams.get('purpose') || '');
  const [type, setType] = useState(searchParams.get('type') || '');
  const [location, setLocation] = useState(searchParams.get('location_slug') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('min_price') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '');
  const [bedrooms, setBedrooms] = useState(searchParams.get('bedrooms') || '');
  const [bathrooms, setBathrooms] = useState(searchParams.get('bathrooms') || '');

  const activeFilterCount = [purpose, type, location, minPrice, maxPrice, bedrooms, bathrooms].filter(Boolean).length;

  const applyFilters = () => {
    const params = new URLSearchParams();
    
    if (purpose) params.set('purpose', purpose);
    if (type) params.set('type', type);
    if (location) params.set('location_slug', location);
    if (minPrice) params.set('min_price', minPrice);
    if (maxPrice) params.set('max_price', maxPrice);
    if (bedrooms) params.set('bedrooms', bedrooms);
    if (bathrooms) params.set('bathrooms', bathrooms);

    router.push(`/${locale}/listings?${params.toString()}`);
    setIsOpen(false);
  };

  const resetFilters = () => {
    setPurpose('');
    setType('');
    setLocation('');
    setMinPrice('');
    setMaxPrice('');
    setBedrooms('');
    setBathrooms('');
    router.push(`/${locale}/listings`);
    setIsOpen(false);
  };

  return (
    <>
      {/* Filter Button */}
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="fixed bottom-4 right-4 z-30 md:hidden shadow-lg bg-white border-2 border-yellow-400"
      >
        <SlidersHorizontal className="w-4 h-4 mr-2" />
        {locale === 'ar' ? 'الفلاتر' : 'Filters'}
        {activeFilterCount > 0 && (
          <span className="ml-2 bg-yellow-400 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
            {activeFilterCount}
          </span>
        )}
      </Button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 md:hidden transform transition-transform duration-300 ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ maxHeight: '85vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold">
            {locale === 'ar' ? 'الفلاتر' : 'Filters'}
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-4 space-y-4" style={{ maxHeight: 'calc(85vh - 140px)' }}>
          {/* Purpose */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {locale === 'ar' ? 'الغرض' : 'Purpose'}
            </label>
            <select
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 bg-white"
            >
              <option value="">{locale === 'ar' ? 'الكل' : 'All'}</option>
              <option value="sell">{locale === 'ar' ? 'للبيع' : 'For Sale'}</option>
              <option value="rent">{locale === 'ar' ? 'للإيجار' : 'For Rent'}</option>
            </select>
          </div>

          {/* Property Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {locale === 'ar' ? 'نوع العقار' : 'Property Type'}
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 bg-white"
            >
              <option value="">{locale === 'ar' ? 'الكل' : 'All Types'}</option>
              {propertyTypes.map((pt) => (
                <option key={pt.value} value={pt.value}>
                  {locale === 'ar' ? pt.labelAr : pt.labelEn}
                </option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {locale === 'ar' ? 'الموقع' : 'Location'}
            </label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 bg-white"
            >
              <option value="">{locale === 'ar' ? 'كل المواقع' : 'All Locations'}</option>
              {locations.map((loc) => (
                <option key={loc.id} value={locale === 'ar' ? loc.slug_ar : loc.slug_en}>
                  {locale === 'ar' ? loc.name_ar : loc.name_en}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {locale === 'ar' ? 'نطاق السعر' : 'Price Range'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder={locale === 'ar' ? 'الحد الأدنى' : 'Min Price'}
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="border-2 focus:ring-2 focus:ring-yellow-400 h-12"
              />
              <Input
                type="number"
                placeholder={locale === 'ar' ? 'الحد الأقصى' : 'Max Price'}
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="border-2 focus:ring-2 focus:ring-yellow-400 h-12"
              />
            </div>
          </div>

          {/* Bedrooms */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {locale === 'ar' ? 'غرف النوم' : 'Bedrooms'}
            </label>
            <select
              value={bedrooms}
              onChange={(e) => setBedrooms(e.target.value)}
              className="w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 bg-white"
            >
              <option value="">{locale === 'ar' ? 'أي' : 'Any'}</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
              <option value="5">5+</option>
            </select>
          </div>

          {/* Bathrooms */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {locale === 'ar' ? 'الحمامات' : 'Bathrooms'}
            </label>
            <select
              value={bathrooms}
              onChange={(e) => setBathrooms(e.target.value)}
              className="w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 bg-white"
            >
              <option value="">{locale === 'ar' ? 'أي' : 'Any'}</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
            </select>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t bg-white grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={resetFilters}
            className="border-2 h-12"
          >
            {locale === 'ar' ? 'إعادة تعيين' : 'Reset'}
          </Button>
          <Button
            onClick={applyFilters}
            className="bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 h-12"
          >
            {locale === 'ar' ? 'تطبيق' : 'Apply Filters'}
          </Button>
        </div>
      </div>
    </>
  );
}

