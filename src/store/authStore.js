import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../services/authService';
import {
  generateEncryptionKey,
  setEncryptionKey,
  getEncryptionKey,
  removeEncryptionKey,
  encryptState,
  decryptState,
} from '../utils/cryptoUtils';

const encryptedStorage = {
  getItem: (name) => {
    const raw = localStorage.getItem(name);
    if (!raw) return null;
    const key = getEncryptionKey();
    if (!key) return null;
    return decryptState(raw, key);
  },
  setItem: (name, value) => {
    const key = getEncryptionKey();
    if (!key) return;
    const encrypted = encryptState(value, key);
    localStorage.setItem(name, encrypted);
  },
  removeItem: (name) => {
    localStorage.removeItem(name);
  },
};

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      login: async (dni, password) => {
        const response = await authService.login(dni, password);
        if (response?.user && response?.token) {
          const key = generateEncryptionKey();
          setEncryptionKey(key);
          set({
            user: response.user,
            token: response.token,
          });
          return response.success;
        }
        return false;
      },
      logout: () => {
        removeEncryptionKey();
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

      activateUser: async (token, password) => {
        try {
          const response = await authService.activateUser(token, password);
          if (response?.token) {
            const key = generateEncryptionKey();
            setEncryptionKey(key);
            set({ token: response.token });
          }
          return response;
        } catch (error) {
          console.error('Error activating user:', error);
          return null;
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: encryptedStorage,
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
    }
  )
);