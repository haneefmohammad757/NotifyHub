const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const cleanApiUrl = rawApiUrl.replace(/\/+$/, '');
const API_BASE = `${cleanApiUrl}/api`;

export const getFileUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${cleanApiUrl}${path.startsWith('/') ? '' : '/'}${path}`;
};

/**
 * Wrapper around fetch that sends credentials (cookies) and handles JSON.
 * All API calls go through this to ensure consistent cookie/credential handling.
 */
async function request(endpoint, options = {}) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message = data?.error || 'Something went wrong.';
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }

  return data;
}

export const api = {
  get: (endpoint) => request(endpoint, { method: 'GET', cache: 'no-store' }),
  post: (endpoint, body) => request(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: (endpoint, body) => request(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (endpoint) => request(endpoint, { method: 'DELETE' }),
  upload: async (endpoint, method, formData) => {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method,
      body: formData,
      credentials: 'include',
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const err = new Error(data?.error || 'Upload failed.');
      err.status = res.status;
      throw err;
    }
    return data;
  }
};
