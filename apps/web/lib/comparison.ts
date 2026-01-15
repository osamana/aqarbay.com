import { Property } from './api';

const COMPARISON_KEY = 'aqarbay_comparison';
const MAX_COMPARISON = 4;

/**
 * Get all comparison property IDs
 */
export function getComparisonIds(): string[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const comparison = localStorage.getItem(COMPARISON_KEY);
    return comparison ? JSON.parse(comparison) : [];
  } catch {
    return [];
  }
}

/**
 * Check if a property is in comparison
 */
export function isInComparison(propertyId: string): boolean {
  const comparison = getComparisonIds();
  return comparison.includes(propertyId);
}

/**
 * Add a property to comparison
 */
export function addToComparison(propertyId: string): boolean {
  if (typeof window === 'undefined') return false;
  
  const comparison = getComparisonIds();
  
  if (comparison.includes(propertyId)) {
    return false; // Already in comparison
  }
  
  if (comparison.length >= MAX_COMPARISON) {
    return false; // Max reached
  }
  
  comparison.push(propertyId);
  localStorage.setItem(COMPARISON_KEY, JSON.stringify(comparison));
  return true;
}

/**
 * Remove a property from comparison
 */
export function removeFromComparison(propertyId: string): void {
  if (typeof window === 'undefined') return;
  
  const comparison = getComparisonIds();
  const filtered = comparison.filter(id => id !== propertyId);
  localStorage.setItem(COMPARISON_KEY, JSON.stringify(filtered));
}

/**
 * Clear all comparisons
 */
export function clearComparison(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(COMPARISON_KEY);
}

/**
 * Get comparison properties from a list
 */
export function getComparisonProperties(properties: Property[]): Property[] {
  const comparisonIds = getComparisonIds();
  return properties.filter(p => comparisonIds.includes(p.id));
}

/**
 * Check if comparison is full
 */
export function isComparisonFull(): boolean {
  return getComparisonIds().length >= MAX_COMPARISON;
}

