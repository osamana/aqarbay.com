'use client';

import Link from 'next/link';
import { Building2, Home, Castle, Trees, Store, Briefcase, ShoppingBag, LucideIcon } from 'lucide-react';

interface CategoryCardProps {
  type: string;
  iconName: string;
  label: string;
  count: number;
  locale: string;
}

// Icon mapping
const iconMap: Record<string, LucideIcon> = {
  Building2,
  Home,
  Castle,
  Trees,
  Store,
  Briefcase,
  ShoppingBag,
};

export default function CategoryCard({ type, iconName, label, count, locale }: CategoryCardProps) {
  const Icon = iconMap[iconName] || Building2;
  
  return (
    <Link href={`/${locale}/listings?type=${type}`}>
      <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-200 bg-white hover:border-yellow-400 hover:bg-yellow-50/50 transition-all duration-200 group cursor-pointer">
        <div className="flex-shrink-0">
          <Icon className="h-5 w-5 text-gray-600 group-hover:text-yellow-600 transition-colors" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-gray-900 group-hover:text-yellow-700 transition-colors truncate">
            {label}
          </div>
          <div className="text-xs text-gray-500">
            {count} {locale === 'ar' ? 'عقار' : 'Properties'}
          </div>
        </div>
      </div>
    </Link>
  );
}
