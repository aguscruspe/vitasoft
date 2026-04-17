import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

const C = {
  bg: '#0a0f1e',
  bgAlt: '#1A2B4C',
  accent: '#007BFF',
  text: '#ffffff',
  muted: '#8b9ab4',
  border: 'rgba(255,255,255,0.06)',
  cardBg: 'rgba(255,255,255,0.03)',
  cardBorder: 'rgba(255,255,255,0.06)',
  footerText: '#4a5568',
};

const steps = [
  {
    num: '01',
    title: 'Importa tu Excel',
    desc: 'Exporta los pagos desde tu ERP y subelos a VitaSoft con un solo clic.',
  },
  {
    num: '02',
    title: 'Valida y corregi',
    desc: 'El sistema detecta errores y te permite completar datos faltantes como el CBU.',
  },
  {
    num: '03',
    title: 'Genera y descarga',
    desc: 'Obtene el archivo TXT listo para subir al home banking de tu banco.',
  },
];

function useScrolledNavbar(threshold = 50) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);
  return scrolled;
}

function useFadeIn() {
  const refs = useRef([]);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }
        });
      },
      { threshold: 0.15 }
    );
    refs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);
  const addRef = (el) => {
    if (el && !refs.current.includes(el)) refs.current.push(el);
  };
  return addRef;
}

export default function Landing() {
  const navigate = useNavigate();
  const addFadeRef = useFadeIn();
  const scrolled = useScrolledNavbar();

  useEffect(() => {
    if (authService.isAuthenticated()) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  const goLogin = () => navigate('/login');
  const scrollToHow = () => {
    const el = document.getElementById('como-funciona');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div style={s.page}>
      {/* NAVBAR */}
      <nav className={`landing-navbar${scrolled ? ' scrolled' : ''}`} style={s.navbar}>
        <div style={s.navInner}>
          <span style={s.logo}>VitaSoft</span>
          <div style={s.navBtns}>
            <button className="landing-btn-ghost" style={s.btnGhost} onClick={goLogin}>
              Iniciar sesion
            </button>
            <button className="landing-btn-filled" style={s.btnFilled} onClick={goLogin}>
              Comenzar
            </button>
          </div>
        </div>
        <div style={s.navGradientLine} />
      </nav>

      {/* HERO */}
      <section style={s.hero}>
        <div style={s.heroInner}>
          <div className="landing-hero-badge" style={s.badge}>
            <span style={{ marginRight: 6 }}>&#10022;</span>
            Sistema de pagos masivos
          </div>
          <h1 className="landing-hero-title" style={s.heroTitle}>
            Automatiza tus{' '}
            <span style={{ color: C.accent }}>pagos</span>
            <br />a proveedores.
            <br />Sin errores. Sin demoras.
          </h1>
          <p className="landing-hero-sub" style={s.heroSub}>
            VitaSoft convierte tu Excel en archivos TXT compatibles con
            Credicoop, Galicia y Santander en segundos.
          </p>
          <div className="landing-hero-btns" style={s.heroBtns}>
            <button className="landing-btn-filled" style={s.btnFilledLg} onClick={goLogin}>
              Comenzar ahora
            </button>
            <button className="landing-btn-outline" style={s.btnOutlineLg} onClick={scrollToHow}>
              Ver como funciona
            </button>
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="como-funciona" style={s.howSection}>
        <h2 ref={addFadeRef} style={{ ...s.sectionTitle, ...s.fadeInit }}>
          De Excel a tu banco en 3 pasos
        </h2>
        <div style={s.stepsGrid}>
          {steps.map((step, i) => (
            <div
              key={step.num}
              ref={addFadeRef}
              className="landing-card"
              style={{
                ...s.card,
                ...s.fadeInit,
                transitionDelay: `${i * 0.1}s`,
              }}
            >
              <div style={s.stepNum}>{step.num}</div>
              <h3 style={s.cardTitle}>{step.title}</h3>
              <p style={s.cardDesc}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section ref={addFadeRef} style={{ ...s.ctaSection, ...s.fadeInit }}>
        <div style={s.ctaGlow} />
        <h2 style={s.ctaTitle}>Empeza a ahorrar tiempo hoy.</h2>
        <p style={s.ctaSub}>
          Mas de 100 empresas ya usan VitaSoft para automatizar sus pagos masivos.
        </p>
        <button className="landing-btn-filled" style={s.btnFilledLg} onClick={goLogin}>
          Crear cuenta gratis
        </button>
      </section>

      {/* FOOTER */}
      <footer style={s.footer}>
        <span style={{ fontWeight: 700, fontSize: 16, color: C.text }}>VitaSoft</span>
        <span style={{ color: C.footerText, fontSize: 13 }}>
          &copy; 2026 VitaSoft. Todos los derechos reservados.
        </span>
      </footer>
    </div>
  );
}

const s = {
  page: {
    background: C.bg,
    color: C.text,
    minHeight: '100vh',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },

  /* Navbar */
  navbar: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    background: 'rgba(10,15,30,0.8)',
    borderBottom: `1px solid ${C.border}`,
  },
  navInner: {
    maxWidth: 1100,
    margin: '0 auto',
    padding: '16px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navGradientLine: {
    height: 1,
    background: `linear-gradient(90deg, transparent, ${C.accent}, transparent)`,
    opacity: 0.35,
  },
  logo: {
    fontSize: 22,
    fontWeight: 700,
    letterSpacing: 1,
    color: C.text,
  },
  navBtns: {
    display: 'flex',
    gap: 10,
    alignItems: 'center',
  },
  btnGhost: {
    background: 'transparent',
    border: 'none',
    color: C.muted,
    fontSize: 14,
    padding: '8px 16px',
    cursor: 'pointer',
    transition: 'color 0.2s ease',
  },
  btnFilled: {
    background: C.accent,
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '8px 20px',
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },

  /* Hero */
  hero: {
    minHeight: '92vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '80px 24px 120px',
    background: `linear-gradient(180deg, ${C.bg} 0%, ${C.bgAlt} 100%)`,
  },
  heroInner: {
    maxWidth: 720,
  },
  badge: {
    display: 'inline-block',
    background: 'rgba(0,123,255,0.1)',
    border: '1px solid rgba(0,123,255,0.3)',
    borderRadius: 20,
    padding: '6px 16px',
    fontSize: 13,
    fontWeight: 500,
    color: C.accent,
    marginBottom: 28,
  },
  heroTitle: {
    fontSize: 'clamp(32px, 5vw, 58px)',
    fontWeight: 800,
    lineHeight: 1.1,
    marginBottom: 24,
    letterSpacing: '-0.02em',
  },
  heroSub: {
    fontSize: 18,
    fontWeight: 300,
    color: C.muted,
    maxWidth: 520,
    margin: '0 auto 40px',
    lineHeight: 1.7,
  },
  heroBtns: {
    display: 'flex',
    gap: 14,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  btnFilledLg: {
    background: C.accent,
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '14px 32px',
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  btnOutlineLg: {
    background: 'transparent',
    color: C.text,
    border: `1px solid ${C.cardBorder}`,
    borderRadius: 8,
    padding: '14px 32px',
    fontSize: 16,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },

  /* How it works */
  howSection: {
    maxWidth: 1100,
    margin: '0 auto',
    padding: '120px 24px',
  },
  sectionTitle: {
    fontSize: 'clamp(24px, 3.5vw, 36px)',
    fontWeight: 700,
    textAlign: 'center',
    marginBottom: 64,
  },
  stepsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: 24,
  },
  card: {
    background: C.cardBg,
    border: `1px solid ${C.cardBorder}`,
    borderRadius: 12,
    padding: 32,
    cursor: 'default',
  },
  stepNum: {
    fontSize: 48,
    fontWeight: 700,
    color: C.accent,
    opacity: 0.3,
    marginBottom: 12,
    lineHeight: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 600,
    marginBottom: 10,
    color: C.text,
  },
  cardDesc: {
    fontSize: 14,
    color: C.muted,
    lineHeight: 1.7,
  },

  /* CTA */
  ctaSection: {
    background: `linear-gradient(135deg, ${C.bg} 0%, ${C.bgAlt} 100%)`,
    textAlign: 'center',
    padding: '100px 24px',
    position: 'relative',
    overflow: 'hidden',
  },
  ctaGlow: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    height: 400,
    background: 'radial-gradient(circle, rgba(0,123,255,0.15), transparent)',
    filter: 'blur(60px)',
    pointerEvents: 'none',
  },
  ctaTitle: {
    fontSize: 'clamp(24px, 3.5vw, 36px)',
    fontWeight: 700,
    marginBottom: 16,
    position: 'relative',
  },
  ctaSub: {
    fontSize: 16,
    color: C.muted,
    maxWidth: 480,
    margin: '0 auto 32px',
    lineHeight: 1.6,
    position: 'relative',
  },

  /* Footer */
  footer: {
    background: C.bg,
    borderTop: `1px solid ${C.border}`,
    padding: '24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
    maxWidth: 1100,
    margin: '0 auto',
  },

  /* Fade-in initial state for IntersectionObserver */
  fadeInit: {
    opacity: 0,
    transform: 'translateY(30px)',
    transition: 'opacity 0.7s ease, transform 0.7s ease',
  },
};
