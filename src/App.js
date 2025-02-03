import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import HomePage from './components/homepage/HomePage.jsx';
import LoginSignup from './components/login/LoginSignup.jsx';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Unauthorized from './components/auth/Unauthorized';
import AdminDashboard from './components/admin/AdminDashboard';
import UserManagement from './components/admin/UserManagement';
import SystemSettings from './components/admin/SystemSettings';
import Applications from './components/applicant/Applications';
import Jobs from './components/applicant/Jobs';
import CV from './components/applicant/CV';
import JobManagement from './components/hr/JobManagement';
import ApplicationManagement from './components/hr/ApplicationManagement';
import { ROLES } from './utils/roles';
import '@fortawesome/fontawesome-free/css/all.min.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginSignup />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        
        {/* Admin Routes */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/users" 
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <UserManagement />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/settings" 
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <SystemSettings />
            </ProtectedRoute>
          } 
        />

        {/* Applicant Routes */}
        <Route 
          path="/applications" 
          element={
            <ProtectedRoute allowedRoles={[ROLES.APPLICANT]}>
              <Applications />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/jobs" 
          element={
            <ProtectedRoute allowedRoles={[ROLES.APPLICANT]}>
              <Jobs />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/cv" 
          element={
            <ProtectedRoute allowedRoles={[ROLES.APPLICANT]}>
              <CV />
            </ProtectedRoute>
          } 
        />

        {/* HR Routes */}
        <Route 
          path="/hr/jobs"
          element={
            <ProtectedRoute allowedRoles={[ROLES.HR]}>
              <JobManagement />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/hr/applications" 
          element={
            <ProtectedRoute allowedRoles={[ROLES.HR]}>
              <ApplicationManagement />
            </ProtectedRoute>
          } 
        />

        {/* Normal user route */}
        <Route 
          path="/homepage" 
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.HR, ROLES.APPLICANT]}>
              <HomePage />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
