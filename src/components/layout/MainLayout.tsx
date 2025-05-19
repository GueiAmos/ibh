
import { Sidebar } from '@/components/layout/Sidebar';
import { TopNavbar } from '@/components/layout/TopNavbar';
import { MobileActions } from '@/components/mobile/MobileActions';
import { useIsMobile } from '@/hooks/use-mobile';
import { motion } from 'framer-motion';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar for mobile */}
      <Sidebar className="lg:hidden" />
      
      {/* Main content with top navbar for desktop */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <TopNavbar />
        
        <motion.main 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex-1 overflow-y-auto pb-safe-area"
        >
          {children}
        </motion.main>
        
        <MobileActions />
      </div>
    </div>
  );
}
