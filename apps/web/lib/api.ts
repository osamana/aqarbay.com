// For server-side rendering, use Docker service name
// For client-side, use NEXT_PUBLIC_API_URL
const getApiUrl = () => {
  // Check if we're on the server (Node.js environment)
  if (typeof window === 'undefined') {
    // Server-side: use Docker service name or fallback to localhost
    return process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://api:8000';
  }
  // Client-side: use public API URL
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
};

const API_URL = getApiUrl();

export interface Property {
  id: string;
  title_en: string;
  title_ar: string;
  slug_en: string;
  slug_ar: string;
  description_en?: string;
  description_ar?: string;
  purpose: string;
  type: string;
  status: string;
  price_amount: number;
  price_currency: string;
  area_m2?: number;
  bedrooms?: number;
  bathrooms?: number;
  furnished: boolean;
  parking: boolean;
  floor?: number;
  year_built?: number;
  video_url?: string;
  lat?: number;
  lng?: number;
  featured: boolean;
  published: boolean;
  location_id: string;
  agent_id?: string;
  first_image?: string;
  location_name?: string;
  images?: PropertyImage[];
  location?: Location;
  agent?: Agent;
  created_at: string;
  updated_at: string;
}

export interface PropertyImage {
  id: string;
  file_key: string;
  alt_en?: string;
  alt_ar?: string;
  sort_order: number;
}

export interface Location {
  id: string;
  name_en: string;
  name_ar: string;
  slug_en: string;
  slug_ar: string;
  parent_id?: string;
  lat?: number;
  lng?: number;
}

export interface Agent {
  id: string;
  name: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  photo_key?: string;
  bio_en?: string;
  bio_ar?: string;
}

export interface Settings {
  id: string;
  site_name_en: string;
  site_name_ar: string;
  primary_color: string;
  logo_key?: string;
  contact_phone?: string;
  contact_whatsapp?: string;
  facebook_url?: string;
  instagram_url?: string;
  meta_title_en?: string;
  meta_title_ar?: string;
  meta_desc_en?: string;
  meta_desc_ar?: string;
}

export interface Lead {
  property_id?: string;
  name: string;
  phone: string;
  email?: string;
  message?: string;
}

export interface PropertiesResponse {
  items: Property[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export async function getSettings(): Promise<Settings> {
  const res = await fetch(`${API_URL}/api/public/settings`, {
    next: { revalidate: 3600 }, // Cache for 1 hour
  });
  if (!res.ok) throw new Error('Failed to fetch settings');
  return res.json();
}

export async function getLocations(): Promise<Location[]> {
  const res = await fetch(`${API_URL}/api/public/locations`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error('Failed to fetch locations');
  return res.json();
}

export async function getProperties(params: {
  page?: number;
  page_size?: number;
  q?: string;  // Search query for Meilisearch
  purpose?: string;
  type?: string;
  location_slug?: string;
  min_price?: number;
  max_price?: number;
  bedrooms?: number;
  bathrooms?: number;
  min_area?: number;
  max_area?: number;
  year_built?: number;
  furnished?: boolean;
  parking?: boolean;
  floor?: number;
  featured?: boolean;
  sort_by?: string;
}): Promise<PropertiesResponse> {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, value.toString());
    }
  });

  const res = await fetch(`${API_URL}/api/public/properties?${queryParams}`, {
    next: { revalidate: 60 }, // Cache for 1 minute
  });
  if (!res.ok) {
    const errorText = await res.text().catch(() => 'Unknown error');
    console.error(`API Error (${res.status}):`, errorText);
    throw new Error(`Failed to fetch properties: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export async function getPropertiesByIds(ids: string[]): Promise<Property[]> {
  const params = new URLSearchParams();
  // Fetch properties by making multiple requests or using a single request with filters
  // Since we don't have a direct endpoint, we'll fetch all and filter client-side
  // Or we can use the search endpoint with IDs
  const response = await fetch(`${API_URL}/api/public/properties?page_size=1000`);
  if (!response.ok) {
    throw new Error('Failed to fetch properties');
  }
  const data = await response.json();
  // Filter by IDs
  return data.items.filter((p: Property) => ids.includes(p.id));
}

export async function getPropertyBySlug(slug: string, locale: string = 'en'): Promise<Property> {
  const res = await fetch(`${API_URL}/api/public/properties/${slug}?locale=${locale}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error('Failed to fetch property');
  return res.json();
}

export async function submitLead(lead: Lead): Promise<void> {
  const res = await fetch(`${API_URL}/api/public/leads`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(lead),
  });
  if (!res.ok) throw new Error('Failed to submit lead');
}

export interface POI {
  name: string;
  name_en?: string;
  name_ar?: string;
  lat: number;
  lng: number;
  distance: number;
  type?: string;
  address?: string;
}

export interface PropertyPOIs {
  property_id: string;
  property_title_en: string;
  property_title_ar: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  pois: {
    [category: string]: POI[];
  };
}

export async function getPropertyPOIs(slug: string, locale: string = 'en'): Promise<PropertyPOIs> {
  const res = await fetch(`${API_URL}/api/public/properties/${slug}/nearby-pois?locale=${locale}`, {
    next: { revalidate: 3600 }, // Cache for 1 hour (POIs don't change often)
  });
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error('Property not found');
    }
    if (res.status === 400) {
      throw new Error('Property does not have coordinates');
    }
    throw new Error('Failed to fetch nearby POIs');
  }
  return res.json();
}

export interface SearchSuggestion {
  type: 'property' | 'location';
  title_en?: string;
  title_ar?: string;
  name_en?: string;
  name_ar?: string;
  slug_en?: string;
  slug_ar?: string;
  location?: string;
}

export async function getSearchSuggestions(query: string, limit: number = 5): Promise<SearchSuggestion[]> {
  if (!query || query.length < 1) return [];
  
  const res = await fetch(`${API_URL}/api/search/suggestions?q=${encodeURIComponent(query)}&limit=${limit}`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.suggestions || [];
}

export async function trackSearch(query: string | null, filters: Record<string, string>, resultCount: number): Promise<void> {
  try {
    await fetch(`${API_URL}/api/search/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, filters, result_count: resultCount }),
    });
  } catch (error) {
    // Silently fail - analytics shouldn't break the UI
    console.error('Failed to track search:', error);
  }
}

// User Account APIs
export interface UserAccount {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  locale: string;
  currency: string;
  is_active: boolean;
  is_verified: boolean;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

export interface UserAccountCreate {
  email: string;
  password: string;
  name?: string;
  phone?: string;
  locale?: string;
  currency?: string;
}

export interface UserAccountLogin {
  email: string;
  password: string;
}

export interface UserAccountToken {
  access_token: string;
  token_type: string;
  user: UserAccount;
}

export async function registerUser(userData: UserAccountCreate): Promise<UserAccount> {
  const res = await fetch(`${API_URL}/api/user/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Registration failed' }));
    throw new Error(error.detail || 'Registration failed');
  }
  return res.json();
}

export async function loginUser(credentials: UserAccountLogin): Promise<UserAccountToken> {
  const formData = new URLSearchParams();
  formData.append('username', credentials.email);
  formData.append('password', credentials.password);
  
  const res = await fetch(`${API_URL}/api/user/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData.toString(),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Login failed' }));
    throw new Error(error.detail || 'Login failed');
  }
  return res.json();
}

export async function getCurrentUser(token: string): Promise<UserAccount> {
  const res = await fetch(`${API_URL}/api/user/me`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to get user info');
  return res.json();
}

export async function updateUser(token: string, userData: Partial<UserAccount>): Promise<UserAccount> {
  const res = await fetch(`${API_URL}/api/user/me`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
  if (!res.ok) throw new Error('Failed to update user');
  return res.json();
}

// Email Alert APIs
export interface EmailAlert {
  id: string;
  email: string;
  name?: string;
  query?: string;
  filters?: Record<string, any>;
  frequency: 'instant' | 'daily' | 'weekly';
  notify_featured: boolean;
  is_active: boolean;
  verified: boolean;
  last_sent_at?: string;
  created_at: string;
  updated_at: string;
}

export interface EmailAlertCreate {
  email: string;
  name?: string;
  query?: string;
  filters?: Record<string, any>;
  frequency?: 'instant' | 'daily' | 'weekly';
  notify_featured?: boolean;
}

export async function subscribeEmailAlert(alert: EmailAlertCreate): Promise<EmailAlert> {
  const res = await fetch(`${API_URL}/api/email-alerts/subscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(alert),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Subscription failed' }));
    throw new Error(error.detail || 'Subscription failed');
  }
  return res.json();
}

export async function getMyEmailAlerts(token: string): Promise<EmailAlert[]> {
  const res = await fetch(`${API_URL}/api/email-alerts/my-alerts`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to get email alerts');
  return res.json();
}

export async function updateEmailAlert(token: string, alertId: string, alert: Partial<EmailAlert>): Promise<EmailAlert> {
  const res = await fetch(`${API_URL}/api/email-alerts/my-alerts/${alertId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(alert),
  });
  if (!res.ok) throw new Error('Failed to update email alert');
  return res.json();
}

export async function deleteEmailAlert(token: string, alertId: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/email-alerts/my-alerts/${alertId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to delete email alert');
}

export async function verifyEmailAlert(token: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/email-alerts/verify/${token}`);
  if (!res.ok) throw new Error('Failed to verify email');
}

export async function unsubscribeEmailAlert(unsubscribeToken: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/email-alerts/unsubscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: unsubscribeToken }),
  });
  if (!res.ok) throw new Error('Failed to unsubscribe');
}

