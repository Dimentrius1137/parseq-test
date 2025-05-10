import axios from 'axios'
const baseUrl = 'https://testapi1.parseq.pro' 
const api = axios.create({
  baseURL: baseUrl,
  headers: {
    'Content-Type': 'application/json'
  }
});

export default api;