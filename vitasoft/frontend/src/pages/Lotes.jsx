import React, { useState, useEffect } from 'react';
import lotesService from '../api/lotesService';

export default function Lotes() {
  const [lotes, setLotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const cargarLotes = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await lotesService.listar();
      setLotes(res.data);
    } catch (err) {
      setError('Error al cargar lotes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarLotes();
  }, []);

  const badgeClass = (estado) => {
    switch (estado) {
      case 'GENERADO': return 'badge badge-generado';
      case 'ERROR': return 'badge badge-error';
      default: return 'badge badge-pendiente';
    }
  };

  const getArchivo = (lote, tipo) => {
    return lote.archivos?.find((a) => a.tipo === tipo);
  };

  const formatFecha = (fecha) => {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div>
      <div className="page-header">
        <h1>Historial de Lotes</h1>
        <button className="btn btn-outline" onClick={cargarLotes}>Actualizar</button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Fecha</th>
                <th>Banco</th>
                <th>Estado</th>
                <th>Pagos</th>
                <th>Archivos</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32 }}>Cargando...</td></tr>
              ) : lotes.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: '#999' }}>No hay lotes generados</td></tr>
              ) : (
                lotes.map((lote) => {
                  const archivoTxt = getArchivo(lote, 'TXT');
                  const archivoPdf = getArchivo(lote, 'PDF');

                  return (
                    <tr key={lote.id}>
                      <td><strong>#{lote.id}</strong></td>
                      <td>{formatFecha(lote.fechaCreacion)}</td>
                      <td>{lote.banco}</td>
                      <td><span className={badgeClass(lote.estado)}>{lote.estado}</span></td>
                      <td>{lote.pagos?.length || 0}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 8 }}>
                          {archivoTxt && (
                            <span className="btn btn-outline btn-sm" title={archivoTxt.ruta}>
                              📄 TXT
                            </span>
                          )}
                          {archivoPdf && (
                            <span className="btn btn-outline btn-sm" title={archivoPdf.ruta}>
                              📕 PDF
                            </span>
                          )}
                          {!archivoTxt && !archivoPdf && (
                            <span className="text-muted">Sin archivos</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
