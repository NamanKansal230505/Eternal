import { Auth0Provider as Auth0ProviderLib } from '@auth0/auth0-react';
import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface Auth0ProviderWithNavigateProps {
  children: ReactNode;
}

const Auth0ProviderWithNavigate = ({ children }: Auth0ProviderWithNavigateProps) => {
  const navigate = useNavigate();
  const domain = import.meta.env.VITE_AUTH0_DOMAIN;
  const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
  const audience = import.meta.env.VITE_AUTH0_AUDIENCE;

  const onRedirectCallback = (appState?: any) => {
    navigate(appState?.returnTo || '/dashboard');
  };

  return (
    <Auth0ProviderLib
      domain={domain || 'placeholder.auth0.com'}
      clientId={clientId || 'placeholder-client-id'}
      authorizationParams={{
        redirect_uri: window.location.origin + '/callback',
        audience: audience,
        scope: 'openid profile email'
      }}
      onRedirectCallback={onRedirectCallback}
      useRefreshTokens={true}
      cacheLocation="localstorage"
      skipRedirectCallback={!domain || !clientId}
    >
      {children}
    </Auth0ProviderLib>
  );
};

export default Auth0ProviderWithNavigate;
