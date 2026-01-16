import { useAuth0 } from '@auth0/auth0-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Callback = () => {
  const navigate = useNavigate();
  
  // Check if Auth0 is configured
  const domain = import.meta.env.VITE_AUTH0_DOMAIN;
  const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
  const hasAuth0 = !!(domain && clientId);

  // If Auth0 not configured, redirect to dashboard
  if (!hasAuth0) {
    useEffect(() => {
      navigate('/dashboard');
    }, [navigate]);
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <div className="text-center space-y-4 z-10">
          <div className="text-xl font-bold gradient-heading">Redirecting...</div>
        </div>
      </div>
    );
  }

  // Use Auth0 hook only if configured
  let isLoading = true;
  let isAuthenticated = false;

  try {
    const auth0 = useAuth0();
    isLoading = auth0.isLoading;
    isAuthenticated = auth0.isAuthenticated;
  } catch (error) {
    // If useAuth0 fails, just redirect
    useEffect(() => {
      navigate('/dashboard');
    }, [navigate]);
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <div className="text-center space-y-4 z-10">
          <div className="text-xl font-bold gradient-heading">Redirecting...</div>
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isLoading, isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center relative">
      <div className="text-center space-y-4 z-10">
        <div className="text-xl font-bold gradient-heading">Completing login...</div>
        <div className="flex justify-center">
          <div className="w-8 h-8 border-4 border-t-army-khaki border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    </div>
  );
};

export default Callback;
