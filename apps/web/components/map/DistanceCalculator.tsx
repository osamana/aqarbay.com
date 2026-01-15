'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Ruler, Navigation, X } from 'lucide-react';
import { calculateDistance, formatDistance } from '@/lib/map-utils';
import { Property } from '@/lib/api';

interface DistanceCalculatorProps {
  properties: Property[];
  userLocation: [number, number] | null;
  locale: string;
  onClose?: () => void;
}

export default function DistanceCalculator({
  properties,
  userLocation,
  locale,
  onClose,
}: DistanceCalculatorProps) {
  const [sortedProperties, setSortedProperties] = useState<Array<Property & { distance: number }>>([]);

  useEffect(() => {
    if (!userLocation) return;

    const propertiesWithDistance = properties
      .filter(p => p.lat && p.lng)
      .map(property => ({
        ...property,
        distance: calculateDistance(
          userLocation[0],
          userLocation[1],
          property.lat!,
          property.lng!
        ),
      }))
      .sort((a, b) => a.distance - b.distance);

    setSortedProperties(propertiesWithDistance);
  }, [properties, userLocation]);

  if (!userLocation) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Ruler className="w-4 h-4" />
            {locale === 'ar' ? 'حاسبة المسافة' : 'Distance Calculator'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            {locale === 'ar'
              ? 'يجب تحديد موقعك أولاً'
              : 'Please enable location access first'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md max-h-[500px] overflow-y-auto">
      <CardHeader className="sticky top-0 bg-white z-10 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Ruler className="w-4 h-4" />
            {locale === 'ar' ? 'حاسبة المسافة' : 'Distance Calculator'}
          </CardTitle>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-2">
          {sortedProperties.slice(0, 10).map((property) => {
            const title = locale === 'ar' ? property.title_ar : property.title_en;
            return (
              <div
                key={property.id}
                className="flex items-center justify-between p-2 border rounded hover:bg-gray-50"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{title}</p>
                  <p className="text-xs text-gray-500">
                    {formatDistance(property.distance, locale)}
                  </p>
                </div>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&origin=${userLocation[0]},${userLocation[1]}&destination=${property.lat},${property.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2"
                >
                  <Button variant="outline" size="sm">
                    <Navigation className="w-3 h-3" />
                  </Button>
                </a>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

