'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import { Property } from '@/lib/api';
import { formatPrice, getImageUrl } from '@/lib/utils';
import Link from 'next/link';
import MapControls from './map/MapControls';
import DistanceCalculator from './map/DistanceCalculator';
import TileLayerSwitcher from './map/TileLayerSwitcher';
import MarkerClusterGroup from './map/MarkerClusterGroup';
import { Button } from '@/components/ui/button';
import { Ruler, X } from 'lucide-react';

// Fix for default marker icon in react-leaflet
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

interface MapViewEnhancedProps {
  properties: Property[];
  locale: string;
  hoveredPropertyId?: string | null;
  selectedPropertyId?: string | null;
  onMarkerClick?: (propertyId: string) => void;
  initialCenter?: [number, number] | null;
  initialZoom?: number;
  userLocation?: [number, number] | null;
  centerOn?: [number, number] | null;
  onBoundsChange?: (bounds: { north: number; south: number; east: number; west: number }) => void;
  onDrawAreaChange?: (bounds: { north: number; south: number; east: number; west: number } | null) => void;
}

// Create custom marker icon with price
function createCustomMarker(price: string, isHovered: boolean, isSelected: boolean) {
  const className = `custom-marker ${isHovered ? 'hovered' : ''} ${isSelected ? 'selected' : ''}`;
  
  return L.divIcon({
    className: className,
    html: `
      <div class="marker-container">
        <div class="marker-pin ${isSelected ? 'selected-pin' : isHovered ? 'hovered-pin' : ''}">
          <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 0C7.163 0 0 7.163 0 16C0 24.837 16 40 16 40C16 40 32 24.837 32 16C32 7.163 24.837 0 16 0Z" 
                  fill="${isSelected ? '#F59E0B' : isHovered ? '#FCD34D' : '#FBBF24'}"/>
            <circle cx="16" cy="16" r="8" fill="white"/>
          </svg>
        </div>
        <div class="marker-price ${isSelected ? 'selected-price' : isHovered ? 'hovered-price' : ''}">
          ${price}
        </div>
      </div>
    `,
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -40],
  });
}

// Create user location marker icon
function createUserLocationMarker() {
  return L.divIcon({
    className: 'user-location-marker',
    html: `
      <div style="position: relative; width: 24px; height: 24px;">
        <div style="
          position: absolute;
          top: 0;
          left: 0;
          width: 24px;
          height: 24px;
          background-color: #3B82F6;
          border-radius: 50%;
          opacity: 0.4;
          animation: userLocationPulse 2s ease-out infinite;
        "></div>
        <div style="
          position: absolute;
          top: 4px;
          left: 4px;
          width: 16px;
          height: 16px;
          background-color: #3B82F6;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        "></div>
        <div style="
          position: absolute;
          top: 9px;
          left: 9px;
          width: 6px;
          height: 6px;
          background-color: white;
          border-radius: 50%;
        "></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
}

// Component to handle map bounds changes
function MapBoundsHandler({ onBoundsChange }: { onBoundsChange?: (bounds: any) => void }) {
  const map = useMapEvents({
    moveend: () => {
      const bounds = map.getBounds();
      if (onBoundsChange) {
        onBoundsChange({
          north: bounds.getNorth(),
          south: bounds.getSouth(),
          east: bounds.getEast(),
          west: bounds.getWest(),
        });
      }
    },
  });
  return null;
}

// Component to update map view when properties change
function MapUpdater({ 
  properties, 
  initialCenter,
  initialZoom,
  centerOn
}: { 
  properties: Property[];
  initialCenter?: [number, number] | null;
  initialZoom?: number;
  centerOn?: [number, number] | null;
}) {
  const map = useMap();
  const [hasInitialized, setHasInitialized] = useState(false);
  const [hasManuallyCentered, setHasManuallyCentered] = useState(false);

  useEffect(() => {
    const validProperties = properties.filter(p => p.lat && p.lng);
    
    if (centerOn) {
      map.setView(centerOn, 15, { animate: true });
      setHasManuallyCentered(true);
      return;
    }
    
    if (!hasManuallyCentered) {
      if (initialCenter) {
        map.setView(initialCenter, initialZoom || 12, { animate: true });
        if (!hasInitialized) {
          setHasInitialized(true);
        }
      } else if (!hasInitialized && validProperties.length > 0) {
        const bounds = L.latLngBounds(
          validProperties.map(p => [p.lat!, p.lng!])
        );
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
        setHasInitialized(true);
      }
    }
  }, [properties, map, initialCenter, initialZoom, hasInitialized, centerOn, hasManuallyCentered]);

  return null;
}

// Draw area handler component
function DrawAreaHandler({ 
  onDrawAreaChange,
  hasDrawnArea,
  locale 
}: { 
  onDrawAreaChange?: (bounds: any) => void;
  hasDrawnArea: boolean;
  locale: string;
}) {
  const map = useMap();
  const drawRef = useRef<any>(null);
  const drawnLayerRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Dynamically import leaflet-draw
    import('leaflet-draw').then((L_DrawModule: any) => {
      if (!drawRef.current) {
        // Access Draw from the module - handle different import structures
        const DrawClass = (L_DrawModule as any).default?.Draw || 
                         (L_DrawModule as any).Draw || 
                         ((window as any).L?.Draw);
        
        if (!DrawClass) {
          console.error('Could not find Draw class in leaflet-draw');
          return;
        }
        
        const drawControl = new DrawClass({
          draw: {
            rectangle: {
              shapeOptions: {
                color: '#F59E0B',
                weight: 2,
                fillOpacity: 0.2,
              },
            },
            polygon: false,
            circle: false,
            marker: false,
            circlemarker: false,
            polyline: false,
          },
          edit: {
            featureGroup: drawnLayerRef.current || new L.FeatureGroup(),
            remove: true,
          },
        });

        map.addControl(drawControl);
        drawRef.current = drawControl;

        // Handle draw events using string event names
        map.on('draw:created' as any, (e: any) => {
          const layer = e.layer;
          if (drawnLayerRef.current) {
            drawnLayerRef.current.clearLayers();
          }
          drawnLayerRef.current = new L.FeatureGroup([layer]);
          map.addLayer(layer);

          const bounds = layer.getBounds();
          if (onDrawAreaChange) {
            onDrawAreaChange({
              north: bounds.getNorth(),
              south: bounds.getSouth(),
              east: bounds.getEast(),
              west: bounds.getWest(),
            });
          }
        });

        map.on('draw:deleted' as any, () => {
          if (onDrawAreaChange) {
            onDrawAreaChange(null);
          }
        });
      }
    }).catch((err) => {
      console.error('Failed to load leaflet-draw:', err);
    });

    return () => {
      if (drawRef.current) {
        map.removeControl(drawRef.current);
      }
    };
  }, [map, onDrawAreaChange, locale]);

  return null;
}

export default function MapViewEnhanced({ 
  properties, 
  locale, 
  hoveredPropertyId = null,
  selectedPropertyId = null,
  onMarkerClick,
  initialCenter = null,
  initialZoom = 8,
  userLocation = null,
  centerOn = null,
  onBoundsChange,
  onDrawAreaChange,
}: MapViewEnhancedProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isSatellite, setIsSatellite] = useState(false);
  const [hasDrawnArea, setHasDrawnArea] = useState(false);
  const [showDistanceCalculator, setShowDistanceCalculator] = useState(false);
  const [drawnBounds, setDrawnBounds] = useState<any>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Filter properties with coordinates
  const propertiesWithCoords = useMemo(() => {
    let filtered = properties.filter(p => p.lat && p.lng);
    
    // Filter by drawn area if exists
    if (drawnBounds) {
      filtered = filtered.filter(p => {
        return (
          p.lat! >= drawnBounds.south &&
          p.lat! <= drawnBounds.north &&
          p.lng! >= drawnBounds.west &&
          p.lng! <= drawnBounds.east
        );
      });
    }
    
    return filtered;
  }, [properties, drawnBounds]);

  const handleDrawAreaChange = (bounds: any) => {
    setDrawnBounds(bounds);
    setHasDrawnArea(!!bounds);
    onDrawAreaChange?.(bounds);
  };

  const handleClearDraw = () => {
    setDrawnBounds(null);
    setHasDrawnArea(false);
    onDrawAreaChange?.(null);
  };

  if (!isMounted) {
    return (
      <div className="h-full bg-muted flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-muted-foreground">
            {locale === 'ar' ? 'جاري تحميل الخريطة...' : 'Loading map...'}
          </p>
        </div>
      </div>
    );
  }

  if (propertiesWithCoords.length === 0 && !drawnBounds) {
    return (
      <div className="h-full bg-gradient-to-br from-yellow-50 to-amber-50 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <p className="text-lg font-semibold mb-2 text-gray-700">
            {locale === 'ar' ? 'لا توجد مواقع على الخريطة' : 'No Map Locations'}
          </p>
          <p className="text-muted-foreground text-sm">
            {locale === 'ar' 
              ? 'العقارات المعروضة ليس لها إحداثيات على الخريطة' 
              : 'The displayed properties do not have map coordinates'}
          </p>
        </div>
      </div>
    );
  }

  const defaultCenter: [number, number] = 
    initialCenter || 
    (propertiesWithCoords.length > 0 
      ? [propertiesWithCoords[0].lat!, propertiesWithCoords[0].lng!]
      : [31.9522, 35.2332]);

  return (
    <div className="h-full relative">
      <MapContainer
        center={defaultCenter}
        zoom={initialZoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <TileLayerSwitcher isSatellite={isSatellite} />
        
        <MapUpdater 
          properties={propertiesWithCoords} 
          initialCenter={initialCenter}
          initialZoom={initialZoom}
          centerOn={centerOn}
        />

        <MapBoundsHandler onBoundsChange={onBoundsChange} />
        
        {hasDrawnArea && (
          <DrawAreaHandler 
            onDrawAreaChange={handleDrawAreaChange}
            hasDrawnArea={hasDrawnArea}
            locale={locale}
          />
        )}

        {/* User Location Marker */}
        {userLocation && (
          <Marker
            position={userLocation}
            icon={createUserLocationMarker()}
          >
            <Popup>
              <div className="p-2">
                <div className="font-semibold text-sm text-blue-600 mb-1">
                  {locale === 'ar' ? 'موقعك الحالي' : 'Your Location'}
                </div>
                <div className="text-xs text-gray-600">
                  {userLocation[0].toFixed(6)}, {userLocation[1].toFixed(6)}
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Use marker clustering for better performance */}
        {propertiesWithCoords.length > 10 ? (
          <MarkerClusterGroup
            properties={propertiesWithCoords}
            locale={locale}
            hoveredPropertyId={hoveredPropertyId}
            selectedPropertyId={selectedPropertyId}
            onMarkerClick={onMarkerClick}
            createCustomMarker={createCustomMarker}
          />
        ) : (
          propertiesWithCoords.map((property) => {
            const title = locale === 'ar' ? property.title_ar : property.title_en;
            const slug = locale === 'ar' ? property.slug_ar : property.slug_en;
            const price = formatPrice(Number(property.price_amount), property.price_currency);
            const isHovered = hoveredPropertyId === property.id;
            const isSelected = selectedPropertyId === property.id;

            return (
              <Marker
                key={property.id}
                position={[property.lat!, property.lng!]}
                icon={createCustomMarker(price, isHovered, isSelected)}
                eventHandlers={{
                  click: () => {
                    onMarkerClick?.(property.id);
                  },
                }}
              >
                <Popup maxWidth={300} minWidth={250} className="custom-popup">
                  <div className="p-2">
                    <Link href={`/${locale}/listings/${slug}`} className="block group">
                      {(property.first_image || property.images?.[0]?.file_key) && (
                        <div className="aspect-video mb-3 overflow-hidden rounded-lg">
                          <img
                            src={getImageUrl(property.first_image || property.images?.[0]?.file_key)}
                            alt={title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <h3 className="font-bold text-base mb-2 line-clamp-2 group-hover:text-yellow-600 transition-colors">
                        {title}
                      </h3>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-yellow-600 font-bold text-lg">
                          {price}
                        </span>
                        {property.purpose === 'rent' && (
                          <span className="text-xs text-muted-foreground">
                            {locale === 'ar' ? '/شهر' : '/month'}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        {property.bedrooms && (
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            {property.bedrooms}
                          </span>
                        )}
                        {property.bathrooms && (
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {property.bathrooms}
                          </span>
                        )}
                        {property.area_m2 && (
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                            </svg>
                            {property.area_m2} m²
                          </span>
                        )}
                      </div>
                      <div className="mt-3 text-xs text-yellow-600 font-medium">
                        {locale === 'ar' ? 'عرض التفاصيل ←' : 'View Details →'}
                      </div>
                    </Link>
                  </div>
                </Popup>
              </Marker>
            );
          })
        )}
      </MapContainer>

      {/* Map Controls */}
      <MapControls
        locale={locale}
        onSatelliteToggle={setIsSatellite}
        onDrawArea={() => setHasDrawnArea(true)}
        onClearDraw={handleClearDraw}
        hasDrawnArea={hasDrawnArea}
        userLocation={userLocation}
      />

      {/* Distance Calculator Toggle */}
      {userLocation && (
        <div className="absolute bottom-4 left-4 z-[1000]">
          {showDistanceCalculator ? (
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                className="absolute top-0 right-0 bg-white shadow-lg"
                onClick={() => setShowDistanceCalculator(false)}
              >
                <X className="w-4 h-4" />
              </Button>
              <DistanceCalculator
                properties={properties}
                userLocation={userLocation}
                locale={locale}
                onClose={() => setShowDistanceCalculator(false)}
              />
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="bg-white shadow-lg"
              onClick={() => setShowDistanceCalculator(true)}
            >
              <Ruler className="w-4 h-4 mr-2" />
              {locale === 'ar' ? 'حاسبة المسافة' : 'Distance Calculator'}
            </Button>
          )}
        </div>
      )}

      {/* Map Legend */}
      <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-3 z-10 text-xs">
        <div className="font-semibold mb-2 text-gray-700">
          {locale === 'ar' ? 'عدد العقارات' : 'Properties'}
        </div>
        <div className="text-yellow-600 font-bold text-lg">
          {propertiesWithCoords.length}
        </div>
      </div>
    </div>
  );
}

