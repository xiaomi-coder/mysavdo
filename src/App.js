import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import POS from './pages/POS';
import Inventory from './pages/Inventory';
import { Employees, Analytics, Reports, Settings } from './pages/OtherPages';
import { CRM, Nasiya, ChekPrinter } from './pages/NewModules';
import Finance from './pages/Finance';
import CreatorPanel from './pages/CreatorPanel';

function PrivateRoute({ children, permission }) {
  const { user, hasPermission } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (permission && !hasPermission(permission)) return <Navigate to="/no-access" replace />;
  return children;
}

function RoleRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'creator') return <Navigate to="/creator" replace />;
  if (user.role === 'cashier') return <Navigate to="/pos" replace />;
  return <Navigate to="/dashboard" replace />;
}

function NoAccess() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 16 }}>
      <div style={{ fontSize: 64 }}>🔒</div>
      <div style={{ fontSize: 22, fontWeight: 800 }}>Ruxsat yo'q</div>
      <div style={{ fontSize: 14, color: 'var(--t2)' }}>Bu sahifaga kirishga ruxsatingiz yo'q</div>
    </div>
  );
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <RoleRedirect /> : <Login />} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<RoleRedirect />} />
        <Route path="no-access" element={<NoAccess />} />
        {/* Creator */}
        <Route path="creator" element={<PrivateRoute permission="dashboard_creator"><CreatorPanel page="dashboard" /></PrivateRoute>} />
        <Route path="creator/stores" element={<PrivateRoute permission="dashboard_creator"><CreatorPanel page="stores" /></PrivateRoute>} />
        <Route path="creator/users" element={<PrivateRoute permission="dashboard_creator"><CreatorPanel page="users" /></PrivateRoute>} />
        <Route path="creator/stats" element={<PrivateRoute permission="dashboard_creator"><CreatorPanel page="stats" /></PrivateRoute>} />
        <Route path="creator/settings" element={<PrivateRoute permission="dashboard_creator"><CreatorPanel page="settings" /></PrivateRoute>} />
        {/* Owner + Manager */}
        <Route path="dashboard" element={<PrivateRoute permission="dashboard_owner"><Dashboard /></PrivateRoute>} />
        <Route path="pos" element={<POS />} />
        <Route path="inventory" element={<PrivateRoute permission="inventory"><Inventory /></PrivateRoute>} />
        <Route path="customers" element={<PrivateRoute permission="dashboard_owner"><CRM /></PrivateRoute>} />
        <Route path="nasiya" element={<PrivateRoute permission="nasiya"><Nasiya /></PrivateRoute>} />
        <Route path="finance" element={<PrivateRoute permission="finance"><Finance /></PrivateRoute>} />
        <Route path="employees" element={<PrivateRoute permission="employees"><Employees /></PrivateRoute>} />
        <Route path="analytics" element={<PrivateRoute permission="analytics"><Analytics /></PrivateRoute>} />
        <Route path="reports" element={<PrivateRoute permission="reports"><Reports /></PrivateRoute>} />
        <Route path="chek" element={<PrivateRoute permission="chek"><ChekPrinter /></PrivateRoute>} />
        <Route path="settings" element={<PrivateRoute permission="settings"><Settings /></PrivateRoute>} />
      </Route>
      <Route path="*" element={<RoleRedirect />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
