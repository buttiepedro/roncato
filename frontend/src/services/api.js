import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || (window.location.hostname.includes('localhost') ? 'http://localhost:3001' : window.location.origin);

export function getToken() {
  return (localStorage.getItem('token') || sessionStorage.getItem('token'));
}

export function setToken(t) {
  localStorage.setItem('token', t);
  sessionStorage.setItem('token', t);
}

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer " + getToken(),
  },
});

api.interceptors.request.use((config) => {
  const t = getToken();
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

export async function login(username, password) {
  const { data } = await api.post('/api/auth/login', { username, password });
  setToken(data.token);
  return data.user;
}

export async function fetchOrders() {
  const { data } = await api.get('/api/orders');
  return data;
}

export async function updateOrderStatus(id, status) {
  const { data } = await api.post(`/api/orders/${id}/status`, { status });
  return data;
}

export async function updateOrderProducts(id, productos) {
  const { data } = await api.put(`/api/orders/${id}`, { productos });
  return data;
}

export async function updateOrder(id, payload) {
  const { data } = await api.put(`/api/orders/${id}`, payload);
  return data;
}

export async function fetchOrderProducts(orderId) {
  const { data } = await api.get(`/api/orders/${orderId}/products`);
  return data;
}

export async function updateOrderProduct(orderId, productId, payload) {
  const { data } = await api.put(`/api/orders/${orderId}/products/${productId}`, payload);
  return data;
}

export async function fetchUsers() {
  const { data } = await api.get('/api/users');
  return data;
}

export async function createUser(user) {
  const { data } = await api.post('/api/users', user);
  return data;
}

export async function updateUser(id, user) {
  const { data } = await api.put(`/api/users/${id}`, user);
  return data;
}

export async function deleteUser(id) {
  const { data } = await api.delete(`/api/users/${id}`);
  return data;
}

export const API_BASE = API_URL;
