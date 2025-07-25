import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { authService } from '../services/authService';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      userRoles: [
        {
          id: 7,
          nombre: "operario",
          descripcion: "Operario de una ubicación, puede ver los dataloggers y canales de dicha ubicación.",
          accion_id: 1
        },
        {
          id: 8,
          nombre: "administrador",
          descripcion: "Administrador de una ubicación, puede crear, eliminar usuarios, asignar y desasignar alarmas.",
          accion_id: 3
        },
        {
          id: 9,
          nombre: "propietario",
          descripcion: "Usuario con todos los permisos sobre todas las ubicaciones y usuarios.",
          accion_id: 3
        }
      ],
      login: async (dni, password) => {
        const response = await authService.login(dni, password);
        //onsole.log('Login response:', response);
        if (response?.user && response?.token) {
          set({ 
            user: response.user,
            token: response.token 
          });
          return true;
        }
        return false;
      },
      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null });
      },
      
      sendActivationEmail: async (email) => {
        try {
          const response = await authService.sendActivationEmail(email);
          return response;
        } catch (error) {
          console.error('Error sending activation email:', error);
          return null;
        }
      },
      
      activateUser: async (token) => {
        try {
          const response = await authService.activateUser(token);
          if (response?.token) {
            set({ token: response.token });
          }
          return response;
        } catch (error) {
          console.error('Error activating user:', error);
          return null;
        }
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        user: state.user,
        token: state.token,
        userRoles: state.userRoles
      }),
    }
  )
);