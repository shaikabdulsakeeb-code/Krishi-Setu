import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';

import Home from './pages/Home';
import { ConfirmProvider } from './contexts/ConfirmContext';

// Pages (to be implemented)
import Login from './pages/Login';
import Register from './pages/Register';
import CompleteProfile from './pages/CompleteProfile';
import PendingApproval from './pages/PendingApproval';
import AdminDashboard from './pages/admin/AdminDashboard';
import FarmerLayout from './pages/farmer/FarmerLayout';
import FarmerDashboard from './pages/farmer/FarmerDashboard';
import AddCrop from './pages/farmer/AddCrop';
import BuyerRequests from './pages/farmer/BuyerRequests';
import FarmerDeals from './pages/farmer/MyDeals';
import MarketAnalysis from './pages/farmer/MarketAnalysis';
import BuyerLayout from './pages/buyer/BuyerLayout';
import BuyerDashboard from './pages/buyer/BuyerDashboard';
import BrowseCrops from './pages/buyer/BrowseCrops';
import BuyerDeals from './pages/buyer/MyDeals';

function isProfileReady(userData) {
  if (!userData?.name || !userData?.phone || !userData?.location) return false;
  if (userData.role === 'farmer') return Boolean(userData.governmentFarmerId);
  if (userData.role === 'buyer') return Boolean(userData.traderId && userData.businessLicenseNumber);
  return true;
}

// Protected Route Component
function ProtectedRoute({ children, role }) {
  const { currentUser, userData, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="h-screen flex items-center justify-center bg-[var(--bg-1)] text-[var(--cream)] font-serif text-2xl">Loading...</div>;
  if (!currentUser) return <Navigate to="/login" />;
  
  if (role && userData?.role !== role) {
    return <Navigate to="/" />; // Redirect if wrong role
  }

  // Admin users bypass pending check and profile check
  if (userData?.role === 'admin') {
    return children;
  }

  // Check for pending status
  if (userData?.status !== 'approved' && location.pathname !== '/pending') {
    return <Navigate to="/pending" replace />;
  }

  if (role && userData && !isProfileReady(userData) && !location.pathname.endsWith('/profile') && location.pathname !== '/pending') {
    return <Navigate to={`/${userData.role}/profile`} replace />;
  }

  return children;
}

function RoleTheme() {
  const { userData } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const routeRole = location.pathname.startsWith('/buyer') ? 'buyer' : 'farmer';
    const role = location.pathname === '/' ? 'farmer' : userData?.role === 'buyer' ? 'buyer' : userData?.role === 'farmer' ? 'farmer' : routeRole;
    document.documentElement.dataset.role = role;
    localStorage.setItem('krishi-setu-theme-role', role);
  }, [location.pathname, userData?.role]);

  return null;
}

function App() {
  return (
    <AuthProvider>
      <ConfirmProvider>
        <BrowserRouter>
          <RoleTheme />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/pending" element={
            <ProtectedRoute>
              <PendingApproval />
            </ProtectedRoute>
          } />
          <Route path="/admin/dashboard" element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/complete-profile" element={
            <ProtectedRoute>
              <CompleteProfile />
            </ProtectedRoute>
          } />

          {/* Farmer Routes */}
          <Route path="/farmer" element={
            <ProtectedRoute role="farmer">
              <FarmerLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="dashboard" />} />
            <Route path="dashboard" element={<FarmerDashboard />} />
            <Route path="add-crop" element={<AddCrop />} />
            <Route path="requests" element={<BuyerRequests />} />
            <Route path="deals" element={<FarmerDeals />} />
            <Route path="market-analysis" element={<MarketAnalysis />} />
            <Route path="profile" element={<CompleteProfile />} />
          </Route>

          {/* Buyer Routes */}
          <Route path="/buyer" element={
            <ProtectedRoute role="buyer">
              <BuyerLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="dashboard" />} />
            <Route path="dashboard" element={<BuyerDashboard />} />
            <Route path="browse" element={<BrowseCrops />} />
            <Route path="requests" element={<BrowseCrops initialTab="myRequests" />} />
            <Route path="deals" element={<BuyerDeals />} />
            <Route path="profile" element={<CompleteProfile />} />
          </Route>
        </Routes>
      </BrowserRouter>
      </ConfirmProvider>
    </AuthProvider>
  );
}

export default App;
