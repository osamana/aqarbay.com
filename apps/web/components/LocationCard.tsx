'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { MapPin, ArrowRight } from 'lucide-react';

interface LocationCardProps {
  name: string;
  slug: string;
  count: number;
  locale: string;
}

export default function LocationCard({ name, slug, count, locale }: LocationCardProps) {
  return (
    <Link href={`/${locale}/listings?location_slug=${slug}`}>
      <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer border-2 hover:border-yellow-400/30 group h-full">
        {/* Image placeholder with gradient */}
        <div className="h-40 md:h-48 bg-gradient-to-br from-yellow-400/20 via-amber-400/10 to-background relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center">
            <MapPin className="w-16 h-16 text-white/80 group-hover:scale-125 transition-transform duration-300" />
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-xl font-bold group-hover:text-yellow-600 transition-colors flex-1">
              {name}
            </h3>
            <ArrowRight 
              className={`w-5 h-5 text-muted-foreground group-hover:text-yellow-600 group-hover:translate-x-1 transition-all ${locale === 'ar' ? 'rotate-180' : ''}`} 
            />
          </div>
          
          <p className="text-muted-foreground font-medium">
            {count} {locale === 'ar' ? 'عقار متاح' : 'Properties Available'}
          </p>

          {/* Progress bar showing relative number of properties */}
          <div className="mt-4 h-1.5 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min((count / 50) * 100, 100)}%` }}
            />
          </div>
        </div>
      </Card>
    </Link>
  );
}
