import Link from 'next/link';
import { getProperties, getLocations } from '@/lib/api';
import PropertyCard from '@/components/PropertyCard';
import CategoryCard from '@/components/CategoryCard';
import StatsBar from '@/components/StatsBar';
import HeroSection from '@/components/HeroSection';
import FeatureSection from '@/components/FeatureSection';
import HappyLifeSection from '@/components/HappyLifeSection';
import HowItWorks from '@/components/HowItWorks';
import { Button } from '@/components/ui/button';

// Property type configuration - using icon names as strings instead of components
const propertyTypes = [
  { type: 'apartment', iconName: 'Building2', labelEn: 'Apartments', labelAr: 'شقق' },
  { type: 'house', iconName: 'Home', labelEn: 'Houses', labelAr: 'منازل' },
  { type: 'villa', iconName: 'Castle', labelEn: 'Villas', labelAr: 'فلل' },
  { type: 'land', iconName: 'Trees', labelEn: 'Land', labelAr: 'أراضي' },
  { type: 'commercial', iconName: 'Store', labelEn: 'Commercial', labelAr: 'تجاري' },
  { type: 'office', iconName: 'Briefcase', labelEn: 'Offices', labelAr: 'مكاتب' },
  { type: 'store', iconName: 'ShoppingBag', labelEn: 'Stores', labelAr: 'متاجر' },
];

export default async function HomePage({
  params: { locale }
}: {
  params: { locale: string };
}) {
  // Fetch all data in parallel
  let featuredProperties: any[] = [];
  let allProperties: any[] = [];
  let locations: any[] = [];

  try {
    // Fetch featured properties and all properties (API limits page_size to 100)
    const [featuredResponse, allResponse, locationsResponse] = await Promise.all([
      getProperties({ featured: true, page_size: 6 }),
      getProperties({ page_size: 100 }), // API max is 100
      getLocations(),
    ]);
    
    featuredProperties = featuredResponse.items || [];
    allProperties = allResponse.items || [];
    locations = locationsResponse || [];
    
    // If there are more properties, fetch additional pages
    if (allResponse.total_pages > 1) {
      const additionalPages = await Promise.all(
        Array.from({ length: Math.min(allResponse.total_pages - 1, 5) }, (_, i) =>
          getProperties({ page: i + 2, page_size: 100 })
        )
      );
      additionalPages.forEach(response => {
        allProperties.push(...(response.items || []));
      });
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    // Continue with empty arrays - page will still render
    featuredProperties = [];
    allProperties = [];
    locations = [];
  }

  // Count properties by type
  const propertyCounts = propertyTypes.map(({ type }) => ({
    type,
    count: allProperties.filter(p => p.type === type).length,
  }));

  // Extract images for gallery background (get first image from up to 15 properties)
  const galleryImages = allProperties
    .filter(p => p.first_image || p.images?.[0]?.file_key)
    .slice(0, 15)
    .map(p => p.first_image || p.images?.[0]?.file_key)
    .filter(Boolean) as string[];

  return (
    <div className="overflow-x-hidden">
      {/* Hero Section with Enhanced Design */}
      <HeroSection locale={locale} galleryImages={galleryImages} />

      {/* Stats Bar */}
      <section className="-mt-12 relative z-10">
        <div className="container mx-auto px-4">
          <StatsBar locale={locale} />
        </div>
      </section>

      {/* Browse by Type */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900">
              {locale === 'ar' ? 'تصفح حسب النوع' : 'Browse by Property Type'}
            </h2>
            <p className="text-gray-600 text-sm md:text-base">
              {locale === 'ar' 
                ? 'اختر نوع العقار المناسب لاحتياجاتك من مجموعة واسعة من الخيارات' 
                : 'Choose the property type that fits your needs from our wide range of options'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {propertyTypes.map(({ type, iconName, labelEn, labelAr }, index) => (
              <CategoryCard
                key={type}
                type={type}
                iconName={iconName}
                label={locale === 'ar' ? labelAr : labelEn}
                count={propertyCounts[index].count}
                locale={locale}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      {featuredProperties.length > 0 && (
        <section className="py-16 bg-gradient-to-b from-background to-muted/20">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10">
              <div className="mb-4 md:mb-0">
                <h2 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900">
                  {locale === 'ar' ? 'عقارات مميزة' : 'Featured Properties'}
                </h2>
                <p className="text-gray-600 text-sm md:text-base">
                  {locale === 'ar' 
                    ? 'أفضل العقارات المختارة بعناية لك' 
                    : 'Hand-picked premium properties just for you'}
                </p>
              </div>
              <Link href={`/${locale}/listings`}>
                <Button size="default" variant="outline" className="group">
                  {locale === 'ar' ? 'عرض الكل' : 'View All'}
                  <svg 
                    className={`ml-2 h-4 w-4 transition-transform group-hover:translate-x-1 ${locale === 'ar' ? 'rotate-180' : ''}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {featuredProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  locale={locale}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features / Why Choose Us */}
      <FeatureSection locale={locale} />

      {/* Happy Life Section - The Feeling You Get */}
      <HappyLifeSection locale={locale} />

      {/* How It Works */}
      <HowItWorks locale={locale} />

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-primary/10 via-primary/5 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900">
              {locale === 'ar' 
                ? 'هل أنت مستعد للعثور على منزل أحلامك؟' 
                : 'Ready to Find Your Dream Home?'}
            </h2>
            <p className="text-sm md:text-base text-gray-600 mb-6 max-w-2xl mx-auto">
              {locale === 'ar' 
                ? 'ابدأ رحلتك في البحث عن العقار المثالي اليوم. فريقنا هنا لمساعدتك في كل خطوة' 
                : 'Start your journey to find the perfect property today. Our team is here to help you every step of the way'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Link href={`/${locale}/listings`}>
                <Button size="default" className="min-w-[180px]">
                  {locale === 'ar' ? 'تصفح العقارات' : 'Browse Properties'}
                </Button>
              </Link>
              <Link href={`/${locale}/contact`}>
                <Button size="default" variant="outline" className="min-w-[180px]">
                  {locale === 'ar' ? 'تواصل معنا' : 'Contact Us'}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
