import apiClient from './apiClient';

export const getToken = async (endPointUrl, clientId, clientSecret) => {
  const params = {
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
  };

  try {
    console.log('Sending request to fetch token...');
    const response = await apiClient.get(`${endPointUrl}/identity/oauth/token`, { params });
    console.log('Token fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch token:', error);
    throw error;
  }
};
