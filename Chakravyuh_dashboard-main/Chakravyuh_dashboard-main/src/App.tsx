
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Auth0ProviderWithNavigate from "./auth/Auth0Provider";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Regions from "./pages/Regions";
import AIIntelligence from "./pages/AIIntelligence";
import NotFound from "./pages/NotFound";
import Callback from "./pages/Callback";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Auth0ProviderWithNavigate>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/callback" element={<Callback />} />
            <Route 
              path="/regions" 
              element={
                <ProtectedRoute>
                  <Regions />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/ai-intelligence" 
              element={
                <ProtectedRoute>
                  <AIIntelligence />
                </ProtectedRoute>
              } 
            />
            {/* Removed the /node:id route as we'll display node details in the dashboard */}
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Auth0ProviderWithNavigate>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
