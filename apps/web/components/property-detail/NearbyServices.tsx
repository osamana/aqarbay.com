'use client';

import { useEffect, useState } from 'react';
import { PropertyPOIs, POI } from '@/lib/api';
import { getPropertyPOIs } from '@/lib/api';
import { School, Building2, Stethoscope, ShoppingCart, Wallet, UtensilsCrossed, Trees, Fuel } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface NearbyServicesProps {
  propertySlug: string;
  locale: string;
}

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  schools: School,
  mosques: Building2,  // Using Building2 for mosques
  hospitals: Stethoscope,  // Using Stethoscope for hospitals
  supermarkets: ShoppingCart,
  banks: Wallet,  // Using Wallet for banks
  restaurants: UtensilsCrossed,
  parks: Trees,
  gas_stations: Fuel,
};

const categoryLabels: Record<string, { en: string; ar: string }> = {
  schools: { en: 'Schools', ar: 'المدارس' },
  mosques: { en: 'Mosques', ar: 'المساجد' },
  hospitals: { en: 'Hospitals & Clinics', ar: 'المستشفيات والعيادات' },
  supermarkets: { en: 'Supermarkets', ar: 'المتاجر' },
  banks: { en: 'Banks', ar: 'البنوك' },
  restaurants: { en: 'Restaurants & Cafes', ar: 'المطاعم والمقاهي' },
  parks: { en: 'Parks & Playgrounds', ar: 'الحدائق والملاعب' },
  gas_stations: { en: 'Gas Stations', ar: 'محطات الوقود' },
};

export default function NearbyServices({ propertySlug, locale }: NearbyServicesProps) {
  const [poisData, setPoisData] = useState<PropertyPOIs | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPOIs() {
      try {
        setLoading(true);
        const data = await getPropertyPOIs(propertySlug, locale);
        setPoisData(data);
      } catch (err) {
        console.error('Error fetching POIs:', err);
        setError(err instanceof Error ? err.message : 'Failed to load nearby services');
      } finally {
        setLoading(false);
      }
    }

    fetchPOIs();
  }, [propertySlug, locale]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-20 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !poisData || Object.keys(poisData.pois).length === 0) {
    return null; // Don't show anything if there's an error or no POIs
  }

  const formatDistance = (distance: number) => {
    if (distance < 1000) {
      return `${Math.round(distance)} ${locale === 'ar' ? 'م' : 'm'}`;
    }
    return `${(distance / 1000).toFixed(1)} ${locale === 'ar' ? 'كم' : 'km'}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-bold">
          {locale === 'ar' ? 'الخدمات القريبة' : 'Nearby Services'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Object.entries(poisData.pois).map(([category, pois]) => {
            if (pois.length === 0) return null;

            const Icon = categoryIcons[category];
            const categoryLabel = categoryLabels[category];
            const label = categoryLabel ? (locale === 'ar' ? categoryLabel.ar : categoryLabel.en) : category;

            return (
              <div key={category} className="space-y-2">
                <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                  {Icon && <Icon className="w-5 h-5 text-yellow-600" />}
                  <span>{label}</span>
                  <span className="text-sm font-normal text-gray-500">
                    ({pois.length})
                  </span>
                </div>
                <div className="space-y-2 pl-7">
                  {pois.slice(0, 5).map((poi, idx) => (
                    <div
                      key={idx}
                      className="flex items-start justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {locale === 'ar' && poi.name_ar ? poi.name_ar : poi.name_en || poi.name}
                        </p>
                        {poi.address && (
                          <p className="text-sm text-gray-600 mt-1">{poi.address}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDistance(poi.distance)} {locale === 'ar' ? 'بعيداً' : 'away'}
                        </p>
                      </div>
                    </div>
                  ))}
                  {pois.length > 5 && (
                    <p className="text-sm text-gray-500 pt-1">
                      {locale === 'ar' 
                        ? `و ${pois.length - 5} أكثر...` 
                        : `and ${pois.length - 5} more...`}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

