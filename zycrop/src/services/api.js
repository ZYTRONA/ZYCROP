import axios from 'axios';

const api = axios.create({
  baseURL: 'http://YOUR_LAPTOP_IP:8000',
  headers: {
    'Content-Type': 'application/json'
  }
});

export default api;
