/**
 * Admin API Client
 * Centralized API calls for admin dashboard
 */

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

function getAuthHeaders() {
  const token = localStorage.getItem('access_token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

// Properties
export async function getProperties() {
  const res = await fetch(`${API_URL}/api/admin/properties/`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch properties');
  return res.json();
}

export async function getProperty(id: string) {
  const res = await fetch(`${API_URL}/api/admin/properties/${id}/`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch property');
  return res.json();
}

export async function createProperty(data: any) {
  const res = await fetch(`${API_URL}/api/admin/properties/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create property');
  return res.json();
}

export async function updateProperty(id: string, data: any) {
  const res = await fetch(`${API_URL}/api/admin/properties/${id}/`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update property');
  return res.json();
}

export async function deleteProperty(id: string) {
  const res = await fetch(`${API_URL}/api/admin/properties/${id}/`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete property');
  return res.json();
}

export async function publishProperty(id: string) {
  const res = await fetch(`${API_URL}/api/admin/properties/${id}/publish/`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to publish property');
  return res.json();
}

export async function unpublishProperty(id: string) {
  const res = await fetch(`${API_URL}/api/admin/properties/${id}/unpublish/`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to unpublish property');
  return res.json();
}

// Locations
export async function getLocations() {
  const res = await fetch(`${API_URL}/api/admin/locations/`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch locations');
  return res.json();
}

export async function createLocation(data: any) {
  const res = await fetch(`${API_URL}/api/admin/locations/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create location');
  return res.json();
}

export async function updateLocation(id: string, data: any) {
  const res = await fetch(`${API_URL}/api/admin/locations/${id}/`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update location');
  return res.json();
}

export async function deleteLocation(id: string) {
  const res = await fetch(`${API_URL}/api/admin/locations/${id}/`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete location');
  return res.json();
}

// Agents
export async function getAgents() {
  const res = await fetch(`${API_URL}/api/admin/agents/`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch agents');
  return res.json();
}

export async function createAgent(data: any) {
  const res = await fetch(`${API_URL}/api/admin/agents/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create agent');
  return res.json();
}

export async function updateAgent(id: string, data: any) {
  const res = await fetch(`${API_URL}/api/admin/agents/${id}/`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update agent');
  return res.json();
}

export async function deleteAgent(id: string) {
  const res = await fetch(`${API_URL}/api/admin/agents/${id}/`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete agent');
  return res.json();
}

// Leads
export async function getLeads() {
  const res = await fetch(`${API_URL}/api/admin/leads/`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch leads');
  return res.json();
}

export async function updateLead(id: string, data: any) {
  const res = await fetch(`${API_URL}/api/admin/leads/${id}/`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update lead');
  return res.json();
}

// Settings
export async function getSettings() {
  const res = await fetch(`${API_URL}/api/admin/settings/`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch settings');
  return res.json();
}

export async function updateSettings(data: any) {
  const res = await fetch(`${API_URL}/api/admin/settings/`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update settings');
  return res.json();
}

