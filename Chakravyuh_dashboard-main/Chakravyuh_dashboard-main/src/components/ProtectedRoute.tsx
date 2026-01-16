import { useAuth0 } from '@auth0/auth0-react';
import { Navigate } from 'react-router-dom';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  // Check if Auth0 is configured
  const domain = import.meta.env.VITE_AUTH0_DOMAIN;
  const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
  const hasAuth0 = !!(domain && clientId);

  // If Auth0 is not configured, allow access (for development)
  if (!hasAuth0) {
    return <>{children}</>;
  }

  // Use Auth0 hook only if configured
  let isAuthenticated = false;
  let isLoading = true;
  
  try {
    const auth0 = useAuth0();
    isAuthenticated = auth0.isAuthenticated;
    isLoading = auth0.isLoading;
  } catch (error) {
    // If useAuth0 fails (no provider), allow access
    console.warn('[ProtectedRoute] Auth0 not available, allowing access');
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <div className="text-center space-y-4 z-10">
          <div className="text-xl font-bold gradient-heading">Loading Chakravyuh</div>
          <div className="flex justify-center">
            <div className="w-8 h-8 border-4 border-t-army-khaki border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
