'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Search, MapPin, DollarSign, RotateCcw } from 'lucide-react';

interface SearchFormProps {
  locale: string;
  initialValues?: {
    purpose?: string;
    location?: string;
    minPrice?: string;
    maxPrice?: string;
  };
}

export default function SearchForm({ locale, initialValues = {} }: SearchFormProps) {
  const router = useRouter();
  const [purpose, setPurpose] = useState(initialValues.purpose || '');
  const [location, setLocation] = useState(initialValues.location || '');
  const [minPrice, setMinPrice] = useState(initialValues.minPrice || '');
  const [maxPrice, setMaxPrice] = useState(initialValues.maxPrice || '');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    const params = new URLSearchParams();
    if (purpose) params.append('purpose', purpose);
    if (location) params.append('location_slug', location);
    if (minPrice) params.append('min_price', minPrice);
    if (maxPrice) params.append('max_price', maxPrice);

    router.push(`/${locale}/listings?${params.toString()}`);
  };

  const handleReset = () => {
    setPurpose('');
    setLocation('');
    setMinPrice('');
    setMaxPrice('');
  };

  return (
    <Card className="w-full max-w-5xl mx-auto shadow-2xl border-2 hover:border-primary/30 transition-all duration-300">
      <CardContent className="p-6 md:p-8">
        <form onSubmit={handleSearch}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Purpose */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {locale === 'ar' ? 'الغرض' : 'Purpose'}
              </label>
              <select
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-white"
              >
                <option value="">{locale === 'ar' ? 'اختر الغرض' : 'Select Purpose'}</option>
                <option value="sell">{locale === 'ar' ? 'للبيع' : 'For Sale'}</option>
                <option value="rent">{locale === 'ar' ? 'للإيجار' : 'For Rent'}</option>
              </select>
            </div>

            {/* Location */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {locale === 'ar' ? 'الموقع' : 'Location'}
              </label>
              <Input
                placeholder={locale === 'ar' ? 'أدخل اسم المدينة أو المنطقة' : 'Enter city or area'}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="border-2 h-[46px] focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Min Price */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                {locale === 'ar' ? 'أدنى سعر' : 'Min Price'}
              </label>
              <Input
                type="number"
                placeholder={locale === 'ar' ? 'من' : 'From'}
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="border-2 h-[46px] focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Max Price */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                {locale === 'ar' ? 'أعلى سعر' : 'Max Price'}
              </label>
              <Input
                type="number"
                placeholder={locale === 'ar' ? 'إلى' : 'To'}
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="border-2 h-[46px] focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              type="submit" 
              size="lg" 
              className="flex-1 h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              <Search className="w-5 h-5 mr-2" />
              {locale === 'ar' ? 'ابحث الآن' : 'Search Now'}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={handleReset}
              className="sm:w-auto h-12 border-2 hover:bg-accent"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              {locale === 'ar' ? 'إعادة تعيين' : 'Reset'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
