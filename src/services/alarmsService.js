import axiosClient from '../utils/axiosClient';

export const alarmsService = {
  getAll: async (userUuid, businessUuid) => {
    console.log('desde alarmService, userUuid: ', userUuid);
    try {
      const { data } = await axiosClient.get(`/api/businesses/${businessUuid}/alarms`);
      return data.items;
    } catch (error) {
      console.error('Get alarms error:', error);
      return null;
    }
  },

  getAllById: async (userId) => {
    try {
      const { data } = await axiosClient.get(`/api/alarmusers/alarmsbyuser/${userId}`);
      //console.log('Alarms by user:', data);
      return data.alarms;
    } catch (error) {
      console.error('Get assigned alarms error:', error);
      return null;
    }
  },
  //GET {{api}}/businesses/{{own_business_uuid}}/alarms
  getAllByLocation: async (locationId) => {
    try {
      const { data } = await axiosClient.get(`/api/businesses/${locationId}/alarms`);
      //console.log('data.alarms', data.alarms)
      return data.items;
    } catch (error) {
      console.error('Get location alarms error:', error);
      return null;
    }
  },

  ///api/alarms/bychannel
  getAllByChannel: async (channelId) => {
    try {
      const { data } = await axiosClient.get(`/api/alarms/bychannel/${channelId}`);
      //console.log('data.alarms', data.alarms)
      return data.alarms;
    } catch (error) {
      console.error('Get location alarms error:', error);
      return null;
    }
  },
  
  getById: async (alarmId) => {
    try {
      const { data } = await axiosClient.get(`/api/alarms/${alarmId}`);
      return data.alarm;
    } catch (error) {
      console.error('Get alarm by id error:', error);
      return null;
    }
  },
  
  create: async (alarmData) => {
    try {
      const { data } = await axiosClient.post('/api/alarms', alarmData);
      return data;
    } catch (error) {
      console.error('Create alarm error:', error);
      throw error;
    }
  },
  
  update: async (alarmId, alarmData) => {
    try {
      const { data } = await axiosClient.put(`/api/alarms/${alarmId}`, alarmData);
      return data;
    } catch (error) {
      console.error('Update alarm error:', error);
      throw error;
    }
  }
};