/**
 * Saved searches management using localStorage
 */

const SAVED_SEARCHES_KEY = 'aqarbay_saved_searches';

export interface SavedSearch {
  id: string;
  name: string;
  query?: string;
  filters: Record<string, string>;
  createdAt: number;
  lastUsed?: number;
}

/**
 * Get all saved searches
 */
export function getSavedSearches(): SavedSearch[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const saved = localStorage.getItem(SAVED_SEARCHES_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

/**
 * Save a search
 */
export function saveSearch(name: string, query: string, filters: Record<string, string>): string {
  if (typeof window === 'undefined') return '';
  
  const saved = getSavedSearches();
  const newSearch: SavedSearch = {
    id: `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    query,
    filters,
    createdAt: Date.now(),
  };
  
  saved.push(newSearch);
  localStorage.setItem(SAVED_SEARCHES_KEY, JSON.stringify(saved));
  
  return newSearch.id;
}

/**
 * Delete a saved search
 */
export function deleteSavedSearch(id: string): void {
  if (typeof window === 'undefined') return;
  
  const saved = getSavedSearches();
  const filtered = saved.filter(search => search.id !== id);
  localStorage.setItem(SAVED_SEARCHES_KEY, JSON.stringify(filtered));
}

/**
 * Update last used timestamp
 */
export function updateSavedSearchUsage(id: string): void {
  if (typeof window === 'undefined') return;
  
  const saved = getSavedSearches();
  const updated = saved.map(search => 
    search.id === id ? { ...search, lastUsed: Date.now() } : search
  );
  localStorage.setItem(SAVED_SEARCHES_KEY, JSON.stringify(updated));
}

/**
 * Get search parameters from saved search
 */
export function getSearchParamsFromSaved(search: SavedSearch): URLSearchParams {
  const params = new URLSearchParams();
  
  if (search.query) {
    params.set('q', search.query);
  }
  
  Object.entries(search.filters).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    }
  });
  
  return params;
}

