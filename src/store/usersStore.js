import { create } from 'zustand';
import { usersService } from '../services/usersService';

export const useUsersStore = create((set, get) => ({
  users: [],
  selectedUser: null,
  isLoading: false,
  error: null,

  fetchUsers: async (currentUser) => {
    if (!currentUser) return;
    
    set({ isLoading: true, error: null });
    try {
      const users = currentUser.espropietario == 1       
      ? await usersService.getAll()
      : await usersService.getAllById(currentUser.id);
      
      /* Ahora uso un solo endpoint para obtener los usuarios asignados al usuario actual, propietario o no.
      
      const users = await usersService.getAllById(currentUser.id);
      if (!users) { /api/locationsusers
      set({ error: 'No users found', isLoading: false });
      return;
    }  
    */
      set({ users, isLoading: false });
    } catch (error) {
      set({ error: 'Error fetching users', isLoading: false });
    }
  },

  fetchUserById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const user = await usersService.getById(id);
      set({ selectedUser: user, isLoading: false });
      return user;
    } catch (error) {
      set({ error: 'Error fetching user', isLoading: false });
      return null;
    }
  },

  createUser: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await usersService.create(userData);
      console.log('respuesta del servicio de creación de usuario', response);
      if (response.success) {
        set(state => ({ 
          users: [...state.users, response.user],
          isLoading: false 
        }));
        return response;
      }
      return response;
    } catch (error) {
      set({ error: 'Error creating user', isLoading: false });
      return response;
    }
  },

  updateUser: async (id, userData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await usersService.update(id, userData);
      if (response.success) {
        set(state => ({
          users: state.users.map(user => 
            user.id === id ? response.user : user
          ),
          selectedUser: response.user,
          isLoading: false
        }));
        return response;
      }
      return response;
    } catch (error) {
      set({ error: 'Error updating user', isLoading: false });
      return { success: false, message: 'Error al actualizar usuario' };
    }
  },

  deleteUser: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const success = await usersService.delete(id);
      if (success) {
        set(state => ({
          users: state.users.filter(user => user.id !== id),
          isLoading: false
        }));
        return true;
      }
      return false;
    } catch (error) {
      set({ error: 'Error deleting user', isLoading: false });
      return false;
    }
  },

  clearSelectedUser: () => set({ selectedUser: null }),
  clearError: () => set({ error: null }),
  setSelectedUser: (user) => {
    set({ 
      selectedUser: user,
      isLoading: false,
      error: null
    });
  },
}));