'use client';

import { useEffect, useState } from 'react';
import { getProperties, getLocations } from '@/lib/api';
import { TrendingUp, MapPin, Home, Tag } from 'lucide-react';

interface Stats {
  totalProperties: number;
  totalLocations: number;
  forSale: number;
  forRent: number;
}

export default function StatsBar({ locale }: { locale: string }) {
  const [stats, setStats] = useState<Stats>({
    totalProperties: 0,
    totalLocations: 0,
    forSale: 0,
    forRent: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [allProperties, locations] = await Promise.all([
          getProperties({ page_size: 1000 }),
          getLocations(),
        ]);

        const forSale = allProperties.items.filter(p => p.purpose === 'sell').length;
        const forRent = allProperties.items.filter(p => p.purpose === 'rent').length;

        setStats({
          totalProperties: allProperties.total,
          totalLocations: locations.length,
          forSale,
          forRent,
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statItems = [
    {
      icon: Home,
      value: stats.totalProperties,
      label: locale === 'ar' ? 'عقار متاح' : 'Properties Available',
    },
    {
      icon: MapPin,
      value: stats.totalLocations,
      label: locale === 'ar' ? 'مدينة ومنطقة' : 'Cities & Areas',
    },
    {
      icon: Tag,
      value: stats.forSale,
      label: locale === 'ar' ? 'للبيع' : 'For Sale',
    },
    {
      icon: TrendingUp,
      value: stats.forRent,
      label: locale === 'ar' ? 'للإيجار' : 'For Rent',
    },
  ];

  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200/50 p-6">
        <div className="flex flex-wrap justify-center gap-8 md:gap-12">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="h-10 w-10 bg-muted rounded"></div>
              <div>
                <div className="h-6 w-12 bg-muted rounded mb-1"></div>
                <div className="h-4 w-20 bg-muted rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200/50 p-6 md:p-8">
      <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 lg:gap-16">
        {statItems.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="flex items-center gap-3 group"
            >
              <div className="flex-shrink-0">
                <Icon className="h-5 w-5 text-yellow-500 group-hover:text-yellow-600 transition-colors" />
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-gray-900 leading-none mb-1">
                  {stat.value}
                </div>
                <div className="text-xs md:text-sm text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
              {index < statItems.length - 1 && (
                <div className="hidden md:block h-12 w-px bg-gray-200 ml-4" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
