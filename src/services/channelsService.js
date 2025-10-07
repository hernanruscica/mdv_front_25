import axiosClient from '../utils/axiosClient';

export const channelsService = {
  getAll: async () => {
    try {
      const { data } = await axiosClient.get(`/api/businesses/${businessId}/channels`);
      return data.channels;
    } catch (error) {
      console.error('Get channels error:', error);
      return null;
    }
  },

  getAllById: async (userId) => {
    try {
      const { data } = await axiosClient.get(`/api/businesses/${businessId}/channels/byuser/${userId}`);
      return data.channels;
    } catch (error) {
      console.error('Get assigned channels error:', error);
      return null;
    }
  },

  getById: async (channelId, businessId) => {
    try {      
      const { data } = await axiosClient.get(`/api/businesses/${businessId}/channels/${channelId}`);           
      return data.item;
    } catch (error) {
      console.error('Get channel by id error:', error);
      return null;
    }
  },

  create: async (businessId, channelData) => {
    try {
      const { data } = await axiosClient.uploadFile(`/api/businesses/${businessId}/channels`, channelData);
      return data;
    } catch (error) {
      console.error('Create channel error:', error);
      throw error;
    }
  },

  update: async (channelId, channelData) => {
    try {
      //const businessId = channelData.get('business_id'); // Assuming business_id is part of formData
      const businessId = (channelData instanceof FormData) ? channelData.get('businessUuid') : channelData?.businessUuid;
      const { data } = await axiosClient.uploadFilePUT(`/api/businesses/${businessId}/channels/${channelId}`, channelData);
      return data;
    } catch (error) {
      console.error('Update channel error:', error);
      throw error;
    }
  }
};
