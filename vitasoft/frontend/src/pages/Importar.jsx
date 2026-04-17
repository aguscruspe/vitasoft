import React, { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { importarPagos } from '../store/pagosSlice';

const styles = {
  dropzone: {
    border: '2px dashed var(--btn-primary)',
    borderRadius: 8,
    padding: 60,
    textAlign: 'center',
    background: 'var(--card-bg)',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  dropzoneActive: {
    background: 'var(--table-row-hover)',
    borderColor: 'var(--text-primary)',
  },
  icon: {
    fontSize: 40,
    color: 'var(--btn-primary)',
    marginBottom: 12,
  },
  info: {
    marginTop: 20,
    padding: 16,
    background: 'var(--card-bg)',
    borderRadius: 6,
  },
  fileName: {
    marginTop: 14,
    fontWeight: 600,
    color: 'var(--text-primary)',
    wordBreak: 'break-all',
  },
};

export default function Importar() {
  const dispatch = useDispatch();
  const { loading, error, lastImport } = useSelector((s) => s.pagos);
  const [dragging, setDragging] = useState(false);
  const [archivo, setArchivo] = useState(null);
  const [localError, setLocalError] = useState(null);
  const inputRef = useRef(null);

  const resetInput = () => {
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleFile = (file) => {
    if (!file) return;
    const ok = /\.(xlsx?|xls)$/i.test(file.name);
    if (!ok) {
      setLocalError('El archivo debe ser un Excel (.xls o .xlsx)');
      setArchivo(null);
      resetInput();
      return;
    }
    setLocalError(null);
    setArchivo(file);
  };

  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    handleFile(file);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  };

  const onSelect = (e) => {
    const file = e.target.files && e.target.files[0];
    handleFile(file);
  };

  const onLimpiar = () => {
    setArchivo(null);
    setLocalError(null);
    resetInput();
  };

  const onImportar = async () => {
    if (!archivo || loading) return;
    setLocalError(null);
    try {
      const res = await dispatch(importarPagos(archivo));
      if (importarPagos.fulfilled.match(res)) {
        setArchivo(null);
        resetInput();
      } else if (importarPagos.rejected.match(res)) {
        // el error ya queda en el store; nos aseguramos de tener un mensaje
        setLocalError(res.payload || 'No se pudo importar el archivo');
      }
    } catch (err) {
      setLocalError(err?.message || 'Error inesperado al importar');
    }
  };

  const mensajeError = localError || error;

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
        onDragEnter={onDragOver}
        onDragLeave={onDragLeave}
      >
        <div style={styles.icon}>⬆</div>
        <div style={{ fontSize: 16, marginBottom: 6 }}>
          Arrastrá tu archivo Excel acá
        </div>
        <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
          o hacé click para seleccionarlo
        </div>
        {archivo && (
          <div style={styles.fileName} data-testid="archivo-nombre">
            📄 {archivo.name}
            <span style={{ marginLeft: 8, fontWeight: 400, color: 'var(--text-secondary)', fontSize: 12 }}>
              ({Math.round(archivo.size / 1024)} KB)
            </span>
          </div>
        )}
        <input
          ref={inputRef}
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
            onClick={onLimpiar}
            disabled={loading}
          >
            Limpiar
          </button>
        )}
      </div>

      {mensajeError && (
        <div className="error-msg" style={{ marginTop: 12 }}>
          {mensajeError}
        </div>
      )}

      {lastImport && (
        <div style={styles.info}>
          <h3 style={{ marginBottom: 8 }}>Resultado de la importación</h3>
          <div>Procesados: <strong>{lastImport.importados ?? '—'}</strong></div>
          <div>Insertados: <strong>{lastImport.importados ?? '—'}</strong></div>
          <div>Errores: <strong>{lastImport.errores ?? 0}</strong></div>
          {lastImport.mensajeError && lastImport.mensajeError.length > 0 && (
            <ul style={{ marginTop: 8, paddingLeft: 20 }}>
              {lastImport.mensajeError.map((m, i) => (
                <li key={i} style={{ fontSize: 13, color: 'var(--vs-rojo, #c0392b)' }}>{m}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
