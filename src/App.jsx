import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { useUserAuth } from './contexts/UserAuthContext';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import ThemeEffects from './components/Layout/ThemeEffects';
import WeeklySchedule from './components/Schedule/WeeklySchedule';
import AdminLogin from './components/Admin/AdminLogin';
import AdminDashboard from './components/Admin/AdminDashboard';
import AdminProfile from './components/Admin/AdminProfile';
import AdminManagement from './components/Admin/AdminManagement';
import UserManagement from './components/Admin/UserManagement';
import UserLogin from './components/Auth/UserLogin';
import UserRegister from './components/Auth/UserRegister';
import UserProfile from './components/Auth/UserProfile';
import ResourcesPage from './components/Resources/ResourcesPage';
import ResourceManager from './components/Resources/ResourceManager';
import './App.css';

function AdminProtectedRoute({ children }) {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? children : <Navigate to="/admin/login" replace />;
}

function UserProtectedRoute({ children }) {
  const { isLoggedIn } = useUserAuth();
  return isLoggedIn ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <div className="app-shell">
      <ThemeEffects />
      <Header />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<WeeklySchedule />} />
          <Route path="/resources" element={<ResourcesPage />} />
          
          {/* User Auth Routes */}
          <Route path="/login" element={<UserLogin />} />
          <Route path="/register" element={<UserRegister />} />
          <Route
            path="/profile"
            element={
              <UserProtectedRoute>
                <UserProfile />
              </UserProtectedRoute>
            }
          />
          
          {/* Admin Routes - UNCHANGED */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <AdminProtectedRoute>
                <AdminDashboard />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/profile"
            element={
              <AdminProtectedRoute>
                <AdminProfile />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/manage"
            element={
              <AdminProtectedRoute>
                <AdminManagement />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminProtectedRoute>
                <UserManagement />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/resources"
            element={
              <AdminProtectedRoute>
                <ResourceManager />
              </AdminProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
