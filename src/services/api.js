import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers["Authorization"] = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);


// export const register = async (data) => {
//   console.log("Calling register API", data);

//   return api.post("/api/auth/register", data);
// };
export const authAPI = {
  login:    (data) => api.post("/api/auth/login", data),
  register: (data) => api.post("/api/auth/register", data),
  
};

export const locationsAPI = {
  getAll:        ()       => api.get("/locations"),
  getById:       (id)     => api.get(`/locations/${id}`),
  create:        (data)   => api.post("/locations", data),
  update:        (id, d)  => api.patch(`/locations/${id}`, d),
  delete:        (id)     => api.delete(`/locations/${id}`),
  searchOSM:     (q)      => api.get(`/locations/search?q=${encodeURIComponent(q)}`),
  createFromOSM: (data)   => api.post("/locations/from-search", data),
};

export const servicesAPI = {
  getAll: (params = {}) => api.get("/services", { params }),
  getById:   (id)     => api.get(`/services/${id}`),
  getByLocation:   (location_id)  => api.get(`/services?location_id=${location_id}`),
  getQueues: (id)     => api.get(`/services/${id}/queues`),
  create:    (data)   => api.post("/services", data),
  update:    (id, d)  => api.patch(`/services/${id}`, d),
  delete:    (id)     => api.delete(`/services/${id}`), // admin only
};

export const queuesAPI = {
  getAll:       ()       => api.get("/queues"),
  getById:      (id)     => api.get(`/queues/${id}`),
  create:       (data)   => api.post("/queues", data),
  updateStatus: (id, d)  => api.patch(`/queues/${id}`, d),
  delete:       (id)     => api.delete(`/queues/${id}`),
  getByDate:    (date)   => api.get(`/queues?date=${date}`),
  join:         (id, d)  => api.post(`/queues/${id}/join`, d),
  callNext:     (id)     => api.post(`/queues/${id}/next`),
  getStats:     (id)     => api.get(`/queues/${id}/stats`),
  getByService: (service_id) =>
    api.get(`/queues/service/${service_id}`),
  getBrowse: (params ={}) => api.get("/queues/browse",{params}),


};

export const tokensAPI = {
  getMyTokens:  ()       => api.get("/tokens/my-tokens"),
  updateStatus: (id, d)  => api.patch(`/tokens/${id}`, d),
  getETA: (token_id) => api.get(`/queues/${token_id}/eta`),
};

export default api;