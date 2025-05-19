
import { Link, useLocation } from 'react-router-dom';
import { Home, BookText, Music, FolderOpen, Settings, LogOut } from 'lucide-react';
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

export function AppSidebar() {
  const location = useLocation();
  const { signOut, user } = useAuth();

  const navItems = [
    {
      title: 'Accueil',
      href: '/',
      icon: <Home className="h-5 w-5" />,
    },
    {
      title: 'Notes',
      href: '/notes',
      icon: <BookText className="h-5 w-5" />,
    },
    {
      title: 'Beats',
      href: '/beats',
      icon: <Music className="h-5 w-5" />,
    },
    {
      title: 'Dossiers',
      href: '/folders',
      icon: <FolderOpen className="h-5 w-5" />,
    },
    {
      title: 'Paramètres',
      href: '/settings',
      icon: <Settings className="h-5 w-5" />,
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

  return (
    <Sidebar>
      <SidebarHeader className="flex items-center justify-between p-4">
        <div className="flex items-center">
          <span className="text-xl font-bold text-primary">IBH</span>
        </div>
        <SidebarTrigger />
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton 
                asChild 
                isActive={location.pathname === item.href}
                tooltip={item.title}
              >
                <Link to={item.href}>
                  {item.icon}
                  <span className="ml-2">{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-4 mt-auto">
        <div className="flex flex-col space-y-3">
          <ThemeToggle />
          
          {user && (
            <SidebarMenuButton
              onClick={handleLogout}
              className="justify-start text-red-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20"
              tooltip="Déconnexion"
            >
              <LogOut className="h-5 w-5" />
              <span className="ml-2">Déconnexion</span>
            </SidebarMenuButton>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
