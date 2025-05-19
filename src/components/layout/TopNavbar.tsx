
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import ThemeToggle from '@/components/ui/ThemeSwitcher';
import { cn } from '@/lib/utils';
import { LogOut, SidebarTrigger } from 'lucide-react';
import { motion } from 'framer-motion';
import { SidebarTrigger as SidebarToggle } from '@/components/ui/sidebar';

export function TopNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <motion.div 
      initial={{ y: -20, opacity: 0 }} 
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex items-center justify-between px-6 py-3 border-b bg-background/95 backdrop-blur-sm sticky top-0 z-40"
    >
      <div className="flex items-center gap-2">
        <SidebarToggle />
        <span className="text-xl font-bold text-primary">IBH</span>
      </div>
      
      <div className="flex items-center space-x-4">
        <ThemeToggle />
        {user && (
          <Button variant="outline" size="sm" onClick={handleSignOut} className="flex items-center gap-2 hidden md:flex">
            <LogOut className="h-4 w-4" />
            <span>Déconnexion</span>
          </Button>
        )}
      </div>
    </motion.div>
  );
}
