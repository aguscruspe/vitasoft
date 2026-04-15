import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { importarPagos } from '../store/pagosSlice';

const styles = {
  dropzone: {
    border: '2px dashed var(--vs-azul)',
    borderRadius: 8,
    padding: 60,
    textAlign: 'center',
    background: '#fff',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  dropzoneActive: {
    background: '#e7f1ff',
    borderColor: 'var(--vs-azul-oscuro)',
  },
  icon: {
    fontSize: 40,
    color: 'var(--vs-azul)',
    marginBottom: 12,
  },
  info: {
    marginTop: 20,
    padding: 16,
    background: '#fff',
    borderRadius: 6,
  },
};

export default function Importar() {
  const dispatch = useDispatch();
  const { loading, error, lastImport } = useSelector((s) => s.pagos);
  const [dragging, setDragging] = useState(false);
  const [archivo, setArchivo] = useState(null);

  const handleFile = (file) => {
    if (!file) return;
    const ok = /\.(xlsx?|xls)$/i.test(file.name);
    if (!ok) {
      alert('El archivo debe ser un Excel (.xls o .xlsx)');
      return;
    }
    setArchivo(file);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const onDragLeave = () => setDragging(false);

  const onSelect = (e) => handleFile(e.target.files[0]);

  const onImportar = async () => {
    if (!archivo) return;
    const res = await dispatch(importarPagos(archivo));
    if (importarPagos.fulfilled.match(res)) {
      setArchivo(null);
    }
  };

  return (
    <div>
      <h1 className="page-title">Importar Pagos</h1>

      <label
        htmlFor="file-input"
        style={{
          ...styles.dropzone,
          ...(dragging ? styles.dropzoneActive : {}),
          display: 'block',
        }}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
      >
        <div style={styles.icon}>⬆</div>
        <div style={{ fontSize: 16, marginBottom: 6 }}>
          Arrastrá tu archivo Excel acá
        </div>
        <div style={{ color: 'var(--vs-gris-medio)', fontSize: 13 }}>
          o hacé click para seleccionarlo
        </div>
        {archivo && (
          <div style={{ marginTop: 14, fontWeight: 600 }}>
            📄 {archivo.name}
          </div>
        )}
        <input
          id="file-input"
          type="file"
          accept=".xls,.xlsx"
          onChange={onSelect}
          style={{ display: 'none' }}
        />
      </label>

      <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
        <button
          className="btn-primary"
          onClick={onImportar}
          disabled={!archivo || loading}
        >
          {loading ? 'Importando...' : 'Importar'}
        </button>
        {archivo && (
          <button
            className="btn-secondary"
            onClick={() => setArchivo(null)}
            disabled={loading}
          >
            Limpiar
          </button>
        )}
      </div>

      {error && <div className="error-msg">{error}</div>}

      {lastImport && (
        <div style={styles.info}>
          <h3 style={{ marginBottom: 8 }}>Resultado de la importación</h3>
          <div>Procesados: <strong>{lastImport.procesados ?? '—'}</strong></div>
          <div>Insertados: <strong>{lastImport.insertados ?? '—'}</strong></div>
          <div>Errores: <strong>{lastImport.errores ?? 0}</strong></div>
          {lastImport.mensajes && lastImport.mensajes.length > 0 && (
            <ul style={{ marginTop: 8, paddingLeft: 20 }}>
              {lastImport.mensajes.map((m, i) => (
                <li key={i} style={{ fontSize: 13 }}>{m}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
