import React from "react";
import { useAuth0 } from '@auth0/auth0-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Loader2 } from "lucide-react";

const Login = () => {
  const { loginWithRedirect, isLoading } = useAuth0();
  const domain = import.meta.env.VITE_AUTH0_DOMAIN;
  const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
  const hasAuth0 = !!(domain && clientId);
  
  const handleLogin = () => {
    if (hasAuth0) {
      loginWithRedirect({
        appState: {
          returnTo: '/dashboard'
        }
      });
    } else {
      window.location.href = '/dashboard';
    }
  };
  
  return (
    <div className="min-h-screen bg-background flex items-center justify-center bg-[url('/lovable-uploads/6e0aff5c-acb9-4b64-bce6-2ff626040349.png')] bg-cover bg-center bg-no-repeat bg-opacity-50">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
      
      <Card className="w-[350px] z-10 army-card">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <Shield className="h-12 w-12 text-army-red" />
          </div>
          <CardTitle className="text-2xl font-bold">Chakravyuh</CardTitle>
          <CardDescription>Indian Army Perimeter Defense System</CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleLogin}
            className="w-full army-button"
            disabled={isLoading}
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : hasAuth0 ? (
              'Login with Auth0'
            ) : (
              'Continue to Dashboard'
            )}
          </Button>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-xs text-muted-foreground">
            {hasAuth0 ? 'Secure authentication required' : 'Auth0 not configured - using direct access'}
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
