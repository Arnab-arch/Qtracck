import axios from "axios";

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

const objectToUrlParams = (obj) => {
  const params = [];

  for (const key in obj) {
    params.push(
      `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`
    );
  }

  return params.join("&");
};

export const getLocations = (filter = {}) => {
  const newURL = objectToUrlParams(filter);

  return axios.get(
    `${BASE}/locations${newURL ? "?" + newURL : ""}`
  );
};

export const getLocationById = (id)=>{
    axios.get(`${BASE}/locaitons/${id}`);
}

export const searchLocations = (query)=>{
    axios.get(`${BASE}/locations/search?q=${encodeURIComponent(query)}`)
}
export const createLocation = (data, token) =>
  axios.post(`${BASE}/locations`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });


export const createLocationFromSearch = (data, token) =>
  axios.post(`${BASE}/locations/from-search`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const updateLocation = (id, data, token) =>
  axios.patch(`${BASE}/locations/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });


export const deleteLocation = (id, token) =>
  axios.delete(`${BASE}/locations/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });