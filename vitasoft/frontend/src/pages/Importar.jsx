import React, { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { importarPagos } from '../store/pagosSlice';
import './Importar.css';

const COLUMNAS = [
  { nombre: 'nombre', obligatoria: true },
  { nombre: 'cuit', obligatoria: true },
  { nombre: 'cbu', obligatoria: true },
  { nombre: 'monto', obligatoria: true },
  { nombre: 'concepto', obligatoria: false },
  { nombre: 'fechaPago', obligatoria: false },
];

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
        setLocalError(res.payload || 'No se pudo importar el archivo');
      }
    } catch (err) {
      setLocalError(err?.message || 'Error inesperado al importar');
    }
  };

  const mensajeError = localError || error;

  return (
    <div className="importar-page">
      <div className="importar-header">
        <h1 className="importar-title">Importar Pagos</h1>
        <p className="importar-subtitle">
          Subí un archivo Excel con los pagos a procesar
        </p>
      </div>

      <label
        htmlFor="file-input"
        className={`importar-dropzone${dragging ? ' dragging' : ''}`}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragEnter={onDragOver}
        onDragLeave={onDragLeave}
      >
        <div className="dropzone-icon">&#8593;</div>
        <div className="dropzone-title">Arrastrá tu archivo Excel acá</div>
        <div className="dropzone-hint">o hacé click para seleccionarlo</div>
        <span className="dropzone-btn">Seleccionar archivo</span>
        <button
          className="dropzone-btn-importar"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onImportar(); }}
          disabled={!archivo || loading}
        >
          {loading ? 'Importando...' : 'Importar'}
        </button>
        {archivo && (
          <div className="dropzone-file" data-testid="archivo-nombre">
            <span>&#128196; {archivo.name}</span>
            <span className="dropzone-file-size">
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

      {archivo && (
        <div className="importar-actions">
          <button
            className="importar-btn-secondary"
            onClick={onLimpiar}
            disabled={loading}
          >
            Limpiar
          </button>
        </div>
      )}

      {mensajeError && <div className="importar-alert">{mensajeError}</div>}

      <div className="importar-cards">
        {/* Card: Columnas requeridas */}
        <div className="importar-card">
          <div className="importar-card-header">
            <div className="importar-card-icon icon-cols">&#9776;</div>
            <span className="importar-card-title">Columnas requeridas</span>
          </div>
          <div className="importar-card-body">
            <ul className="col-list">
              {COLUMNAS.map((col) => (
                <li key={col.nombre} className="col-item">
                  <span className="col-name">{col.nombre}</span>
                  <span
                    className={`col-badge ${col.obligatoria ? 'required' : 'optional'}`}
                  >
                    {col.obligatoria ? 'Obligatoria' : 'Opcional'}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Card: Resumen última importación */}
        <div className="importar-card">
          <div className="importar-card-header">
            <div className="importar-card-icon icon-result">&#10003;</div>
            <span className="importar-card-title">
              Resumen de última importación
            </span>
          </div>
          <div className="importar-card-body">
            {lastImport ? (
              <>
                <div className="result-stats">
                  <div className="result-row">
                    <span className="result-label">Filas procesadas</span>
                    <span className="result-value">
                      {lastImport.procesados ?? lastImport.importados ?? '—'}
                    </span>
                  </div>
                  <div className="result-row">
                    <span className="result-label">Insertadas</span>
                    <span className="result-value val-success">
                      {lastImport.importados ?? '—'}
                    </span>
                  </div>
                  <div className="result-row">
                    <span className="result-label">Con errores</span>
                    <span className="result-value val-error">
                      {lastImport.errores ?? 0}
                    </span>
                  </div>
                </div>
                {lastImport.mensajeError &&
                  lastImport.mensajeError.length > 0 && (
                    <ul className="result-errors-list">
                      {lastImport.mensajeError.map((m, i) => (
                        <li key={i}>{m}</li>
                      ))}
                    </ul>
                  )}
              </>
            ) : (
              <div className="result-empty">
                Todavía no se realizó ninguna importación
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
