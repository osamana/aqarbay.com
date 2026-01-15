import { getPropertyBySlug, getProperties } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import PropertyCard from '@/components/PropertyCard';
import ImageGallery from '@/components/property-detail/ImageGallery';
import BookingPanel from '@/components/property-detail/BookingPanel';
import PropertyMap from '@/components/property-detail/PropertyMap';
import ShareButtons from '@/components/property-detail/ShareButtons';
import NearbyServices from '@/components/property-detail/NearbyServices';
import { BedDouble, Bath, Maximize, Calendar } from 'lucide-react';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default async function PropertyPage({
  params: { locale, slug },
}: {
  params: { locale: string; slug: string };
}) {
  let property;
  try {
    property = await getPropertyBySlug(slug, locale);
  } catch {
    notFound();
  }

  const title = locale === 'ar' ? property.title_ar : property.title_en;
  const description = locale === 'ar' ? property.description_ar : property.description_en;

  // Fetch similar properties
  const { items: similarProperties } = await getProperties({
    purpose: property.purpose,
    type: property.type,
    page_size: 3,
  });

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

  const shareText = `${title} - ${formatPrice(Number(property.price_amount), property.price_currency)}`;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-6 flex-wrap">
          <Link href={`/${locale}`} className="text-yellow-600 hover:text-yellow-700">
            {locale === 'ar' ? 'الرئيسية' : 'Home'}
          </Link>
          <span className="text-muted-foreground">/</span>
          <Link href={`/${locale}/listings`} className="text-yellow-600 hover:text-yellow-700">
            {locale === 'ar' ? 'العقارات' : 'Listings'}
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-muted-foreground line-clamp-1">{title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Main Content - Left Side (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <ImageGallery images={property.images || []} title={title} />

            {/* Title and Basic Info */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold mb-2 text-gray-900">{title}</h1>
                  
                  {property.location && (
                    <div className="flex items-center gap-2 text-gray-600 mb-3">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-lg">
                        {locale === 'ar' ? property.location.name_ar : property.location.name_en}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="inline-block px-3 py-1.5 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-semibold">
                      {getTypeLabel(property.type)}
                    </span>
                    {property.featured && (
                      <span className="inline-block px-3 py-1.5 bg-gradient-to-r from-yellow-400 to-amber-500 text-white rounded-lg text-sm font-semibold">
                        ⭐ {locale === 'ar' ? 'مميز' : 'Featured'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Share Buttons */}
                <div className="flex gap-2">
                  <ShareButtons 
                    title={title}
                    shareText={shareText}
                    locale={locale}
                  />
                </div>
              </div>

              {/* Key Features Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-y">
                {property.bedrooms && (
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <BedDouble className="w-6 h-6 mx-auto mb-2 text-yellow-600" />
                    <div className="text-2xl font-bold text-gray-900">{property.bedrooms}</div>
                    <div className="text-sm text-muted-foreground">
                      {locale === 'ar' ? 'غرف النوم' : 'Bedrooms'}
                    </div>
                  </div>
                )}
                {property.bathrooms && (
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Bath className="w-6 h-6 mx-auto mb-2 text-yellow-600" />
                    <div className="text-2xl font-bold text-gray-900">{property.bathrooms}</div>
                    <div className="text-sm text-muted-foreground">
                      {locale === 'ar' ? 'الحمامات' : 'Bathrooms'}
                    </div>
                  </div>
                )}
                {property.area_m2 && (
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Maximize className="w-6 h-6 mx-auto mb-2 text-yellow-600" />
                    <div className="text-2xl font-bold text-gray-900">{property.area_m2}</div>
                    <div className="text-sm text-muted-foreground">
                      {locale === 'ar' ? 'متر مربع' : 'Sq Meters'}
                    </div>
                  </div>
                )}
                {property.year_built && (
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Calendar className="w-6 h-6 mx-auto mb-2 text-yellow-600" />
                    <div className="text-2xl font-bold text-gray-900">{property.year_built}</div>
                    <div className="text-sm text-muted-foreground">
                      {locale === 'ar' ? 'سنة البناء' : 'Year Built'}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tabbed Content */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="border-b">
                <div className="flex">
                  <button className="px-6 py-4 font-semibold text-yellow-600 border-b-2 border-yellow-600">
                    {locale === 'ar' ? 'الوصف' : 'Description'}
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                {/* Description */}
                {description && (
                  <div className="mb-6">
                    <p className="whitespace-pre-line text-gray-700 leading-relaxed text-lg">
                      {description}
                    </p>
                  </div>
                )}

                {/* Additional Features */}
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-gray-900">
                    {locale === 'ar' ? 'المميزات الإضافية' : 'Additional Features'}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {property.furnished && (
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-gray-700">{locale === 'ar' ? 'مفروش' : 'Furnished'}</span>
                      </div>
                    )}
                    {property.parking && (
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-gray-700">{locale === 'ar' ? 'موقف سيارات' : 'Parking'}</span>
                      </div>
                    )}
                    {property.floor && (
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-gray-700">
                          {locale === 'ar' ? `الطابق ${property.floor}` : `Floor ${property.floor}`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Location Map */}
            {property.lat && property.lng && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-semibold mb-4 text-gray-900">
                  {locale === 'ar' ? 'الموقع' : 'Location'}
                </h2>
                <PropertyMap
                  lat={property.lat}
                  lng={property.lng}
                  title={title}
                  locale={locale}
                  propertySlug={slug}
                />
              </div>
            )}

            {/* Nearby Services */}
            {property.lat && property.lng && (
              <NearbyServices propertySlug={slug} locale={locale} />
            )}
          </div>

          {/* Sidebar - Right Side (1/3) */}
          <div className="lg:col-span-1">
            <BookingPanel property={property} locale={locale} />
          </div>
        </div>

        {/* Similar Properties */}
        {similarProperties.length > 0 && (
          <section className="mt-12">
            <h2 className="text-3xl font-bold mb-6 text-gray-900">
              {locale === 'ar' ? 'عقارات مشابهة' : 'Similar Properties'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {similarProperties.filter(p => p.id !== property.id).slice(0, 3).map((prop) => (
                <PropertyCard key={prop.id} property={prop} locale={locale} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
