import { create } from 'zustand';
import { usersService } from '../services/usersService';

export const useUsersStore = create((set, get) => ({
  users: [],
  selectedUser: null,  
  error: null,
  loadingStates: {
    fetchUsers: false,
    fetchUser: false,
    createUser: false,
    updateUser: false,
    deleteUser: false
  },  

  fetchUserById: async (id, uuidOrigin) => {
    set(state => ({
      loadingStates: { ...state.loadingStates, fetchUser: true }
    }));
    try {
      const user = await usersService.getById(id, uuidOrigin);        
        set({ selectedUser: user, error: null });
        return user;
    } catch (error) {
        set({ error: error.message});        
        return null;
    } finally {
        set(state => ({
        loadingStates: { ...state.loadingStates, fetchUser: false }
    }));
    }
  },
  
  fetchUsers: async (currentUser, businessUuid) => {
    //console.log('currentUSer', currentUser);
    
    if (!currentUser) return;
    set(state => ({ loadingStates: { ...state.loadingStates, fetchUsers: true }, error: null }));
    try {
      const currentUserIsOwner = currentUser?.businesses_roles?.some(br => br?.role === "Owner" );
      const users = currentUserIsOwner
        ? await usersService.getAll(businessUuid)
        : await usersService.getAllById(businessUuid);
      set({ users, error: null });
    } catch (error) {
      set({ error: 'Error fetching users' });
    } finally {
      set(state => ({ loadingStates: { ...state.loadingStates, fetchUsers: false } }));
    }
  },

  createUser: async (userData, businessUuid) => {
    set(state => ({ loadingStates: { ...state.loadingStates, createUser: true }, error: null }));
    try {
      const response = await usersService.create(userData, businessUuid);
      if (response.success) {
        set(state => ({
          users: [...state.users, response.user]
        }));
      }
      return response;
    } catch (error) {
      set({ error: 'Error creating user' });
      return { success: false, message: 'Error al crear usuario' };
    } finally {
      set(state => ({ loadingStates: { ...state.loadingStates, createUser: false } }));
    }
  },
//businessUuid, userData nada mas ..
  updateUser: async (uuid, userData) => {    
    set(state => ({ loadingStates: { ...state.loadingStates, updateUser: true }, error: null }));
    try {
      console.log('users Store update');      
      console.log(uuid, userData) ;
      
      const response = await usersService.update(uuid, userData);
      console.log('Response from usersService.update in usersStore:', response); // Added log
      
      return response;
      

    } catch (error) {
      set({ error: 'Error updating user' });
      return { success: false, message: 'Error al actualizar usuario' };
    } finally {
      set(state => ({ loadingStates: { ...state.loadingStates, updateUser: false } }));
    }
  },

  deleteUser: async (businessUuid, id) => {
    set(state => ({ loadingStates: { ...state.loadingStates, deleteUser: true }, error: null }));
    try {
      const success = await usersService.delete(businessUuid, id);
      if (success) {
        set(state => ({
          users: state.users.filter(user => user.id !== id)
        }));
        return true;
      }
      return false;
    } catch (error) {
      set({ error: 'Error deleting user' });
      return false;
    } finally {
      set(state => ({ loadingStates: { ...state.loadingStates, deleteUser: false } }));
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
