import { Navigate } from 'react-router-dom';
import { ROLES } from '../../utils/roles.js';

const ProtectedRoute = ({ children, allowedRoles = [ROLES.ADMIN] }) => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role'); // 'userRole' yerine 'role' kullanıyoruz
    
    console.log('Current Role:', userRole); // Debug için
    console.log('Allowed Roles:', allowedRoles); // Debug için

    if (!token) {
        return <Navigate to="/" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(userRole)) {
        // Kullanıcının rolü sayfaya erişim için uygun değilse
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
};

export default ProtectedRoute; 