
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Music, BookmarkIcon, Record } from 'lucide-react';

const Index = () => {
  return (
    <MainLayout>
      <div className="ibh-container py-8">
        {/* Hero section */}
        <div className="flex flex-col items-center text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gradient">
            Ivoire Beat Hub
          </h1>
          <p className="text-lg mb-8 max-w-2xl">
            Votre espace créatif pour écrire, enregistrer et perfectionner vos textes de rap.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button asChild size="lg">
              <Link to="/notes">
                <BookmarkIcon className="mr-2 h-5 w-5" />
                Commencer à écrire
              </Link>
            </Button>
            <Button variant="outline" asChild size="lg">
              <Link to="/beats">
                <Music className="mr-2 h-5 w-5" />
                Explorer les beats
              </Link>
            </Button>
          </div>
        </div>

        {/* Features section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
          <FeatureCard 
            icon={<BookmarkIcon className="h-10 w-10 text-ibh-purple" />}
            title="Notes Structurées"
            description="Organisez vos textes avec des sections claires: couplet, refrain, pont et plus."
          />
          <FeatureCard 
            icon={<Music className="h-10 w-10 text-ibh-purple" />}
            title="Beats Intégrés"
            description="Écoutez des beats tout en écrivant pour rester dans le rythme et l'ambiance."
          />
          <FeatureCard 
            icon={<Record className="h-10 w-10 text-ibh-purple" />}
            title="Enregistrement Vocal"
            description="Enregistrez votre voix directement dans l'application pour tester vos flows."
          />
        </div>
      </div>
    </MainLayout>
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
    <div className="glass-panel p-6 animate-slide-in">
      <div className="flex flex-col items-center text-center">
        <div className="mb-4">{icon}</div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};

export default Index;
