
import { BookmarkIcon, FolderIcon, Home, Music, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

type SidebarProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

export function Sidebar({ open, setOpen }: SidebarProps) {
  const navigation = [
    { name: 'Accueil', href: '/', icon: Home },
    { name: 'Notes', href: '/notes', icon: BookmarkIcon },
    { name: 'Beats', href: '/beats', icon: Music },
    { name: 'Dossiers', href: '/folders', icon: FolderIcon },
    { name: 'Paramètres', href: '/settings', icon: Settings },
  ];

  const closeSidebar = () => {
    setOpen(false);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-20 md:hidden" 
          onClick={closeSidebar}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed md:relative inset-y-0 left-0 z-30 w-64 bg-sidebar text-sidebar-foreground transition-transform duration-300 ease-in-out transform",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full py-6">
          <div className="px-4 mb-6">
            <h2 className="text-2xl font-bold text-gradient">Ivoire Beat Hub</h2>
            <p className="text-sm text-muted-foreground">Votre espace créatif</p>
          </div>

          <nav className="flex-1 px-2 space-y-1">
            {navigation.map((item) => (
              <Link 
                key={item.name} 
                to={item.href} 
                onClick={closeSidebar}
                className={cn(
                  "flex items-center px-4 py-3 text-sm rounded-md font-medium transition-colors",
                  "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  "focus:outline-none focus:ring-2 focus:ring-sidebar-ring"
                )}
              >
                <item.icon className="mr-3 h-5 w-5 text-sidebar-foreground/70" aria-hidden="true" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
}
