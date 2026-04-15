import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login, clearError } from '../store/authSlice';

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--vs-azul-oscuro)',
  },
  card: {
    background: '#fff',
    borderRadius: 8,
    padding: 36,
    width: 380,
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
  },
  title: {
    color: 'var(--vs-azul-oscuro)',
    marginBottom: 4,
    fontSize: 26,
    textAlign: 'center',
  },
  subtitle: {
    color: 'var(--vs-gris-medio)',
    marginBottom: 24,
    fontSize: 13,
    textAlign: 'center',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    color: 'var(--vs-gris-medio)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  button: {
    width: '100%',
    padding: '10px',
    marginTop: 10,
    fontSize: 15,
  },
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
    <div style={styles.container}>
      <form style={styles.card} onSubmit={handleSubmit}>
        <h1 style={styles.title}>VitaSoft</h1>
        <p style={styles.subtitle}>Ingresá a tu cuenta</p>

        <div style={styles.field}>
          <label style={styles.label}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Contraseña</label>
          <input
            type="password"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            required
          />
        </div>

        {error && <div className="error-msg">{error}</div>}

        <button
          type="submit"
          className="btn-primary"
          style={styles.button}
          disabled={loading}
        >
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
    </div>
  );
}
