import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import { Icon } from './components/UI';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import POS from './pages/POS';
import Inventory from './pages/Inventory';
import Employees from './pages/Employees';
import Analytics from './pages/Analytics';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import CRM from './pages/CRM';
import Nasiya from './pages/Nasiya';
import ChekPrinter from './pages/ChekPrinter';
import Finance from './pages/Finance';
import CreatorPanel from './pages/CreatorPanel';
import LandingPage from './pages/LandingPage';
import DealerPortal from './pages/DealerPortal';
import Storefront from './pages/Storefront';

function PrivateRoute({ children, permission }) {
  const { user, hasPermission } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (permission && !hasPermission(permission)) return <Navigate to="/no-access" replace />;
  return children;
}

function RoleRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  if (user.role === 'creator') return <Navigate to="/creator" replace />;
  if (user.role === 'cashier') return <Navigate to="/pos" replace />;
  if (user.role === 'dealer') return <Navigate to="/dealer" replace />;
  return <Navigate to="/dashboard" replace />;
}

function NoAccess() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', height: '60vh', gap: 12, textAlign: 'center',
    }}>
      <Icon name="lock-simple" size={34} color="var(--color-neutral-600)" />
      <div style={{ fontSize: 17, fontWeight: 500 }}>Ruxsat yo'q</div>
      <div style={{ fontSize: 13, color: 'var(--color-neutral-500)' }}>
        Bu bo'limga kirish huquqingiz yo'q. Do'kon egasiga murojaat qiling.
      </div>
    </div>
  );
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/" element={user ? <RoleRedirect /> : <LandingPage />} />
      <Route path="/login" element={user ? <RoleRedirect /> : <Login />} />
      <Route path="/shop/:storeId" element={<Storefront />} />
      <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
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
        <Route path="customers" element={<PrivateRoute permission="crm"><CRM /></PrivateRoute>} />
        <Route path="dealer" element={<PrivateRoute permission="dealer_dashboard"><DealerPortal /></PrivateRoute>} />
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
