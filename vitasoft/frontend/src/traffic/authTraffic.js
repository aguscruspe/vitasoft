import axiosClient from './axiosClient';

export const authTraffic = {
  login: (email, contrasena) =>
    axiosClient.post('/auth/login', { email, contrasena }),

  register: (payload) =>
    axiosClient.post('/auth/register', payload),
};
