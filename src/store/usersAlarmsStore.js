import { create } from 'zustand';
import { usersAlarmsService } from '../services/usersAlarmsService';

export const useUsersAlarmsStore = create((set) => ({
  users: [],
  loadingStates: {
    fetchUsersByAlarmId: false,
    subscribeUserToAlarm: false,
    unsubscribeUserFromAlarm: false
  },
  error: null,
   
    createLocationUser: async (locationData) => {
      set(state => ({
        loadingStates: { ...state.loadingStates, createLocationUser: true }
      }));
      try {
        const response = await locationUsersService.create(locationData);
        //console.log('response on locationUsersStore', response);        
        set(state => ({
          locationUsers: [...state.locationUsers, response.item],
          error: null
        }));
        return response;
      } catch (error) {
        set({ error: error.message });
        throw error;
      } finally {
        set(state => ({
          loadingStates: { ...state.loadingStates, createLocationUser: false }
        }));
      }
    },
    updateLocationUser: async (locationData) => {
      set(state => ({
        loadingStates: { ...state.loadingStates, updateLocationUser: true }
      }));
      try {
        const response = await locationUsersService.update(locationData);
        //console.log('response on locationUsersStore', response);        
        set(state => ({
          locationUsers: [...state.locationUsers, response.item],
          error: null
        }));
        return response;
      } catch (error) {
        set({ error: error.message });
        throw error;
      } finally {
        set(state => ({
          loadingStates: { ...state.loadingStates, updateLocationUser: false }
        }));
      }
    },
     deleteLocationUser: async (businessUuid, businessUserUuid) => {
      set(state => ({
        loadingStates: { ...state.loadingStates, deleteLocationUser: true }
      }));
      try {
        const response = await locationUsersService.delete(businessUuid, businessUserUuid);
        //console.log('response on locationUsersStore', response);        
        set(state => ({
          locationUsers: [...state.locationUsers, response.item],
          error: null
        }));
        return response;
      } catch (error) {
        set({ error: error.message });
        throw error;
      } finally {
        set(state => ({
          loadingStates: { ...state.loadingStates, deleteLocationUser: false }
        }));
      }
    },

  fetchLocationUsers: async (currentUser) => {
    if (!currentUser) return;
    
    set(state => ({
      loadingStates: { ...state.loadingStates, fetchLocationUsers: true },
      error: null
    }));

    try {
      const locationUsers = await locationUsersService.getAllByUserId(currentUser.id);
        
      set(state => ({
        locationUsers,
        loadingStates: { ...state.loadingStates, fetchLocationUsers: false }
      }));
    } catch (error) {
      set(state => ({
        error: 'Error fetching location users',
        loadingStates: { ...state.loadingStates, fetchLocationUsers: false }
      }));
    }
  },
  fetchUsersByAlarmId: async (businessUuid, alarmUuid) => {
    set(state => ({
      loadingStates: { ...state.loadingStates, fetchUsersByAlarmId: true },
      error: null
    }));

    try {
      const users = await usersAlarmsService.getAllUsersByAlarmId(businessUuid, alarmUuid);
      set(state => ({
        users,
        loadingStates: { ...state.loadingStates, fetchUsersByAlarmId: false }
      }));
    } catch (error) {
      set(state => ({
        error: 'Error fetching users by alarm id',
        loadingStates: { ...state.loadingStates, fetchUsersByAlarmId: false }
      }));
    }
  },
  subscribeUserToAlarm: async (businessUuid, alarmUuid, userUuid) => {
    set(state => ({
      loadingStates: { ...state.loadingStates, subscribeUserToAlarm: true },
      error: null
    }));

    try {
      const response = await usersAlarmsService.subscribeUserToAlarm(businessUuid, alarmUuid, userUuid);
      if (response?.success) {
        const users = await usersAlarmsService.getAllUsersByAlarmId(businessUuid, alarmUuid);
        set(state => ({
          users,
          loadingStates: { ...state.loadingStates, subscribeUserToAlarm: false }
        }));
      } else {
        set(state => ({
          loadingStates: { ...state.loadingStates, subscribeUserToAlarm: false }
        }));
      }
      return response;
    } catch (error) {
      set(state => ({
        error: 'Error subscribing user to alarm',
        loadingStates: { ...state.loadingStates, subscribeUserToAlarm: false }
      }));
      return null;
    }
  },
  unsubscribeUserFromAlarm: async (businessUuid, alarmUuid, userAlarmUuid) => {
    // console.log('unsubscribe store');
    
    set(state => ({
      loadingStates: { ...state.loadingStates, unsubscribeUserFromAlarm: true },
      error: null
    }));

    try {
      const response = await usersAlarmsService.unsubscribeUserFromAlarm(businessUuid, userAlarmUuid);
      if (response?.success) {
        const users = await usersAlarmsService.getAllUsersByAlarmId(businessUuid, alarmUuid);
        set(state => ({
          users,
          loadingStates: { ...state.loadingStates, unsubscribeUserFromAlarm: false }
        }));
      } else {
        set(state => ({
          loadingStates: { ...state.loadingStates, unsubscribeUserFromAlarm: false }
        }));
      }
      return response;
    } catch (error) {
      set(state => ({
        error: 'Error unsubscribing user from alarm',
        loadingStates: { ...state.loadingStates, unsubscribeUserFromAlarm: false }
      }));
      return null;
    }
  }
}));
