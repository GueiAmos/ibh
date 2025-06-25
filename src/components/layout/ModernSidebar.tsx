
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  FileText, 
  Music, 
  FolderOpen, 
  Settings, 
  LogOut,
  User,
  PenTool
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export function ModernSidebar() {
  const location = useLocation();
  const { signOut, user } = useAuth();

  const navItems = [
    {
      title: 'Accueil',
      href: '/',
      icon: Home,
    },
    {
      title: 'Notes',
      href: '/notes',
      icon: FileText,
    },
    {
      title: 'Beats',
      href: '/beats',
      icon: Music,
    },
    {
      title: 'Dossiers',
      href: '/folders',
      icon: FolderOpen,
    },
    {
      title: 'Paramètres',
      href: '/settings',
      icon: Settings,
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
    <div className="fixed left-0 top-0 h-full w-64 modern-sidebar z-40">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <PenTool className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Notes</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Studio</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={`nav-link ${
                location.pathname === item.href ? 'nav-link-active' : ''
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.title}</span>
            </Link>
          ))}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          {user && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-sm bg-indigo-500 text-white">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {userDisplayName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user.email}
                  </p>
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="nav-link w-full text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <LogOut className="w-5 h-5" />
                <span>Déconnexion</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
