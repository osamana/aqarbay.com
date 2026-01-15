import { getLocations } from '@/lib/api';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';

export default async function LocationsPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const locations = await getLocations();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">
        {locale === 'ar' ? 'المواقع' : 'Locations'}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {locations.map((location) => (
          <Link
            key={location.id}
            href={`/${locale}/listings?location_slug=${locale === 'ar' ? location.slug_ar : location.slug_en}`}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg">
                  {locale === 'ar' ? location.name_ar : location.name_en}
                </h3>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

