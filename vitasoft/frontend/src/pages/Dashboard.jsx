import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchLotes } from '../store/lotesSlice';
import { fetchPagos } from '../store/pagosSlice';
import BarChart from '../components/charts/BarChart';
import DonutChart from '../components/charts/DonutChart';

const formatearMoneda = (v) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(v || 0);

const formatearFechaCorta = (iso) => {
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

const ESTADO_STYLE = {
  PROCESADO: { color: 'var(--vs-blue)', bg: 'var(--vs-blue-bg)', barra: 'var(--vs-blue)' },
  PENDIENTE: { color: 'var(--vs-orange)', bg: 'var(--vs-orange-bg)', barra: 'var(--vs-orange)' },
  ERROR: { color: 'var(--vs-rojo)', bg: 'var(--vs-red-bg)', barra: 'var(--vs-rojo)' },
  ELIMINADO: { color: 'var(--vs-t4)', bg: 'rgba(100,116,139,0.1)', barra: 'var(--vs-t4)' },
};

const MetricCard = ({ label, value, sub, subColor, icon, iconBg }) => (
  <div
    style={{
      flex: 1,
      background: 'var(--card-bg)',
      border: '1px solid var(--border-soft)',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      borderRadius: 4,
      padding: 24,
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
      <span style={{ fontSize: 12, letterSpacing: '1.2px', color: 'var(--text-secondary)' }}>{label}</span>
      <div
        style={{
          width: 27,
          height: 27,
          borderRadius: 4,
          background: iconBg || 'rgba(216,226,255,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </div>
    </div>
    <div style={{ fontSize: 30, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.75px', lineHeight: '36px', marginBottom: 8 }}>
      {value}
    </div>
    <div style={{ fontSize: 14, color: subColor || 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
      {sub}
    </div>
  </div>
);

export default function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const lotesItems = useSelector((s) => s.lotes.items);
  const pagosItems = useSelector((s) => s.pagos.items);

  useEffect(() => {
    dispatch(fetchLotes());
    dispatch(fetchPagos({ banco: '', estado: '' }));
  }, [dispatch]);

  const metricas = useMemo(() => {
    const procesados = pagosItems.filter((p) => p.estado === 'PROCESADO');
    const pendientes = pagosItems.filter((p) => p.estado === 'PENDIENTE');
    const errores = pagosItems.filter((p) => p.estado === 'ERROR');
    const volumen = procesados.reduce((acc, p) => acc + Number(p.monto || 0), 0);
    const totalCount = procesados.length + pendientes.length + errores.length || 1;
    const pctProcesado = Math.round((procesados.length / totalCount) * 100);
    return {
      volumen,
      pendientes: pendientes.length,
      errores: errores.length,
      procesados: procesados.length,
      pctProcesado,
      lotesActivos: lotesItems.length,
    };
  }, [pagosItems, lotesItems]);

  const lotesRecientes = useMemo(() => {
    const sorted = [...lotesItems].sort((a, b) => {
      const fa = a.fechaCreacion || a.fecha || '';
      const fb = b.fechaCreacion || b.fecha || '';
      return fb.localeCompare(fa);
    });
    return sorted.slice(0, 3);
  }, [lotesItems]);

  return (
    <div className="anim-up" style={{ padding: 32, maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 44, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-1.1px', lineHeight: '44px' }}>
          Resumen General
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>
          Monitoreo de actividad financiera de hoy.
        </p>
      </div>

      {/* Metric cards */}
      <div style={{ display: 'flex', gap: 24, marginBottom: 32, flexWrap: 'wrap' }}>
        <MetricCard
          label="VOLUMEN PROCESADO"
          value={formatearMoneda(metricas.volumen)}
          subColor="var(--vs-blue)"
          sub={
            <>
              <svg width="13.333" height="8" viewBox="0 0 13.333 8" fill="var(--vs-blue)">
                <path d="M0.933 8L0 7.067L4.933 2.1L7.6 4.767L11.067 1.333L9.333 1.333L9.333 0L13.333 0L13.333 4L12 4L12 2.267L7.6 6.667L4.933 4L0.933 8Z" fillRule="nonzero" />
              </svg>
              {metricas.procesados} pagos procesados
            </>
          }
          iconBg="rgba(216,226,255,0.3)"
          icon={
            <svg width="15.833" height="15" viewBox="0 0 16 15" fill="var(--vs-blue)">
              <path d="M0 15V3l8-3 8 3v12h-5V9H5v6H0z" fillRule="nonzero" />
            </svg>
          }
        />
        <MetricCard
          label="VALIDACIONES PENDIENTES"
          value={metricas.pendientes}
          sub="Requieren revisión manual"
          iconBg="rgba(255,219,204,0.3)"
          icon={
            <svg width="18.333" height="15.833" viewBox="0 0 20 18" fill="var(--vs-orange)">
              <path d="M1 18L10 2l9 16H1zm9-3a1 1 0 100-2 1 1 0 000 2zm-1-3h2V8h-2v4z" fillRule="nonzero" />
            </svg>
          }
        />
        <MetricCard
          label="LOTES ACTIVOS"
          value={metricas.lotesActivos}
          sub="Generados en el sistema"
          iconBg="rgba(216,226,255,0.3)"
          icon={
            <svg width="15" height="15.875" viewBox="0 0 15 15.875" fill="var(--text-secondary)">
              <path d="M7.5 15.875L0 10.042L1.375 9L7.5 13.75L13.625 9L15 10.042L7.5 15.875ZM7.5 11.667L0 5.833L7.5 0L15 5.833L7.5 11.667Z" fillRule="nonzero" />
            </svg>
          }
        />
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: 24, marginBottom: 32 }}>
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-soft)', borderRadius: 4, padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>Volumen de Pagos (30 días)</span>
            <span
              onClick={() => navigate('/historial')}
              style={{ fontSize: 14, fontWeight: 500, color: 'var(--vs-blue)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              Ver detalle
              <svg width="4.933" height="8" viewBox="0 0 5 8" fill="currentColor">
                <path d="M3.067 4L0 0.933L0.933 0L4.933 4L0.933 8L0 7.067L3.067 4Z" fillRule="nonzero" />
              </svg>
            </span>
          </div>
          <div style={{ position: 'relative' }}>
            <div
              style={{
                position: 'absolute',
                left: -28,
                top: 0,
                height: 260,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                paddingBottom: 8,
              }}
            >
              {['3M', '2M', '1M', '0'].map((l) => (
                <span key={l} style={{ fontSize: 10, color: 'var(--vs-t5)', lineHeight: '12px' }}>
                  {l}
                </span>
              ))}
            </div>
            <div style={{ border: '1px solid var(--vs-border-3)', padding: '0 8px 8px' }}>
              <BarChart />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px 0', marginTop: 4 }}>
            {['01 Mar', '15 Mar', '30 Mar'].map((l) => (
              <span key={l} style={{ fontSize: 10, color: 'var(--vs-t5)' }}>
                {l}
              </span>
            ))}
          </div>
        </div>

        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-soft)', borderRadius: 4, padding: 24 }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: 24 }}>
            Estado de Pagos
          </span>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
            <DonutChart pct={metricas.pctProcesado} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              ['var(--vs-blue)', 'Procesados', metricas.procesados],
              ['var(--vs-rojo)', 'Con Error', metricas.errores],
              ['var(--vs-orange)', 'Pendientes', metricas.pendientes],
            ].map(([c, l, v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
                  <span style={{ fontSize: 14, color: 'var(--vs-t2)' }}>{l}</span>
                </div>
                <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
                  {v}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-soft)', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ padding: 24, borderBottom: '1px solid var(--vs-border-3)' }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>Actividad Reciente (Lotes)</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 215px 138px 215px', background: 'var(--card-bg)', borderBottom: '1px solid var(--vs-border-3)' }}>
          {['NOMBRE DEL LOTE', 'FECHA', 'MONTO', 'ESTADO'].map((h) => (
            <div key={h} style={{ padding: '10px 24px', fontSize: 11, fontWeight: 700, letterSpacing: '1.1px', color: 'var(--text-secondary)' }}>
              {h}
            </div>
          ))}
        </div>
        {lotesRecientes.length === 0 && (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-secondary)' }}>Sin lotes generados aún</div>
        )}
        {lotesRecientes.map((l) => {
          const total = l.pagos
            ? l.pagos.reduce((acc, p) => acc + Number(p.monto || 0), 0)
            : Number(l.total || 0);
          const estado = (l.estado || 'PROCESADO').toUpperCase();
          const sty = ESTADO_STYLE[estado] || ESTADO_STYLE.PROCESADO;
          return (
            <div
              key={l.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 215px 138px 215px',
                borderBottom: '1px solid rgba(231,232,233,0.5)',
                position: 'relative',
              }}
            >
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 2, background: sty.barra }} />
              <div style={{ padding: '16px 24px' }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>
                  Lote {l.banco || ''} #{l.id}
                </div>
                <div style={{ fontSize: 12, color: 'var(--vs-t5)', marginTop: 2 }}>ID: L-{l.id}</div>
              </div>
              <div style={{ padding: 24, fontSize: 14, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>
                {formatearFechaCorta(l.fechaCreacion || l.fecha)}
              </div>
              <div
                style={{
                  padding: 24,
                  fontSize: 14,
                  fontWeight: 500,
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {formatearMoneda(total)}
              </div>
              <div style={{ padding: '21.75px 24px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                <span className="status-badge" style={{ color: sty.color, background: sty.bg }}>
                  {estado}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
