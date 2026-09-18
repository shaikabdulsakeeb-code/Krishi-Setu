import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';

// Pages (to be implemented)
import Login from './pages/Login';
import Register from './pages/Register';
import CompleteProfile from './pages/CompleteProfile';
import FarmerLayout from './pages/farmer/FarmerLayout';
import FarmerDashboard from './pages/farmer/FarmerDashboard';
import AddCrop from './pages/farmer/AddCrop';
import BuyerRequests from './pages/farmer/BuyerRequests';
import FarmerDeals from './pages/farmer/MyDeals';
import BuyerLayout from './pages/buyer/BuyerLayout';
import BuyerDashboard from './pages/buyer/BuyerDashboard';
import BrowseCrops from './pages/buyer/BrowseCrops';
import BuyerDeals from './pages/buyer/MyDeals';

// Protected Route Component
function ProtectedRoute({ children, role }) {
  const { currentUser, userData, loading } = useAuth();

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
  if (!currentUser) return <Navigate to="/login" />;
  
  if (role && userData?.role !== role) {
    return <Navigate to="/" />; // Redirect if wrong role
  }

  return children;
}

function RoleBasedHome() {
  const { currentUser, userData, loading } = useAuth();
  
  if (loading || (currentUser && !userData)) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading your dashboard...</div>;
  if (!userData) return <Navigate to="/login" />;

  return userData.role === 'farmer' ? (
    <Navigate to="/farmer/dashboard" />
  ) : (
    <Navigate to="/buyer/dashboard" />
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RoleBasedHome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
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
            <Route path="deals" element={<BuyerDeals />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
