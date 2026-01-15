'use client';

import { useState } from 'react';
import { useMap } from 'react-leaflet';
import { Button } from '@/components/ui/button';
import { Layers, Navigation, Ruler, MapPin, X } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface MapControlsProps {
  locale: string;
  onSatelliteToggle?: (isSatellite: boolean) => void;
  onDrawArea?: () => void;
  onClearDraw?: () => void;
  hasDrawnArea?: boolean;
  userLocation?: [number, number] | null;
  onGetRoute?: (lat: number, lng: number) => void;
}

export default function MapControls({
  locale,
  onSatelliteToggle,
  onDrawArea,
  onClearDraw,
  hasDrawnArea,
  userLocation,
  onGetRoute,
}: MapControlsProps) {
  const map = useMap();
  const [isSatellite, setIsSatellite] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const handleSatelliteToggle = () => {
    const newState = !isSatellite;
    setIsSatellite(newState);
    onSatelliteToggle?.(newState);
  };

  const handleGetUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          map.setView([latitude, longitude], 15, { animate: true });
        },
        (error) => {
          console.error('Error getting location:', error);
          alert(locale === 'ar' ? 'فشل الحصول على الموقع' : 'Failed to get location');
        }
      );
    }
  };

  if (!showControls) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="absolute top-4 right-4 z-[1000] bg-white shadow-lg"
        onClick={() => setShowControls(true)}
      >
        <Layers className="w-4 h-4" />
      </Button>
    );
  }

  return (
    <Card className="absolute top-4 right-4 z-[1000] bg-white shadow-lg p-2 space-y-2">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-gray-700">
          {locale === 'ar' ? 'التحكم' : 'Controls'}
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={() => setShowControls(false)}
        >
          <X className="w-3 h-3" />
        </Button>
      </div>
      
      <div className="flex flex-col gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleSatelliteToggle}
          className="justify-start text-xs"
        >
          <Layers className="w-3 h-3 mr-2" />
          {isSatellite
            ? locale === 'ar' ? 'عرض عادي' : 'Standard View'
            : locale === 'ar' ? 'عرض القمر الصناعي' : 'Satellite View'}
        </Button>

        {onDrawArea && (
          <Button
            variant="outline"
            size="sm"
            onClick={hasDrawnArea ? onClearDraw : onDrawArea}
            className="justify-start text-xs"
          >
            <MapPin className="w-3 h-3 mr-2" />
            {hasDrawnArea
              ? locale === 'ar' ? 'مسح المنطقة' : 'Clear Area'
              : locale === 'ar' ? 'رسم منطقة البحث' : 'Draw Search Area'}
          </Button>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={handleGetUserLocation}
          className="justify-start text-xs"
        >
          <Navigation className="w-3 h-3 mr-2" />
          {locale === 'ar' ? 'موقعي' : 'My Location'}
        </Button>
      </div>
    </Card>
  );
}

