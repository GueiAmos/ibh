
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  FileText, 
  Music, 
  FolderOpen, 
  Settings, 
  LogOut,
  Sparkles,
  User
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { ThemeToggle } from '@/components/ui/ThemeSwitcher';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export function AppSidebar() {
  const location = useLocation();
  const { signOut, user } = useAuth();

  const navItems = [
    {
      title: 'Accueil',
      href: '/',
      icon: Home,
      color: 'text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Notes',
      href: '/notes',
      icon: FileText,
      color: 'text-green-600 dark:text-green-400',
    },
    {
      title: 'Beats',
      href: '/beats',
      icon: Music,
      color: 'text-purple-600 dark:text-purple-400',
    },
    {
      title: 'Dossiers',
      href: '/folders',
      icon: FolderOpen,
      color: 'text-orange-600 dark:text-orange-400',
    },
    {
      title: 'Paramètres',
      href: '/settings',
      icon: Settings,
      color: 'text-gray-600 dark:text-gray-400',
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
    <Sidebar className="border-r-0 bg-sidebar">
      <SidebarHeader className="border-b border-border/50 px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              IBH Studio
            </span>
          </div>
          <SidebarTrigger className="h-6 w-6" />
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        <SidebarMenu className="space-y-1">
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton 
                asChild 
                isActive={location.pathname === item.href}
                className="nav-item group"
              >
                <Link to={item.href}>
                  <item.icon className={`h-4 w-4 transition-colors ${
                    location.pathname === item.href 
                      ? 'text-primary-foreground' 
                      : item.color
                  }`} />
                  <span className="font-medium">{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/50 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <ThemeToggle />
          
          {user && (
            <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-accent/50">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs font-medium text-muted-foreground">
                {userDisplayName}
              </span>
            </div>
          )}
        </div>
        
        {user && (
          <SidebarMenuButton
            onClick={handleLogout}
            className="nav-item text-destructive hover:bg-destructive/10 hover:text-destructive w-full justify-start"
          >
            <LogOut className="h-4 w-4" />
            <span className="font-medium">Déconnexion</span>
          </SidebarMenuButton>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
