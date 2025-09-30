import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const PUBLIC_ENDPOINTS = [
  '/api/users/login',
  '/api/users/register',
  '/api/users/reset-password'
];


class ApiClient {
  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_URL,
      timeout: 20000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
  }
  
  async request(config) {
    
    try {      
      if (!PUBLIC_ENDPOINTS.some(endpoint => config.url?.includes(endpoint))) {
        const token = useAuthStore.getState()?.token;        
        if (token) {
          config.headers = {
            ...config.headers,
            Authorization: `Bearer ${token}`
          };
        }
      }

      const response = await this.client.request(config);
      return response;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  // Métodos de conveniencia
  async get(url, config = {}) {
    return this.request({ ...config, method: 'GET', url });
  }

  async post(url, data, config = {}) {
    return this.request({ ...config, method: 'POST', url, data });
  }

  async put(url, data, config = {}) {
    return this.request({ ...config, method: 'PUT', url, data });
  }

  async delete(url, config = {}) {
    return this.request({ ...config, method: 'DELETE', url });
  }

  // Método específico para subidas multipart
  async uploadFile(url, formData, config = {}) {
    return this.request({
      ...config,
      method: 'POST',
      url,
      data: formData,
      headers: {
        ...config.headers,
        'Content-Type': 'multipart/form-data'
      }
    });
  }

  handleError(error) {
    if (error.code === 'ECONNREFUSED') {
      console.error('Error de conexión: El servidor no está disponible');
    } else if (axios.isAxiosError(error)) {
      console.error('Error de red:', {
        mensaje: error.message,
        código: error.response?.status,
        url: error.config?.url
      });
    }
  }
}

const apiClient = new ApiClient();
export default apiClient;