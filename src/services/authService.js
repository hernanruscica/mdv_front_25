import axiosClient from '../utils/axiosClient';

export const authService = {
  login: async (dni, password) => {
    try {
      const { data } = await axiosClient.post('/api/users/login', { 
        dni, 
        password 
      });
      
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      return data;
    } catch (error) {
      console.error('Login error:', error);
      return null;
    }
  }
};