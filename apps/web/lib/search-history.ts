/**
 * Search history management using localStorage
 */

const SEARCH_HISTORY_KEY = 'aqarbay_search_history';
const MAX_HISTORY_ITEMS = 10;

export interface SearchHistoryItem {
  query: string;
  filters: Record<string, string>;
  timestamp: number;
}

/**
 * Get search history
 */
export function getSearchHistory(): SearchHistoryItem[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const history = localStorage.getItem(SEARCH_HISTORY_KEY);
    return history ? JSON.parse(history) : [];
  } catch {
    return [];
  }
}

/**
 * Add search to history
 */
export function addToSearchHistory(query: string, filters: Record<string, string>): void {
  if (typeof window === 'undefined') return;
  
  const history = getSearchHistory();
  const newItem: SearchHistoryItem = {
    query,
    filters,
    timestamp: Date.now(),
  };
  
  // Remove duplicates (same query and filters)
  const filtered = history.filter(
    item => !(item.query === query && JSON.stringify(item.filters) === JSON.stringify(filters))
  );
  
  // Add new item at the beginning
  filtered.unshift(newItem);
  
  // Keep only last MAX_HISTORY_ITEMS
  const trimmed = filtered.slice(0, MAX_HISTORY_ITEMS);
  
  localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(trimmed));
}

/**
 * Clear search history
 */
export function clearSearchHistory(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SEARCH_HISTORY_KEY);
}

/**
 * Remove a specific search from history
 */
export function removeFromSearchHistory(timestamp: number): void {
  if (typeof window === 'undefined') return;
  
  const history = getSearchHistory();
  const filtered = history.filter(item => item.timestamp !== timestamp);
  localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(filtered));
}

