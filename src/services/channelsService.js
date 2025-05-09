import axiosClient from '../utils/axiosClient';

export const channelsService = {
  getAll: async () => {
    try {
      const { data } = await axiosClient.get('/api/channels');
      return data.channels;
    } catch (error) {
      console.error('Get channels error:', error);
      return null;
    }
  },

  getAllById: async (userId) => {
    try {
      const { data } = await axiosClient.get(`/api/channels/byuser/${userId}`);
      return data.channels;
    } catch (error) {
      console.error('Get assigned channels error:', error);
      return null;
    }
  },

  getById: async (channelId) => {
    try {
      const { data } = await axiosClient.get(`/api/channels/${channelId}`);
      return data.channel;
    } catch (error) {
      console.error('Get channel by id error:', error);
      return null;
    }
  },

  create: async (channelData) => {
    try {
      const { data } = await axiosClient.uploadFile('/api/channels', channelData);
      return data;
    } catch (error) {
      console.error('Create channel error:', error);
      throw error;
    }
  },

  update: async (channelId, channelData) => {
    try {
      const { data } = await axiosClient.put(`/api/channels/${channelId}`, channelData);
      return data;
    } catch (error) {
      console.error('Update channel error:', error);
      throw error;
    }
  }
};