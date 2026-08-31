import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import PageErrorBoundary from './PageErrorBoundary';

/* <main> ataylab bo'shliqsiz: ichki chekinishni har sahifa o'zi beradi
   (yangilari <Page> orqali, hali ko'chirilmaganlari o'z padding'i bilan).

   Sahifa xato chegarasi ichkarida: nosozlik bo'lsa menyu va yuqori panel
   tirik qoladi, foydalanuvchi boshqa bo'limga o'ta oladi. `key` marshrut
   bo'yicha — boshqa sahifaga o'tilganda chegara o'zi tiklanadi. */
export default function Layout({ children }) {
  const location = useLocation();

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Topbar />
        <main style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
          <PageErrorBoundary key={location.pathname}>
            {children || <Outlet />}
          </PageErrorBoundary>
        </main>
      </div>
    </div>
  );
}
