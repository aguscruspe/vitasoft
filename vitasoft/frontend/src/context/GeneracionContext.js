import React, { createContext, useContext, useState, useCallback } from 'react';

const GeneracionContext = createContext(null);

export function GeneracionProvider({ children }) {
  const [open, setOpen] = useState(false);
  const openModal = useCallback(() => setOpen(true), []);
  const closeModal = useCallback(() => setOpen(false), []);
  return (
    <GeneracionContext.Provider value={{ open, openModal, closeModal }}>
      {children}
    </GeneracionContext.Provider>
  );
}

export function useGeneracion() {
  const ctx = useContext(GeneracionContext);
  if (!ctx) throw new Error('useGeneracion must be used within GeneracionProvider');
  return ctx;
}
