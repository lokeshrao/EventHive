import apiClient from './apiClient';

const API_BASE_URL = 'https://435-tdp-284.mktorest.com/rest/v1';

export const createOrUpdateUser = async (user, token,partitionName) => {
  const endpoint = `${API_BASE_URL}/leads.json?access_token=${token}`;
  const payload = {
    action: "createOrUpdate",
    partitionName: partitionName,
    lookupField: "email",
    input: [user]
  };

  try {
    const response = await apiClient.post(endpoint, payload);
    return response.data;
  } catch (error) {
    console.error('Failed to create or update user:', error);
    throw error;
  }
};