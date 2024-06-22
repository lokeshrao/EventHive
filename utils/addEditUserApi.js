import apiClient from './apiClient';

const API_BASE_URL = 'https://435-tdp-284.mktorest.com/rest/v1';

export const createOrUpdateUser = async (user, token,partitionName) => {
  const endpoint = `${API_BASE_URL}/leads.json?access_token=${token}`;
  const payload = {
    action: "createOrUpdate",
    partitionName: "EMEA",
    lookupField: "email",
    input: [{
      firstName: user.firstName,
      lastName: user.lastName,
      title: user.title,
      company: user.organization,  
      email: user.email,
      phone: user.phone,
      unsubscribed: !user.marketingOptedIn  
    }]
  };
  console.log("user Data" +JSON.stringify(user))

  try {
    const response = await apiClient.post(endpoint, payload);
    return response.data;
  } catch (error) {
    console.error('Failed to create or update user:', error);
    throw error;
  }
};