import apiClient from './apiClient';

const API_BASE_URL = 'https://435-tdp-284.mktorest.com/rest/v1';

export const changeUserStatus = async (leadId, eventId, statusName, token) => {
  const endpoint = `${API_BASE_URL}/programs/${eventId}/members/status.json?access_token=${token}`;
  console.log(leadId,eventId,statusName,token)
  const payload = {
    statusName: statusName,
    input: [
      {
        leadId: leadId 
      }
    ]
  };

  try {
    const response = await apiClient.post(endpoint, payload);
    return response.data.success;
  } catch (error) {
    console.error('Failed to update event status:', error);
    return false; 
  }
};