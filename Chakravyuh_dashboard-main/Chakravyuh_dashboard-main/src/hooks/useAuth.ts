import { useAuth0 } from '@auth0/auth0-react';

export const useAuth = () => {
  const { 
    isAuthenticated, 
    isLoading, 
    user, 
    logout, 
    getAccessTokenSilently,
    error 
  } = useAuth0();

  const handleLogout = () => {
    logout({
      logoutParams: {
        returnTo: window.location.origin
      }
    });
  };

  return {
    isAuthenticated,
    isLoading,
    user,
    logout: handleLogout,
    getAccessTokenSilently,
    error
  };
};

