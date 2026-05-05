import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import GeneracionModal from './GeneracionModal';
import { GeneracionProvider } from '../context/GeneracionContext';

export default function Layout({ children }) {
  return (
    <GeneracionProvider>
      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
        <Sidebar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Topbar />
          <main
            style={{
              flex: 1,
              overflowY: 'auto',
              background: 'var(--bg-primary)',
            }}
          >
            {children}
          </main>
        </div>
        <GeneracionModal />
      </div>
    </GeneracionProvider>
  );
}
