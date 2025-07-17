
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Search, 
  Bell, 
  Menu, 
  Plus,
  Music
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/ui/ThemeSwitcher';
import { ModernMobileMenu } from './ModernMobileMenu';
import { motion } from 'framer-motion';

export function ModernHeader() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return 'Tableau de bord';
      case '/notes': return 'Mes Notes';
      case '/beats': return 'Mes Beats';
      case '/folders': return 'Dossiers';
      case '/settings': return 'Paramètres';
      default: return 'Music Studio';
    }
  };

  const getPageSubtitle = () => {
    switch (location.pathname) {
      case '/': return 'Bienvenue dans votre espace créatif';
      case '/notes': return 'Organisez vos idées et créations';
      case '/beats': return 'Votre collection musicale';
      case '/folders': return 'Organisez votre contenu';
      case '/settings': return 'Personnalisez votre expérience';
      default: return '';
    }
  };

  return (
    <>
      <header className="floating-header music-header">
        <div className="px-4 py-4 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Left section */}
            <div className="flex items-center gap-4">
              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden hover:bg-primary/10"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              
              {/* Page title */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <Music className="w-6 h-6 text-primary" />
                  {getPageTitle()}
                </h1>
                <p className="text-sm text-muted-foreground hidden sm:block">
                  {getPageSubtitle()}
                </p>
              </motion.div>
            </div>

            {/* Right section */}
            <div className="flex items-center gap-3">
              {/* Search - Hidden on small screens */}
              <div className="hidden md:block relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  className="pl-10 w-64 modern-input"
                />
              </div>

              {/* Action buttons */}
              <Button 
                variant="ghost" 
                size="sm" 
                className="hidden sm:flex hover:bg-primary/10 relative"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full"></span>
              </Button>

              <ThemeToggle />

              {/* Quick action button */}
              {location.pathname === '/notes' && (
                <Button className="modern-button">
                  <Plus className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Nouvelle note</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <ModernMobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />
    </>
  );
}
