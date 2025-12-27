/**
 * API Configuration for Audiolore Backend
 */

// For local development with Expo:
// - Use 'localhost' when running on web
// - Use your computer's IP address when running on physical device
// - Use '10.0.2.2' when running on Android emulator

export const API_BASE_URL = 'http://192.168.0.102:8000';

// For physical device testing, replace with your computer's IP:
// export const API_BASE_URL = 'http://192.168.1.XXX:8000';

export interface ApiError {
  detail: string;
}

/**
 * Generic fetch wrapper with error handling
 */
export async function apiFetch<T>(
  endpoint: string, 
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error: ApiError = await response.json().catch(() => ({ 
      detail: `HTTP ${response.status}: ${response.statusText}` 
    }));
    throw new Error(error.detail);
  }

  return response.json();
}
