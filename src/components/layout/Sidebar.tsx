
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Home, BookText, Music, FolderOpen, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

type SidebarProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

type NavItem = {
  title: string;
  href: string;
  icon: React.ReactNode;
};

export function Sidebar({ open, setOpen }: SidebarProps) {
  const location = useLocation();
  const [mounted, setMounted] = useState(false);
  const { signOut, user } = useAuth();

  const navItems: NavItem[] = [
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

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Déconnexion réussie');
    } catch (error) {
      console.error('Error during logout:', error);
      toast.error('Erreur lors de la déconnexion');
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
      <div
        className={cn(
          "fixed top-16 bottom-0 z-50 w-72 border-r bg-background transition-transform md:translate-x-0 md:z-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <ScrollArea className="h-full py-6">
          <div className="flex flex-col space-y-2 px-3">
            {navItems.map((item) => (
              <Button
                key={item.href}
                variant={location.pathname === item.href ? "secondary" : "ghost"}
                className={cn(
                  "justify-start",
                  location.pathname === item.href && "bg-accent text-accent-foreground"
                )}
                asChild
                onClick={() => setOpen(false)}
              >
                <Link to={item.href}>
                  {item.icon}
                  <span className="ml-2">{item.title}</span>
                </Link>
              </Button>
            ))}

            {/* Bouton de déconnexion */}
            {user && (
              <Button
                variant="ghost"
                className="justify-start text-red-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 mt-auto"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5" />
                <span className="ml-2">Déconnexion</span>
              </Button>
            )}
          </div>
        </ScrollArea>
      </div>
    </>
  );
}
