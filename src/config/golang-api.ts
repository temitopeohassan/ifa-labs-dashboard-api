import axios from 'axios';

export const golangApiClient = axios.create({
  baseURL: process.env.GOLANG_API_BASE_URL || 'http://localhost:8080',
  timeout: parseInt(process.env.GOLANG_API_TIMEOUT || '30000'),
  headers: {
    'Content-Type': 'application/json',
  },
});

export default golangApiClient;
