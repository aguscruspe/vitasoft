import React, { useState, useEffect, useCallback } from 'react';
import pagosService from '../api/pagosService';
import lotesService from '../api/lotesService';
import EditPagoModal from '../components/EditPagoModal';

const BANCOS = ['', 'CREDICOOP', 'GALICIA', 'SANTANDER'];
const ESTADOS = ['', 'PENDIENTE', 'PROCESADO', 'ELIMINADO'];

export default function Dashboard() {
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filtros
  const [banco, setBanco] = useState('');
  const [estado, setEstado] = useState('');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');

  // Selección para procesar
  const [selected, setSelected] = useState(new Set());
  const [bancoLote, setBancoLote] = useState('CREDICOOP');
  const [procesando, setProcesando] = useState(false);

  // Modal de edición
  const [editPago, setEditPago] = useState(null);

  const cargarPagos = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await pagosService.listar({ banco, estado, desde, hasta });
      setPagos(res.data);
    } catch (err) {
      setError('Error al cargar pagos');
    } finally {
      setLoading(false);
    }
  }, [banco, estado, desde, hasta]);

  useEffect(() => {
    cargarPagos();
  }, [cargarPagos]);

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    const pendientes = pagos.filter((p) => p.estado === 'PENDIENTE');
    if (selected.size === pendientes.length && pendientes.length > 0) {
      setSelected(new Set());
    } else {
      setSelected(new Set(pendientes.map((p) => p.id)));
    }
  };

  const handleProcesar = async () => {
    if (selected.size === 0) return;
    setProcesando(true);
    setError('');
    setSuccess('');
    try {
      const res = await lotesService.procesar([...selected], bancoLote);
      setSuccess(`Lote #${res.data.id} generado con ${selected.size} pagos para ${bancoLote}`);
      setSelected(new Set());
      cargarPagos();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al procesar lote');
    } finally {
      setProcesando(false);
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Eliminar este pago?')) return;
    try {
      await pagosService.eliminar(id);
      cargarPagos();
    } catch (err) {
      setError('Error al eliminar pago');
    }
  };

  const badgeClass = (estado) => {
    switch (estado) {
      case 'PENDIENTE': return 'badge badge-pendiente';
      case 'PROCESADO': return 'badge badge-procesado';
      case 'ELIMINADO': return 'badge badge-eliminado';
      default: return 'badge';
    }
  };

  const formatMonto = (monto) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(monto);
  };

  return (
    <div>
      <div className="page-header">
        <h1>Pagos</h1>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Filtros */}
      <div className="card">
        <div className="filters-bar">
          <div className="form-group">
            <label>Banco</label>
            <select className="form-control" value={banco} onChange={(e) => setBanco(e.target.value)}>
              {BANCOS.map((b) => (
                <option key={b} value={b}>{b || 'Todos'}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Estado</label>
            <select className="form-control" value={estado} onChange={(e) => setEstado(e.target.value)}>
              {ESTADOS.map((e) => (
                <option key={e} value={e}>{e || 'Todos'}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Desde</label>
            <input className="form-control" type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Hasta</label>
            <input className="form-control" type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={cargarPagos}>Buscar</button>
        </div>
      </div>

      {/* Barra de procesamiento */}
      {selected.size > 0 && (
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontWeight: 600 }}>{selected.size} pago(s) seleccionado(s)</span>
          <select className="form-control" style={{ width: 180 }} value={bancoLote} onChange={(e) => setBancoLote(e.target.value)}>
            <option value="CREDICOOP">Credicoop</option>
            <option value="GALICIA">Galicia</option>
            <option value="SANTANDER">Santander</option>
          </select>
          <button className="btn btn-success" onClick={handleProcesar} disabled={procesando}>
            {procesando ? <span className="spinner" /> : 'Procesar Lote'}
          </button>
        </div>
      )}

      {/* Tabla de pagos */}
      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th><input type="checkbox" onChange={toggleAll} checked={selected.size > 0 && selected.size === pagos.filter((p) => p.estado === 'PENDIENTE').length} /></th>
                <th>Proveedor</th>
                <th>CUIT</th>
                <th>CBU</th>
                <th>Monto</th>
                <th>Concepto</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: 32 }}>Cargando...</td></tr>
              ) : pagos.length === 0 ? (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: 32, color: '#999' }}>No se encontraron pagos</td></tr>
              ) : (
                pagos.map((pago) => (
                  <tr key={pago.id}>
                    <td>
                      {pago.estado === 'PENDIENTE' && (
                        <input
                          type="checkbox"
                          checked={selected.has(pago.id)}
                          onChange={() => toggleSelect(pago.id)}
                        />
                      )}
                    </td>
                    <td>{pago.proveedor?.nombre}</td>
                    <td>{pago.proveedor?.cuit}</td>
                    <td style={{ color: !pago.proveedor?.cbu ? 'var(--rojo)' : 'inherit', fontStyle: !pago.proveedor?.cbu ? 'italic' : 'normal' }}>
                      {pago.proveedor?.cbu || 'Sin CBU'}
                    </td>
                    <td style={{ fontWeight: 600 }}>{formatMonto(pago.monto)}</td>
                    <td>{pago.concepto}</td>
                    <td>{pago.fechaPago}</td>
                    <td><span className={badgeClass(pago.estado)}>{pago.estado}</span></td>
                    <td>
                      {pago.estado === 'PENDIENTE' && (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-outline btn-sm" onClick={() => setEditPago(pago)}>Editar</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleEliminar(pago.id)}>Eliminar</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de edición */}
      {editPago && (
        <EditPagoModal
          pago={editPago}
          onClose={() => setEditPago(null)}
          onSaved={() => { setEditPago(null); cargarPagos(); }}
        />
      )}
    </div>
  );
}
