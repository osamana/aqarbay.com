/**
 * User authentication utilities
 */

const USER_TOKEN_KEY = 'aqarbay_user_token';
const USER_DATA_KEY = 'aqarbay_user_data';

export interface UserData {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  locale: string;
  currency: string;
  is_active: boolean;
  is_verified: boolean;
}

/**
 * Get stored user token
 */
export function getUserToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(USER_TOKEN_KEY);
}

/**
 * Set user token
 */
export function setUserToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_TOKEN_KEY, token);
}

/**
 * Remove user token
 */
export function removeUserToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(USER_TOKEN_KEY);
  localStorage.removeItem(USER_DATA_KEY);
}

/**
 * Get stored user data
 */
export function getUserData(): UserData | null {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(USER_DATA_KEY);
  return data ? JSON.parse(data) : null;
}

/**
 * Set user data
 */
export function setUserData(user: UserData): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return getUserToken() !== null;
}

/**
 * Clear all user data
 */
export function logout(): void {
  removeUserToken();
}

