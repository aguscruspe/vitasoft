import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchPagos,
  setFiltro,
  toggleSeleccion,
  seleccionarTodos,
  limpiarSeleccion,
  eliminarPagos,
} from '../store/pagosSlice';
import { procesarLote } from '../store/lotesSlice';
import EditCbuCell from '../components/EditCbuCell';

const BANCOS = ['CREDICOOP', 'GALICIA', 'SANTANDER'];
const ESTADOS = ['PENDIENTE', 'PROCESADO', 'ELIMINADO'];

const formatearFecha = (fechaISO) => {
  if (!fechaISO) return '—';
  const fecha = new Date(fechaISO);
  if (isNaN(fecha)) return '—';
  return fecha.toLocaleDateString('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  });
};

const formatearMonto = (monto) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(monto);

export default function Dashboard() {
  const dispatch = useDispatch();
  const { items, loading, error, filtros, seleccionados } = useSelector(
    (s) => s.pagos
  );
  const { loading: loteLoading, error: loteError, ultimoLote } = useSelector(
    (s) => s.lotes
  );
  const [bancoProceso, setBancoProceso] = useState('CREDICOOP');
  const [ordenDesc, setOrdenDesc] = useState(true);
  const [modalConfirmar, setModalConfirmar] = useState(false);
  const [modalEliminar, setModalEliminar] = useState(false);

  const itemsOrdenados = useMemo(() => {
    const sorted = [...items].sort((a, b) => {
      const fechaA = a.fechaPago || '';
      const fechaB = b.fechaPago || '';
      const cmp = fechaA.localeCompare(fechaB) || a.id - b.id;
      return ordenDesc ? -cmp : cmp;
    });
    return sorted;
  }, [items, ordenDesc]);

  useEffect(() => {
    dispatch(fetchPagos(filtros));
  }, [dispatch, filtros]);

  const handleFiltro = (campo, valor) => {
    dispatch(setFiltro({ [campo]: valor }));
  };

  const toggleTodos = (e) => {
    if (e.target.checked) {
      dispatch(seleccionarTodos(itemsOrdenados.map((p) => p.id)));
    } else {
      dispatch(limpiarSeleccion());
    }
  };

  const handleProcesarClick = () => {
    if (seleccionados.length === 0) {
      alert('Seleccioná al menos un pago');
      return;
    }
    setModalConfirmar(true);
  };

  const handleConfirmar = async () => {
    setModalConfirmar(false);
    const res = await dispatch(
      procesarLote({ banco: bancoProceso, pagoIds: seleccionados })
    );
    if (procesarLote.fulfilled.match(res)) {
      dispatch(limpiarSeleccion());
      dispatch(fetchPagos(filtros));
    }
  };

  const handleEliminar = async () => {
    setModalEliminar(false);
    const res = await dispatch(eliminarPagos(seleccionados));
    if (eliminarPagos.fulfilled.match(res)) {
      dispatch(fetchPagos(filtros));
    }
  };

  const montoTotalSeleccionados = useMemo(() => {
    return items
      .filter((p) => seleccionados.includes(p.id))
      .reduce((acc, p) => acc + Number(p.monto), 0);
  }, [items, seleccionados]);

  const todosSeleccionados =
    itemsOrdenados.length > 0 && seleccionados.length === itemsOrdenados.length;

  return (
    <div>
      <h1 className="page-title">Dashboard de Pagos</h1>

      <div className="card">
        <div className="filters">
          <div className="filter-group">
            <label>Banco</label>
            <select
              value={filtros.banco}
              onChange={(e) => handleFiltro('banco', e.target.value)}
            >
              <option value="">Todos</option>
              {BANCOS.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Estado</label>
            <select
              value={filtros.estado}
              onChange={(e) => handleFiltro('estado', e.target.value)}
            >
              {ESTADOS.map((e) => (
                <option key={e} value={e}>{e}</option>
              ))}
              <option value="">Todos</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Orden</label>
            <button
              className={ordenDesc ? 'btn-primary' : 'btn-dark'}
              style={{ padding: '8px 12px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
              onClick={() => setOrdenDesc((prev) => !prev)}
              title={ordenDesc ? 'Más recientes primero' : 'Más antiguos primero'}
            >
              <span style={{ fontSize: 16 }}>{ordenDesc ? '↓' : '↑'}</span>
              {ordenDesc ? 'Recientes' : 'Antiguos'}
            </button>
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'end' }}>
            <div className="filter-group">
              <label>Procesar con banco</label>
              <select
                value={bancoProceso}
                onChange={(e) => setBancoProceso(e.target.value)}
              >
                {BANCOS.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
            <button
              className="btn-primary"
              onClick={handleProcesarClick}
              disabled={loteLoading || seleccionados.length === 0}
            >
              {loteLoading ? 'Procesando...' : `Procesar (${seleccionados.length})`}
            </button>
            {seleccionados.length > 0 && (
              <button
                className="btn-danger"
                onClick={() => setModalEliminar(true)}
                disabled={loading}
              >
                Eliminar seleccionados ({seleccionados.length})
              </button>
            )}
          </div>
        </div>

        {error && <div className="error-msg">{error}</div>}
        {loteError && <div className="error-msg">{loteError}</div>}
        {ultimoLote && (
          <div className="success-msg">
            Lote #{ultimoLote.id} generado correctamente.
          </div>
        )}
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th style={{ width: 40 }}>
                <input
                  type="checkbox"
                  checked={todosSeleccionados}
                  onChange={toggleTodos}
                />
              </th>
              <th>ID</th>
              <th>Proveedor</th>
              <th>CBU</th>
              <th>Monto</th>
              <th>Concepto</th>
              <th>Fecha Pago</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan="8" style={{ textAlign: 'center' }}>Cargando...</td></tr>
            )}
            {!loading && itemsOrdenados.length === 0 && (
              <tr><td colSpan="8" style={{ textAlign: 'center' }}>Sin resultados</td></tr>
            )}
            {!loading && itemsOrdenados.map((p) => (
              <tr key={p.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={seleccionados.includes(p.id)}
                    onChange={() => dispatch(toggleSeleccion(p.id))}
                  />
                </td>
                <td>{p.id}</td>
                <td>{p.proveedor ? p.proveedor.nombre : '—'}</td>
                <td><EditCbuCell pago={p} /></td>
                <td>{formatearMonto(p.monto)}</td>
                <td>{p.concepto}</td>
                <td>{formatearFecha(p.fechaPago)}</td>
                <td>{p.estado}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalEliminar && (
        <div
          onClick={() => setModalEliminar(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff', borderRadius: 8, padding: 28,
              width: 420, maxWidth: '90vw',
              boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
            }}
          >
            <h2 style={{ margin: '0 0 16px', color: '#1A2B4C', fontSize: 18 }}>
              Confirmar eliminación
            </h2>
            <p style={{ margin: '0 0 24px', color: '#333' }}>
              ¿Estás seguro que querés eliminar{' '}
              <strong>{seleccionados.length} pagos</strong>?
              {' '}Esta acción no se puede deshacer.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                className="btn-secondary"
                onClick={() => setModalEliminar(false)}
                style={{ padding: '8px 20px' }}
              >
                Cancelar
              </button>
              <button
                className="btn-danger"
                onClick={handleEliminar}
                style={{ padding: '8px 20px' }}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {modalConfirmar && (
        <div
          onClick={() => setModalConfirmar(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff', borderRadius: 8, padding: 28,
              width: 420, maxWidth: '90vw',
              boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
            }}
          >
            <h2 style={{ margin: '0 0 16px', color: '#1A2B4C', fontSize: 18 }}>
              Confirmar procesamiento
            </h2>
            <p style={{ margin: '0 0 8px', color: '#333' }}>
              ¿Estás seguro que querés procesar{' '}
              <strong>{seleccionados.length} pagos</strong> con banco{' '}
              <strong>{bancoProceso}</strong>?
            </p>
            <p style={{ margin: '0 0 24px', fontSize: 16, fontWeight: 600, color: '#1A2B4C' }}>
              Monto total: {formatearMonto(montoTotalSeleccionados)}
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                className="btn-secondary"
                onClick={() => setModalConfirmar(false)}
                style={{ padding: '8px 20px' }}
              >
                Cancelar
              </button>
              <button
                className="btn-primary"
                onClick={handleConfirmar}
                style={{ padding: '8px 20px' }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
