import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../lib/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: Role | Role[] | 'member';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole = 'member'
}) => {
  const { role, currentUser } = useAuth();
  const location = useLocation();

  // If user is not authenticated at all
  if (!currentUser || role === 'public') {
    return <Navigate to="/login" replace state={{ from: location, message: 'Please sign in to continue' }} />;
  }

  // Member required: any authenticated student/user (member)
  if (requiredRole === 'member') {
    return <>{children}</>;
  }

  // Array of allowed roles (e.g. ['admin', 'coach'])
  if (Array.isArray(requiredRole)) {
    if (!requiredRole.includes(role as Role)) {
      return <Navigate to="/profile" replace state={{ from: location }} />;
    }
    return <>{children}</>;
  }

  // Specific role required
  if (role !== requiredRole) {
    return <Navigate to={role === 'admin' || role === 'coach' ? '/admin' : '/profile'} replace state={{ from: location }} />;
  }

  return <>{children}</>;
};
