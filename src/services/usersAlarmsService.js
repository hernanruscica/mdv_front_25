import axiosClient from '../utils/axiosClient';

export const usersAlarmsService = {
  create: async (locationUserData) => {    
    const businessUuid = locationUserData?.locationUuid || '';
    //console.log('locationUserData on CREATE locationUserService', locationUserData);       
    const formData = new FormData();
    formData.append("user_uuid", locationUserData?.userUuid);
    formData.append("business_uuid", businessUuid);
    formData.append("role_uuid", locationUserData?.roleUuid);
    
    try {
      const { data } = await axiosClient.post(`/api/businesses/${businessUuid}/user-businesses`, formData)
      console.log('locationsUserResponseData',data);
      return data;
    } catch (error) {
        console.error('Create locationUser error', error);
        return null;
    }
        
  },
   update: async (locationUserData) => {    
    const businessUuid = locationUserData?.locationUuid || '';
    const businessUserUuid = locationUserData?.businessUserUuid || '';
    //console.log('locationUserData on UPDATE locationUserService', locationUserData);   
    const formData = new FormData();
    formData.append("user_uuid", locationUserData?.userUuid);
    formData.append("business_uuid", businessUuid);
    formData.append("role_uuid", locationUserData?.roleUuid);    
    
    try {
      const { data } = await axiosClient.put(`/api/businesses/${businessUuid}/user-businesses/${businessUserUuid}`, formData);
      console.log('locationsUserResponseData',data);
      return data;
    } catch (error) {
        console.error('update locationUser error', error);
        return null;
    }
        
  },
   delete: async (businessUuid, businessUserUuid) => {    
   // const businessUuid = locationUserData?.locationUuid || '';
    //const businessUserUuid = locationUserData?.businessUserUuid || '';   
    
    try {
      const { data } = await axiosClient.delete(`/api/businesses/${businessUuid}/user-businesses/${businessUserUuid}/hard`)
      //console.log('locationsUserResponseData DELETE',data);
      return data;
    } catch (error) {
        console.error('delete locationUser error', error);
        return null;
    }
    
  },
  getAll: async () => {
    try {
      const { data } = await axiosClient.get('/api/locationsusers');
      return data.locationsUsers;
    } catch (error) {
      console.error('Get location users error:', error);
      return null;
    }
  },

  getAllUsersByAlarmId: async (businessUuid, alarmUuid) => {
    try { 
      const { data } = await axiosClient.get(`/api/businesses/${businessUuid}/users-alarms/alarm/${alarmUuid}`);
      return data.users;
    } catch (error) {
      console.error('Get user locations error:', error);
      return null;
    }
  }
};