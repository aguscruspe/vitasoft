import api from './axios';

const pagosService = {
  listar: (filtros = {}) => {
    const params = new URLSearchParams();
    if (filtros.estado) params.append('estado', filtros.estado);
    if (filtros.banco) params.append('banco', filtros.banco);
    if (filtros.desde) params.append('desde', filtros.desde);
    if (filtros.hasta) params.append('hasta', filtros.hasta);
    return api.get(`/pagos?${params.toString()}`);
  },

  importar: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/pagos/importar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  actualizar: (id, data) => {
    return api.put(`/pagos/${id}`, data);
  },

  eliminar: (id) => {
    return api.delete(`/pagos/${id}`);
  },
};

export default pagosService;
