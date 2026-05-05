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
          top: -96,
          left: -96,
          width: 384,
          height: 384,
          borderRadius: 12,
          background: 'rgba(0,123,255,0.2)',
          filter: 'blur(40px)',
          opacity: 0.3,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: 730,
          height: 512,
          borderRadius: 12,
          background: 'rgba(248,249,250,0.05)',
          opacity: 0.3,
          pointerEvents: 'none',
        }}
      />

      <form
        onSubmit={handleSubmit}
        className="anim-scale"
        style={{
          background: '#fff',
          width: 440,
          borderRadius: 0,
          border: '1px solid rgba(193,198,215,0.15)',
          boxShadow: '0 32px 64px -12px rgba(0,0,0,0.15)',
          padding: '32px 32px 48px',
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
            width: 6,
            height: '100%',
            background: 'rgba(0,123,255,0.2)',
          }}
        />

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
          <VSLogo size={112} color="white" notchColor="#1A2B4C" />
        </div>
        <h1
          style={{
            textAlign: 'center',
            fontSize: 24,
            fontWeight: 700,
            color: 'var(--vs-t1)',
            letterSpacing: '-0.6px',
            marginBottom: 8,
          }}
        >
          Iniciar Sesión
        </h1>
        <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--vs-t2)', marginBottom: 32 }}>
          Ingrese sus credenciales corporativas.
        </p>

        {/* Email */}
        <div style={{ marginBottom: 24 }}>
          <label
            style={{
              display: 'block',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.55px',
              color: 'var(--vs-t2)',
              marginBottom: 6,
            }}
          >
            CORREO ELECTRÓNICO
          </label>
          <div style={{ position: 'relative' }}>
            <svg
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}
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

        {/* Password */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.55px', color: 'var(--vs-t2)' }}>
              CONTRASEÑA
            </label>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
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
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}
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

        {/* Remember */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
          <div
            style={{
              width: 16,
              height: 16,
              borderRadius: 2,
              border: '1px solid var(--vs-border-2)',
              background: '#fff',
              flexShrink: 0,
            }}
          />
          <span style={{ fontSize: 12, color: 'var(--vs-t2)' }}>
            Recordar sesión en este equipo de confianza
          </span>
        </div>

        {error && (
          <div className="error-msg" style={{ marginBottom: 16 }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          className="btn-blue-grad"
          disabled={loading}
          style={{
            width: '100%',
            padding: '16px 0',
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: '1.4px',
            borderRadius: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            whiteSpace: 'nowrap',
            minHeight: 52,
          }}
        >
          {loading ? (
            'INGRESANDO…'
          ) : (
            <>
              INICIAR SESIÓN
              <svg width="12" height="12" viewBox="0 0 12 12" fill="white">
                <path d="M9.131 6.75L0 6.75L0 5.25L9.131 5.25L4.931 1.05L6 0L12 6L6 12L4.931 10.95L9.131 6.75Z" fillRule="nonzero" />
              </svg>
            </>
          )}
        </button>

        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--vs-t2)', marginTop: 16 }}>
          ¿No tienes cuenta? <span style={{ color: 'var(--vs-blue-light)', cursor: 'pointer' }}>Regístrate</span>
        </p>
      </form>

      <div style={{ marginTop: 32, textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <p style={{ fontSize: 10, letterSpacing: '1.5px', color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>
          DESARROLLADO POR VITASOFT CORPORATION
        </p>
        <p
          style={{
            fontSize: 10,
            letterSpacing: '-0.5px',
            color: 'rgba(255,255,255,0.8)',
            fontWeight: 500,
            marginTop: 12,
            cursor: 'pointer',
          }}
        >
          ¿NECESITA SOPORTE O AYUDA? CONTACTE CON NOSOTROS
        </p>
      </div>
    </div>
  );
}
