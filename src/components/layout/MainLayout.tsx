
import { Sidebar } from '@/components/layout/Sidebar';
import { TopNavbar } from '@/components/layout/TopNavbar';
import { MobileActions } from '@/components/mobile/MobileActions';
import { motion } from 'framer-motion';
import { 
  SidebarProvider, 
  Sidebar as ShadcnSidebar, 
  SidebarContent, 
  SidebarTrigger 
} from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';

export interface MainLayoutProps {
  children?: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden">
        {/* Sidebar for desktop using shadcn/ui sidebar that handles responsiveness */}
        <AppSidebar />

        {/* Main content with top navbar */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <TopNavbar />
          
          <motion.main 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="flex-1 overflow-y-auto pb-safe-area relative"
          >
            <div className="p-4">
              {children}
            </div>
          </motion.main>
          
          <MobileActions />
        </div>
      </div>
    </SidebarProvider>
  );
}
