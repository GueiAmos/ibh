
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/Index";
import Notes from "./pages/Notes";
import Beats from "./pages/Beats";
import Folders from "./pages/Folders";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { AnimatePresence } from "framer-motion";

const queryClient = new QueryClient();

const App = () => {
  // Check system preference for dark mode and set initial theme
  useEffect(() => {
    const isDark = localStorage.theme === 'dark' || 
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner closeButton position="bottom-center" />
          <BrowserRouter>
            <AnimatePresence mode="wait">
              <Routes>
                {/* Route publique pour l'accueil */}
                <Route path="/" element={<Index />} />
                
                {/* Route pour l'authentification */}
                <Route path="/auth" element={<Auth />} />
                
                {/* Routes protégées - accessibles uniquement si connecté */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/notes" element={<Notes />} />
                  <Route path="/beats" element={<Beats />} />
                  <Route path="/folders" element={<Folders />} />
                  <Route path="/settings" element={<Settings />} />
                </Route>
                
                {/* Fallback */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AnimatePresence>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
