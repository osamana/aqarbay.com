'use client';

import { useState, useEffect } from 'react';
import { getFavoriteIds, removeFavorite } from '@/lib/favorites';
import { getPropertiesByIds } from '@/lib/api';
import { Property } from '@/lib/api';
import PropertyCard from '@/components/PropertyCard';
import { Card, CardContent } from '@/components/ui/card';
import { Heart } from 'lucide-react';

export default function FavoritesPage({ params: { locale } }: { params: { locale: string } }) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    const favoriteIds = getFavoriteIds();
    if (favoriteIds.length === 0) {
      setLoading(false);
      return;
    }

    try {
      const data = await getPropertiesByIds(favoriteIds);
      setProperties(data);
    } catch (err) {
      console.error('Failed to load favorites:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = (propertyId: string) => {
    removeFavorite(propertyId);
    setProperties(properties.filter(p => p.id !== propertyId));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4">{locale === 'ar' ? 'جاري التحميل...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6">
          {locale === 'ar' ? 'العقارات المفضلة' : 'Favorite Properties'}
        </h1>

        {properties.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Heart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">
                {locale === 'ar'
                  ? 'لا توجد عقارات مفضلة'
                  : 'No favorite properties yet'}
              </p>
              <p className="text-gray-400 text-sm mt-2">
                {locale === 'ar'
                  ? 'ابدأ بإضافة العقارات إلى قائمة المفضلة'
                  : 'Start adding properties to your favorites'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                locale={locale}
                onFavoriteChange={() => handleRemoveFavorite(property.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

