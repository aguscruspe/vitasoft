import api from './axios';

const lotesService = {
  listar: () => {
    return api.get('/lotes');
  },

  procesar: (pagoIds, banco) => {
    return api.post('/lotes/procesar', { pagoIds, banco });
  },
};

export default lotesService;
