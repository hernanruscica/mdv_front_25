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
      data.user.esadministrador =  data.user.ubicaciones.some((ubi) => ubi.usuarios_nombre_rol == "administrador");
      //console.log('es admin en alguna ubicacion? - authservice', data.user.ubicaciones.some((ubi) => ubi.usuarios_nombre_rol == "administrador")) ;
      return data;
    } catch (error) {
      console.error('Login error:', error);
      return null;
    }
  },
  
  sendActivationEmail: async (email) => {
    try {
      const { data } = await axiosClient.get(`/api/users/sendactivation/${email}`);
      return data;
    } catch (error) {
      console.error('Send activation email error:', error);
      return null;
    }
  },
  
  activateUser: async (token) => {
    try {
      const { data } = await axiosClient.get(`/api/users/activate/${token}`);
      
      // Guardamos el token en localStorage si la activación fue exitosa
      if (data.success && token) {
        localStorage.setItem('token', token);
      }
      
      return {
        success: data.success,
        message: data.message,
        ...data.data
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