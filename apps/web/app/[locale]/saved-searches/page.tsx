'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  getSavedSearches,
  deleteSavedSearch,
  getSearchParamsFromSaved,
  SavedSearch,
} from '@/lib/saved-searches';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Search } from 'lucide-react';

export default function SavedSearchesPage({ params: { locale } }: { params: { locale: string } }) {
  const router = useRouter();
  const [searches, setSearches] = useState<SavedSearch[]>([]);

  useEffect(() => {
    loadSearches();
  }, []);

  const loadSearches = () => {
    const saved = getSavedSearches();
    setSearches(saved);
  };

  const handleUseSearch = (search: SavedSearch) => {
    const params = getSearchParamsFromSaved(search);
    router.push(`/${locale}/listings?${params.toString()}`);
  };

  const handleDelete = (id: string) => {
    if (confirm(locale === 'ar' ? 'هل أنت متأكد من الحذف؟' : 'Are you sure you want to delete?')) {
      deleteSavedSearch(id);
      loadSearches();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">
          {locale === 'ar' ? 'البحوث المحفوظة' : 'Saved Searches'}
        </h1>

        {searches.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Search className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">
                {locale === 'ar' ? 'لا توجد بحوث محفوظة' : 'No saved searches yet'}
              </p>
              <p className="text-gray-400 text-sm mt-2">
                {locale === 'ar'
                  ? 'احفظ معايير البحث الخاصة بك للوصول السريع'
                  : 'Save your search criteria for quick access'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {searches.map((search) => (
              <Card key={search.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">{search.name}</h3>
                      {search.query && (
                        <p className="text-sm text-gray-600 mb-2">
                          <strong>{locale === 'ar' ? 'البحث:' : 'Search:'}</strong> {search.query}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                        {Object.entries(search.filters).map(([key, value]) => {
                          if (!value) return null;
                          return (
                            <span key={key} className="bg-gray-100 px-2 py-1 rounded">
                              {key}: {value}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUseSearch(search)}
                      >
                        {locale === 'ar' ? 'استخدام' : 'Use'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(search.id)}
                        className="text-red-600"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

