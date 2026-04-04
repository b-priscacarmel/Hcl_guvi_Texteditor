import axios from 'axios';

// In production (Vercel), VITE_API_BASE points to your Railway backend URL
// e.g. https://your-app.up.railway.app
// In local dev it's empty string so the Vite proxy handles /api → localhost:8080
const BASE = `${import.meta.env.VITE_API_BASE || ''}/api`;

// ─── Document APIs ────────────────────────────────────────────────

export const createDocument = (title, createdBy) =>
  axios.post(`${BASE}/documents`, { title, createdBy }).then(r => r.data);

export const getDocument = (id) =>
  axios.get(`${BASE}/documents/${id}`).then(r => r.data);

export const getAllDocuments = () =>
  axios.get(`${BASE}/documents`).then(r => r.data);

export const updateDocument = (id, body) =>
  axios.put(`${BASE}/documents/${id}`, body).then(r => r.data);

export const deleteDocument = (id) =>
  axios.delete(`${BASE}/documents/${id}`);

// ─── Version APIs ─────────────────────────────────────────────────

export const saveVersion = (id, savedBy) =>
  axios.post(`${BASE}/documents/${id}/versions`, { savedBy }).then(r => r.data);

export const getVersions = (id) =>
  axios.get(`${BASE}/documents/${id}/versions`).then(r => r.data);

// ─── Presence REST fallback ───────────────────────────────────────

export const getActiveUsers = (id) =>
  axios.get(`${BASE}/documents/${id}/users`).then(r => r.data);
