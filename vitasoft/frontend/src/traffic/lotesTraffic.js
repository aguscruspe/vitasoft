import axios from 'axios';
import axiosClient from './axiosClient';

const FILES_BASE = 'http://localhost:8080';

export const lotesTraffic = {
  listar: () => axiosClient.get('/lotes'),

  obtener: (id) => axiosClient.get(`/lotes/${id}`),

  procesar: (banco, pagoIds) =>
    axiosClient.post('/lotes/procesar', { banco, pagoIds }),

  descargarArchivo: (archivoId) => {
    const token = localStorage.getItem('token');
    return axios.get(`${FILES_BASE}/archivos/${archivoId}/descargar`, {
      responseType: 'blob',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },
};
