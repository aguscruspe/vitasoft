import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLotes } from '../store/lotesSlice';
import { lotesService } from '../services/lotesService';
import './Historial.css';

const BANCOS = ['CREDICOOP', 'GALICIA', 'SANTANDER'];

const BANK_CLASS = {
  CREDICOOP: 'bank-credicoop',
  GALICIA: 'bank-galicia',
  SANTANDER: 'bank-santander',
};

const formatearFecha = (fechaISO) => {
  if (!fechaISO) return '—';
  const fecha = new Date(fechaISO);
  if (isNaN(fecha)) return '—';
  return fecha.toLocaleDateString('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  }) + ' ' + fecha.toLocaleTimeString('es-AR', {
    hour: '2-digit', minute: '2-digit'
  });
};

const formatearMoneda = (valor) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(valor);

export default function Historial() {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((s) => s.lotes);
  const [ordenDesc, setOrdenDesc] = useState(true);
  const [filtroBanco, setFiltroBanco] = useState('');

  const itemsFiltrados = useMemo(() => {
    let filtered = items;
    if (filtroBanco) {
      filtered = filtered.filter((l) => l.banco === filtroBanco);
    }
    const sorted = [...filtered].sort((a, b) => {
      const fechaA = a.fechaCreacion || a.fecha || '';
      const fechaB = b.fechaCreacion || b.fecha || '';
      const cmp = fechaA.localeCompare(fechaB) || a.id - b.id;
      return ordenDesc ? -cmp : cmp;
    });
    return sorted;
  }, [items, ordenDesc, filtroBanco]);

  useEffect(() => {
    dispatch(fetchLotes());
  }, [dispatch]);

  const archivoDe = (lote, tipo) => {
    if (!lote.archivos) return null;
    return lote.archivos.find((a) => a.tipo === tipo);
  };

  const descargar = async (archivo) => {
    if (!archivo) return;
    const nombre = archivo.ruta
      ? archivo.ruta.split(/[\\/]/).pop()
      : `archivo_${archivo.id}.${archivo.tipo.toLowerCase()}`;
    try {
      await lotesService.descargarArchivo(archivo.id, nombre);
    } catch (e) {
      alert('No se pudo descargar el archivo');
    }
  };

  const cantidadPagos = (lote) =>
    lote.pagos ? lote.pagos.length : (lote.cantidadPagos ?? '—');

  const totalLote = (lote) => {
    if (lote.pagos && lote.pagos.length > 0) {
      return formatearMoneda(lote.pagos.reduce((acc, p) => acc + Number(p.monto), 0));
    }
    return lote.total != null ? formatearMoneda(lote.total) : '—';
  };

  return (
    <div className="historial-page">
      <h1 className="historial-title">Historial de Lotes</h1>

      {/* Filter Chips */}
      <div className="historial-filters">
        <div className="chip-group">
          <span className="filter-label">Banco</span>
          <button
            className={`chip${filtroBanco === '' ? ' active' : ''}`}
            onClick={() => setFiltroBanco('')}
          >
            Todos
          </button>
          {BANCOS.map((b) => (
            <button
              key={b}
              className={`chip${filtroBanco === b ? ' active' : ''}`}
              onClick={() => setFiltroBanco(b)}
            >
              {b}
            </button>
          ))}
        </div>

        <button
          className="btn-order"
          onClick={() => setOrdenDesc((prev) => !prev)}
          title={ordenDesc ? 'Más recientes primero' : 'Más antiguos primero'}
        >
          {ordenDesc ? '↓' : '↑'} {ordenDesc ? 'Recientes' : 'Antiguos'}
        </button>
      </div>

      {/* Error */}
      {error && <div className="dashboard-alert alert-error">{error}</div>}

      {/* Cards Grid */}
      <div className="historial-grid">
        {loading && (
          <div className="historial-loading">Cargando...</div>
        )}

        {!loading && itemsFiltrados.length === 0 && (
          <div className="historial-empty">Sin lotes aún</div>
        )}

        {!loading && itemsFiltrados.map((lote) => {
          const txt = archivoDe(lote, 'TXT');
          const pdf = archivoDe(lote, 'PDF');
          const bankClass = BANK_CLASS[lote.banco] || 'bank-default';

          return (
            <div className="lote-card" key={lote.id}>
              <div className="lote-card-header">
                <span className="lote-card-id">Lote #{lote.id}</span>
                <span className={`bank-badge ${bankClass}`}>{lote.banco}</span>
              </div>

              <div className="lote-card-details">
                <div className="lote-detail">
                  <span className="lote-detail-label">Fecha</span>
                  <span className="lote-detail-value">
                    {formatearFecha(lote.fechaCreacion || lote.fecha)}
                  </span>
                </div>
                <div className="lote-detail">
                  <span className="lote-detail-label">Pagos</span>
                  <span className="lote-detail-value">{cantidadPagos(lote)}</span>
                </div>
                <div className="lote-detail" style={{ gridColumn: '1 / -1' }}>
                  <span className="lote-detail-label">Total</span>
                  <span className="lote-detail-value total">{totalLote(lote)}</span>
                </div>
              </div>

              <div className="lote-card-actions">
                <button
                  className="btn-download btn-download-txt"
                  onClick={() => descargar(txt)}
                  disabled={!txt}
                >
                  Descargar TXT
                </button>
                <button
                  className="btn-download btn-download-pdf"
                  onClick={() => descargar(pdf)}
                  disabled={!pdf}
                >
                  Descargar PDF
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
