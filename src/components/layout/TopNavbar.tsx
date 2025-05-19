
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/ThemeSwitcher';
import { cn } from '@/lib/utils';
import { LogOut, Music, BookOpen, Settings, Home } from 'lucide-react';
import { motion } from 'framer-motion';

export function TopNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };
  
  const navItems = [
    { label: 'Accueil', icon: <Home className="w-4 h-4 mr-2" />, path: '/' },
    { label: 'Notes', icon: <BookOpen className="w-4 h-4 mr-2" />, path: '/notes' },
    { label: 'Beats', icon: <Music className="w-4 h-4 mr-2" />, path: '/beats' },
    { label: 'Paramètres', icon: <Settings className="w-4 h-4 mr-2" />, path: '/settings' },
  ];

  return (
    <motion.div 
      initial={{ y: -20, opacity: 0 }} 
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="hidden lg:flex items-center justify-between px-6 py-3 border-b bg-background/95 backdrop-blur-sm sticky top-0 z-50"
    >
      <div className="flex items-center">
        <span className="text-xl font-bold text-primary mr-8">IBH</span>
        
        <nav className="flex space-x-1">
          {navItems.map((item) => (
            <Button
              key={item.path}
              variant={location.pathname === item.path ? "default" : "ghost"}
              className={cn(
                "rounded-md flex items-center",
                location.pathname === item.path ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => navigate(item.path)}
            >
              {item.icon}
              {item.label}
            </Button>
          ))}
        </nav>
      </div>
      
      <div className="flex items-center space-x-4">
        <ThemeToggle />
        {user && (
          <Button variant="outline" size="sm" onClick={handleSignOut} className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            <span>Déconnexion</span>
          </Button>
        )}
      </div>
    </motion.div>
  );
}
