'use client';

import { useState, useEffect, useMemo } from 'react';
import { Property } from '@/lib/api';
import PropertyCard from '@/components/PropertyCard';
import MapView from '@/components/MapView';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react';

interface ListingsViewProps {
  properties: Property[];
  locale: string;
  total: number;
  page: number;
  totalPages: number;
}

export default function ListingsView({
  properties,
  locale,
  total,
  page,
  totalPages,
}: ListingsViewProps) {
  const [hoveredPropertyId, setHoveredPropertyId] = useState<string | null>(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(true);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [centerOnProperty, setCenterOnProperty] = useState<[number, number] | null>(null);

  // Request user location on mount
  useEffect(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setLocationLoading(false);
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log('User location obtained:', latitude, longitude);
        setUserLocation([latitude, longitude]);
        setLocationLoading(false);
      },
      (error) => {
        // User denied permission or error occurred
        console.log('Location access denied or error:', error.message);
        setLocationLoading(false);
      },
      options
    );
  }, []);

  // Get initial center: user location or first property location
  // Use useMemo to recalculate when userLocation changes
  const initialCenter = useMemo((): [number, number] | null => {
    if (userLocation) {
      return userLocation;
    }
    
    // Fallback to first property with coordinates
    const firstPropertyWithCoords = properties.find(p => p.lat && p.lng);
    if (firstPropertyWithCoords) {
      return [firstPropertyWithCoords.lat!, firstPropertyWithCoords.lng!];
    }
    
    return null;
  }, [userLocation, properties]);

  // Handle locate button click
  const handleLocateProperty = (property: Property) => {
    // Use property coordinates first, fallback to location coordinates
    const lat = property.lat || property.location?.lat;
    const lng = property.lng || property.location?.lng;
    
    if (lat && lng) {
      setCenterOnProperty([lat, lng]);
      setSelectedPropertyId(property.id);
      // Reset after animation completes so it can be triggered again for the same property
      setTimeout(() => setCenterOnProperty(null), 2000);
    }
  };

  if (properties.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          <h3 className="text-xl font-bold mb-2">
            {locale === 'ar' ? 'لم يتم العثور على عقارات' : 'No Properties Found'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {locale === 'ar' 
              ? 'جرب تعديل الفلاتر أو البحث عن معايير مختلفة' 
              : 'Try adjusting your filters or search with different criteria'}
          </p>
          <Button
            variant="outline"
            onClick={() => window.location.href = `/${locale}/listings`}
            className="border-2 border-yellow-400 text-yellow-600 hover:bg-yellow-50"
          >
            {locale === 'ar' ? 'مسح الفلاتر' : 'Clear Filters'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-0 h-full max-h-screen">
      {/* Property List - Left Side */}
      <div className="lg:w-2/5 flex flex-col min-h-0">
        {/* Results Header */}
        <div className="bg-white border-b px-4 py-3 flex items-center justify-between sticky top-0 z-10">
          <div className="text-sm font-medium text-gray-700">
            {locale === 'ar' ? `${total} عقار` : `${total} Properties`}
          </div>
          
          {/* Mobile Map Toggle */}
          <button
            onClick={() => setShowMap(!showMap)}
            className="lg:hidden text-sm font-medium text-yellow-600 flex items-center gap-1"
          >
            {showMap ? (
              <>
                <ChevronUp className="w-4 h-4" />
                {locale === 'ar' ? 'إخفاء الخريطة' : 'Hide Map'}
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                {locale === 'ar' ? 'عرض الخريطة' : 'Show Map'}
              </>
            )}
          </button>
        </div>

        {/* Property Cards - Scrollable */}
        <div className="flex-1 overflow-y-auto px-4 py-4 bg-gray-50 min-h-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {properties.map((property) => (
              <div
                key={property.id}
                onMouseEnter={() => setHoveredPropertyId(property.id)}
                onMouseLeave={() => setHoveredPropertyId(null)}
                onClick={() => setSelectedPropertyId(property.id)}
                className={`transition-all duration-200 ${
                  selectedPropertyId === property.id ? 'ring-2 ring-yellow-400 rounded-xl' : ''
                }`}
              >
                <PropertyCard
                  property={property}
                  locale={locale}
                  onLocate={() => handleLocateProperty(property)}
                />
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 py-6">
              {page > 1 && (
                <Button variant="outline" size="sm" asChild>
                  <a href={`?page=${page - 1}`} className="flex items-center gap-1">
                    <ChevronLeft className="w-4 h-4" />
                    {locale === 'ar' ? 'السابق' : 'Previous'}
                  </a>
                </Button>
              )}
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? 'default' : 'outline'}
                      size="sm"
                      asChild
                      className={page === pageNum ? 'bg-yellow-400 hover:bg-yellow-500' : ''}
                    >
                      <a href={`?page=${pageNum}`}>{pageNum}</a>
                    </Button>
                  );
                })}
              </div>
              
              {page < totalPages && (
                <Button variant="outline" size="sm" asChild>
                  <a href={`?page=${page + 1}`} className="flex items-center gap-1">
                    {locale === 'ar' ? 'التالي' : 'Next'}
                    <ChevronRight className="w-4 h-4" />
                  </a>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Map View - Right Side */}
      <div className={`lg:w-3/5 ${showMap ? 'block' : 'hidden lg:block'} flex flex-col min-h-0`}>
        <div className="sticky top-0 h-[400px] lg:h-full lg:max-h-[calc(100vh-180px)] flex-shrink-0">
          <MapView
            properties={properties}
            locale={locale}
            hoveredPropertyId={hoveredPropertyId}
            selectedPropertyId={selectedPropertyId}
            initialCenter={initialCenter}
            initialZoom={userLocation ? 12 : 8}
            userLocation={userLocation}
            centerOn={centerOnProperty}
            onMarkerClick={(propertyId) => {
              setSelectedPropertyId(propertyId);
              // Scroll to property card
              const element = document.querySelector(`[data-property-id="${propertyId}"]`);
              if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
