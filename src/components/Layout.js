import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

/* <main> ataylab bo'shliqsiz: ichki chekinishni har sahifa o'zi beradi
   (yangilari <Page> orqali, hali ko'chirilmaganlari o'z padding'i bilan). */
export default function Layout({ children }) {
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Topbar />
        <main style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}
