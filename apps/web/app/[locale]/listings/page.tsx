import { Suspense } from 'react';
import { getProperties, getLocations } from '@/lib/api';
import FilterBar from '@/components/listings/FilterBar';
import MobileFilterDrawer from '@/components/listings/MobileFilterDrawer';
import ListingsView from '@/components/ListingsView';

interface SearchParams {
  page?: string;
  q?: string;  // Search query
  purpose?: string;
  type?: string;
  location_slug?: string;
  min_price?: string;
  max_price?: string;
  bedrooms?: string;
  bathrooms?: string;
  min_area?: string;
  max_area?: string;
  year_built?: string;
  furnished?: string;
  parking?: string;
  floor?: string;
  sort_by?: string;
}

export default async function ListingsPage({
  params: { locale },
  searchParams,
}: {
  params: { locale: string };
  searchParams: SearchParams;
}) {
  const page = parseInt(searchParams.page || '1');
  
  // Fetch properties and locations in parallel
  const [propertiesData, locations] = await Promise.all([
    getProperties({
      page,
      page_size: 20,
      q: searchParams.q,
      purpose: searchParams.purpose,
      type: searchParams.type,
      location_slug: searchParams.location_slug,
      min_price: searchParams.min_price ? parseFloat(searchParams.min_price) : undefined,
      max_price: searchParams.max_price ? parseFloat(searchParams.max_price) : undefined,
      bedrooms: searchParams.bedrooms ? parseInt(searchParams.bedrooms) : undefined,
      bathrooms: searchParams.bathrooms ? parseInt(searchParams.bathrooms) : undefined,
      min_area: searchParams.min_area ? parseFloat(searchParams.min_area) : undefined,
      max_area: searchParams.max_area ? parseFloat(searchParams.max_area) : undefined,
      year_built: searchParams.year_built ? parseInt(searchParams.year_built) : undefined,
      furnished: searchParams.furnished === 'true' ? true : searchParams.furnished === 'false' ? false : undefined,
      parking: searchParams.parking === 'true' ? true : searchParams.parking === 'false' ? false : undefined,
      floor: searchParams.floor ? parseInt(searchParams.floor) : undefined,
      sort_by: searchParams.sort_by || 'newest',
    }),
    getLocations(),
  ]);

  const { items: properties, total, total_pages } = propertiesData;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Filter Bar - Desktop */}
      <div className="hidden md:block">
        <FilterBar locale={locale} locations={locations} />
      </div>

      {/* Mobile Filter Drawer */}
      <div className="md:hidden">
        <MobileFilterDrawer locale={locale} locations={locations} />
      </div>

      {/* Page Title - Mobile */}
      <div className="md:hidden bg-white border-b px-4 py-4">
        <h1 className="text-2xl font-bold">
          {locale === 'ar' ? 'العقارات' : 'Property Listings'}
        </h1>
      </div>

      {/* Listings View with Split Screen */}
      <div className="h-[calc(100vh-140px)] md:h-[calc(100vh-180px)]">
        <ListingsView
          properties={properties}
          locale={locale}
          total={total}
          page={page}
          totalPages={total_pages}
        />
      </div>
    </div>
  );
}
