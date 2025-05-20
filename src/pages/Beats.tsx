
import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Music, Plus, Loader2, Search, Upload, Trash2 } from 'lucide-react';
import { AudioPlayer } from '@/components/audio/AudioPlayer';
import { BeatUploader } from '@/components/audio/BeatUploader';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FolderPlus } from "lucide-react";

interface Beat {
  id: string;
  title: string;
  audio_url: string;
  created_at: string;
}

interface Folder {
  id: string;
  name: string;
}

const Beats = () => {
  const [beats, setBeats] = useState<Beat[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();

  // Fetch beats data
  useEffect(() => {
    const fetchBeats = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('beats')
          .select('*')
          .eq('user_id', user.id)
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
  
  // Fetch folders
  useEffect(() => {
    const fetchFolders = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('folders')
          .select('id, name')
          .eq('user_id', user.id)
          .order('name');
        
        if (error) throw error;
        
        if (data) {
          setFolders(data as Folder[]);
        }
      } catch (error: any) {
        console.error('Error fetching folders:', error);
      }
    };
    
    fetchFolders();
  }, [user]);

  const handleUploadSuccess = (fileUrl: string, fileName: string) => {
    // Le beat a déjà été ajouté à la base de données dans le composant BeatUploader
    // Nous rechargeons simplement la liste des beats
    const fetchBeats = async () => {
      try {
        const { data, error } = await supabase
          .from('beats')
          .select('*')
          .eq('user_id', user?.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        setBeats(data || []);
      } catch (error: any) {
        toast.error(`Erreur lors du chargement des beats: ${error.message}`);
      }
    };
    
    fetchBeats();
  };
  
  // Delete beat function
  const handleDeleteBeat = async (beatId: string) => {
    try {
      // First remove from any folders
      const { error: folderItemError } = await supabase
        .from('folder_items')
        .delete()
        .eq('item_id', beatId)
        .eq('item_type', 'beat');
        
      if (folderItemError) throw folderItemError;
      
      // Then delete the beat
      const { error } = await supabase
        .from('beats')
        .delete()
        .eq('id', beatId);
        
      if (error) throw error;
      
      setBeats(beats.filter(beat => beat.id !== beatId));
      toast.success('Beat supprimé');
    } catch (error: any) {
      console.error('Error deleting beat:', error);
      toast.error('Erreur lors de la suppression du beat');
    }
  };
  
  // Add beat to folder
  const handleAddToFolder = async (beatId: string, folderId: string) => {
    try {
      // Check if already in folder
      const { data: existingData, error: existingError } = await supabase
        .from('folder_items')
        .select('*')
        .eq('folder_id', folderId)
        .eq('item_id', beatId)
        .eq('item_type', 'beat');
        
      if (existingError) throw existingError;
      
      if (existingData && existingData.length > 0) {
        toast.info('Ce beat est déjà dans ce dossier');
        return;
      }
      
      // Add to folder
      const { error } = await supabase
        .from('folder_items')
        .insert({
          folder_id: folderId,
          item_id: beatId,
          item_type: 'beat'
        });
        
      if (error) throw error;
      
      toast.success('Beat ajouté au dossier');
    } catch (error: any) {
      console.error('Error adding to folder:', error);
      toast.error('Erreur lors de l\'ajout au dossier');
    }
  };

  // Filtrer les beats selon la recherche
  const filteredBeats = beats.filter(beat => 
    beat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <MainLayout>
      <div className="ibh-container py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center">
              <Music className="mr-2 h-6 w-6 text-primary" />
              Mes Beats
            </h1>
            <p className="text-muted-foreground mt-1">
              Votre collection personnelle d'instrumentaux
            </p>
          </div>
          <Button onClick={() => setIsUploaderOpen(true)} className="rounded-lg shadow-sm">
            <Upload className="mr-2 h-4 w-4" />
            Ajouter un beat
          </Button>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un beat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background/50"
          />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Chargement de vos beats...</p>
          </div>
        ) : filteredBeats.length === 0 ? (
          <div className="glass-panel text-center py-20 rounded-xl flex flex-col items-center">
            <Music className="mx-auto h-16 w-16 text-muted-foreground opacity-30 mb-4" />
            <h3 className="text-xl font-medium">
              {searchQuery ? 'Aucun beat trouvé' : 'Votre bibliothèque est vide'}
            </h3>
            <p className="text-muted-foreground mt-2 mb-6 max-w-md mx-auto">
              {searchQuery 
                ? 'Essayez avec des termes différents' 
                : 'Commencez par ajouter un nouveau beat à votre collection'}
            </p>
            {!searchQuery && (
              <Button onClick={() => setIsUploaderOpen(true)} className="rounded-lg shadow-sm">
                <Upload className="mr-2 h-4 w-4" />
                Importer mon premier beat
              </Button>
            )}
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {filteredBeats.map((beat, index) => (
              <motion.div 
                key={beat.id} 
                variants={item}
                className="glass-panel p-5 rounded-xl hover:shadow-md transition-all relative group"
              >
                <div className="absolute top-3 right-3 flex space-x-2">
                  {/* Add to folder dropdown */}
                  {folders.length > 0 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 rounded-full transition-opacity">
                          <FolderPlus className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {folders.map(folder => (
                          <DropdownMenuItem 
                            key={folder.id}
                            onClick={() => handleAddToFolder(beat.id, folder.id)}
                          >
                            {folder.name}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                  
                  {/* Delete button */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="destructive" 
                        size="icon" 
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 rounded-full transition-opacity"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Êtes-vous sûr?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Cette action ne peut pas être annulée. Ce beat sera supprimé définitivement.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDeleteBeat(beat.id)} 
                          className="bg-red-500 hover:bg-red-600"
                        >
                          Supprimer
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
                
                <h3 className="font-medium text-lg mb-3 truncate pr-20">{beat.title}</h3>
                <AudioPlayer audioSrc={beat.audio_url} />
                <p className="text-xs text-muted-foreground mt-2">
                  Ajouté le {new Date(beat.created_at).toLocaleDateString()}
                </p>
              </motion.div>
            ))}
          </motion.div>
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
