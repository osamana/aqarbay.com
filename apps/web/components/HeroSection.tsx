'use client';

import SearchForm from './SearchForm';
import PropertyGalleryBackground from './PropertyGalleryBackground';
import { Sparkles } from 'lucide-react';

interface HeroSectionProps {
  locale: string;
  galleryImages?: string[];
}

export default function HeroSection({ locale, galleryImages = [] }: HeroSectionProps) {
  return (
    <section className="relative bg-gradient-to-br from-slate-50 via-amber-50/30 to-slate-50 py-20 md:py-28 overflow-hidden">
      {/* Animated Property Gallery Background */}
      {galleryImages.length > 0 && (
        <PropertyGalleryBackground images={galleryImages} />
      )}

      {/* Decorative Elements (subtle now since we have gallery) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-yellow-400/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm border border-gray-200/50">
            <Sparkles className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium text-gray-700">
              {locale === 'ar' ? 'المنصة الرائدة للعقارات في فلسطين' : 'Leading Real Estate Platform in Palestine'}
            </span>
          </div>
        </div>

        {/* Main Heading */}
        <div className="text-center mb-8 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
              {locale === 'ar' ? 'اعثر على ' : 'Find Your '}
            </span>
            <span className="bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-500 bg-clip-text text-transparent">
              {locale === 'ar' ? 'عقارك المثالي' : 'Dream Property'}
            </span>
            <br />
            <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
              {locale === 'ar' ? 'في فلسطين' : 'in Palestine'}
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            {locale === 'ar' 
              ? 'اكتشف آلاف العقارات للبيع والإيجار في جميع أنحاء فلسطين. من الشقق الحديثة إلى الفلل الفاخرة، نساعدك في إيجاد منزلك المثالي' 
              : 'Discover thousands of properties for sale and rent across Palestine. From modern apartments to luxury villas, we help you find your perfect home'}
          </p>
        </div>
        
        {/* Search Form */}
        <div className="max-w-5xl mx-auto">
          <SearchForm locale={locale} />
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 flex flex-wrap justify-center items-center gap-6 md:gap-8 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">{locale === 'ar' ? 'موثوق ومعتمد' : 'Trusted & Verified'}</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
            <span className="font-medium">{locale === 'ar' ? 'تحديثات يومية' : 'Daily Updates'}</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">{locale === 'ar' ? 'دعم مجاني' : 'Free Support'}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
