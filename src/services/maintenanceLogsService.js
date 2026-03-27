import axiosClient from '../utils/axiosClient';

const BASE_URL = '/api/businesses';

export const maintenanceLogsService = {
  // ============================================
  // RUTAS SIN CANAL (Datalogger level)
  // ============================================
  
  getAllByDatalogger: async (businessUuid, dataloggerUuid) => {
    try {
      const { data } = await axiosClient.get(
        `${BASE_URL}/${businessUuid}/dataloggers/${dataloggerUuid}/maintenance-logs`
      );
      return data;
    } catch (error) {
      console.error('Get maintenance logs error:', error);
      throw error;
    }
  },

  getById: async (businessUuid, dataloggerUuid, maintenanceLogUuid, channelUuid = null) => {
    try {
      let url;
      if (channelUuid) {
        url = `${BASE_URL}/${businessUuid}/dataloggers/${dataloggerUuid}/channels/${channelUuid}/maintenance-logs/${maintenanceLogUuid}`;
      } else {
        url = `${BASE_URL}/${businessUuid}/dataloggers/${dataloggerUuid}/maintenance-logs/${maintenanceLogUuid}`;
      }
      const { data } = await axiosClient.get(url);
      return data;
    } catch (error) {
      console.error('Get maintenance log by id error:', error);
      throw error;
    }
  },

  create: async (businessUuid, dataloggerUuid, logData, channelUuid = null) => {
    try {
      let url;
      if (channelUuid) {
        url = `${BASE_URL}/${businessUuid}/dataloggers/${dataloggerUuid}/channels/${channelUuid}/maintenance-logs`;
      } else {
        url = `${BASE_URL}/${businessUuid}/dataloggers/${dataloggerUuid}/maintenance-logs`;
      }
      const { data } = await axiosClient.post(url, logData);
      return data;
    } catch (error) {
      console.error('Create maintenance log error:', error);
      throw error;
    }
  },

  update: async (businessUuid, dataloggerUuid, maintenanceLogUuid, logData, channelUuid = null) => {
    try {
      let url;
      if (channelUuid) {
        url = `${BASE_URL}/${businessUuid}/dataloggers/${dataloggerUuid}/channels/${channelUuid}/maintenance-logs/${maintenanceLogUuid}`;
      } else {
        url = `${BASE_URL}/${businessUuid}/dataloggers/${dataloggerUuid}/maintenance-logs/${maintenanceLogUuid}`;
      }
      const { data } = await axiosClient.put(url, logData);
      return data;
    } catch (error) {
      console.error('Update maintenance log error:', error);
      throw error;
    }
  },

  complete: async (businessUuid, dataloggerUuid, maintenanceLogUuid, channelUuid = null) => {
    try {
      let url;
      if (channelUuid) {
        url = `${BASE_URL}/${businessUuid}/dataloggers/${dataloggerUuid}/channels/${channelUuid}/maintenance-logs/${maintenanceLogUuid}/complete`;
      } else {
        url = `${BASE_URL}/${businessUuid}/dataloggers/${dataloggerUuid}/maintenance-logs/${maintenanceLogUuid}/complete`;
      }
      const { data } = await axiosClient.put(url);
      return data;
    } catch (error) {
      console.error('Complete maintenance log error:', error);
      throw error;
    }
  },

  softDelete: async (businessUuid, dataloggerUuid, maintenanceLogUuid, channelUuid = null) => {
    try {
      let url;
      if (channelUuid) {
        url = `${BASE_URL}/${businessUuid}/dataloggers/${dataloggerUuid}/channels/${channelUuid}/maintenance-logs/${maintenanceLogUuid}`;
      } else {
        url = `${BASE_URL}/${businessUuid}/dataloggers/${dataloggerUuid}/maintenance-logs/${maintenanceLogUuid}`;
      }
      const { data } = await axiosClient.delete(url);
      return data;
    } catch (error) {
      console.error('Soft delete maintenance log error:', error);
      throw error;
    }
  },

  hardDelete: async (businessUuid, dataloggerUuid, maintenanceLogUuid, channelUuid = null) => {
    try {
      let url;
      if (channelUuid) {
        url = `${BASE_URL}/${businessUuid}/dataloggers/${dataloggerUuid}/channels/${channelUuid}/maintenance-logs/${maintenanceLogUuid}/hard`;
      } else {
        url = `${BASE_URL}/${businessUuid}/dataloggers/${dataloggerUuid}/maintenance-logs/${maintenanceLogUuid}/hard`;
      }
      const { data } = await axiosClient.delete(url);
      return data;
    } catch (error) {
      console.error('Hard delete maintenance log error:', error);
      throw error;
    }
  },

  // ============================================
  // RUTAS CON CANAL (Channel level)
  // ============================================
  
  getAllByChannel: async (businessUuid, dataloggerUuid, channelUuid) => {
    try {
      console.log(`SERVICE ${BASE_URL}/${businessUuid}/dataloggers/${dataloggerUuid}/channels/${channelUuid}/maintenance-logs`)
      const { data } = await axiosClient.get(
        `${BASE_URL}/${businessUuid}/dataloggers/${dataloggerUuid}/channels/${channelUuid}/maintenance-logs`
      );
      return data;
    } catch (error) {
      console.error('Get maintenance logs by channel error:', error);
      throw error;
    }
  }
};
