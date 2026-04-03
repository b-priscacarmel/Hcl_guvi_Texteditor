import axios from 'axios';

const BASE = '/api';

// ─── Document APIs ───────────────────────────────────────────────────────────

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

// ─── Version APIs ─────────────────────────────────────────────────────────────

export const saveVersion = (id, savedBy) =>
  axios.post(`${BASE}/documents/${id}/versions`, { savedBy }).then(r => r.data);

export const getVersions = (id) =>
  axios.get(`${BASE}/documents/${id}/versions`).then(r => r.data);

// ─── Presence REST fallback ───────────────────────────────────────────────────

export const getActiveUsers = (id) =>
  axios.get(`${BASE}/documents/${id}/users`).then(r => r.data);
