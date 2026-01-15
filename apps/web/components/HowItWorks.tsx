'use client';

import { Search, FileText, Home, CheckCircle } from 'lucide-react';

interface HowItWorksProps {
  locale: string;
}

export default function HowItWorks({ locale }: HowItWorksProps) {
  const steps = [
    {
      icon: Search,
      titleEn: 'Search Properties',
      titleAr: 'ابحث عن العقارات',
      descEn: 'Use our advanced search to find properties that match your criteria',
      descAr: 'استخدم البحث المتقدم للعثور على عقارات تطابق معاييرك',
      step: '01',
    },
    {
      icon: FileText,
      titleEn: 'Compare & Review',
      titleAr: 'قارن وراجع',
      descEn: 'Review property details, compare options, and save your favorites',
      descAr: 'راجع تفاصيل العقارات، قارن الخيارات، واحفظ المفضلات',
      step: '02',
    },
    {
      icon: Home,
      titleEn: 'Schedule Visit',
      titleAr: 'حدد موعد الزيارة',
      descEn: 'Contact the agent and schedule a property viewing at your convenience',
      descAr: 'تواصل مع الوكيل وحدد موعد معاينة العقار في الوقت المناسب لك',
      step: '03',
    },
    {
      icon: CheckCircle,
      titleEn: 'Close the Deal',
      titleAr: 'أتمم الصفقة',
      descEn: 'Complete the paperwork and move into your dream property',
      descAr: 'أكمل الأوراق وانتقل إلى عقارك المثالي',
      step: '04',
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            {locale === 'ar' ? 'كيف يعمل؟' : 'How It Works'}
          </h2>
          <p className="text-muted-foreground text-lg">
            {locale === 'ar' 
              ? 'أربع خطوات بسيطة للعثور على عقارك المثالي' 
              : 'Four simple steps to find your perfect property'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connection Lines - Hidden on mobile */}
          <div className="hidden lg:block absolute top-20 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-yellow-400/30 to-transparent" />
          
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isRTL = locale === 'ar';
            
            return (
              <div 
                key={index}
                className="relative flex flex-col items-center text-center group"
              >
                {/* Step Number */}
                <div className="absolute -top-4 right-0 md:right-auto text-6xl font-bold text-yellow-400/5 group-hover:text-yellow-400/10 transition-colors">
                  {step.step}
                </div>

                {/* Icon Container */}
                <div className="relative mb-6 z-10">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400/20 to-amber-500/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <div className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center">
                      <Icon className="w-8 h-8 text-yellow-500" />
                    </div>
                  </div>
                  
                  {/* Connection Dot */}
                  <div className="hidden lg:block absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-yellow-400 border-4 border-white shadow-md" 
                       style={{ 
                         [isRTL ? 'right' : 'left']: index === steps.length - 1 ? '50%' : 'auto',
                         [isRTL ? 'left' : 'right']: index === 0 ? '50%' : 'auto'
                       }} 
                  />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold mb-3 group-hover:text-yellow-600 transition-colors">
                  {locale === 'ar' ? step.titleAr : step.titleEn}
                </h3>
                <p className="text-muted-foreground leading-relaxed max-w-xs">
                  {locale === 'ar' ? step.descAr : step.descEn}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
