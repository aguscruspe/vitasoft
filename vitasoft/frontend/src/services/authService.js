import { authTraffic } from '../traffic/authTraffic';

export const authService = {
  async login(email, contrasena) {
    const { data } = await authTraffic.login(email, contrasena);
    if (data && data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('usuario', JSON.stringify({
        id: data.id,
        nombre: data.nombre,
        email: data.email,
        rol: data.rol,
      }));
    }
    return data;
  },

  logout() {
    localStorage.clear();
  },

  getToken() {
    return localStorage.getItem('token');
  },

  getUsuario() {
    const raw = localStorage.getItem('usuario');
    return raw ? JSON.parse(raw) : null;
  },

  isAuthenticated() {
    return !!localStorage.getItem('token');
  },
};
