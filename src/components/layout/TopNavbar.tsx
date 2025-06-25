
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import ThemeToggle from '@/components/ui/ThemeSwitcher';
import { LogOut, User, Bell, Search, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from '@/components/ui/input';

export function TopNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const userDisplayName = user?.email?.split('@')[0] || 'Utilisateur';
  const userInitials = userDisplayName.substring(0, 2).toUpperCase();

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return 'Accueil';
      case '/notes': return 'Notes';
      case '/beats': return 'Beats';
      case '/folders': return 'Dossiers';
      case '/settings': return 'Paramètres';
      default: return 'IBH Studio';
    }
  };

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }} 
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="glass-effect sticky top-0 z-40 border-b border-border/50"
    >
      <div className="flex h-14 items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div className="hidden sm:block">
            <h1 className="text-lg font-semibold text-foreground">
              {getPageTitle()}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Search - Hidden on mobile */}
          <div className="hidden md:flex relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Rechercher..." 
              className="pl-10 w-64 h-8 bg-background/50 border-border/50"
            />
          </div>

          {/* Quick actions */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0 hover:bg-accent/50"
          >
            <Bell className="h-4 w-4" />
          </Button>

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/notes')}
            className="hidden sm:flex h-8 gap-1 text-xs hover:bg-accent/50"
          >
            <Plus className="h-3 w-3" />
            Nouveau
          </Button>

          <ThemeToggle />
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel className="text-xs">
                  <div className="flex flex-col space-y-1">
                    <p className="font-medium">{userDisplayName}</p>
                    <p className="text-muted-foreground truncate">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <User className="mr-2 h-4 w-4" />
                  Profil
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleSignOut} 
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="outline" size="sm" onClick={() => navigate('/auth')}>
              <User className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Connexion</span>
            </Button>
          )}
        </div>
      </div>
    </motion.header>
  );
}
