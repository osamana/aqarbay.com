import { Property } from './api';

const FAVORITES_KEY = 'aqarbay_favorites';

/**
 * Get all favorite property IDs
 */
export function getFavoriteIds(): string[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const favorites = localStorage.getItem(FAVORITES_KEY);
    return favorites ? JSON.parse(favorites) : [];
  } catch {
    return [];
  }
}

/**
 * Check if a property is favorited
 */
export function isFavorite(propertyId: string): boolean {
  const favorites = getFavoriteIds();
  return favorites.includes(propertyId);
}

/**
 * Add a property to favorites
 */
export function addFavorite(propertyId: string): void {
  if (typeof window === 'undefined') return;
  
  const favorites = getFavoriteIds();
  if (!favorites.includes(propertyId)) {
    favorites.push(propertyId);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }
}

/**
 * Remove a property from favorites
 */
export function removeFavorite(propertyId: string): void {
  if (typeof window === 'undefined') return;
  
  const favorites = getFavoriteIds();
  const filtered = favorites.filter(id => id !== propertyId);
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(filtered));
}

/**
 * Toggle favorite status
 */
export function toggleFavorite(propertyId: string): boolean {
  if (isFavorite(propertyId)) {
    removeFavorite(propertyId);
    return false;
  } else {
    addFavorite(propertyId);
    return true;
  }
}

/**
 * Get favorite properties from a list
 */
export function getFavoriteProperties(properties: Property[]): Property[] {
  const favoriteIds = getFavoriteIds();
  return properties.filter(p => favoriteIds.includes(p.id));
}

