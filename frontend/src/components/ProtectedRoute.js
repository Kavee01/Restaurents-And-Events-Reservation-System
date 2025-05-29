import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Box, CircularProgress } from '@mui/material';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const location = useLocation();
  const { user, loading } = useAuth();

  console.log('ProtectedRoute - User:', user);
  console.log('ProtectedRoute - Loading:', loading);
  console.log('ProtectedRoute - Allowed Roles:', allowedRoles);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    console.log('ProtectedRoute - No user, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    console.log('ProtectedRoute - User role not allowed');
    return <Navigate to="/unauthorized" replace />;
  }

  console.log('ProtectedRoute - Access granted');
  return children;
};

export default ProtectedRoute; 