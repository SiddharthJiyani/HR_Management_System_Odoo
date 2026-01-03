import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PublicRoute, HRRoute, PrivateRoute, AdminRoute } from './components/guards/RouteGuards';
import SignIn from './components/auth/SignIn';
import SignUp from './components/auth/SignUp';
import { ComingSoon } from './pages';
import { AdminDashboard, AdminProfile, EmployeeProfileView } from './pages/admin';
import HRDashboard from './components/dashboard/HRDashboard';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes (only for non-authenticated users) */}
          <Route
            path="/signin"
            element={
              <PublicRoute>
                <SignIn />
              </PublicRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicRoute>
                <SignUp />
              </PublicRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/employee/:employeeId"
            element={
              <AdminRoute>
                <EmployeeProfileView />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/my-profile"
            element={
              <AdminRoute>
                <AdminProfile />
              </AdminRoute>
            }
          />
          {/* Redirect /admin/profile to dashboard */}
          <Route
            path="/admin/profile"
            element={<Navigate to="/admin/dashboard" replace />}
          />

          {/* HR Dashboard Route */}
          <Route
            path="/dashboard/*"
            element={
              <HRRoute>
                <HRDashboard />
              </HRRoute>
            }
          />

          {/* Employee/Admin Coming Soon */}
          <Route
            path="/coming-soon"
            element={
              <PrivateRoute>
                <ComingSoon />
              </PrivateRoute>
            }
          />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/signin" replace />} />
          
          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/signin" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
