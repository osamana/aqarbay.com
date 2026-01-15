'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, SlidersHorizontal, X } from 'lucide-react';

interface FilterBarProps {
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

const bedroomOptions = [
  { value: '1', label: '1+' },
  { value: '2', label: '2+' },
  { value: '3', label: '3+' },
  { value: '4', label: '4+' },
  { value: '5', label: '5+' },
];

const bathroomOptions = [
  { value: '1', label: '1+' },
  { value: '2', label: '2+' },
  { value: '3', label: '3+' },
  { value: '4', label: '4+' },
];

const sortOptions = [
  { value: 'newest', labelEn: 'Newest First', labelAr: 'الأحدث أولاً' },
  { value: 'price_asc', labelEn: 'Price: Low to High', labelAr: 'السعر: من الأقل للأعلى' },
  { value: 'price_desc', labelEn: 'Price: High to Low', labelAr: 'السعر: من الأعلى للأقل' },
];

export default function FilterBar({ locale, locations }: FilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [purpose, setPurpose] = useState(searchParams.get('purpose') || '');
  const [type, setType] = useState(searchParams.get('type') || '');
  const [location, setLocation] = useState(searchParams.get('location_slug') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('min_price') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '');
  const [bedrooms, setBedrooms] = useState(searchParams.get('bedrooms') || '');
  const [bathrooms, setBathrooms] = useState(searchParams.get('bathrooms') || '');
  const [minArea, setMinArea] = useState(searchParams.get('min_area') || '');
  const [maxArea, setMaxArea] = useState(searchParams.get('max_area') || '');
  const [yearBuilt, setYearBuilt] = useState(searchParams.get('year_built') || '');
  const [furnished, setFurnished] = useState(searchParams.get('furnished') || '');
  const [parking, setParking] = useState(searchParams.get('parking') || '');
  const [floor, setFloor] = useState(searchParams.get('floor') || '');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort_by') || 'newest');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const applyFilters = () => {
    const params = new URLSearchParams();
    
    if (searchQuery) params.set('q', searchQuery);
    if (purpose) params.set('purpose', purpose);
    if (type) params.set('type', type);
    if (location) params.set('location_slug', location);
    if (minPrice) params.set('min_price', minPrice);
    if (maxPrice) params.set('max_price', maxPrice);
    if (bedrooms) params.set('bedrooms', bedrooms);
    if (bathrooms) params.set('bathrooms', bathrooms);
    if (minArea) params.set('min_area', minArea);
    if (maxArea) params.set('max_area', maxArea);
    if (yearBuilt) params.set('year_built', yearBuilt);
    if (furnished) params.set('furnished', furnished);
    if (parking) params.set('parking', parking);
    if (floor) params.set('floor', floor);
    if (sortBy) params.set('sort_by', sortBy);

    router.push(`/${locale}/listings?${params.toString()}`);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setPurpose('');
    setType('');
    setLocation('');
    setMinPrice('');
    setMaxPrice('');
    setBedrooms('');
    setBathrooms('');
    setMinArea('');
    setMaxArea('');
    setYearBuilt('');
    setFurnished('');
    setParking('');
    setFloor('');
    setSortBy('newest');
    router.push(`/${locale}/listings`);
  };

  const activeFilterCount = [
    searchQuery, purpose, type, location, minPrice, maxPrice, 
    bedrooms, bathrooms, minArea, maxArea, yearBuilt, furnished, parking, floor
  ].filter(Boolean).length;

  return (
    <div className="bg-white border-b shadow-sm sticky top-0 z-20">
      <div className="container mx-auto px-4 py-4">
        {/* Search Input */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            {locale === 'ar' ? 'بحث' : 'Search'}
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder={locale === 'ar' ? 'ابحث عن عقار...' : 'Search for a property...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  applyFilters();
                }
              }}
              className="pl-10 border-2 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
            />
          </div>
        </div>
        
        {/* Main Filter Row */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-3">
          {/* Purpose */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {locale === 'ar' ? 'الغرض' : 'Purpose'}
            </label>
            <select
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 bg-white text-sm"
            >
              <option value="">{locale === 'ar' ? 'الكل' : 'All'}</option>
              <option value="sell">{locale === 'ar' ? 'للبيع' : 'For Sale'}</option>
              <option value="rent">{locale === 'ar' ? 'للإيجار' : 'For Rent'}</option>
            </select>
          </div>

          {/* Property Type */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {locale === 'ar' ? 'نوع العقار' : 'Property Type'}
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 bg-white text-sm"
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
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {locale === 'ar' ? 'الموقع' : 'Location'}
            </label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 bg-white text-sm"
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
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {locale === 'ar' ? 'السعر' : 'Price Range'}
            </label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder={locale === 'ar' ? 'من' : 'Min'}
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="border-2 focus:ring-2 focus:ring-yellow-400 text-sm h-10"
              />
              <Input
                type="number"
                placeholder={locale === 'ar' ? 'إلى' : 'Max'}
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="border-2 focus:ring-2 focus:ring-yellow-400 text-sm h-10"
              />
            </div>
          </div>

          {/* Search Button */}
          <div className="flex items-end gap-2">
            <Button
              onClick={applyFilters}
              className="flex-1 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 h-10"
            >
              <Search className="w-4 h-4 mr-2" />
              {locale === 'ar' ? 'بحث' : 'Search'}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`h-10 w-10 ${showAdvanced ? 'bg-yellow-50 border-yellow-400' : ''}`}
            >
              <SlidersHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="border-t pt-3 grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Bedrooms */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {locale === 'ar' ? 'غرف النوم' : 'Bedrooms'}
              </label>
              <select
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                className="w-full px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 bg-white text-sm"
              >
                <option value="">{locale === 'ar' ? 'أي' : 'Any'}</option>
                {bedroomOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Bathrooms */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {locale === 'ar' ? 'الحمامات' : 'Bathrooms'}
              </label>
              <select
                value={bathrooms}
                onChange={(e) => setBathrooms(e.target.value)}
                className="w-full px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 bg-white text-sm"
              >
                <option value="">{locale === 'ar' ? 'أي' : 'Any'}</option>
                {bathroomOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Min Area */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {locale === 'ar' ? 'المساحة (م²) - من' : 'Area (m²) - Min'}
              </label>
              <Input
                type="number"
                placeholder={locale === 'ar' ? 'من' : 'Min'}
                value={minArea}
                onChange={(e) => setMinArea(e.target.value)}
                className="border-2 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-sm"
              />
            </div>

            {/* Max Area */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {locale === 'ar' ? 'المساحة (م²) - إلى' : 'Area (m²) - Max'}
              </label>
              <Input
                type="number"
                placeholder={locale === 'ar' ? 'إلى' : 'Max'}
                value={maxArea}
                onChange={(e) => setMaxArea(e.target.value)}
                className="border-2 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-sm"
              />
            </div>

            {/* Year Built */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {locale === 'ar' ? 'سنة البناء' : 'Year Built'}
              </label>
              <Input
                type="number"
                placeholder={locale === 'ar' ? 'من سنة' : 'From year'}
                value={yearBuilt}
                onChange={(e) => setYearBuilt(e.target.value)}
                className="border-2 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-sm"
              />
            </div>

            {/* Furnished */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {locale === 'ar' ? 'مفروش' : 'Furnished'}
              </label>
              <select
                value={furnished}
                onChange={(e) => setFurnished(e.target.value)}
                className="w-full px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 bg-white text-sm"
              >
                <option value="">{locale === 'ar' ? 'أي' : 'Any'}</option>
                <option value="true">{locale === 'ar' ? 'نعم' : 'Yes'}</option>
                <option value="false">{locale === 'ar' ? 'لا' : 'No'}</option>
              </select>
            </div>

            {/* Parking */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {locale === 'ar' ? 'موقف سيارات' : 'Parking'}
              </label>
              <select
                value={parking}
                onChange={(e) => setParking(e.target.value)}
                className="w-full px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 bg-white text-sm"
              >
                <option value="">{locale === 'ar' ? 'أي' : 'Any'}</option>
                <option value="true">{locale === 'ar' ? 'نعم' : 'Yes'}</option>
                <option value="false">{locale === 'ar' ? 'لا' : 'No'}</option>
              </select>
            </div>

            {/* Floor */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {locale === 'ar' ? 'الطابق' : 'Floor'}
              </label>
              <Input
                type="number"
                placeholder={locale === 'ar' ? 'رقم الطابق' : 'Floor number'}
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                className="border-2 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-sm"
              />
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {locale === 'ar' ? 'ترتيب حسب' : 'Sort By'}
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 bg-white text-sm"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {locale === 'ar' ? opt.labelAr : opt.labelEn}
                  </option>
                ))}
              </select>
            </div>

            {/* Reset Button */}
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={resetFilters}
                className="w-full border-2 h-10"
              >
                <X className="w-4 h-4 mr-2" />
                {locale === 'ar' ? 'إعادة تعيين' : 'Reset All'}
              </Button>
            </div>
          </div>
        )}

        {/* Active Filters */}
        {activeFilterCount > 0 && (
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span className="text-sm text-gray-600">
              {locale === 'ar' ? 'الفلاتر النشطة:' : 'Active Filters:'}
            </span>
            {purpose && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                {purpose === 'sell' ? (locale === 'ar' ? 'للبيع' : 'For Sale') : (locale === 'ar' ? 'للإيجار' : 'For Rent')}
                <button onClick={() => { setPurpose(''); applyFilters(); }} className="hover:bg-yellow-200 rounded-full p-0.5">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {type && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                {propertyTypes.find(pt => pt.value === type)?.[locale === 'ar' ? 'labelAr' : 'labelEn']}
                <button onClick={() => { setType(''); applyFilters(); }} className="hover:bg-yellow-200 rounded-full p-0.5">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {activeFilterCount > 0 && (
              <button
                onClick={resetFilters}
                className="text-xs text-yellow-600 hover:text-yellow-700 font-medium underline"
              >
                {locale === 'ar' ? 'مسح الكل' : 'Clear All'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

