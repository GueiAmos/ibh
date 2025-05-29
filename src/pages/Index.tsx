import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Music, BookmarkIcon, CirclePlay, Headphones, MicVocal, FolderOpen, Plus, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MainLayout } from '@/components/layout/MainLayout';

// Dashboard components
const UserDashboard = () => {
  const [stats, setStats] = useState({
    notes: 0,
    beats: 0,
    folders: 0,
    recordings: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentNotes, setRecentNotes] = useState<any[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchUserStats = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        // Fetch note count
        const { count: notesCount, error: notesError } = await supabase
          .from('notes')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        // Fetch beat count
        const { count: beatsCount, error: beatsError } = await supabase
          .from('beats')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        // Fetch folder count
        const { count: foldersCount, error: foldersError } = await supabase
          .from('folders')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);
          
        // Fetch recording count
        const { count: recordingsCount, error: recordingsError } = await supabase
          .from('voice_recordings')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);
          
        // Fetch recent notes
        const { data: notes, error: recentNotesError } = await supabase
          .from('notes')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })
          .limit(5);
          
        if (notes) {
          setRecentNotes(notes);
        }

        setStats({
          notes: notesCount || 0,
          beats: beatsCount || 0,
          folders: foldersCount || 0,
          recordings: recordingsCount || 0
        });
      } catch (error) {
        console.error('Error fetching user stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserStats();
  }, [user]);

  return (
    <div className="py-6 space-y-8">
      {/* Welcome section */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl md:text-4xl font-bold">
          Bon retour, <span className="text-gradient">{user?.email?.split('@')[0]}</span> ! 🎵
        </h1>
        <p className="text-muted-foreground">
          Prêt à créer quelque chose d'extraordinaire aujourd'hui ?
        </p>
      </div>
      
      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard 
          title="Notes" 
          value={stats.notes} 
          icon={<BookmarkIcon className="h-6 w-6" />} 
          linkTo="/notes" 
          loading={loading}
          color="blue"
        />
        <StatCard 
          title="Beats" 
          value={stats.beats} 
          icon={<Music className="h-6 w-6" />} 
          linkTo="/beats" 
          loading={loading}
          color="purple"
        />
        <StatCard 
          title="Dossiers" 
          value={stats.folders} 
          icon={<FolderOpen className="h-6 w-6" />} 
          linkTo="/folders" 
          loading={loading}
          color="green"
        />
        <StatCard 
          title="Enregistrements" 
          value={stats.recordings} 
          icon={<MicVocal className="h-6 w-6" />} 
          linkTo="/notes" 
          loading={loading}
          color="orange"
        />
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8">
        {/* Recent notes */}
        <div className="xl:col-span-2">
          <div className="glass-panel p-6 rounded-2xl h-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl md:text-2xl font-semibold flex items-center">
                <BookmarkIcon className="h-6 w-6 mr-2 text-blue-500" />
                Notes récentes
              </h2>
              <Button asChild variant="ghost" size="sm" className="text-blue-500">
                <Link to="/notes">Voir tout</Link>
              </Button>
            </div>
            
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="animate-pulse flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-xl bg-gray-300/20"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-3/4 bg-gray-300/20 rounded"></div>
                      <div className="h-3 w-1/2 bg-gray-300/20 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recentNotes.length > 0 ? (
              <div className="space-y-3">
                {recentNotes.map(note => (
                  <Link 
                    key={note.id} 
                    to={`/notes?note=${note.id}`}
                    className="flex items-center p-4 rounded-xl hover:bg-accent/50 transition-all duration-200 group"
                  >
                    <div className="h-12 w-12 rounded-xl flex items-center justify-center bg-blue-500/10 text-blue-500 mr-4 group-hover:scale-110 transition-transform">
                      <BookmarkIcon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium line-clamp-1 text-lg">{note.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        Modifié le {new Date(note.updated_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BookmarkIcon className="mx-auto h-16 w-16 text-muted-foreground opacity-30 mb-4" />
                <h3 className="text-lg font-medium mb-2">Aucune note pour le moment</h3>
                <p className="text-muted-foreground mb-6">Commencez par créer votre première note</p>
                <Button asChild size="lg" className="rounded-xl">
                  <Link to="/notes">
                    <Plus className="h-5 w-5 mr-2" />
                    Créer ma première note
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <CirclePlay className="h-6 w-6 mr-2 text-primary" />
              Actions rapides
            </h2>
            <div className="space-y-3">
              <QuickActionButton 
                to="/notes" 
                icon={<Plus className="h-5 w-5" />} 
                label="Nouvelle note" 
                description="Créer une nouvelle composition"
                color="blue"
              />
              <QuickActionButton 
                to="/beats" 
                icon={<Music className="h-5 w-5" />} 
                label="Explorer les beats" 
                description="Découvrir de nouveaux rythmes"
                color="purple"
              />
              <QuickActionButton 
                to="/folders" 
                icon={<FolderOpen className="h-5 w-5" />} 
                label="Gérer mes dossiers" 
                description="Organiser mes créations"
                color="green"
              />
            </div>
          </div>

          {/* Activity summary */}
          <div className="glass-panel p-6 rounded-2xl">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <TrendingUp className="h-6 w-6 mr-2 text-primary" />
              Activité
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Cette semaine</span>
                <span className="font-medium">{stats.notes + stats.beats} créations</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="font-medium">{stats.notes + stats.beats + stats.recordings} éléments</span>
              </div>
            </div>
          </div>
          
          <div className="glass-panel p-6 rounded-2xl border-dashed border-2 border-primary/20">
            <div className="text-center">
              <h3 className="font-medium mb-2">Envie d'explorer ?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Découvrez toutes nos fonctionnalités
              </p>
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link to="/" onClick={() => setShowLanding(true)}>
                  <CirclePlay className="h-4 w-4 mr-2" />
                  Page d'accueil
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Stat card component for dashboard
const StatCard = ({ 
  title, 
  value, 
  icon, 
  linkTo,
  loading,
  color = "blue"
}: { 
  title: string; 
  value: number; 
  icon: React.ReactNode; 
  linkTo: string;
  loading: boolean;
  color?: string;
}) => {
  const colorVariants = {
    blue: "from-blue-500/10 to-blue-600/5 text-blue-600 border-blue-200/50",
    purple: "from-purple-500/10 to-purple-600/5 text-purple-600 border-purple-200/50",
    green: "from-green-500/10 to-green-600/5 text-green-600 border-green-200/50",
    orange: "from-orange-500/10 to-orange-600/5 text-orange-600 border-orange-200/50"
  };

  return (
    <Link to={linkTo} className="group">
      <div className={cn(
        "glass-panel rounded-2xl p-6 hover:shadow-lg transition-all duration-300 border bg-gradient-to-br group-hover:scale-105",
        colorVariants[color as keyof typeof colorVariants]
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={cn(
              "h-12 w-12 rounded-xl flex items-center justify-center bg-white/50 dark:bg-black/20 group-hover:scale-110 transition-transform",
              `text-${color}-600`
            )}>
              {icon}
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              {loading ? (
                <div className="h-8 w-12 bg-gray-300/20 rounded mt-1 animate-pulse"></div>
              ) : (
                <p className="text-2xl md:text-3xl font-bold">{value}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

// Quick access button component
const QuickActionButton = ({ 
  to, 
  icon, 
  label, 
  description,
  color = "blue"
}: { 
  to: string; 
  icon: React.ReactNode; 
  label: string;
  description: string;
  color?: string;
}) => {
  const colorVariants = {
    blue: "hover:bg-blue-50 hover:border-blue-200 dark:hover:bg-blue-950/30",
    purple: "hover:bg-purple-50 hover:border-purple-200 dark:hover:bg-purple-950/30",
    green: "hover:bg-green-50 hover:border-green-200 dark:hover:bg-green-950/30",
    orange: "hover:bg-orange-50 hover:border-orange-200 dark:hover:bg-orange-950/30"
  };

  return (
    <Link 
      to={to} 
      className={cn(
        "block p-4 rounded-xl border transition-all duration-200 group",
        colorVariants[color as keyof typeof colorVariants]
      )}
    >
      <div className="flex items-center space-x-3">
        <div className={cn(
          "h-10 w-10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform",
          `bg-${color}-500/10 text-${color}-600`
        )}>
          {icon}
        </div>
        <div className="flex-1">
          <h4 className="font-medium">{label}</h4>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </Link>
  );
};

// Landing page component
const LandingPage = () => {
  const { user, loading } = useAuth();
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-20 right-10 w-64 h-64 rounded-full bg-primary/10 blur-3xl -z-10" />
      <div className="absolute bottom-20 left-10 w-80 h-80 rounded-full bg-blue-400/10 blur-3xl -z-10" />
      
      {/* Hero section */}
      <section className="ibh-container pt-12 pb-20">
        <motion.div 
          className="flex flex-col items-center text-center"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.h1 
            variants={item}
            className="text-4xl md:text-6xl font-bold mb-4 leading-tight"
          >
            Votre <span className="text-gradient">studio d'écriture</span> musical
          </motion.h1>

          <motion.p 
            variants={item}
            className="text-lg mb-8 max-w-2xl text-muted-foreground"
          >
            Un espace créatif pour écrire, enregistrer et perfectionner 
            vos textes sur des beats inspirants.
          </motion.p>
          
          <motion.div 
            variants={item}
            className="flex flex-wrap gap-4 justify-center"
          >
            {!loading && (user ? (
              <>
                <Button asChild size="lg" className="rounded-full">
                  <Link to="/notes">
                    <BookmarkIcon className="mr-2 h-5 w-5" />
                    Commencer à écrire
                  </Link>
                </Button>
                <Button variant="outline" asChild size="lg" className="rounded-full">
                  <Link to="/beats">
                    <Music className="mr-2 h-5 w-5" />
                    Explorer les beats
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button asChild size="lg" className="rounded-full">
                  <Link to="/auth">
                    <BookmarkIcon className="mr-2 h-5 w-5" />
                    Se connecter
                  </Link>
                </Button>
                <Button variant="outline" asChild size="lg" className="rounded-full">
                  <Link to="/auth?tab=signup">
                    <Music className="mr-2 h-5 w-5" />
                    S'inscrire
                  </Link>
                </Button>
              </>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Features section */}
      <section className="bg-accent/50 dark:bg-accent/50 py-20">
        <div className="ibh-container">
          <motion.h2 
            className="text-3xl font-bold text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Créez sans limites
          </motion.h2>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            <FeatureCard 
              icon={<BookmarkIcon className="h-12 w-12 text-primary" />}
              title="Notes Structurées"
              description="Organisez vos textes avec des sections claires: couplet, refrain, pont et plus."
            />
            <FeatureCard 
              icon={<Headphones className="h-12 w-12 text-primary" />}
              title="Beats Intégrés"
              description="Écoutez des beats tout en écrivant pour rester dans le rythme et l'ambiance."
            />
            <FeatureCard 
              icon={<MicVocal className="h-12 w-12 text-primary" />}
              title="Enregistrement Vocal"
              description="Enregistrez votre voix directement dans l'application pour tester vos flows."
            />
            <FeatureCard 
              icon={<CirclePlay className="h-12 w-12 text-primary" />}
              title="Lecture Synchronisée"
              description="Écoutez vos enregistrements en même temps que les beats pour affiner votre style."
            />
            <FeatureCard 
              icon={<FolderOpen className="h-12 w-12 text-primary" />}
              title="Organisation"
              description="Classez vos créations dans des dossiers pour retrouver facilement vos projets."
            />
            <FeatureCard 
              icon={<Music className="h-12 w-12 text-primary" />}
              title="Bibliothèque de Beats"
              description="Accédez à votre collection personnelle de beats pour toujours avoir l'inspiration."
            />
          </motion.div>
        </div>
      </section>

      {/* CTA Section - Only show when not logged in */}
      {!loading && !user && (
        <section className="ibh-container py-20">
          <motion.div 
            className="glass-panel p-8 md:p-12 text-center rounded-3xl relative overflow-hidden"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent -z-10" />
            
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Prêt à donner vie à vos textes?
            </h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto text-muted-foreground">
              Rejoignez notre communauté de créateurs et transformez vos idées en morceaux aboutis.
            </p>
            <Button asChild size="lg" className="rounded-full">
              <Link to="/auth">
                Créer un compte gratuit
              </Link>
            </Button>
          </motion.div>
        </section>
      )}
    </div>
  );
};

// Feature card component
const FeatureCard = ({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
}) => {
  return (
    <motion.div
      className="glass-panel p-6 rounded-3xl h-full"
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
      }}
    >
      <div className="flex flex-col items-center text-center h-full">
        <div className="mb-4 p-3 rounded-2xl bg-primary/10 text-primary">{icon}</div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </motion.div>
  );
};

// Main component that conditionally renders Dashboard or Landing page
const Index = () => {
  const { user, loading } = useAuth();
  const [showLanding, setShowLanding] = useState(false);
  
  // If user is logged in but explicitly wants to see landing
  if (showLanding && user) {
    return (
      <MainLayout>
        <div className="mb-4 flex justify-between items-center">
          <Button 
            variant="outline" 
            onClick={() => setShowLanding(false)}
            className="mb-2"
          >
            Retour au tableau de bord
          </Button>
        </div>
        <LandingPage />
      </MainLayout>
    );
  }
  
  // If user is logged in and hasn't chosen to see landing, show dashboard
  if (user && !showLanding) {
    return (
      <MainLayout>
        <UserDashboard />
      </MainLayout>
    );
  }
  
  // For users not logged in, show landing page
  return <LandingPage />;
};

export default Index;
