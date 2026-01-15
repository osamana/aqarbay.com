'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/button';
import { Navigation, Route, MapPin } from 'lucide-react';
import { getPropertyPOIs, POI } from '@/lib/api';
import { getRouteUrl, getStreetViewUrl, getTransitUrl } from '@/lib/map-utils';

// Fix for default marker icon
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

interface PropertyMapProps {
  lat: number;
  lng: number;
  title: string;
  locale: string;
  propertySlug?: string;
}

// Create custom yellow marker for property
function createYellowMarker() {
  return L.divIcon({
    className: 'custom-property-marker',
    html: `
      <div class="marker-pin-wrapper">
        <svg width="40" height="50" viewBox="0 0 40 50" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 0C8.954 0 0 8.954 0 20C0 31.046 20 50 20 50C20 50 40 31.046 40 20C40 8.954 31.046 0 20 0Z" 
                fill="#FBBF24"/>
          <circle cx="20" cy="20" r="10" fill="white"/>
          <path d="M20 15v10M15 20h10" stroke="#FBBF24" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </div>
    `,
    iconSize: [40, 50],
    iconAnchor: [20, 50],
    popupAnchor: [0, -50],
  });
}

// Create POI markers with different colors based on category
function createPOIMarker(category: string) {
  const colors: Record<string, string> = {
    schools: '#3B82F6',      // Blue
    mosques: '#10B981',      // Green
    hospitals: '#EF4444',    // Red
    supermarkets: '#8B5CF6', // Purple
    banks: '#F59E0B',        // Amber
    restaurants: '#EC4899', // Pink
    parks: '#22C55E',        // Green
    gas_stations: '#6366F1', // Indigo
  };
  
  const color = colors[category] || '#6B7280';
  
  return L.divIcon({
    className: 'custom-poi-marker',
    html: `
      <div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
}

export default function PropertyMap({ lat, lng, title, locale, propertySlug }: PropertyMapProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [pois, setPois] = useState<{ category: string; pois: POI[] }[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    async function fetchPOIs() {
      if (!propertySlug) return;
      try {
        const data = await getPropertyPOIs(propertySlug, locale);
        // Convert POIs object to array format
        const poisArray = Object.entries(data.pois).map(([category, poisList]) => ({
          category,
          pois: poisList,
        }));
        setPois(poisArray);
      } catch (err) {
        console.error('Error fetching POIs for map:', err);
      }
    }
    fetchPOIs();
  }, [propertySlug, locale]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        () => {
          // User denied or error
        }
      );
    }
  }, []);

  if (!isMounted) {
    return (
      <div className="h-[400px] bg-muted rounded-xl flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-muted-foreground">
            {locale === 'ar' ? 'جاري تحميل الخريطة...' : 'Loading map...'}
          </p>
        </div>
      </div>
    );
  }

  const openInMaps = () => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank');
  };

  const openRoute = (mode: 'driving' | 'walking' | 'transit' = 'driving') => {
    if (userLocation) {
      window.open(getRouteUrl(userLocation[0], userLocation[1], lat, lng, mode), '_blank');
    } else {
      // If no user location, just open the property location
      openInMaps();
    }
  };

  const openStreetView = () => {
    window.open(getStreetViewUrl(lat, lng), '_blank');
  };

  const openTransitInfo = () => {
    window.open(getTransitUrl(lat, lng), '_blank');
  };

  return (
    <div className="relative h-[400px] rounded-xl overflow-hidden border-2 border-gray-200 shadow-lg">
      <MapContainer
        center={[lat, lng]}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <Marker position={[lat, lng]} icon={createYellowMarker()}>
          <Popup>
            <div className="p-2">
              <h3 className="font-semibold mb-2">{title}</h3>
              <div className="space-y-2">
                <Button
                  size="sm"
                  onClick={openInMaps}
                  className="bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 w-full"
                >
                  <Navigation className="w-4 h-4 mr-2" />
                  {locale === 'ar' ? 'فتح في خرائط جوجل' : 'Open in Google Maps'}
                </Button>
                {userLocation && (
                  <div className="space-y-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openRoute('driving')}
                      className="w-full text-xs"
                    >
                      <Route className="w-3 h-3 mr-2" />
                      {locale === 'ar' ? 'طريق بالسيارة' : 'Driving Route'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openRoute('walking')}
                      className="w-full text-xs"
                    >
                      {locale === 'ar' ? 'طريق مشي' : 'Walking Route'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openRoute('transit')}
                      className="w-full text-xs"
                    >
                      {locale === 'ar' ? 'طريق بالمواصلات' : 'Transit Route'}
                    </Button>
                  </div>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={openStreetView}
                  className="w-full text-xs"
                >
                  {locale === 'ar' ? 'عرض الشارع' : 'Street View'}
                </Button>
              </div>
            </div>
          </Popup>
        </Marker>

        {/* POI Markers */}
        {pois.map(({ category, pois: categoryPois }) =>
          categoryPois.slice(0, 10).map((poi, idx) => (
            <Marker
              key={`${category}-${idx}`}
              position={[poi.lat, poi.lng]}
              icon={createPOIMarker(category)}
            >
              <Popup>
                <div className="p-2">
                  <h4 className="font-semibold text-sm mb-1">
                    {locale === 'ar' && poi.name_ar ? poi.name_ar : poi.name_en || poi.name}
                  </h4>
                  {poi.address && (
                    <p className="text-xs text-gray-600 mb-1">{poi.address}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    {Math.round(poi.distance)} {locale === 'ar' ? 'م' : 'm'} {locale === 'ar' ? 'بعيداً' : 'away'}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))
        )}
      </MapContainer>

      {/* Action Buttons */}
      <div className="absolute bottom-4 left-4 right-4 z-10 space-y-2">
        <Button
          onClick={openInMaps}
          className="w-full bg-white hover:bg-gray-50 text-gray-800 border-2 border-yellow-400 shadow-lg"
        >
          <Navigation className="w-5 h-5 mr-2" />
          {locale === 'ar' ? 'احصل على الاتجاهات' : 'Get Directions'}
        </Button>
        <div className="grid grid-cols-2 gap-2">
          {userLocation && (
            <Button
              onClick={() => openRoute('transit')}
              variant="outline"
              size="sm"
              className="bg-white text-xs"
            >
              <MapPin className="w-3 h-3 mr-1" />
              {locale === 'ar' ? 'مواصلات' : 'Transit'}
            </Button>
          )}
          <Button
            onClick={openStreetView}
            variant="outline"
            size="sm"
            className="bg-white text-xs"
          >
            {locale === 'ar' ? 'عرض الشارع' : 'Street View'}
          </Button>
        </div>
      </div>
    </div>
  );
}

