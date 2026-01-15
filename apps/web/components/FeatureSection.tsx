'use client';

import { Shield, Search, MapPin, Heart, TrendingUp, Clock } from 'lucide-react';

interface FeatureSectionProps {
  locale: string;
}

export default function FeatureSection({ locale }: FeatureSectionProps) {
  const features = [
    {
      icon: Search,
      titleEn: 'Advanced Search',
      titleAr: 'بحث متقدم',
      descEn: 'Find exactly what you need with our powerful search filters and smart recommendations',
      descAr: 'اعثر على ما تحتاجه بالضبط مع مرشحات البحث القوية والتوصيات الذكية',
    },
    {
      icon: Shield,
      titleEn: 'Verified Listings',
      titleAr: 'إعلانات موثقة',
      descEn: 'All properties are verified by our team to ensure quality and authenticity',
      descAr: 'جميع العقارات موثقة من قبل فريقنا لضمان الجودة والأصالة',
    },
    {
      icon: MapPin,
      titleEn: 'Interactive Maps',
      titleAr: 'خرائط تفاعلية',
      descEn: 'Explore properties with detailed interactive maps and neighborhood insights',
      descAr: 'استكشف العقارات بخرائط تفاعلية مفصلة ورؤى عن الأحياء',
    },
    {
      icon: Heart,
      titleEn: 'Save Favorites',
      titleAr: 'حفظ المفضلات',
      descEn: 'Save and organize your favorite properties to compare and review later',
      descAr: 'احفظ ونظم عقاراتك المفضلة للمقارنة والمراجعة لاحقاً',
    },
    {
      icon: TrendingUp,
      titleEn: 'Market Insights',
      titleAr: 'رؤى السوق',
      descEn: 'Stay informed with real-time market trends and property value analysis',
      descAr: 'ابق على اطلاع باتجاهات السوق الفورية وتحليل قيمة العقارات',
    },
    {
      icon: Clock,
      titleEn: 'Instant Updates',
      titleAr: 'تحديثات فورية',
      descEn: 'Get notified immediately when new properties matching your criteria are listed',
      descAr: 'احصل على إشعارات فورية عند إدراج عقارات جديدة تطابق معاييرك',
    },
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-muted/20 to-background">
      <div className="container mx-auto px-4">
        <div className="mb-10 max-w-2xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-3 text-gray-900">
            {locale === 'ar' ? 'لماذا تختار عقارات فلسطين؟' : 'Why Choose Palestine Real Estate?'}
          </h2>
          <p className="text-gray-600 text-sm md:text-base">
            {locale === 'ar' 
              ? 'نوفر لك أفضل الأدوات والخدمات لتجربة بحث عقاري استثنائية' 
              : 'We provide you with the best tools and services for an exceptional property search experience'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={index}
                className="flex gap-4 p-4 rounded-lg border border-gray-200 bg-white hover:border-yellow-400/50 hover:bg-yellow-50/30 transition-all duration-200 group"
              >
                <div className="flex-shrink-0">
                  <div className="p-2 rounded-lg bg-yellow-50 group-hover:bg-yellow-100 transition-colors">
                    <Icon className="w-5 h-5 text-yellow-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold mb-1.5 text-gray-900 group-hover:text-yellow-700 transition-colors">
                    {locale === 'ar' ? feature.titleAr : feature.titleEn}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {locale === 'ar' ? feature.descAr : feature.descEn}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
