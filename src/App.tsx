import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ReportPage from './pages/ReportPage';
import MapPage from './pages/MapPage';
import ActionPlanPage from './pages/ActionPlanPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import SignupPage from './pages/SignupPage';
import MyReportsPage from './pages/MyReportsPage';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';

function App() {
  const { isAdmin } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="report" element={<ReportPage />} />
        <Route path="map" element={<MapPage />} />
        <Route path="action-plan" element={<ActionPlanPage />} />
        <Route path="my-reports" element={
          <ProtectedRoute>
            <MyReportsPage />
          </ProtectedRoute>
        } />
        <Route path="signup" element={<SignupPage />} />
        <Route path="admin/login" element={<AdminLogin />} />
        <Route path="admin" element={
          <ProtectedRoute requireAdmin>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;