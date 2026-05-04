export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

// Guard flag — prevents multiple simultaneous 401s from firing multiple logouts
let isLoggingOut = false;

/**
 * Core fetch wrapper.
 * @param {{ method?: string, path: string, body?: any, params?: Record<string, any> }} options
 */
async function apiClient({ method = 'GET', path, body, params } = {}) {
  const url = new URL(path, window.location.origin);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, value);
      }
    });
  }

  const headers = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(url.toString(), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    // Network error — no response at all
    throw new ApiError(0, 'Network error. Please check your connection.');
  }

  if (response.ok) {
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  }

  // Parse error message from response body
  let message = response.statusText || 'Something went wrong';
  try {
    const errBody = await response.json();
    message = errBody.message || errBody.error || message;
  } catch {
    // ignore parse failure
  }

  const isLoginRequest = method === 'POST' && path === '/auth/login';

  if (response.status === 401) {
    if (isLoginRequest) {
      // Wrong credentials — surface the server message, no logout side-effects
      throw new ApiError(401, message || 'Invalid email or password.');
    }
    // Session expiry — existing logout flow (unchanged)
    if (!isLoggingOut) {
      isLoggingOut = true;
      localStorage.removeItem('token');
      window.dispatchEvent(new CustomEvent('auth:logout'));
      // Reset flag after navigation completes
      setTimeout(() => { isLoggingOut = false; }, 2000);
    }
    throw new ApiError(401, 'Session expired. Please log in again.');
  }

  if (response.status === 403) {
    window.dispatchEvent(new CustomEvent('auth:forbidden'));
    throw new ApiError(403, 'You do not have permission to perform this action.');
  }

  throw new ApiError(response.status, message);
}

export default apiClient;
