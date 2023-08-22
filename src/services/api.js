import axios from 'axios';

const api = axios.create({
  baseURL: 'https://payments.pre-bnvo.com/api/v1',
  headers: {
    'X-Device-Id': '551a269b-ca34-42ef-bc3c-2f0d869e103b'
  },
});

export default api;
