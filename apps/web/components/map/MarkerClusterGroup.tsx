'use client';

import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { Property } from '@/lib/api';
import { formatPrice } from '@/lib/utils';

interface MarkerClusterGroupProps {
  properties: Property[];
  locale: string;
  hoveredPropertyId?: string | null;
  selectedPropertyId?: string | null;
  onMarkerClick?: (propertyId: string) => void;
  createCustomMarker: (price: string, isHovered: boolean, isSelected: boolean) => L.DivIcon;
}

export default function MarkerClusterGroup({
  properties,
  locale,
  hoveredPropertyId,
  selectedPropertyId,
  onMarkerClick,
  createCustomMarker,
}: MarkerClusterGroupProps) {
  const map = useMap();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Dynamically import markercluster
    import('leaflet.markercluster').then((MarkerCluster) => {
      const markers = L.markerClusterGroup({
        maxClusterRadius: 50,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
        iconCreateFunction: (cluster) => {
          const count = cluster.getChildCount();
          return L.divIcon({
            html: `<div style="
              background-color: #F59E0B;
              color: white;
              border-radius: 50%;
              width: 40px;
              height: 40px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: bold;
              font-size: 14px;
              border: 3px solid white;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            ">${count}</div>`,
            className: 'marker-cluster',
            iconSize: L.point(40, 40),
          });
        },
      });

      // Add markers to cluster group
      properties.forEach((property) => {
        if (!property.lat || !property.lng) return;

        const title = locale === 'ar' ? property.title_ar : property.title_en;
        const slug = locale === 'ar' ? property.slug_ar : property.slug_en;
        const price = formatPrice(Number(property.price_amount), property.price_currency);
        const isHovered = hoveredPropertyId === property.id;
        const isSelected = selectedPropertyId === property.id;

        const marker = L.marker([property.lat!, property.lng!], {
          icon: createCustomMarker(price, isHovered, isSelected),
        });

        marker.on('click', () => {
          onMarkerClick?.(property.id);
        });

        // Add popup
        const popupContent = `
          <div style="padding: 8px; min-width: 200px;">
            <h3 style="font-weight: bold; margin-bottom: 8px; font-size: 14px;">${title}</h3>
            <div style="color: #F59E0B; font-weight: bold; font-size: 16px; margin-bottom: 8px;">${price}</div>
            <a href="/${locale}/listings/${slug}" style="color: #F59E0B; text-decoration: none; font-size: 12px;">
              ${locale === 'ar' ? 'عرض التفاصيل ←' : 'View Details →'}
            </a>
          </div>
        `;
        marker.bindPopup(popupContent);

        markers.addLayer(marker);
      });

      map.addLayer(markers);

      return () => {
        map.removeLayer(markers);
      };
    });
  }, [properties, locale, hoveredPropertyId, selectedPropertyId, map, onMarkerClick, createCustomMarker]);

  return null;
}

