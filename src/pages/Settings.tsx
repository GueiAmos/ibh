
import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from '@/components/ui/ThemeSwitcher';
import { useAuth } from '@/contexts/AuthContext';
import { User, Bell, Palette, Database, Shield, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Settings() {
  const { user } = useAuth();

  const settingsSections = [
    {
      title: 'Profil',
      description: 'Gérez vos informations personnelles',
      icon: User,
      color: 'from-music-emerald to-music-indigo'
    },
    {
      title: 'Notifications',
      description: 'Configurez vos préférences de notification',
      icon: Bell,
      color: 'from-music-royal-blue to-music-deep-purple'
    },
    {
      title: 'Apparence',
      description: 'Personnalisez l\'interface utilisateur',
      icon: Palette,
      color: 'from-music-copper to-music-crimson'
    },
    {
      title: 'Données',
      description: 'Exportez ou supprimez vos données',
      icon: Database,
      color: 'from-music-deep-purple to-music-indigo'
    }
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="music-card p-6 border border-music-platinum/20"
        >
          <div className="flex items-center gap-4">
            <div className="vinyl-effect w-12 h-12 bg-gradient-to-br from-music-platinum to-music-deep-purple flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-music-platinum to-music-deep-purple bg-clip-text text-transparent">
                Paramètres
              </h1>
              <p className="text-muted-foreground">
                Personnalisez votre expérience Music Studio
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settings Navigation */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            {settingsSections.map((section, index) => (
              <Card key={section.title} className="music-card border border-music-deep-purple/20 hover:border-music-platinum/40 transition-all duration-300 cursor-pointer group">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${section.color} flex items-center justify-center vinyl-effect`}>
                      <section.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-sm text-foreground">{section.title}</CardTitle>
                      <CardDescription className="text-xs">{section.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </motion.div>

          {/* Main Settings Content */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Profile Settings */}
            <Card className="music-card border border-music-emerald/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-music-emerald to-music-indigo flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  Informations du profil
                </CardTitle>
                <CardDescription>
                  Gérez vos informations personnelles et préférences de compte
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Adresse email</Label>
                  <Input 
                    id="email" 
                    value={user?.email || ''} 
                    disabled 
                    className="modern-input bg-gradient-to-r from-background/50 to-music-midnight/30 border-music-emerald/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Nom d'utilisateur</Label>
                  <Input 
                    id="username" 
                    placeholder="Choisissez un nom d'utilisateur" 
                    className="modern-input bg-gradient-to-r from-background/50 to-music-midnight/30 border-music-emerald/30"
                  />
                </div>
                <Button className="modern-button bg-gradient-to-r from-music-emerald to-music-indigo hover:from-music-emerald/90 hover:to-music-indigo/90">
                  Sauvegarder les modifications
                </Button>
              </CardContent>
            </Card>

            {/* Appearance Settings */}
            <Card className="music-card border border-music-copper/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-music-copper to-music-crimson flex items-center justify-center">
                    <Palette className="w-4 h-4 text-white" />
                  </div>
                  Apparence
                </CardTitle>
                <CardDescription>
                  Personnalisez l'apparence de l'application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Thème</Label>
                    <p className="text-sm text-muted-foreground">Choisissez entre le mode clair et sombre</p>
                  </div>
                  <ThemeToggle />
                </div>
                <Separator className="bg-music-deep-purple/20" />
                <div className="space-y-2">
                  <Label>Couleur d'accent</Label>
                  <div className="flex gap-3">
                    {[
                      'from-music-emerald to-music-indigo',
                      'from-music-royal-blue to-music-deep-purple',
                      'from-music-copper to-music-crimson',
                      'from-music-deep-purple to-music-indigo'
                    ].map((gradient, index) => (
                      <div 
                        key={index}
                        className={`w-8 h-8 rounded-lg bg-gradient-to-br ${gradient} cursor-pointer hover:scale-110 transition-transform vinyl-effect`}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notifications Settings */}
            <Card className="music-card border border-music-royal-blue/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-music-royal-blue to-music-deep-purple flex items-center justify-center">
                    <Bell className="w-4 h-4 text-white" />
                  </div>
                  Notifications
                </CardTitle>
                <CardDescription>
                  Configurez vos préférences de notification
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Notifications par email</Label>
                      <p className="text-sm text-muted-foreground">Recevez des mises à jour par email</p>
                    </div>
                    <input type="checkbox" className="rounded" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Notifications de sauvegarde</Label>
                      <p className="text-sm text-muted-foreground">Soyez notifié lors des sauvegardes automatiques</p>
                    </div>
                    <input type="checkbox" className="rounded" defaultChecked />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data Management */}
            <Card className="music-card border border-music-deep-purple/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-music-deep-purple to-music-indigo flex items-center justify-center">
                    <Database className="w-4 h-4 text-white" />
                  </div>
                  Gestion des données
                </CardTitle>
                <CardDescription>
                  Exportez ou supprimez vos données
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    variant="outline" 
                    className="modern-button-secondary border-music-deep-purple/30 hover:bg-music-deep-purple/20"
                  >
                    Exporter mes données
                  </Button>
                  <Button 
                    variant="destructive" 
                    className="bg-gradient-to-r from-destructive to-destructive/80 hover:from-destructive/90 hover:to-destructive/70"
                  >
                    Supprimer mon compte
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
}
