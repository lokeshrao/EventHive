import axios from 'axios';
const apiClient = axios.create({
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
// Request interceptor
apiClient.interceptors.request.use(request => {
  console.log('Request:', request);
  return request;
});

// Response interceptor
apiClient.interceptors.response.use(response => {
  console.log('Response:', response);
  return response;
}, error => {
  console.error('Error:', error);
  throw error;
});



export default apiClient;
