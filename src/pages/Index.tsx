
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Music, BookmarkIcon, CirclePlay, Headphones, MicVocal, FolderOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
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

export default Index;
