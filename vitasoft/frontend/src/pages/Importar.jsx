import React, { useState, useRef } from 'react';
import pagosService from '../api/pagosService';

export default function Importar() {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setResult(null);
      setError('');
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await pagosService.importar(file);
      setResult(res.data);
      setFile(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al importar archivo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Importar Pagos desde Excel</h1>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Resultado de importación */}
      {result && (
        <div className="card">
          <div className={`alert ${result.errores?.length > 0 ? 'alert-info' : 'alert-success'}`}>
            <strong>Importación completada</strong>
          </div>
          <div style={{ display: 'flex', gap: 32, marginTop: 12 }}>
            <div>
              <span style={{ fontSize: 28, fontWeight: 700, color: 'var(--azul-oscuro)' }}>
                {result.totalLeidos}
              </span>
              <br />
              <span className="text-muted">Leídos</span>
            </div>
            <div>
              <span style={{ fontSize: 28, fontWeight: 700, color: 'var(--verde)' }}>
                {result.totalImportados}
              </span>
              <br />
              <span className="text-muted">Importados</span>
            </div>
            {result.errores?.length > 0 && (
              <div>
                <span style={{ fontSize: 28, fontWeight: 700, color: 'var(--rojo)' }}>
                  {result.errores.length}
                </span>
                <br />
                <span className="text-muted">Errores</span>
              </div>
            )}
          </div>

          {result.errores?.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <strong>Detalle de errores:</strong>
              <ul style={{ marginTop: 8, paddingLeft: 20, fontSize: 13, color: 'var(--rojo)' }}>
                {result.errores.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Drag & Drop zone */}
      <div className="card">
        <div
          className={`dropzone ${dragActive ? 'active' : ''}`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <div className="dropzone-icon">📁</div>
          <p><strong>Arrastrá tu archivo Excel aquí</strong></p>
          <p>o hacé click para seleccionarlo</p>
          <p style={{ fontSize: 12, marginTop: 8 }}>Formato: .xlsx — Columnas: Proveedor, CUIT, CBU, Monto, Concepto, Fecha</p>

          {file && (
            <div className="filename">
              📄 {file.name} ({(file.size / 1024).toFixed(1)} KB)
            </div>
          )}

          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        </div>

        {file && (
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <button className="btn btn-primary" onClick={handleUpload} disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner" /> Importando...
                </>
              ) : (
                'Importar Pagos'
              )}
            </button>
            <button
              className="btn btn-outline"
              style={{ marginLeft: 10 }}
              onClick={() => { setFile(null); setResult(null); }}
            >
              Cancelar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
