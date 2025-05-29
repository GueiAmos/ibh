
import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import ThemeSwitcher from '@/components/ui/ThemeSwitcher';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Settings as SettingsIcon, User, Bell, HardDrive, Trash, Loader2, Edit } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const Settings = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [offlineModeEnabled, setOfflineModeEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;
      setLoading(true);

      try {
        // Récupérer le profil utilisateur
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          // Si le profil n'existe pas, nous allons le créer
          if (profileError.code === 'PGRST116') {
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({ 
                id: user.id, 
                username: user.email?.split('@')[0] || '' 
              });
            
            if (insertError) {
              throw insertError;
            } else {
              // Nouvelle tentative de récupération après création
              const { data: newProfile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();
                
              if (newProfile) {
                setUsername(newProfile.username || user.email?.split('@')[0] || '');
              }
            }
          } else {
            throw profileError;
          }
        } else if (profile) {
          setUsername(profile.username || user.email?.split('@')[0] || '');
        }

        // Définir l'email de l'utilisateur
        setEmail(user.email || '');
      } catch (error) {
        console.error('Error setting up profile:', error);
        toast.error('Erreur lors du chargement du profil');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) {
      toast.error('Vous devez être connecté pour mettre à jour votre profil');
      return;
    }

    if (!username.trim()) {
      toast.error('Le nom d\'utilisateur ne peut pas être vide');
      return;
    }

    setUpdating(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          username: username.trim()
        });

      if (error) throw error;

      toast.success('Profil mis à jour avec succès!');
      setIsEditingUsername(false);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(`Erreur lors de la mise à jour du profil: ${error.message}`);
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteAccount = async () => {
    // Dans une vraie implémentation, vous pourriez ajouter une confirmation
    toast.error('Cette fonctionnalité est désactivée pour le moment');
  };

  const handleDeleteAllNotes = async () => {
    // Dans une vraie implémentation, vous pourriez ajouter une confirmation
    toast.error('Cette fonctionnalité est désactivée pour le moment');
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
              <User className="mr-2 h-5 w-5 text-primary" />
              Profil
            </h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium mb-1">
                  Nom d'utilisateur
                </label>
                <div className="flex items-center gap-2">
                  {isEditingUsername ? (
                    <>
                      <Input
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Votre nom d'utilisateur"
                        disabled={loading || updating}
                        className="flex-1"
                      />
                      <Button 
                        onClick={handleSaveProfile} 
                        disabled={loading || updating || !username.trim()}
                        size="sm"
                      >
                        {updating ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Sauvegarder'
                        )}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setIsEditingUsername(false);
                          // Reset to original value
                        }}
                        size="sm"
                        disabled={updating}
                      >
                        Annuler
                      </Button>
                    </>
                  ) : (
                    <>
                      <Input
                        id="username"
                        value={username}
                        disabled
                        className="flex-1"
                      />
                      <Button 
                        variant="outline"
                        onClick={() => setIsEditingUsername(true)}
                        size="sm"
                        disabled={loading}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Modifier
                      </Button>
                    </>
                  )}
                </div>
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
                  disabled
                />
                <p className="text-sm text-muted-foreground mt-1">
                  L'email ne peut pas être modifié
                </p>
              </div>
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
              <Bell className="mr-2 h-5 w-5 text-primary" />
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
              <HardDrive className="mr-2 h-5 w-5 text-primary" />
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
                <Button variant="destructive" onClick={handleDeleteAllNotes}>
                  Supprimer toutes les notes
                </Button>
                <Button variant="destructive" onClick={handleDeleteAccount}>
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
