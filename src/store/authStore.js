import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { authService } from '../services/authService';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,      
      login: async (dni, password) => {
        const response = await authService.login(dni, password);        
        if (response?.user && response?.token) {
          set({ 
            user: response.user,
            token: response.token 
          });
          return response.success;
        }
        return false;
      },
      logout: () => {        
        set({ user: null, token: null });
      },
      
      sendActivationEmail: async (email) => {
        try {
          const response = await authService.sendActivationEmail(email);
          //console.log('response sendActivationEmail in store:', response);
          return response;
        } catch (error) {
          console.error('Error sending activation email:', error);
          return null;
        }
      },
      
      activateUser: async (token, password) => {
        try {
          const response = await authService.activateUser(token, password);
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