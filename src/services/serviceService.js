import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:5000";


export const getServices = (locationId) =>
  axios.get(`${BASE}/services${locationId ? `?location_id=${locationId}` : ''}`);


export const getServiceById = (id) =>
  axios.get(`${BASE}/services/${id}`);


export const getServiceQueues = (serviceId) =>
  axios.get(`${BASE}/services/${serviceId}/queues`);


export const createService = (data, token) =>
  axios.post(`${BASE}/services`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

// PATCH /services/:id
export const updateService = (id, data, token) =>
  axios.patch(`${BASE}/services/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });