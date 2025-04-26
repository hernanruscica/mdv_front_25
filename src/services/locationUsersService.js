import axiosClient from '../utils/axiosClient';

export const locationUsersService = {
  getAll: async () => {
    try {
      const { data } = await axiosClient.get('/api/locationsusers');
      return data.locationsUsers;
    } catch (error) {
      console.error('Get location users error:', error);
      return null;
    }
  },

  getAllByUserId: async (userId) => {
    try { 
      const { data } = await axiosClient.get(`/api/locationsusers/locationsbyuser/${userId}`);
      return data.locationUserData;
    } catch (error) {
      console.error('Get user locations error:', error);
      return null;
    }
  }
};