
import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import ThemeSwitcher from '@/components/ui/ThemeSwitcher';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Settings as SettingsIcon, User, Bell, HardDrive, Trash } from 'lucide-react';

const Settings = () => {
  const [username, setUsername] = useState('User');
  const [email, setEmail] = useState('user@example.com');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [offlineModeEnabled, setOfflineModeEnabled] = useState(true);

  const handleSaveProfile = () => {
    // Here we would save the profile info to the backend
    toast.success('Profil mis à jour avec succès!');
  };

  return (
    <MainLayout>
      <div className="ibh-container py-4">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold flex items-center">
            <SettingsIcon className="mr-2 h-6 w-6" />
            Paramètres
          </h1>
          <p className="text-muted-foreground">
            Gérez vos préférences d'application
          </p>
        </div>

        <div className="space-y-8">
          {/* Profile section */}
          <section className="glass-panel p-4 rounded-lg">
            <h2 className="text-xl font-semibold flex items-center mb-4">
              <User className="mr-2 h-5 w-5 text-ibh-purple" />
              Profil
            </h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium mb-1">
                  Nom d'utilisateur
                </label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              <Button onClick={handleSaveProfile}>
                Enregistrer
              </Button>
            </div>
          </section>
          
          {/* Appearance section */}
          <section className="glass-panel p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">
              Apparence
            </h2>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Thème</h3>
                <p className="text-sm text-muted-foreground">Basculer entre le mode clair et sombre</p>
              </div>
              <ThemeSwitcher />
            </div>
          </section>
          
          {/* Notifications section */}
          <section className="glass-panel p-4 rounded-lg">
            <h2 className="text-xl font-semibold flex items-center mb-4">
              <Bell className="mr-2 h-5 w-5 text-ibh-purple" />
              Notifications
            </h2>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Activer les notifications</h3>
                <p className="text-sm text-muted-foreground">Recevoir des alertes pour les nouveaux beats et fonctionnalités</p>
              </div>
              <Switch 
                checked={notificationsEnabled} 
                onCheckedChange={setNotificationsEnabled} 
              />
            </div>
          </section>
          
          {/* Storage section */}
          <section className="glass-panel p-4 rounded-lg">
            <h2 className="text-xl font-semibold flex items-center mb-4">
              <HardDrive className="mr-2 h-5 w-5 text-ibh-purple" />
              Stockage
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Sauvegarde automatique</h3>
                  <p className="text-sm text-muted-foreground">Sauvegarder automatiquement vos travaux</p>
                </div>
                <Switch 
                  checked={autoSaveEnabled} 
                  onCheckedChange={setAutoSaveEnabled} 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Mode hors-ligne</h3>
                  <p className="text-sm text-muted-foreground">Travailler sans connexion internet</p>
                </div>
                <Switch 
                  checked={offlineModeEnabled} 
                  onCheckedChange={setOfflineModeEnabled} 
                />
              </div>
            </div>
          </section>
          
          {/* Danger zone */}
          <section className="border border-destructive rounded-lg p-4">
            <h2 className="text-xl font-semibold flex items-center mb-4 text-destructive">
              <Trash className="mr-2 h-5 w-5" />
              Zone de danger
            </h2>
            
            <div className="space-y-4">
              <p className="text-sm">
                Ces actions sont irréversibles. Veuillez procéder avec prudence.
              </p>
              
              <div className="flex flex-wrap gap-2">
                <Button variant="destructive">
                  Supprimer toutes les notes
                </Button>
                <Button variant="destructive">
                  Supprimer le compte
                </Button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </MainLayout>
  );
};

export default Settings;
