import { api } from './api';

async function testApi() {
  try {
    const response = await api.get('/health');
    console.log('API Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    return null;
  }
}

export default testApi;
