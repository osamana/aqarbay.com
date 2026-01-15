import { MetadataRoute } from 'next';
import { getProperties, getLocations } from '@/lib/api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_WEB_URL || 'https://yourdomain.com';
  
  // Try to get data, but handle errors gracefully during build
  let properties: any[] = [];
  let locations: any[] = [];
  
  try {
    const result = await getProperties({ page_size: 1000 });
    properties = result.items || [];
    locations = await getLocations();
  } catch (error) {
    console.warn('Could not fetch data for sitemap, using static pages only');
  }

  const staticPages = [
    {
      url: `${baseUrl}/en`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/ar`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/en/listings`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/ar/listings`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
  ];

  const propertyPages = properties.flatMap((property) => [
    {
      url: `${baseUrl}/en/listings/${property.slug_en}`,
      lastModified: new Date(property.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/ar/listings/${property.slug_ar}`,
      lastModified: new Date(property.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
  ]);

  const locationPages = locations.flatMap((location) => [
    {
      url: `${baseUrl}/en/listings?location_slug=${location.slug_en}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/ar/listings?location_slug=${location.slug_ar}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
  ]);

  return [...staticPages, ...propertyPages, ...locationPages];
}

