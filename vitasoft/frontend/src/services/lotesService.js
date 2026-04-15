import { lotesTraffic } from '../traffic/lotesTraffic';

export const lotesService = {
  async listar() {
    const { data } = await lotesTraffic.listar();
    return data;
  },

  async procesar(banco, pagoIds) {
    const { data } = await lotesTraffic.procesar(banco, pagoIds);
    return data;
  },

  async descargarArchivo(archivoId, nombreSugerido) {
    const response = await lotesTraffic.descargarArchivo(archivoId);
    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nombreSugerido || `archivo_${archivoId}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
