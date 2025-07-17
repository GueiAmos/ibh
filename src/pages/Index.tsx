import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Music, BookmarkIcon, CirclePlay, Headphones, MicVocal, FolderOpen, Plus, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MainLayout } from '@/components/layout/MainLayout';

// Dashboard components
const UserDashboard = ({ setShowLanding }: { setShowLanding: (show: boolean) => void }) => {
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
        const { count: notesCount } = await supabase
          .from('notes')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        const { count: beatsCount } = await supabase
          .from('beats')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        const { count: foldersCount } = await supabase
          .from('folders')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);
          
        const { count: recordingsCount } = await supabase
          .from('voice_recordings')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);
          
        const { data: notes } = await supabase
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
    <div className="py-8 space-y-8">
      {/* Section d'accueil */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="music-card p-8 text-center">
          <div className="vinyl-effect w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-music-purple to-music-blue"></div>
          <h1 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground to-music-silver bg-clip-text text-transparent">
            Bon retour, <span className="text-primary">{user?.email?.split('@')[0]}</span> ! 🎵
          </h1>
          <p className="text-lg text-muted-foreground">
            Prêt à créer quelque chose d'extraordinaire aujourd'hui ?
          </p>
        </div>
      </motion.div>
      
      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <QuickActionCard 
          to="/notes" 
          icon={<Plus className="h-8 w-8" />} 
          title="Nouvelle note" 
          description="Créer une nouvelle composition"
          color="from-music-purple to-primary"
        />
        <QuickActionCard 
          to="/beats" 
          icon={<Music className="h-8 w-8" />} 
          title="Explorer les beats" 
          description="Découvrir de nouveaux rythmes"
          color="from-music-blue to-accent"
        />
        <QuickActionCard 
          to="/folders" 
          icon={<FolderOpen className="h-8 w-8" />} 
          title="Gérer mes dossiers" 
          description="Organiser mes créations"
          color="from-music-gold to-music-accent"
        />
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Notes récentes */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="music-card p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl md:text-2xl font-semibold flex items-center">
              <BookmarkIcon className="h-6 w-6 mr-3 text-primary" />
              Notes récentes
            </h2>
            <Button asChild variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
              <Link to="/notes">Voir tout</Link>
            </Button>
          </div>
          
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-xl bg-muted/20"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 bg-muted/20 rounded"></div>
                    <div className="h-3 w-1/2 bg-muted/20 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : recentNotes.length > 0 ? (
            <div className="space-y-3">
              {recentNotes.slice(0, 3).map(note => (
                <Link 
                  key={note.id} 
                  to={`/notes?note=${note.id}`}
                  className="flex items-center p-4 rounded-xl bg-gradient-to-r from-secondary/50 to-transparent hover:from-primary/10 hover:to-accent/10 transition-all duration-300 group border border-border/30"
                >
                  <div className="h-12 w-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20 text-primary mr-4 group-hover:scale-110 transition-transform">
                    <BookmarkIcon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium line-clamp-1 text-lg text-foreground">{note.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      Modifié le {new Date(note.updated_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="vinyl-effect w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-muted to-muted/50"></div>
              <h3 className="text-lg font-medium mb-2 text-foreground">Aucune note pour le moment</h3>
              <p className="text-muted-foreground mb-6">Commencez par créer votre première note</p>
              <Button asChild size="lg" className="modern-button">
                <Link to="/notes">
                  <Plus className="h-5 w-5 mr-2" />
                  Créer ma première note
                </Link>
              </Button>
            </div>
          )}
        </motion.div>

        {/* Résumé d'activité */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-6"
        >
          <div className="music-card p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <TrendingUp className="h-6 w-6 mr-3 text-primary" />
              Activité récente
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <BookmarkIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Notes créées</p>
                    <p className="text-sm text-muted-foreground">Cette semaine</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-primary beat-pulse">{stats.notes}</span>
              </div>
              
              <div className="flex justify-between items-center p-4 rounded-xl bg-gradient-to-r from-music-blue/10 to-music-purple/10 border border-music-blue/20">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-music-blue/20 to-music-purple/20 flex items-center justify-center">
                    <Music className="h-5 w-5 text-music-blue" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Beats ajoutés</p>
                    <p className="text-sm text-muted-foreground">Au total</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-music-blue">{stats.beats}</span>
              </div>
            </div>
          </div>
          
          <div className="music-card p-6 border-dashed border-2 border-primary/30">
            <div className="text-center">
              <div className="vinyl-effect w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-primary to-accent"></div>
              <h3 className="font-medium mb-2 text-foreground">Envie d'explorer ?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Découvrez toutes nos fonctionnalités
              </p>
              <Button asChild variant="outline" size="sm" className="w-full modern-button-secondary">
                <Link to="/" onClick={() => setShowLanding(true)}>
                  <CirclePlay className="h-4 w-4 mr-2" />
                  Page d'accueil
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Quick action card component for dashboard
const QuickActionCard = ({ 
  to, 
  icon, 
  title, 
  description,
  color = "from-primary to-accent"
}: { 
  to: string; 
  icon: React.ReactNode; 
  title: string;
  description: string;
  color?: string;
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Link 
        to={to} 
        className={`group block p-6 rounded-2xl border border-border/30 transition-all duration-300 
                   hover:shadow-2xl hover:border-primary/50 music-card relative overflow-hidden`}
      >
        <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
        <div className="relative z-10 flex flex-col items-center text-center space-y-4">
          <div className={`h-16 w-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform 
                          bg-gradient-to-br ${color} text-white shadow-lg`}>
            {icon}
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-2 text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
      </Link>
    </motion.div>
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
      {/* Éléments d'arrière-plan */}
      <div className="absolute top-20 right-10 w-64 h-64 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 blur-3xl -z-10" />
      <div className="absolute bottom-20 left-10 w-80 h-80 rounded-full bg-gradient-to-br from-music-purple/20 to-music-blue/20 blur-3xl -z-10" />
      
      {/* Section héros */}
      <section className="container mx-auto px-4 pt-12 pb-20">
        <motion.div 
          className="flex flex-col items-center text-center"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.div 
            variants={item}
            className="vinyl-effect w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-primary to-accent"
          />

          <motion.h1 
            variants={item}
            className="text-4xl md:text-6xl font-bold mb-4 leading-tight"
          >
            Votre <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">studio d'écriture</span> musical
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
                <Button asChild size="lg" className="modern-button">
                  <Link to="/notes">
                    <BookmarkIcon className="mr-2 h-5 w-5" />
                    Commencer à écrire
                  </Link>
                </Button>
                <Button asChild size="lg" className="modern-button-secondary">
                  <Link to="/beats">
                    <Music className="mr-2 h-5 w-5" />
                    Explorer les beats
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button asChild size="lg" className="modern-button">
                  <Link to="/auth">
                    <BookmarkIcon className="mr-2 h-5 w-5" />
                    Se connecter
                  </Link>
                </Button>
                <Button asChild size="lg" className="modern-button-secondary">
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

      {/* Section des fonctionnalités */}
      <section className="music-header py-20">
        <div className="container mx-auto px-4">
          <motion.h2 
            className="text-3xl font-bold text-center mb-12 text-foreground"
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
              icon={<Headphones className="h-12 w-12 text-accent" />}
              title="Beats Intégrés"
              description="Écoutez des beats tout en écrivant pour rester dans le rythme et l'ambiance."
            />
            <FeatureCard 
              icon={<MicVocal className="h-12 w-12 text-music-blue" />}
              title="Enregistrement Vocal"
              description="Enregistrez votre voix directement dans l'application pour tester vos flows."
            />
            <FeatureCard 
              icon={<CirclePlay className="h-12 w-12 text-music-purple" />}
              title="Lecture Synchronisée"
              description="Écoutez vos enregistrements en même temps que les beats pour affiner votre style."
            />
            <FeatureCard 
              icon={<FolderOpen className="h-12 w-12 text-music-gold" />}
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

      {/* Section CTA */}
      {!loading && !user && (
        <section className="container mx-auto px-4 py-20">
          <motion.div 
            className="music-card p-8 md:p-12 text-center relative overflow-hidden"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 -z-10" />
            
            <div className="vinyl-effect w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-primary to-accent"></div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Prêt à donner vie à vos textes?
            </h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto text-muted-foreground">
              Rejoignez notre communauté de créateurs et transformez vos idées en morceaux aboutis.
            </p>
            <Button asChild size="lg" className="modern-button">
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
      className="music-card p-6 h-full group hover:scale-105 transition-all duration-300"
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
      }}
      whileHover={{ y: -5 }}
    >
      <div className="flex flex-col items-center text-center h-full">
        <div className="mb-4 p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <h3 className="text-xl font-semibold mb-2 text-foreground">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </motion.div>
  );
};

// Main component that conditionally renders Dashboard or Landing page
const Index = () => {
  const { user, loading } = useAuth();
  const [showLanding, setShowLanding] = useState(false);
  
  if (showLanding && user) {
    return (
      <MainLayout>
        <div className="mb-4 flex justify-between items-center">
          <Button 
            variant="outline" 
            onClick={() => setShowLanding(false)}
            className="mb-2 modern-button-secondary"
          >
            Retour au tableau de bord
          </Button>
        </div>
        <LandingPage />
      </MainLayout>
    );
  }
  
  if (user && !showLanding) {
    return (
      <MainLayout>
        <UserDashboard setShowLanding={setShowLanding} />
      </MainLayout>
    );
  }
  
  return <LandingPage />;
};

export default Index;
