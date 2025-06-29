import { ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

interface AdminRouteProps {
  children: ReactNode;
}

export const AdminRoute = ({ children }: AdminRouteProps) => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const adminToken = localStorage.getItem("adminToken");
    const adminEmail = localStorage.getItem("adminEmail");
    
    // Check if admin is authenticated (JWT token or legacy token)
    if ((adminToken && adminToken !== "admin-authenticated") || 
        (adminToken === "admin-authenticated" && adminEmail)) {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, []);

  if (isAdmin === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/admin-login" replace />;
  }

  return <>{children}</>;
}; 