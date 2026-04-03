import api from './axios';

const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { token, email: userEmail, rol } = response.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify({ email: userEmail, rol }));
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
};

export default authService;
