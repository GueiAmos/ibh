
import React from 'react';
import { ModernSidebar } from './ModernSidebar';
import { ModernHeader } from './ModernHeader';
import { motion } from 'framer-motion';

interface ModernLayoutProps {
  children: React.ReactNode;
}

export function ModernLayout({ children }: ModernLayoutProps) {
  return (
    <div className="min-h-screen bg-dark-gradient">
      <div className="flex">
        {/* Sidebar - Hidden on mobile, shown on desktop */}
        <div className="hidden lg:block">
          <ModernSidebar />
        </div>
        
        {/* Main content */}
        <div className="flex-1 lg:ml-64">
          <ModernHeader />
          <motion.main
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-4 md:p-6 lg:p-8"
          >
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </motion.main>
        </div>
      </div>
    </div>
  );
}
