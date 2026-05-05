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
import './Dashboard.css';

const BANCOS = ['CREDICOOP', 'GALICIA', 'SANTANDER'];
const ESTADOS = ['PENDIENTE', 'PROCESADO', 'ELIMINADO'];

const formatearFecha = (fechaISO) => {
  if (!fechaISO) return '\u2014';
  const fecha = new Date(fechaISO);
  if (isNaN(fecha)) return '\u2014';
  return fecha.toLocaleDateString('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  });
};

const formatearMonto = (monto) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(monto);

const BADGE_CLASS = {
  PENDIENTE: 'badge badge-pendiente',
  PROCESADO: 'badge badge-procesado',
  ELIMINADO: 'badge badge-eliminado',
};

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

  const pendientesCount = items.filter((p) => p.estado === 'PENDIENTE').length;
  const procesadosCount = items.filter((p) => p.estado === 'PROCESADO').length;

  return (
    <div className="dashboard-page">
      {/* Stat Cards */}
      <div className="dashboard-stats">
        <div className="stat-card stat-warning">
          <span className="stat-card-label">Pendientes</span>
          <span className="stat-card-value">{pendientesCount}</span>
        </div>
        <div className="stat-card stat-accent">
          <span className="stat-card-label">Total seleccionado</span>
          <span className="stat-card-value accent">
            {formatearMonto(montoTotalSeleccionados)}
          </span>
        </div>
        <div className="stat-card stat-success">
          <span className="stat-card-label">Procesados hoy</span>
          <span className="stat-card-value">{procesadosCount}</span>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="dashboard-filters">
        <div className="chip-group">
          <span className="filter-label">Banco</span>
          <button
            className={`chip${filtros.banco === '' ? ' active' : ''}`}
            onClick={() => handleFiltro('banco', '')}
          >
            Todos
          </button>
          {BANCOS.map((b) => (
            <button
              key={b}
              className={`chip${filtros.banco === b ? ' active' : ''}`}
              onClick={() => handleFiltro('banco', b)}
            >
              {b}
            </button>
          ))}
        </div>

        <div className="chip-group">
          <span className="filter-label">Estado</span>
          <button
            className={`chip${filtros.estado === '' ? ' active' : ''}`}
            onClick={() => handleFiltro('estado', '')}
          >
            Todos
          </button>
          {ESTADOS.map((e) => (
            <button
              key={e}
              className={`chip${filtros.estado === e ? ' active' : ''}`}
              onClick={() => handleFiltro('estado', e)}
            >
              {e}
            </button>
          ))}
        </div>

        <button
          className="btn-order"
          onClick={() => setOrdenDesc((prev) => !prev)}
          title={ordenDesc ? 'Más recientes primero' : 'Más antiguos primero'}
        >
          {ordenDesc ? '\u2193' : '\u2191'} {ordenDesc ? 'Recientes' : 'Antiguos'}
        </button>
      </div>

      {/* Alerts */}
      {error && <div className="dashboard-alert alert-error">{error}</div>}
      {loteError && <div className="dashboard-alert alert-error">{loteError}</div>}
      {ultimoLote && (
        <div className="dashboard-alert alert-success">
          Lote #{ultimoLote.id} generado correctamente.
        </div>
      )}

      {/* Table Card */}
      <div className="dashboard-table-card">
        <div className="dashboard-table-header">
          <span className="dashboard-table-title">
            Pagos ({itemsOrdenados.length})
          </span>
          <div className="dashboard-table-actions">
            {seleccionados.length > 0 && (
              <button
                className="btn-eliminar"
                onClick={() => setModalEliminar(true)}
                disabled={loading}
              >
                Eliminar ({seleccionados.length})
              </button>
            )}
            <button
              className="btn-procesar"
              onClick={handleProcesarClick}
              disabled={loteLoading || seleccionados.length === 0}
            >
              {loteLoading ? 'Procesando...' : `Procesar lote (${seleccionados.length})`}
            </button>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="dashboard-table">
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
                <tr>
                  <td colSpan="8" className="table-empty">Cargando...</td>
                </tr>
              )}
              {!loading && itemsOrdenados.length === 0 && (
                <tr>
                  <td colSpan="8" className="table-empty">Sin resultados</td>
                </tr>
              )}
              {!loading && itemsOrdenados.map((p) => {
                const cbuPresente = p.cbu || (p.proveedor && p.proveedor.cbu);
                return (
                  <tr
                    key={p.id}
                    className={seleccionados.includes(p.id) ? 'row-selected' : ''}
                  >
                    <td>
                      <input
                        type="checkbox"
                        checked={seleccionados.includes(p.id)}
                        onChange={() => dispatch(toggleSeleccion(p.id))}
                      />
                    </td>
                    <td>{p.id}</td>
                    <td>{p.proveedor ? p.proveedor.nombre : '\u2014'}</td>
                    <td className={!cbuPresente ? 'cbu-missing' : ''}>
                      <EditCbuCell pago={p} />
                    </td>
                    <td>{formatearMonto(p.monto)}</td>
                    <td>{p.concepto}</td>
                    <td>{formatearFecha(p.fechaPago)}</td>
                    <td>
                      <span className={BADGE_CLASS[p.estado] || 'badge'}>
                        {p.estado}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Eliminar */}
      {modalEliminar && (
        <div className="modal-overlay" onClick={() => setModalEliminar(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Confirmar eliminación</h2>
            <p className="modal-text">
              ¿Estás seguro que querés eliminar{' '}
              <strong>{seleccionados.length} pagos</strong>?
              {' '}Esta acción no se puede deshacer.
            </p>
            <div className="modal-actions">
              <button className="btn-modal-cancel" onClick={() => setModalEliminar(false)}>
                Cancelar
              </button>
              <button className="btn-modal-danger" onClick={handleEliminar}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Confirmar procesamiento */}
      {modalConfirmar && (
        <div className="modal-overlay" onClick={() => setModalConfirmar(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Confirmar procesamiento</h2>
            <p className="modal-text">
              ¿Estás seguro que querés procesar{' '}
              <strong>{seleccionados.length} pagos</strong> con banco{' '}
              <strong>{bancoProceso}</strong>?
            </p>
            <p className="modal-amount">
              Monto total: {formatearMonto(montoTotalSeleccionados)}
            </p>
            <div className="modal-actions">
              <button className="btn-modal-cancel" onClick={() => setModalConfirmar(false)}>
                Cancelar
              </button>
              <button className="btn-modal-confirm" onClick={handleConfirmar}>
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
