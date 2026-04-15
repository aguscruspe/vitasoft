import axiosClient from './axiosClient';

export const pagosTraffic = {
  buscar: (filtros = {}) => {
    const params = {};
    if (filtros.banco) params.banco = filtros.banco;
    if (filtros.estado) params.estado = filtros.estado;
    if (filtros.desde) params.desde = filtros.desde;
    if (filtros.hasta) params.hasta = filtros.hasta;
    return axiosClient.get('/pagos', { params });
  },

  actualizar: (id, payload) =>
    axiosClient.put(`/pagos/${id}`, payload),

  eliminar: (id) =>
    axiosClient.delete(`/pagos/${id}`),

  importar: (archivo) => {
    const formData = new FormData();
    formData.append('archivo', archivo);
    return axiosClient.post('/pagos/importar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
