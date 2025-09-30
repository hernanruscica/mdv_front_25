import axiosClient from '../utils/axiosClient';

export const dataloggersService = {
  create: async (formData) => {
    try {
      const { data } = await axiosClient.uploadFile('/api/dataloggers', formData);
      return data;
    } catch (error) {
      console.error('Error creating datalogger:', error);
      throw error;
    }
  },
  ///businesses/{{own_business_uuid}}/dataloggers
  getAll: async (businessUuid) => {
    try {
      const { data } = await axiosClient.get(`/api/businesses/${businessUuid}/dataloggers`);
      //console.log(data.items);
      return data.items;
    } catch (error) {
      console.error('Get dataloggers error:', error);
      return null;
    }
  },
  // to check
  getAllById: async (userId, businessUuid) => {
    try {
      const { data } = await axiosClient.get(`/api/businesses/${businessUuid}/dataloggers/${userId}`);
      return data.dataloggers;
    } catch (error) {
      console.error('Get assigned dataloggers error:', error);
      return null;
    }
  },

  getAllByLocation: async (locationId) => {
    try {
      const { data } = await axiosClient.get(`/api/dataloggers/bylocation/${locationId}`);
      return data.dataloggers;
    } catch (error) {
      console.error('Get location dataloggers error:', error);
      return null;
    }
  },

  getById: async (id, businessUuid) => {
    try {
      const { data } = await axiosClient.get(`/api/businesses/${businessUuid}/dataloggers/${id}`);
      //console.log('Datalogger by id data:', data);
      return data.item;
    } catch (error) {
      console.error('Get datalogger by id error:', error);
      return null;
    }
  },

  update: async (id, formData) => {
    try {
      const { data } = await axiosClient.put(`/api/dataloggers/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return data;
    } catch (error) {
      console.error('Error updating datalogger:', error);
      throw error;
    }
  }
};