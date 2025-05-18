
import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Music, Plus } from 'lucide-react';
import { AudioPlayer } from '@/components/audio/AudioPlayer';
import { BeatUploader } from '@/components/audio/BeatUploader';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Beat {
  id: string;
  title: string;
  audio_url: string;
  created_at: string;
}

const Beats = () => {
  const [beats, setBeats] = useState<Beat[]>([]);
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchBeats = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('beats')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        setBeats(data || []);
      } catch (error: any) {
        toast.error(`Erreur lors du chargement des beats: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBeats();
  }, [user]);

  const handleUploadSuccess = (fileUrl: string, fileName: string) => {
    // Le beat a déjà été ajouté à la base de données dans le composant BeatUploader
    // Nous rechargeons simplement la liste des beats
    const fetchBeats = async () => {
      try {
        const { data, error } = await supabase
          .from('beats')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        setBeats(data || []);
      } catch (error: any) {
        toast.error(`Erreur lors du chargement des beats: ${error.message}`);
      }
    };
    
    fetchBeats();
  };

  return (
    <MainLayout>
      <div className="ibh-container py-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold flex items-center">
            <Music className="mr-2 h-6 w-6" />
            Mes Beats
          </h1>
          <Button onClick={() => setIsUploaderOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un beat
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center my-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ibh-purple"></div>
          </div>
        ) : beats.length === 0 ? (
          <div className="text-center py-12">
            <Music className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
            <h3 className="mt-4 text-lg font-medium">Aucun beat trouvé</h3>
            <p className="text-muted-foreground mt-2">
              Commencez par ajouter un nouveau beat à votre collection.
            </p>
            <Button className="mt-4" onClick={() => setIsUploaderOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un beat
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {beats.map((beat) => (
              <div key={beat.id} className="glass-panel p-4 rounded-lg">
                <h3 className="font-medium text-lg mb-2 truncate">{beat.title}</h3>
                <AudioPlayer audioSrc={beat.audio_url} />
              </div>
            ))}
          </div>
        )}

        <BeatUploader 
          isOpen={isUploaderOpen} 
          onClose={() => setIsUploaderOpen(false)} 
          onUploadSuccess={handleUploadSuccess}
        />
      </div>
    </MainLayout>
  );
};

export default Beats;
