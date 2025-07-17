
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  FileText, 
  Music, 
  FolderOpen, 
  Settings, 
  LogOut,
  PenTool
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { motion } from 'framer-motion';

export function ModernSidebar() {
  const location = useLocation();
  const { signOut, user } = useAuth();

  const navItems = [
    {
      title: 'Accueil',
      href: '/',
      icon: Home,
      color: 'from-primary to-accent'
    },
    {
      title: 'Notes',
      href: '/notes',
      icon: FileText,
      color: 'from-music-purple to-primary'
    },
    {
      title: 'Beats',
      href: '/beats',
      icon: Music,
      color: 'from-music-blue to-accent'
    },
    {
      title: 'Dossiers',
      href: '/folders',
      icon: FolderOpen,
      color: 'from-music-gold to-music-accent'
    },
    {
      title: 'Paramètres',
      href: '/settings',
      icon: Settings,
      color: 'from-muted to-secondary'
    },
  ];

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Déconnexion réussie');
    } catch (error) {
      console.error('Error during logout:', error);
      toast.error('Erreur lors de la déconnexion');
    }
  };

  const userDisplayName = user?.email?.split('@')[0] || 'Utilisateur';
  const userInitials = userDisplayName.substring(0, 2).toUpperCase();

  return (
    <div className="fixed left-0 top-0 h-full w-64 modern-sidebar z-40 shadow-2xl">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-6 border-b border-sidebar-border/50">
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center vinyl-effect">
              <PenTool className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-sidebar-foreground">Music</h1>
              <p className="text-sm text-sidebar-foreground/70">Studio</p>
            </div>
          </motion.div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item, index) => (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                to={item.href}
                className={`nav-link ${
                  location.pathname === item.href ? 'nav-link-active' : ''
                }`}
              >
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center`}>
                  <item.icon className="w-4 h-4 text-white" />
                </div>
                <span className="font-medium">{item.title}</span>
              </Link>
            </motion.div>
          ))}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-sidebar-border/50">
          {user && (
            <motion.div 
              className="space-y-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-secondary/50 to-transparent border border-border/30">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-sm bg-gradient-to-br from-primary to-accent text-white">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">
                    {userDisplayName}
                  </p>
                  <p className="text-xs text-sidebar-foreground/60 truncate">
                    {user.email}
                  </p>
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="nav-link w-full text-destructive hover:bg-destructive/10 border border-destructive/20"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-destructive/20 to-destructive/30 flex items-center justify-center">
                  <LogOut className="w-4 h-4 text-destructive" />
                </div>
                <span className="font-medium">Déconnexion</span>
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
