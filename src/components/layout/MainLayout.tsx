
import { useState } from 'react';
import { Sidebar } from './Sidebar';
import ThemeSwitcher from '../ui/ThemeSwitcher';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { MobileActions } from '@/components/mobile/MobileActions';

type MainLayoutProps = {
  children: React.ReactNode;
};

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="h-16 flex items-center justify-between px-4 border-b">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="mr-2 md:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold text-gradient">IBH</h1>
        </div>
        <div className="flex items-center space-x-2">
          <ThemeSwitcher />
        </div>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <main className="flex-1 overflow-y-auto">
          {children}
          <MobileActions />
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
