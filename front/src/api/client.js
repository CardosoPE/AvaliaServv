const BASE_URL = import.meta.env.VITE_API_URL || '/api';
const TOKEN_KEY = 'av_token';

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.status = status;
    this.details = details || [];
  }
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = tokenStore.get();
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (response.status === 401 && auth) {
    tokenStore.clear();
    window.dispatchEvent(new CustomEvent('av:unauthorized'));
  }

  if (response.status === 204) return null;

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      payload?.message || 'Nao foi possivel completar a operacao.',
      response.status,
      payload?.details
    );
  }
  return payload;
}

const qs = (params) => {
  const search = new URLSearchParams(
    Object.entries(params || {}).filter(([, v]) => v !== undefined && v !== null && v !== '')
  ).toString();
  return search ? `?${search}` : '';
};

export const api = {
  auth: {
    login: (data) => request('/auth/login', { method: 'POST', body: data, auth: false }),
    signup: (data) => request('/auth/signup', { method: 'POST', body: data, auth: false }),
    forgotPassword: (email) =>
      request('/auth/forgot-password', { method: 'POST', body: { email }, auth: false }),
    verifyToken: (email, token) =>
      request('/auth/verify-token', { method: 'POST', body: { email, token }, auth: false }),
    resetPassword: (data) =>
      request('/auth/reset-password', { method: 'POST', body: data, auth: false }),
  },
  users: {
    me: () => request('/users/me'),
    update: (data) => request('/users/me', { method: 'PUT', body: data }),
    remove: () => request('/users/me', { method: 'DELETE' }),
  },
  professionals: {
    list: (filters) => request(`/professionals${qs(filters)}`, { auth: false }),
    byId: (id) => request(`/professionals/${id}`, { auth: false }),
    review: (id, data) => request(`/professionals/${id}/reviews`, { method: 'POST', body: data }),
  },
  requests: {
    create: (data) => request('/requests', { method: 'POST', body: data }),
    mine: () => request('/requests/mine'),
    open: (category) => request(`/requests/open${qs({ category })}`),
    close: (id) => request(`/requests/${id}/close`, { method: 'PATCH' }),
    remove: (id) => request(`/requests/${id}`, { method: 'DELETE' }),
  },
  chat: {
    conversations: () => request('/chat/conversations'),
    history: (withEmail) => request(`/chat/messages${qs({ with: withEmail })}`),
    send: (data) => request('/chat/messages', { method: 'POST', body: data }),
  },
  favorites: {
    list: () => request('/favorites'),
    ids: () => request('/favorites/ids'),
    toggle: (profileId) => request(`/favorites/${profileId}/toggle`, { method: 'POST' }),
  },
};
