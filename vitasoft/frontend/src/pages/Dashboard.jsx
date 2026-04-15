import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchPagos,
  setFiltro,
  toggleSeleccion,
  seleccionarTodos,
  limpiarSeleccion,
} from '../store/pagosSlice';
import { procesarLote } from '../store/lotesSlice';
import EditCbuCell from '../components/EditCbuCell';

const BANCOS = ['CREDICOOP', 'GALICIA', 'SANTANDER'];
const ESTADOS = ['PENDIENTE', 'PROCESADO', 'ELIMINADO'];

export default function Dashboard() {
  const dispatch = useDispatch();
  const { items, loading, error, filtros, seleccionados } = useSelector(
    (s) => s.pagos
  );
  const { loading: loteLoading, error: loteError, ultimoLote } = useSelector(
    (s) => s.lotes
  );
  const [bancoProceso, setBancoProceso] = useState('CREDICOOP');

  useEffect(() => {
    dispatch(fetchPagos(filtros));
  }, [dispatch, filtros]);

  const handleFiltro = (campo, valor) => {
    dispatch(setFiltro({ [campo]: valor }));
  };

  const toggleTodos = (e) => {
    if (e.target.checked) {
      dispatch(seleccionarTodos(items.map((p) => p.id)));
    } else {
      dispatch(limpiarSeleccion());
    }
  };

  const handleProcesar = async () => {
    if (seleccionados.length === 0) {
      alert('Seleccioná al menos un pago');
      return;
    }
    const res = await dispatch(
      procesarLote({ banco: bancoProceso, pagoIds: seleccionados })
    );
    if (procesarLote.fulfilled.match(res)) {
      dispatch(limpiarSeleccion());
      dispatch(fetchPagos(filtros));
    }
  };

  const todosSeleccionados =
    items.length > 0 && seleccionados.length === items.length;

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
              <option value="">Todos</option>
              {ESTADOS.map((e) => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
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
              onClick={handleProcesar}
              disabled={loteLoading || seleccionados.length === 0}
            >
              {loteLoading ? 'Procesando...' : `Procesar (${seleccionados.length})`}
            </button>
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
            {!loading && items.length === 0 && (
              <tr><td colSpan="8" style={{ textAlign: 'center' }}>Sin resultados</td></tr>
            )}
            {!loading && items.map((p) => (
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
                <td>{p.monto}</td>
                <td>{p.concepto}</td>
                <td>{p.fechaPago}</td>
                <td>{p.estado}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
