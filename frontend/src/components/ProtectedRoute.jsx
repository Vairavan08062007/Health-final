import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
    const { user } = useAuth();
    const location = useLocation();

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect to their own dashboard if role doesn't match
        const dashboardMap = { admin: '/admin', doctor: '/doctor', staff: '/staff' };
        return <Navigate to={dashboardMap[user.role] || '/login'} replace />;
    }

    return children;
}
