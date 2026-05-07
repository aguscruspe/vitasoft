import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login, clearError } from '../store/authSlice';
import VSLogo from '../components/VSLogo';

const inputBase = {
  width: '100%',
  fontFamily: 'inherit',
  fontSize: 14,
  color: 'var(--vs-t1)',
  background: 'var(--vs-bg-2)',
  border: 'none',
  outline: 'none',
  padding: '13px 16px 14px 40px',
};

const labelBase = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.55px',
  textTransform: 'uppercase',
  color: 'var(--vs-t2)',
  lineHeight: '16.5px',
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, token } = useSelector((s) => s.auth);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (token) navigate('/dashboard');
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(login({ email, contrasena }));
    if (login.fulfilled.match(result)) {
      navigate('/dashboard');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--vs-login-bg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.3,
          overflow: 'hidden',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -96,
            left: -96,
            width: 384,
            height: 384,
            borderRadius: 12,
            background: 'rgba(0,123,255,0.2)',
            filter: 'blur(32px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -128,
            right: -182.5,
            width: 730,
            height: 512,
            borderRadius: 12,
            background: 'rgba(248,249,250,0.05)',
            filter: 'blur(60px)',
          }}
        />
      </div>

      <form
        onSubmit={handleSubmit}
        className="anim-scale"
        style={{
          width: 440,
          background: '#fff',
          border: '1px solid rgba(193,198,215,0.15)',
          boxShadow: '0 32px 64px -12px rgba(0,0,0,0.15)',
          padding: '33px 33px 49px',
          display: 'flex',
          flexDirection: 'column',
          gap: 32,
          position: 'relative',
          overflow: 'hidden',
          zIndex: 1,
        }}
      >
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: 6,
            background: 'rgba(0,123,255,0.2)',
          }}
        />

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <VSLogo size={160} color="#1A2B4C" notchColor="#ffffff" />
          <h1
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: 'var(--vs-t1)',
              letterSpacing: '-0.6px',
              lineHeight: '32px',
              marginTop: 16,
              textAlign: 'center',
            }}
          >
            Iniciar Sesión
          </h1>
          <p
            style={{
              fontSize: 14,
              color: 'var(--vs-t2)',
              lineHeight: '20px',
              textAlign: 'center',
            }}
          >
            Ingrese sus credenciales corporativas.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={labelBase}>CORREO ELECTRÓNICO</label>
            <div style={{ position: 'relative' }}>
              <svg
                style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                }}
                width="16.667"
                height="13.333"
                viewBox="0 0 20 16"
                fill="var(--vs-t5)"
              >
                <path d="M18 0H2C.9 0 0 .9 0 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V2c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V2l8 5 8-5v2z" />
              </svg>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nombre@corporativo.com"
                required
                autoFocus
                style={inputBase}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={labelBase}>CONTRASEÑA</label>
              <span
                style={{
                  ...labelBase,
                  letterSpacing: '-0.275px',
                  color: 'var(--vs-blue-light)',
                  cursor: 'pointer',
                }}
              >
                RECUPERAR
              </span>
            </div>
            <div style={{ position: 'relative' }}>
              <svg
                style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                }}
                width="13.333"
                height="17.5"
                viewBox="0 0 16 21"
                fill="var(--vs-t5)"
              >
                <path d="M13 8V6a5 5 0 00-10 0v2H1a1 1 0 00-1 1v11a1 1 0 001 1h14a1 1 0 001-1V9a1 1 0 00-1-1h-2zm-6 8a2 2 0 114 0 2 2 0 01-4 0zm4-8H5V6a3 3 0 016 0v2z" />
              </svg>
              <input
                type="password"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                placeholder="••••••••"
                required
                style={inputBase}
              />
            </div>
          </div>

          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '4px 0',
              cursor: 'pointer',
            }}
          >
            <input
              type="checkbox"
              style={{
                width: 16,
                height: 16,
                margin: 0,
                accentColor: 'var(--vs-blue-light)',
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: 12, color: 'var(--vs-t2)', lineHeight: '16px', marginLeft: 8 }}>
              Recordar sesión en este equipo de confianza
            </span>
          </label>

          {error && <div className="error-msg">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '16px 0',
              background: 'var(--vs-blue-light)',
              color: '#fff',
              border: 'none',
              borderRadius: 0,
              fontFamily: 'inherit',
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: '1.4px',
              textTransform: 'uppercase',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'filter 0.12s ease',
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.filter = 'brightness(1.07)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.filter = 'none';
            }}
          >
            {loading ? (
              'INGRESANDO…'
            ) : (
              <>
                INICIAR SESIÓN
                <svg width="12" height="12" viewBox="0 0 12 12" fill="#fff">
                  <path d="M9.131 6.75L0 6.75L0 5.25L9.131 5.25L4.931 1.05L6 0L12 6L6 12L4.931 10.95L9.131 6.75Z" />
                </svg>
              </>
            )}
          </button>

          <p
            style={{
              textAlign: 'center',
              fontSize: 12,
              color: 'var(--vs-t2)',
              lineHeight: '16px',
            }}
          >
            ¿No tienes cuenta?{' '}
            <span style={{ fontWeight: 700, color: 'var(--vs-blue-light)', cursor: 'pointer' }}>
              Regístrate
            </span>
          </p>
        </div>
      </form>

      <div
        style={{
          position: 'absolute',
          bottom: 64,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 281,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          textAlign: 'center',
          zIndex: 1,
        }}
      >
        <p
          style={{
            fontSize: 10,
            fontWeight: 500,
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            lineHeight: '15px',
            color: 'rgba(255,255,255,0.6)',
          }}
        >
          DESARROLLADO POR{' '}
          <span style={{ color: '#fff', fontWeight: 700 }}>VITASOFT CORPORATION</span>
        </p>
        <p
          style={{
            fontSize: 10,
            fontWeight: 500,
            letterSpacing: '-0.5px',
            textTransform: 'uppercase',
            lineHeight: '15px',
            color: 'rgba(255,255,255,0.8)',
            cursor: 'pointer',
          }}
        >
          ¿NECESITA SOPORTE O AYUDA? CONTACTE CON NOSOTROS
        </p>
      </div>
    </div>
  );
}
