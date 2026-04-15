import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { actualizarPago } from '../store/pagosSlice';

export default function EditCbuCell({ pago }) {
  const dispatch = useDispatch();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(pago.cbu || (pago.proveedor && pago.proveedor.cbu) || '');
  const [saving, setSaving] = useState(false);

  const currentCbu = pago.cbu || (pago.proveedor && pago.proveedor.cbu) || '';

  const handleSave = async () => {
    setSaving(true);
    await dispatch(actualizarPago({ pago, cbu: value }));
    setSaving(false);
    setEditing(false);
  };

  const handleCancel = () => {
    setValue(currentCbu);
    setEditing(false);
  };

  if (!editing) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontFamily: 'monospace' }}>{currentCbu || '—'}</span>
        <button
          type="button"
          className="btn-secondary"
          style={{ padding: '2px 8px', fontSize: 12 }}
          onClick={() => setEditing(true)}
        >
          Editar
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        style={{ fontFamily: 'monospace', width: 220 }}
      />
      <button
        type="button"
        className="btn-primary"
        style={{ padding: '4px 10px', fontSize: 12 }}
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? '...' : 'OK'}
      </button>
      <button
        type="button"
        className="btn-secondary"
        style={{ padding: '4px 10px', fontSize: 12 }}
        onClick={handleCancel}
        disabled={saving}
      >
        X
      </button>
    </div>
  );
}
