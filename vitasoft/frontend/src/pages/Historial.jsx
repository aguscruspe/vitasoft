import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLotes } from '../store/lotesSlice';
import { lotesService } from '../services/lotesService';

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

  const itemsOrdenados = useMemo(() => {
    const sorted = [...items].sort((a, b) => {
      const fechaA = a.fechaCreacion || a.fecha || '';
      const fechaB = b.fechaCreacion || b.fecha || '';
      const cmp = fechaA.localeCompare(fechaB) || a.id - b.id;
      return ordenDesc ? -cmp : cmp;
    });
    return sorted;
  }, [items, ordenDesc]);

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

  return (
    <div>
      <h1 className="page-title">Historial de Lotes</h1>

      <div className="card">
        <div className="filters">
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
        </div>
      </div>

      {error && <div className="error-msg">{error}</div>}

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Banco</th>
            <th>Fecha</th>
            <th>Pagos</th>
            <th>Total</th>
            <th>Archivos</th>
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr><td colSpan="6" style={{ textAlign: 'center' }}>Cargando...</td></tr>
          )}
          {!loading && itemsOrdenados.length === 0 && (
            <tr><td colSpan="6" style={{ textAlign: 'center' }}>Sin lotes aún</td></tr>
          )}
          {!loading && itemsOrdenados.map((lote) => {
            const txt = archivoDe(lote, 'TXT');
            const pdf = archivoDe(lote, 'PDF');
            return (
              <tr key={lote.id}>
                <td>{lote.id}</td>
                <td>{lote.banco}</td>
                <td>{formatearFecha(lote.fechaCreacion || lote.fecha)}</td>
                <td>{lote.pagos ? lote.pagos.length : (lote.cantidadPagos ?? '—')}</td>
                <td>
                  {lote.pagos && lote.pagos.length > 0
                    ? formatearMoneda(lote.pagos.reduce((acc, p) => acc + Number(p.monto), 0))
                    : lote.total != null ? formatearMoneda(lote.total) : '—'}
                </td>
                <td style={{ display: 'flex', gap: 8 }}>
                  <button
                    className="btn-dark"
                    style={{ padding: '4px 10px', fontSize: 12 }}
                    onClick={() => descargar(txt)}
                    disabled={!txt}
                  >
                    TXT
                  </button>
                  <button
                    className="btn-primary"
                    style={{ padding: '4px 10px', fontSize: 12 }}
                    onClick={() => descargar(pdf)}
                    disabled={!pdf}
                  >
                    PDF
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
