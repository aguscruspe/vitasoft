import { pagosTraffic } from '../traffic/pagosTraffic';

export const pagosService = {
  async buscar(filtros) {
    const { data } = await pagosTraffic.buscar(filtros);
    return data;
  },

  async actualizar(id, payload) {
    const { data } = await pagosTraffic.actualizar(id, payload);
    return data;
  },

  async actualizarCbu(pago, nuevoCbu) {
    const payload = {
      proveedorId: pago.proveedor ? pago.proveedor.id : pago.proveedorId,
      monto: pago.monto,
      concepto: pago.concepto,
      fechaPago: pago.fechaPago,
      cbu: nuevoCbu,
    };
    const { data } = await pagosTraffic.actualizar(pago.id, payload);
    return data;
  },

  async eliminar(id) {
    await pagosTraffic.eliminar(id);
    return id;
  },

  async importar(archivo) {
    const { data } = await pagosTraffic.importar(archivo);
    return data;
  },
};
