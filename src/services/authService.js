import axiosClient from '../utils/axiosClient';

export const authService = {
  login: async (dni, password) => {
    try {
      const { data } = await axiosClient.post('/api/auth/login', { 
        dni, 
        password 
      });      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      return null;
    }
  },
  
  sendActivationEmail: async (email) => { 
    try {
      const { data } = await axiosClient.get(`/api/auth/users/sendactivation/${email}`);
      return data;
    } catch (error) {
      console.error('Send activation email error:', error);
      return null;
    }
  },
  
  activateUser: async (token, password) => { 
    try {      
      const response = await axiosClient.post(`/api/auth/users/activate/${token}`, { password });
      const { success, message, user } = response.data;
      // Guardamos el token en localStorage si la activación fue exitosa
      if (success && token) {
        localStorage.setItem('token', token);
      }
      
      return {
        success: success,
        message: message,
        user: user,
      };
    } catch (error) {
      console.error('Error de activación:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al activar el usuario'
      };
    }
  }
};