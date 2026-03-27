import axiosClient from '../utils/axiosClient';

export const dataService = {

  //data/getLastPorcentageUsageByChannel/:dataloggerUuid/:channelUuid
  getChannelUsage: async (businessUuid, dataloggerUuid, channelUuid) => {
    try {
      const response = await axiosClient.get(
        `/api/data/getLastPorcentageUsageByChannel/businesses/${businessUuid}/${dataloggerUuid}/${channelUuid}`
      );      
      
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener datos:', error);
      return null;
    }
  },
  // /data/getDataloggerLastData/:dataloggerUuid
  getDataloggerUsage: async (businessUuid, dataloggerUuid) => {
    try {      
      const response = await axiosClient.get(
        `/api/data/getDataloggerLastData/businesses/${businessUuid}/${dataloggerUuid}`
      );
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener datos:', error);
      return null;
    }
  },
  // /data/allregisters/:channeluuid?start='2025-12-11'&end='2025-12-12'
  getChannelAllRegisters: async (businessUuid, channelUuid, start, end) => {
    try {
      const response = await axiosClient.get(
        `/api/data/allregisters/businesses/${businessUuid}/${channelUuid}?start='${start}'&end='${end}'`        
      );
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener el último dato:', error);
      return null;
    }
  },
  // /data/alldaily/:channeluuid?start='2025-12-01'&end='2025-12-31
  getChannelDaily: async (businessUuid, channelUuid, start, end) => {
    try {
      const response = await axiosClient.get(
        `/api/data/alldaily/businesses/${businessUuid}/${channelUuid}?start='${start}'&end='${end}'`        
      );
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener el último dato:', error);
      return null;
    }
  },
  // /data/allweekly/:channeluuid?start='2025-12-01'&end='2025-12-31
  getChannelWeekly: async (businessUuid, channelUuid, start, end) => {
    try {
      const response = await axiosClient.get(
        `/api/data/allweekly/businesses/${businessUuid}/${channelUuid}?start='${start}'&end='${end}'`        
      );
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener el último dato:', error);
      return null;
    }
  },

  // /data/totalontime/businesses/:businessUuid/:channelUuid?start='...'&end='...'
  getTotalOnTime: async (businessUuid, channelUuid, start, end) => {
    try {
      const params = [];
      if (start) params.push(`start='${start}'`);
      if (end) params.push(`end='${end}'`);
      const queryString = params.length > 0 ? `?${params.join('&')}` : '';
      
      const response = await axiosClient.get(
        `/api/data/totalontime/businesses/${businessUuid}/${channelUuid}${queryString}`
      );
      return response.data;
    } catch (error) {
      console.error('Error al obtener total on time:', error);
      return { success: false, data: null };
    }
  },
};