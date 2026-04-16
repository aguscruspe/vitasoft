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
    // No seteamos Content-Type: el browser/axios agrega automáticamente
    // el boundary correcto (multipart/form-data; boundary=...). Fijarlo a
    // mano rompía el parseo en el backend.
    return axiosClient.post('/pagos/importar', formData, {
      headers: { 'Content-Type': undefined },
    });
  },
};
