import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLotes } from '../store/lotesSlice';
import { lotesService } from '../services/lotesService';

const formatearFecha = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d)) return '—';
  const hoy = new Date();
  const ayer = new Date();
  ayer.setDate(hoy.getDate() - 1);
  const sameDay = (a, b) => a.toDateString() === b.toDateString();
  const hh = d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  if (sameDay(d, hoy)) return `Hoy, ${hh}`;
  if (sameDay(d, ayer)) return `Ayer, ${hh}`;
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' }) + `, ${hh}`;
};

const formatearMoneda = (v) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(v || 0);

const BANK_COLOR = {
  CREDICOOP: 'var(--vs-blue)',
  GALICIA: 'var(--vs-rojo)',
  SANTANDER: 'var(--vs-verde)',
};

const BANK_BG = {
  CREDICOOP: 'rgba(0,89,187,0.1)',
  GALICIA: 'rgba(186,26,26,0.1)',
  SANTANDER: 'rgba(22,163,74,0.1)',
};

export default function Historial() {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((s) => s.lotes);
  const [ordenDesc, setOrdenDesc] = useState(true);

  useEffect(() => {
    dispatch(fetchLotes());
  }, [dispatch]);

  const lotes = useMemo(() => {
    const sorted = [...items].sort((a, b) => {
      const fa = a.fechaCreacion || a.fecha || '';
      const fb = b.fechaCreacion || b.fecha || '';
      const cmp = fa.localeCompare(fb) || a.id - b.id;
      return ordenDesc ? -cmp : cmp;
    });
    return sorted;
  }, [items, ordenDesc]);

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
    } catch {
      alert('No se pudo descargar el archivo');
    }
  };

  return (
    <div className="anim-up" style={{ padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 44, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-1.1px', lineHeight: '44px' }}>
            Historial de Lotes
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 8 }}>
            {lotes.length} lote{lotes.length === 1 ? '' : 's'} generado{lotes.length === 1 ? '' : 's'}
          </p>
        </div>
        <button
          onClick={() => setOrdenDesc((v) => !v)}
          style={{
            padding: '10px 16px',
            border: '1px solid var(--border-color)',
            background: 'var(--card-bg)',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 500,
            color: 'var(--text-primary)',
            cursor: 'pointer',
            fontFamily: 'inherit',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
          title={ordenDesc ? 'Más recientes primero' : 'Más antiguos primero'}
        >
          <span style={{ fontSize: 14 }}>{ordenDesc ? '↓' : '↑'}</span>
          {ordenDesc ? 'Recientes' : 'Antiguos'}
        </button>
      </div>

      {error && <div className="error-msg" style={{ marginBottom: 16 }}>{error}</div>}
      {loading && <div style={{ color: 'var(--text-secondary)' }}>Cargando…</div>}

      {!loading && lotes.length === 0 && (
        <div
          style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--border-soft)',
            borderRadius: 4,
            padding: 48,
            textAlign: 'center',
            color: 'var(--text-secondary)',
          }}
        >
          Todavía no hay lotes generados.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
        {lotes.map((l) => {
          const banco = (l.banco || '').toUpperCase();
          const color = BANK_COLOR[banco] || 'var(--vs-blue)';
          const bg = BANK_BG[banco] || 'rgba(0,89,187,0.1)';
          const total = l.pagos
            ? l.pagos.reduce((acc, p) => acc + Number(p.monto || 0), 0)
            : Number(l.total || 0);
          const cantidad = l.pagos ? l.pagos.length : l.cantidadPagos ?? '—';
          const txt = archivoDe(l, 'TXT');
          const pdf = archivoDe(l, 'PDF');
          return (
            <div
              key={l.id}
              style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--border-soft)',
                borderRadius: 4,
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}
            >
              <div style={{ height: 3, background: color }} />
              <div style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Lote #{l.id}</span>
                  <span
                    className="status-badge"
                    style={{ background: bg, color }}
                  >
                    {banco || '—'}
                  </span>
                </div>
                <div style={{ fontSize: 22, fontWeight: 700, color, letterSpacing: '-0.03em', marginBottom: 16 }}>
                  {formatearMoneda(total)}
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 8,
                    marginBottom: 16,
                    paddingBottom: 16,
                    borderBottom: '1px solid var(--border-color)',
                  }}
                >
                  {[
                    ['Pagos', cantidad],
                    ['Fecha', formatearFecha(l.fechaCreacion || l.fecha)],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <div
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          letterSpacing: '0.7px',
                          color: 'var(--text-muted)',
                          textTransform: 'uppercase',
                          marginBottom: 2,
                        }}
                      >
                        {k}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{v}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => descargar(txt)}
                    disabled={!txt}
                    style={{
                      flex: 1,
                      padding: 7,
                      border: '1px solid var(--border-color)',
                      borderRadius: 4,
                      background: 'var(--card-bg)',
                      fontSize: 12,
                      fontWeight: 500,
                      color: txt ? 'var(--text-primary)' : 'var(--text-muted)',
                      cursor: txt ? 'pointer' : 'not-allowed',
                      fontFamily: 'inherit',
                      opacity: txt ? 1 : 0.6,
                    }}
                  >
                    ↓ TXT
                  </button>
                  <button
                    onClick={() => descargar(pdf)}
                    disabled={!pdf}
                    style={{
                      flex: 1,
                      padding: 7,
                      border: '1px solid var(--border-color)',
                      borderRadius: 4,
                      background: 'var(--card-bg)',
                      fontSize: 12,
                      fontWeight: 500,
                      color: pdf ? 'var(--text-primary)' : 'var(--text-muted)',
                      cursor: pdf ? 'pointer' : 'not-allowed',
                      fontFamily: 'inherit',
                      opacity: pdf ? 1 : 0.6,
                    }}
                  >
                    ↓ PDF
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
