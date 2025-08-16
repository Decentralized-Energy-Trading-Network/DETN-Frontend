// api.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export default {
  get(path, config = {}) {
    return api.get(path, config);
  },

  post(path, data, config = {}) {
    return api.post(path, data, config);
  },

  put(path, data, config = {}) {
    return api.put(path, data, config);
  },

  patch(path, data, config = {}) {
    return api.patch(path, data, config);
  },

  delete(path, config = {}) {
    return api.delete(path, config);
  },

  upload(path, formData, config = {}) {
    return api.post(path, formData, {
      ...config,
      headers: {
        ...config.headers,
        'Content-Type': 'multipart/form-data'
      }
    });
  }
};