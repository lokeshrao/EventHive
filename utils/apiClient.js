import axios from 'axios';

// Helper function to convert an Axios request to a cURL command
function axiosToCurl(request) {
  let command = `curl -X ${request.method.toUpperCase()}`;
  
  // Add headers
  for (const [key, value] of Object.entries(request.headers)) {
    command += ` -H "${key}: ${value}"`;
  }

  // Add data if present
  if (request.data) {
    command += ` -d '${JSON.stringify(request.data)}'`;
  }

  // Add the URL
  command += ` "${request.url}"`;

  return command;
}

const apiClient = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(request => {
  const curlCommand = axiosToCurl(request);
  console.log('Request as cURL:', curlCommand);
  return request;
});

// Response interceptor
apiClient.interceptors.response.use(response => {
  console.log('Response JSON:', JSON.stringify(response.data, null, 2));
  return response;
}, error => {
  if (error.response) {
    console.error('Error Response JSON:', JSON.stringify(error.response.data, null, 2));
  } else {
    console.error('Error:', error.message);
  }
  throw error;
});

export default apiClient;
