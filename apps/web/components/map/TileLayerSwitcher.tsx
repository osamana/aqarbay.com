'use client';

import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

interface TileLayerSwitcherProps {
  isSatellite: boolean;
}

export default function TileLayerSwitcher({ isSatellite }: TileLayerSwitcherProps) {
  const map = useMap();

  useEffect(() => {
    // Remove existing tile layers
    map.eachLayer((layer: any) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    // Add new tile layer based on mode
    const url = isSatellite
      ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    const attribution = isSatellite
      ? '&copy; Esri'
      : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

    L.tileLayer(url, {
      attribution,
      maxZoom: 19,
    }).addTo(map);
  }, [isSatellite, map]);

  return null;
}

