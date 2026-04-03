import React, { useState } from 'react';
import pagosService from '../api/pagosService';

export default function EditPagoModal({ pago, onClose, onSaved }) {
  const [form, setForm] = useState({
    cbu: pago.proveedor?.cbu || '',
    monto: pago.monto || '',
    concepto: pago.concepto || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await pagosService.actualizar(pago.id, {
        cbu: form.cbu,
        monto: parseFloat(form.monto),
        concepto: form.concepto,
      });
      onSaved();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Editar Pago #{pago.id}</h2>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Proveedor</label>
            <input
              className="form-control"
              value={pago.proveedor?.nombre || ''}
              disabled
            />
          </div>

          <div className="form-group">
            <label>CBU</label>
            <input
              className="form-control"
              name="cbu"
              value={form.cbu}
              onChange={handleChange}
              maxLength={22}
              placeholder="Ingresá el CBU (22 dígitos)"
            />
          </div>

          <div className="form-group">
            <label>Monto</label>
            <input
              className="form-control"
              name="monto"
              type="number"
              step="0.01"
              value={form.monto}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Concepto</label>
            <input
              className="form-control"
              name="concepto"
              value={form.concepto}
              onChange={handleChange}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
