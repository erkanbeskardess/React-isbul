import { Navigate } from 'react-router-dom';
import { ROLES } from '../../utils/roles.js';

const ProtectedRoute = ({ children, allowedRoles = [ROLES.ADMIN] }) => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role'); 

    if (!token) {
        return <Navigate to="/" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(userRole)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
};

export default ProtectedRoute; 