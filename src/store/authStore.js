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
          return true;
        }
        return false;
      },
      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null });
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        user: state.user,
        token: state.token 
      }),
    }
  )
);