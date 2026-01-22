import axiosClient from '../utils/axiosClient';

export const usersService = {
  getAll: async (businessUuid) => {
    try {
      const { data } = await axiosClient.get(`/api/businesses/${businessUuid}/users/`);
      return data.users;
    } catch (error) {
      console.error('Get users error:', error);
      return null;
    }
  },

  getAllById: async (businessUuid) => {
    try {
      const { data } = await axiosClient.get(`/api/businesses/${businessUuid}/users/`);
      return data.users;
    } catch (error) {
      console.error('Get assigned users error:', error);
      return null;
    }
  },

  getById: async (uuid, uuidOrigin) => {    
    
    try {
      const { data } = await axiosClient.get(`/api/businesses/${uuidOrigin}/users/${uuid}`);
      return data.user;
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  },

  create: async (userData, businessUuid) => {
    try {
      const { data } = await axiosClient.uploadFile(`/api/businesses/${businessUuid}/users`, userData);
      return data;
    } catch (error) {
      console.error('Create user error:', error);
      throw error;
    } 
  },

  update: async (uuid, userData) => {
    //console.log('userToUpdate.uuid userService', uuid);
    //console.log('business_uuid', userData.get("business_uuid"));
    
    //const businessUuid = userData.get('business_uuid');
    const businessUuid = userData.get("business_uuid");
    //console.log('businessUuid - usersService', businessUuid);
    
    try {
      const { data } = await axiosClient.uploadFilePUT(`/api/businesses/${businessUuid}/users/${uuid}`, userData);
      console.log(' from usrs service data', data);
      return data;
    } catch (error) {
      console.error('Update user error:', error);
      return null;
    }
  },

  delete: async (businessUuid, id) => {
    try {      
      const { data } = await axiosClient.delete(`/api/businesses/${businessUuid}/users/${id}/hard`);
      return data;
    } catch (error) {
      console.error('Delete user error:', error);
      return null;
    }
  }
};
