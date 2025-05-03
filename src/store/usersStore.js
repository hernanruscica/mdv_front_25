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
      const users = currentUser.espropietario === 1 
        ? await usersService.getAll()
        : await usersService.getAllById(currentUser.id);
        
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
      const newUser = await usersService.create(userData);
      if (newUser) {
        set(state => ({ 
          users: [...state.users, newUser],
          isLoading: false 
        }));
        return true;
      }
      return false;
    } catch (error) {
      set({ error: 'Error creating user', isLoading: false });
      return false;
    }
  },

  updateUser: async (id, userData) => {
    set({ isLoading: true, error: null });
    try {
      const updatedUser = await usersService.update(id, userData);
      //console.log('updated User', updatedUser);
      if (updatedUser.success) {
        set(state => ({
          users: state.users.map(user => 
            user.id === id ? updatedUser : user
          ),
          selectedUser: updatedUser,
          isLoading: false
        }));
        return true;
      }
      return false;
    } catch (error) {
      set({ error: 'Error updating user', isLoading: false });
      return false;
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