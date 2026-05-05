import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchPagos,
  setFiltro,
  toggleSeleccion,
  seleccionarTodos,
  limpiarSeleccion,
  eliminarPagos,
  importarPagos,
} from '../store/pagosSlice';
import { procesarLote } from '../store/lotesSlice';
import EditCbuCell from '../components/EditCbuCell';

const BANCOS = ['CREDICOOP', 'GALICIA', 'SANTANDER'];
const TABS = ['PENDIENTE', 'PROCESADO', 'ELIMINADO'];

const formatearMoneda = (v) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(v || 0);

const formatearFecha = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d)) return '—';
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });
};

const enmascararCbu = (cbu) => {
  if (!cbu) return null;
  if (cbu.length < 10) return cbu;
  return `${cbu.slice(0, 6)}···${cbu.slice(-4)}`;
};

export default function Importar() {
  const dispatch = useDispatch();
  const { items, loading, error, filtros, seleccionados, lastImport } = useSelector((s) => s.pagos);
  const { loading: loteLoading, error: loteError } = useSelector((s) => s.lotes);

  const [bancoProceso, setBancoProceso] = useState('CREDICOOP');
  const [modalConfirmar, setModalConfirmar] = useState(false);
  const [modalEliminar, setModalEliminar] = useState(false);

  // File upload
  const [archivo, setArchivo] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    dispatch(fetchPagos(filtros));
  }, [dispatch, filtros]);

  const handleFiltro = (campo, valor) => dispatch(setFiltro({ [campo]: valor }));

  const toggleTodos = (e) => {
    if (e.target.checked) dispatch(seleccionarTodos(items.map((p) => p.id)));
    else dispatch(limpiarSeleccion());
  };

  const totalSeleccionado = useMemo(
    () => items.filter((p) => seleccionados.includes(p.id)).reduce((acc, p) => acc + Number(p.monto || 0), 0),
    [items, seleccionados],
  );

  const sinCbu = useMemo(
    () => items.filter((p) => !(p.cbu || (p.proveedor && p.proveedor.cbu))).length,
    [items],
  );

  const todosSeleccionados = items.length > 0 && seleccionados.length === items.length;

  const handleProcesar = () => {
    if (seleccionados.length === 0) return;
    setModalConfirmar(true);
  };

  const handleConfirmarProcesar = async () => {
    setModalConfirmar(false);
    const res = await dispatch(procesarLote({ banco: bancoProceso, pagoIds: seleccionados }));
    if (procesarLote.fulfilled.match(res)) {
      dispatch(limpiarSeleccion());
      dispatch(fetchPagos(filtros));
    }
  };

  const handleEliminar = async () => {
    setModalEliminar(false);
    const res = await dispatch(eliminarPagos(seleccionados));
    if (eliminarPagos.fulfilled.match(res)) dispatch(fetchPagos(filtros));
  };

  // ── File upload ──
  const resetInput = () => {
    if (inputRef.current) inputRef.current.value = '';
  };
  const handleFile = (file) => {
    if (!file) return;
    if (!/\.(xlsx?|xls)$/i.test(file.name)) {
      setUploadError('El archivo debe ser un Excel (.xls o .xlsx)');
      setArchivo(null);
      resetInput();
      return;
    }
    setUploadError(null);
    setArchivo(file);
  };
  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    handleFile(e.dataTransfer.files && e.dataTransfer.files[0]);
  };
  const onSelect = (e) => handleFile(e.target.files && e.target.files[0]);
  const onImportar = async () => {
    if (!archivo || loading) return;
    const res = await dispatch(importarPagos(archivo));
    if (importarPagos.fulfilled.match(res)) {
      setArchivo(null);
      resetInput();
      dispatch(fetchPagos(filtros));
    } else {
      setUploadError(res.payload || 'No se pudo importar el archivo');
    }
  };

  return (
    <div className="anim-up" style={{ padding: 32 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 44, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-1.1px', lineHeight: '44px' }}>
          Importación
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>
          Cargá pagos desde Excel y procesá lotes por banco.
        </p>
      </div>

      {/* Excel upload card */}
      <div
        style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--border-soft)',
          borderRadius: 4,
          padding: 20,
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <label
          htmlFor="file-input"
          onDrop={onDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          style={{
            flex: 1,
            minWidth: 280,
            border: `2px dashed ${dragging ? 'var(--vs-blue)' : 'var(--vs-border-2)'}`,
            background: dragging ? 'rgba(0,89,187,0.04)' : 'var(--vs-bg-2)',
            padding: '16px 20px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            transition: 'all 0.15s',
          }}
        >
          <svg width="24" height="24" viewBox="0 0 18 18" fill="var(--vs-blue)">
            <path d="M9 13L4 8l1.4-1.4 2.6 2.6V2h2v7.2l2.6-2.6L14 8l-5 5zm-7 2v-4H0v4c0 1.1.9 2 2 2h14a2 2 0 002-2v-4h-2v4H2z" />
          </svg>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
              {archivo ? archivo.name : 'Arrastrá un Excel o click para seleccionar'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
              {archivo ? `${Math.round(archivo.size / 1024)} KB · listo para importar` : 'Formatos aceptados: .xls / .xlsx'}
            </div>
          </div>
          <input ref={inputRef} id="file-input" type="file" accept=".xls,.xlsx" onChange={onSelect} style={{ display: 'none' }} />
        </label>
        <button
          className="btn-blue-grad"
          onClick={onImportar}
          disabled={!archivo || loading}
          style={{ padding: '12px 24px', borderRadius: 4, fontSize: 13, fontWeight: 700, letterSpacing: '0.6px' }}
        >
          {loading ? 'IMPORTANDO…' : 'IMPORTAR'}
        </button>
      </div>

      {uploadError && <div className="error-msg" style={{ marginBottom: 16 }}>{uploadError}</div>}
      {lastImport && (
        <div
          style={{
            marginBottom: 16,
            padding: '12px 16px',
            background: 'var(--vs-blue-bg)',
            border: '1px solid rgba(0,89,187,0.2)',
            borderRadius: 4,
            color: 'var(--vs-blue)',
            fontSize: 13,
          }}
        >
          Importación completada: <strong>{lastImport.importados ?? 0}</strong> pagos · errores:{' '}
          <strong>{lastImport.errores ?? 0}</strong>
        </div>
      )}

      {/* Controls row */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 24, marginBottom: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: 8 }}>
            BANCO OPERADOR
          </div>
          <div style={{ position: 'relative', width: 304 }}>
            <select
              value={filtros.banco}
              onChange={(e) => handleFiltro('banco', e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: 8,
                border: '1px solid var(--border-color)',
                background: 'var(--card-bg)',
                fontSize: 14,
                fontWeight: 500,
                color: 'var(--text-primary)',
                fontFamily: 'inherit',
                appearance: 'none',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="">Todos los bancos</option>
              {BANCOS.map((b) => (
                <option key={b} value={b}>
                  Banco {b.charAt(0) + b.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
            <svg
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
              width="12"
              height="7.4"
              viewBox="0 0 12 7.4"
              fill="var(--vs-t6)"
            >
              <path d="M6 7.4L0 1.4L1.4 0L6 4.6L10.6 0L12 1.4L6 7.4Z" fillRule="nonzero" />
            </svg>
          </div>
        </div>

        <div style={{ display: 'flex', background: 'var(--vs-bg-2)', borderRadius: 8, padding: 4, gap: 1 }}>
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => handleFiltro('estado', t)}
              style={{
                padding: '8px 16px',
                borderRadius: 6,
                border: 'none',
                fontFamily: 'inherit',
                fontWeight: 700,
                fontSize: 12,
                letterSpacing: '0.6px',
                cursor: 'pointer',
                background: filtros.estado === t ? 'var(--card-bg)' : 'transparent',
                color: filtros.estado === t ? 'var(--vs-blue)' : 'var(--text-muted)',
                boxShadow: filtros.estado === t ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
              }}
            >
              {t}S
            </button>
          ))}
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 12, alignItems: 'flex-end' }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: 8 }}>
              PROCESAR CON
            </div>
            <select
              value={bancoProceso}
              onChange={(e) => setBancoProceso(e.target.value)}
              style={{
                padding: '12px 16px',
                borderRadius: 8,
                border: '1px solid var(--border-color)',
                background: 'var(--card-bg)',
                fontSize: 14,
                fontWeight: 500,
                color: 'var(--text-primary)',
                fontFamily: 'inherit',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              {BANCOS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
          <button
            className="btn-blue-grad"
            onClick={handleProcesar}
            disabled={loteLoading || seleccionados.length === 0}
            style={{
              padding: '12px 32px',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 4px 6px -4px rgba(29,78,216,0.2), 0 10px 15px -3px rgba(29,78,216,0.2)',
            }}
          >
            <svg width="9.333" height="9.333" viewBox="0 0 10 10" fill="white">
              <path d="M4.5 5.5L0 5.5L0 4.5L4.5 4.5L4.5 0L5.5 0L5.5 4.5L10 4.5L10 5.5L5.5 5.5L5.5 10L4.5 10L4.5 5.5Z" fillRule="nonzero" />
            </svg>
            {loteLoading ? 'PROCESANDO…' : `Procesar Lote${seleccionados.length > 0 ? ` (${seleccionados.length})` : ''}`}
          </button>
        </div>
      </div>

      {/* Selection banner */}
      {seleccionados.length > 0 && (
        <div
          className="anim-fade"
          style={{
            marginBottom: 12,
            padding: '10px 16px',
            background: 'rgba(0,89,187,0.06)',
            border: '1px solid rgba(0,89,187,0.2)',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <span style={{ fontSize: 13, color: 'var(--vs-blue)', fontWeight: 600 }}>
            {seleccionados.length} pago{seleccionados.length > 1 ? 's' : ''} seleccionado{seleccionados.length > 1 ? 's' : ''}
          </span>
          <span style={{ color: 'var(--vs-blue)', opacity: 0.4 }}>·</span>
          <span style={{ fontSize: 13, color: 'var(--vs-blue)', fontWeight: 700 }}>
            Total: {formatearMoneda(totalSeleccionado)}
          </span>
          <button
            onClick={() => setModalEliminar(true)}
            style={{
              marginLeft: 'auto',
              padding: '6px 14px',
              borderRadius: 6,
              border: '1px solid var(--vs-rojo)',
              background: 'transparent',
              color: 'var(--vs-rojo)',
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.5px',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            ELIMINAR
          </button>
        </div>
      )}

      {error && <div className="error-msg" style={{ marginBottom: 12 }}>{error}</div>}
      {loteError && <div className="error-msg" style={{ marginBottom: 12 }}>{loteError}</div>}

      {/* Table */}
      <div
        style={{
          borderRadius: 12,
          border: '1px solid var(--border-color)',
          overflow: 'hidden',
          background: 'var(--card-bg)',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--vs-sidebar)', borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '12px 16px', width: 44 }}>
                <input type="checkbox" checked={todosSeleccionados} onChange={toggleTodos} />
              </th>
              {['PROVEEDOR', 'CUIT', 'CBU / ALIAS', 'MONTO', 'CONCEPTO', 'FECHA'].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: '12px 16px',
                    textAlign: 'left',
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: '1px',
                    color: 'var(--text-muted)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan="7" style={{ padding: 32, textAlign: 'center', color: 'var(--text-secondary)' }}>
                  Cargando…
                </td>
              </tr>
            )}
            {!loading && items.length === 0 && (
              <tr>
                <td colSpan="7" style={{ padding: 32, textAlign: 'center', color: 'var(--text-secondary)' }}>
                  Sin resultados
                </td>
              </tr>
            )}
            {!loading &&
              items.map((p) => {
                const cbu = p.cbu || (p.proveedor && p.proveedor.cbu) || '';
                const isSel = seleccionados.includes(p.id);
                return (
                  <tr
                    key={p.id}
                    style={{
                      borderBottom: '1px solid var(--border-color)',
                      background: isSel ? 'rgba(0,89,187,0.03)' : 'var(--card-bg)',
                    }}
                  >
                    <td style={{ padding: 16 }}>
                      <input type="checkbox" checked={isSel} onChange={() => dispatch(toggleSeleccion(p.id))} />
                    </td>
                    <td style={{ padding: 16 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', lineHeight: '20px' }}>
                        {(p.proveedor && p.proveedor.nombre) || '—'}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--vs-t6)', marginTop: 2 }}>ID: {p.id}</div>
                    </td>
                    <td style={{ padding: 16, fontSize: 14, color: 'var(--vs-t3)' }}>
                      {(p.proveedor && p.proveedor.cuit) || '—'}
                    </td>
                    <td style={{ padding: 16 }}>
                      {cbu ? (
                        <span
                          title={cbu}
                          style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-muted)' }}
                        >
                          {enmascararCbu(cbu)}
                        </span>
                      ) : (
                        <EditCbuCell pago={p} />
                      )}
                    </td>
                    <td style={{ padding: 16, fontSize: 14, fontWeight: 500, color: 'var(--vs-t3)', fontVariantNumeric: 'tabular-nums' }}>
                      {formatearMoneda(p.monto)}
                    </td>
                    <td style={{ padding: 16, fontSize: 14, color: 'var(--vs-t3)' }}>{p.concepto || '—'}</td>
                    <td style={{ padding: 16, fontSize: 14, color: 'var(--vs-t3)' }}>{formatearFecha(p.fechaPago)}</td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginTop: 24 }}>
        {[
          ['TOTAL PAGOS', items.length, 'var(--vs-blue)'],
          ['MONTO TOTAL', formatearMoneda(items.reduce((acc, p) => acc + Number(p.monto || 0), 0)), 'var(--vs-blue)'],
          ['SIN CBU', sinCbu, sinCbu > 0 ? 'var(--vs-rojo)' : 'var(--vs-blue)'],
        ].map(([l, v, c]) => (
          <div
            key={l}
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--border-soft)',
              borderRadius: 12,
              padding: 24,
            }}
          >
            <div style={{ fontSize: 11, letterSpacing: '0.55px', color: 'var(--text-secondary)', marginBottom: 8 }}>
              {l}
            </div>
            <div style={{ fontSize: 32, fontWeight: 700, color: c, letterSpacing: '-0.64px' }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Modal: confirmar procesamiento */}
      {modalConfirmar && (
        <div
          onClick={() => setModalConfirmar(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(248,249,250,0.8)',
            backdropFilter: 'blur(20px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="anim-scale"
            style={{
              background: 'var(--modal-bg)',
              width: 480,
              maxWidth: '90vw',
              boxShadow: '0 8px 32px rgba(65,71,84,0.12)',
              padding: 32,
            }}
          >
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
              Confirmar procesamiento
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 8 }}>
              Vas a procesar <strong>{seleccionados.length}</strong> pago(s) con banco{' '}
              <strong>{bancoProceso}</strong>.
            </p>
            <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 24 }}>
              Total: {formatearMoneda(totalSeleccionado)}
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button
                onClick={() => setModalConfirmar(false)}
                style={{
                  padding: '10px 24px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--card-bg)',
                  fontSize: 12,
                  letterSpacing: '1.1px',
                  fontWeight: 700,
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                CANCELAR
              </button>
              <button
                className="btn-blue-grad"
                onClick={handleConfirmarProcesar}
                style={{ padding: '10px 24px', fontSize: 12, letterSpacing: '1.1px', fontWeight: 700 }}
              >
                CONFIRMAR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: eliminar */}
      {modalEliminar && (
        <div
          onClick={() => setModalEliminar(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(248,249,250,0.8)',
            backdropFilter: 'blur(20px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="anim-scale"
            style={{
              background: 'var(--modal-bg)',
              width: 460,
              maxWidth: '90vw',
              boxShadow: '0 8px 32px rgba(65,71,84,0.12)',
              padding: 32,
            }}
          >
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--vs-rojo)', marginBottom: 12 }}>
              Confirmar eliminación
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>
              ¿Eliminar <strong>{seleccionados.length}</strong> pago(s)? Esta acción no se puede deshacer.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button
                onClick={() => setModalEliminar(false)}
                style={{
                  padding: '10px 24px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--card-bg)',
                  fontSize: 12,
                  letterSpacing: '1.1px',
                  fontWeight: 700,
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                CANCELAR
              </button>
              <button
                onClick={handleEliminar}
                style={{
                  padding: '10px 24px',
                  background: 'var(--vs-rojo)',
                  color: '#fff',
                  fontSize: 12,
                  letterSpacing: '1.1px',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                ELIMINAR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
