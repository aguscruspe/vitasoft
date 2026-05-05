import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setFiltro } from '../store/pagosSlice';
import { lotesService } from '../services/lotesService';
import { useGeneracion } from '../context/GeneracionContext';

const BANCOS = [
  { value: 'CREDICOOP', label: 'Banco Credicoop' },
  { value: 'GALICIA', label: 'Banco Galicia' },
  { value: 'SANTANDER', label: 'Banco Santander' },
];

export default function GeneracionModal() {
  const { open, closeModal } = useGeneracion();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const lotes = useSelector((s) => s.lotes.items);
  const [banco, setBanco] = useState('');
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);

  if (!open) return null;

  const ultimoLoteDelBanco = (codBanco) => {
    if (!codBanco) return null;
    const filtrados = lotes.filter((l) => (l.banco || '').toUpperCase() === codBanco);
    if (filtrados.length === 0) return null;
    return filtrados.sort((a, b) => {
      const fa = a.fechaCreacion || a.fecha || '';
      const fb = b.fechaCreacion || b.fecha || '';
      return fb.localeCompare(fa);
    })[0];
  };

  const handleDescargarPDF = async () => {
    setError(null);
    if (!banco) {
      setError('Seleccioná un banco primero.');
      return;
    }
    const lote = ultimoLoteDelBanco(banco);
    const pdf = lote && lote.archivos ? lote.archivos.find((a) => a.tipo === 'PDF') : null;
    if (!pdf) {
      setError(`No hay PDF de control disponible para ${banco}.`);
      return;
    }
    setDownloading(true);
    try {
      const nombre = pdf.ruta ? pdf.ruta.split(/[\\/]/).pop() : `control_lote_${lote.id}.pdf`;
      await lotesService.descargarArchivo(pdf.id, nombre);
    } catch {
      setError('No se pudo descargar el PDF.');
    } finally {
      setDownloading(false);
    }
  };

  const handleGenerarTXT = () => {
    if (!banco) {
      setError('Seleccioná un banco primero.');
      return;
    }
    dispatch(setFiltro({ banco, estado: 'PENDIENTE' }));
    closeModal();
    navigate('/importar');
  };

  return (
    <div
      onClick={closeModal}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(248,249,250,0.8)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
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
          width: 672,
          maxWidth: '94vw',
          border: '1px solid var(--border-soft)',
          boxShadow: '0 8px 32px rgba(65,71,84,0.12)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
              Generación de Archivos
            </h2>
            <p style={{ fontSize: 14, color: 'var(--vs-t2)' }}>
              Configurá y generá los archivos necesarios para la conciliación bancaria.
            </p>
          </div>
          <button
            onClick={closeModal}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
            aria-label="Cerrar"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="var(--vs-t2)">
              <path d="M1.4 14L0 12.6L5.6 7L0 1.4L1.4 0L7 5.6L12.6 0L14 1.4L8.4 7L14 12.6L12.6 14L7 8.4L1.4 14Z" fillRule="nonzero" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: 32 }}>
          <div style={{ marginBottom: 32 }}>
            <label style={{ display: 'block', fontSize: 11, letterSpacing: '1.1px', color: 'var(--vs-t2)', marginBottom: 12, fontWeight: 700 }}>
              ENTIDAD BANCARIA
            </label>
            <div style={{ position: 'relative' }}>
              <select
                value={banco}
                onChange={(e) => {
                  setBanco(e.target.value);
                  setError(null);
                }}
                style={{
                  width: '100%',
                  padding: '13px 40px 13px 17px',
                  background: 'var(--input-bg)',
                  border: '1px solid var(--border-soft)',
                  fontSize: 14,
                  color: 'var(--text-primary)',
                  fontFamily: 'inherit',
                  appearance: 'none',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="">Seleccione un banco…</option>
                {BANCOS.map((b) => (
                  <option key={b.value} value={b.value}>
                    {b.label}
                  </option>
                ))}
              </select>
              <svg
                style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                width="10"
                height="6.167"
                viewBox="0 0 10 6.167"
                fill="var(--vs-t2)"
              >
                <path d="M5 6.167L0 1.167L1.167 0L5 3.833L8.833 0L10 1.167L5 6.167Z" fillRule="nonzero" />
              </svg>
            </div>
          </div>

          <div
            style={{
              background: 'var(--input-bg)',
              border: '1px solid var(--vs-blue)',
              padding: 24,
              display: 'flex',
              gap: 16,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="var(--vs-blue)" style={{ flexShrink: 0, marginTop: 2 }}>
              <path d="M9 7h2V5H9v2zm0 8h2v-6H9v6zm1-18C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fillRule="nonzero" />
            </svg>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                Acción Requerida
              </div>
              <p style={{ fontSize: 14, color: 'var(--vs-t2)', lineHeight: '20px' }}>
                Al generar el archivo TXT, el sistema consolidará todas las transacciones pendientes del día para
                la entidad seleccionada. Asegurate de descargar el PDF de control previo para revisión interna.
              </p>
            </div>
          </div>

          {error && (
            <div className="error-msg" style={{ marginTop: 16 }}>
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '24px 32px',
            background: 'var(--input-bg)',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 16,
          }}
        >
          <button
            onClick={handleDescargarPDF}
            disabled={downloading}
            style={{
              padding: '12px 24px',
              border: '1px solid var(--border-soft)',
              background: 'var(--card-bg)',
              fontSize: 11,
              letterSpacing: '1.1px',
              color: 'var(--vs-t2)',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontWeight: 700,
            }}
          >
            {downloading ? 'DESCARGANDO…' : 'DESCARGAR PDF DE CONTROL'}
          </button>
          <button
            className="btn-blue-grad"
            onClick={handleGenerarTXT}
            style={{ padding: '12px 24px', fontSize: 11, letterSpacing: '1.1px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <svg width="12" height="15" viewBox="0 0 12 15" fill="white">
              <path d="M6 11L1 6l1.4-1.4L5 7.2V0h2v7.2L9.6 4.6 11 6 6 11zm-5 4v-2h10v2H1z" />
            </svg>
            GENERAR ARCHIVO TXT
          </button>
        </div>
      </div>
    </div>
  );
}
