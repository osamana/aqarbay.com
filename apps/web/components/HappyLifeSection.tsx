'use client';

import { Sparkles, Heart, Home, Sun, Trees, ArrowRight } from 'lucide-react';

interface HappyLifeSectionProps {
  locale: string;
}

export default function HappyLifeSection({ locale }: HappyLifeSectionProps) {
  const isRTL = locale === 'ar';

  return (
    <section className="relative py-20 md:py-28 overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating Circles */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-green-200/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-40 right-20 w-40 h-40 bg-emerald-200/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-1/4 w-36 h-36 bg-teal-200/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-40 right-1/3 w-28 h-28 bg-green-300/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }}></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-700 mb-6 animate-pulse">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-semibold">
                {locale === 'ar' ? 'حياة سعيدة تنتظرك' : 'A Happy Life Awaits You'}
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
              {locale === 'ar' 
                ? 'الشعور الذي تحصل عليه عند التعامل معنا'
                : 'The Feeling You Get When Dealing With Us'}
            </h2>
            <p className="text-lg md:text-xl text-green-700/80 max-w-2xl mx-auto">
              {locale === 'ar'
                ? 'نحن لا نبيع فقط عقارات، نحن نبيع أحلاماً، ذكريات، وحياة سعيدة'
                : "We don't just sell properties, we sell dreams, memories, and a happy life"}
            </p>
          </div>

          {/* Main Content Grid */}
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center mb-12">
            {/* Left Side - Graphics */}
            <div className="relative order-2 md:order-1">
              <div className="relative w-full aspect-square max-w-md mx-auto">
                {/* Main Happy House Illustration */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg
                    viewBox="0 0 400 400"
                    className="w-full h-full drop-shadow-2xl"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* Animated Sun */}
                    <circle
                      cx="320"
                      cy="80"
                      r="50"
                      fill="#FCD34D"
                      className="animate-pulse"
                      opacity="0.9"
                    />
                    <circle
                      cx="320"
                      cy="80"
                      r="40"
                      fill="#FDE047"
                      className="animate-pulse"
                      style={{ animationDelay: '0.2s' }}
                    />
                    {/* Sun Rays */}
                    {[...Array(8)].map((_, i) => (
                      <line
                        key={i}
                        x1="320"
                        y1="80"
                        x2={320 + 60 * Math.cos((i * Math.PI) / 4)}
                        y2={80 + 60 * Math.sin((i * Math.PI) / 4)}
                        stroke="#FCD34D"
                        strokeWidth="3"
                        className="animate-pulse"
                        style={{ animationDelay: `${i * 0.1}s` }}
                      />
                    ))}

                    {/* Happy House */}
                    <g transform="translate(200, 200)">
                      {/* House Base */}
                      <rect
                        x="-80"
                        y="20"
                        width="160"
                        height="120"
                        fill="#86EFAC"
                        stroke="#4ADE80"
                        strokeWidth="3"
                        rx="8"
                      />
                      {/* Roof */}
                      <polygon
                        points="-100,20 0,-20 100,20"
                        fill="#22C55E"
                        stroke="#16A34A"
                        strokeWidth="3"
                      />
                      {/* Door */}
                      <rect
                        x="-20"
                        y="80"
                        width="40"
                        height="60"
                        fill="#FCD34D"
                        stroke="#F59E0B"
                        strokeWidth="2"
                        rx="4"
                      />
                      {/* Door Handle */}
                      <circle cx="10" cy="110" r="3" fill="#F59E0B" />
                      {/* Windows */}
                      <rect
                        x="-60"
                        y="40"
                        width="30"
                        height="30"
                        fill="#FEF3C7"
                        stroke="#FCD34D"
                        strokeWidth="2"
                        rx="4"
                      />
                      <rect
                        x="30"
                        y="40"
                        width="30"
                        height="30"
                        fill="#FEF3C7"
                        stroke="#FCD34D"
                        strokeWidth="2"
                        rx="4"
                      />
                      {/* Window Cross */}
                      <line
                        x1="-45"
                        y1="40"
                        x2="-45"
                        y2="70"
                        stroke="#FCD34D"
                        strokeWidth="2"
                      />
                      <line
                        x1="-60"
                        y1="55"
                        x2="-30"
                        y2="55"
                        stroke="#FCD34D"
                        strokeWidth="2"
                      />
                      <line
                        x1="45"
                        y1="40"
                        x2="45"
                        y2="70"
                        stroke="#FCD34D"
                        strokeWidth="2"
                      />
                      <line
                        x1="30"
                        y1="55"
                        x2="60"
                        y2="55"
                        stroke="#FCD34D"
                        strokeWidth="2"
                      />
                      {/* Happy Face on House */}
                      <circle cx="0" cy="0" r="15" fill="#FCD34D" />
                      <circle cx="-5" cy="-3" r="2" fill="#000" />
                      <circle cx="5" cy="-3" r="2" fill="#000" />
                      <path
                        d="M -8 5 Q 0 10 8 5"
                        stroke="#000"
                        strokeWidth="2"
                        fill="none"
                        strokeLinecap="round"
                      />
                    </g>

                    {/* Trees */}
                    <g transform="translate(80, 280)">
                      {/* Tree 1 */}
                      <ellipse cx="0" cy="0" rx="25" ry="35" fill="#22C55E" />
                      <rect x="-5" y="20" width="10" height="30" fill="#92400E" />
                    </g>
                    <g transform="translate(320, 300)">
                      {/* Tree 2 */}
                      <ellipse cx="0" cy="0" rx="30" ry="40" fill="#16A34A" />
                      <rect x="-6" y="25" width="12" height="35" fill="#78350F" />
                    </g>

                    {/* Floating Hearts */}
                    <g className="animate-float" style={{ animationDelay: '0.5s' }}>
                      <path
                        d="M 150 100 C 150 80, 130 80, 130 100 C 130 80, 110 80, 110 100 C 110 120, 130 140, 150 140 C 170 140, 190 120, 190 100 C 190 80, 170 80, 170 100 C 170 80, 150 80, 150 100 Z"
                        fill="#EF4444"
                        opacity="0.8"
                      />
                    </g>
                    <g className="animate-float" style={{ animationDelay: '1s', transform: 'translate(250, 150)' }}>
                      <path
                        d="M 0 0 C 0 -10, -10 -10, -10 0 C -10 -10, -20 -10, -20 0 C -20 10, -10 20, 0 20 C 10 20, 20 10, 20 0 C 20 -10, 10 -10, 10 0 C 10 -10, 0 -10, 0 0 Z"
                        fill="#F87171"
                        opacity="0.7"
                      />
                    </g>
                  </svg>
                </div>

                {/* Floating Icons */}
                <div className="absolute top-10 left-10 animate-float">
                  <div className="p-3 bg-white/90 rounded-full shadow-lg">
                    <Home className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="absolute top-20 right-10 animate-float" style={{ animationDelay: '1s' }}>
                  <div className="p-3 bg-white/90 rounded-full shadow-lg">
                    <Heart className="w-6 h-6 text-red-500" />
                  </div>
                </div>
                <div className="absolute bottom-20 left-20 animate-float" style={{ animationDelay: '1.5s' }}>
                  <div className="p-3 bg-white/90 rounded-full shadow-lg">
                    <Sun className="w-6 h-6 text-yellow-500" />
                  </div>
                </div>
                <div className="absolute bottom-10 right-20 animate-float" style={{ animationDelay: '0.7s' }}>
                  <div className="p-3 bg-white/90 rounded-full shadow-lg">
                    <Trees className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Content */}
            <div className="order-1 md:order-2 space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 rounded-xl bg-white/80 backdrop-blur-sm border-2 border-green-200 hover:border-green-400 transition-all duration-300 hover:shadow-lg">
                  <div className="flex-shrink-0 p-2 bg-green-100 rounded-lg">
                    <Heart className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-green-800 mb-2">
                      {locale === 'ar' ? 'شعور بالراحة والطمأنينة' : 'Feeling of Comfort & Security'}
                    </h3>
                    <p className="text-green-700">
                      {locale === 'ar'
                        ? 'كل خطوة في رحلتك معنا مصممة لتعطيك راحة البال والثقة'
                        : 'Every step in your journey with us is designed to give you peace of mind and confidence'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-xl bg-white/80 backdrop-blur-sm border-2 border-emerald-200 hover:border-emerald-400 transition-all duration-300 hover:shadow-lg">
                  <div className="flex-shrink-0 p-2 bg-emerald-100 rounded-lg">
                    <Sun className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-emerald-800 mb-2">
                      {locale === 'ar' ? 'طاقة إيجابية وحيوية' : 'Positive Energy & Vitality'}
                    </h3>
                    <p className="text-emerald-700">
                      {locale === 'ar'
                        ? 'نحن نؤمن بأن كل منزل يجب أن يكون مصدراً للسعادة والطاقة الإيجابية'
                        : 'We believe every home should be a source of happiness and positive energy'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-xl bg-white/80 backdrop-blur-sm border-2 border-teal-200 hover:border-teal-400 transition-all duration-300 hover:shadow-lg">
                  <div className="flex-shrink-0 p-2 bg-teal-100 rounded-lg">
                    <Trees className="w-6 h-6 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-teal-800 mb-2">
                      {locale === 'ar' ? 'نمو وازدهار' : 'Growth & Prosperity'}
                    </h3>
                    <p className="text-teal-700">
                      {locale === 'ar'
                        ? 'منزلك الجديد هو بداية جديدة لحياة مزدهرة ومليئة بالإمكانيات'
                        : 'Your new home is a fresh start for a thriving life full of possibilities'}
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <div className="pt-4">
                <a
                  href={`/${locale}/listings`}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-full hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  <span>{locale === 'ar' ? 'ابدأ رحلتك السعيدة' : 'Start Your Happy Journey'}</span>
                  <ArrowRight className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Stats/Highlights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
            {[
              {
                number: '100%',
                labelEn: 'Satisfaction',
                labelAr: 'رضا تام',
                icon: Heart,
              },
              {
                number: '24/7',
                labelEn: 'Support',
                labelAr: 'دعم',
                icon: Sun,
              },
              {
                number: '1000+',
                labelEn: 'Happy Families',
                labelAr: 'عائلة سعيدة',
                icon: Home,
              },
              {
                number: '5★',
                labelEn: 'Experience',
                labelAr: 'تجربة',
                icon: Sparkles,
              },
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="text-center p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-green-200 hover:bg-white/80 hover:border-green-400 transition-all duration-300"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-3">
                    <Icon className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-green-700 mb-1">{stat.number}</div>
                  <div className="text-sm text-green-600 font-medium">
                    {locale === 'ar' ? stat.labelAr : stat.labelEn}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

