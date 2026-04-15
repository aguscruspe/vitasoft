import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLotes } from '../store/lotesSlice';
import { lotesService } from '../services/lotesService';

export default function Historial() {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((s) => s.lotes);

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
          {!loading && items.length === 0 && (
            <tr><td colSpan="6" style={{ textAlign: 'center' }}>Sin lotes aún</td></tr>
          )}
          {!loading && items.map((lote) => {
            const txt = archivoDe(lote, 'TXT');
            const pdf = archivoDe(lote, 'PDF');
            return (
              <tr key={lote.id}>
                <td>{lote.id}</td>
                <td>{lote.banco}</td>
                <td>{lote.fechaCreacion || lote.fecha || '—'}</td>
                <td>{lote.pagos ? lote.pagos.length : (lote.cantidadPagos ?? '—')}</td>
                <td>{lote.total ?? '—'}</td>
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
