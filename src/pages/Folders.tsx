import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { FolderIcon, PlusCircle, Search, Music, BookmarkIcon, Trash2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { CreateFolderDialog } from '@/components/folders/CreateFolderDialog';
import { FolderContent } from '@/components/folders/FolderContent';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
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
import { Skeleton } from '@/components/ui/skeleton';

type Folder = {
  id: string;
  name: string;
  color: string;
  created_at: string;
  user_id: string;
};

const Folders = () => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();
  const { user } = useAuth();

  // Fetch folders data
  useEffect(() => {
    const fetchFolders = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('folders')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        setFolders(data || []);
      } catch (error: any) {
        console.error('Error fetching folders:', error);
        toast.error('Erreur lors du chargement des dossiers');
      } finally {
        setLoading(false);
      }
    };
    
    fetchFolders();
  }, [user]);

  // Filter folders based on search query
  const filteredFolders = folders.filter(folder =>
    folder.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateFolder = async (name: string, color: string) => {
    if (!user) {
      toast.error('Vous devez être connecté pour créer un dossier');
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('folders')
        .insert({
          name,
          color,
          user_id: user.id
        })
        .select();
        
      if (error) throw error;
      
      if (data && data[0]) {
        setFolders([data[0], ...folders]);
        setIsCreateDialogOpen(false);
        toast.success('Dossier créé avec succès!');
      }
    } catch (error: any) {
      console.error('Error creating folder:', error);
      toast.error('Erreur lors de la création du dossier');
    }
  };
  
  const handleDeleteFolder = async (folderId: string) => {
    try {
      // First delete all folder items
      const { error: itemsError } = await supabase
        .from('folder_items')
        .delete()
        .eq('folder_id', folderId);
        
      if (itemsError) throw itemsError;
      
      // Then delete the folder
      const { error } = await supabase
        .from('folders')
        .delete()
        .eq('id', folderId);
        
      if (error) throw error;
      
      setFolders(folders.filter(folder => folder.id !== folderId));
      toast.success('Dossier supprimé');
    } catch (error: any) {
      console.error('Error deleting folder:', error);
      toast.error('Erreur lors de la suppression du dossier');
    }
  };

  // Get folder item counts
  const [folderCounts, setFolderCounts] = useState<{[key: string]: {notes: number, beats: number}}>({});
  
  useEffect(() => {
    const fetchFolderCounts = async () => {
      if (!folders.length || !user) return;
      
      try {
        const folderIds = folders.map(folder => folder.id);
        
        const { data, error } = await supabase
          .from('folder_items')
          .select('folder_id, item_type')
          .in('folder_id', folderIds);
          
        if (error) throw error;
        
        const counts: {[key: string]: {notes: number, beats: number}} = {};
        
        folders.forEach(folder => {
          counts[folder.id] = { notes: 0, beats: 0 };
        });
        
        data?.forEach(item => {
          if (item.item_type === 'note') {
            counts[item.folder_id].notes++;
          } else if (item.item_type === 'beat') {
            counts[item.folder_id].beats++;
          }
        });
        
        setFolderCounts(counts);
      } catch (error: any) {
        console.error('Error fetching folder counts:', error);
      }
    };
    
    fetchFolderCounts();
  }, [folders, user]);

  return (
    <MainLayout>
      <div className="ibh-container py-4">
        {selectedFolder ? (
          <FolderContent 
            folderId={selectedFolder.id} 
            folderName={selectedFolder.name} 
            onBack={() => setSelectedFolder(null)} 
            onItemDeleted={() => {
              // Refresh counts after item deletion
              const fetchFolderCounts = async () => {
                if (!folders.length || !user) return;
                
                try {
                  const folderIds = folders.map(folder => folder.id);
                  
                  const { data, error } = await supabase
                    .from('folder_items')
                    .select('folder_id, item_type')
                    .in('folder_id', folderIds);
                    
                  if (error) throw error;
                  
                  const counts: {[key: string]: {notes: number, beats: number}} = {};
                  
                  folders.forEach(folder => {
                    counts[folder.id] = { notes: 0, beats: 0 };
                  });
                  
                  data?.forEach(item => {
                    if (item.item_type === 'note') {
                      counts[item.folder_id].notes++;
                    } else if (item.item_type === 'beat') {
                      counts[item.folder_id].beats++;
                    }
                  });
                  
                  setFolderCounts(counts);
                } catch (error: any) {
                  console.error('Error fetching folder counts:', error);
                }
              };
              
              fetchFolderCounts();
            }}
          />
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl md:text-3xl font-bold">Dossiers</h1>
              <Button 
                onClick={() => setIsCreateDialogOpen(true)}
                size={isMobile ? "icon" : "default"}
              >
                {isMobile ? (
                  <PlusCircle className="h-5 w-5" />
                ) : (
                  <>
                    <PlusCircle className="mr-2 h-4 w-4" /> 
                    Nouveau dossier
                  </>
                )}
              </Button>
            </div>
            
            {/* Search bar */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Rechercher un dossier..."
                className="w-full pl-9 pr-4 py-2 rounded-md border bg-background"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* Folders grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="glass-panel p-4 rounded-lg">
                    <div className="flex items-center mb-3">
                      <Skeleton className="h-8 w-8 rounded-md mr-3" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredFolders.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredFolders.map(folder => {
                  const counts = folderCounts[folder.id] || { notes: 0, beats: 0 };
                  const totalItems = counts.notes + counts.beats;
                  
                  return (
                    <div 
                      key={folder.id}
                      className="glass-panel p-4 rounded-lg hover:shadow-md transition-shadow cursor-pointer animate-fade-in relative group"
                      onClick={() => setSelectedFolder(folder)}
                    >
                      <div className="flex items-center mb-3">
                        <div className={`h-10 w-10 rounded-md flex items-center justify-center bg-${folder.color}-500/20`}>
                          <FolderIcon className={`h-6 w-6 text-${folder.color}-500`} />
                        </div>
                        <div className="ml-3">
                          <h3 className="font-medium">{folder.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {totalItems === 0 ? 'Dossier vide' : (
                              <>
                                {counts.notes > 0 && (
                                  <span>{counts.notes} note{counts.notes > 1 ? 's' : ''}</span>
                                )}
                                {counts.notes > 0 && counts.beats > 0 && ', '}
                                {counts.beats > 0 && (
                                  <span>{counts.beats} beat{counts.beats > 1 ? 's' : ''}</span>
                                )}
                              </>
                            )}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-xs text-muted-foreground">
                        Créé le {new Date(folder.created_at).toLocaleDateString()}
                      </div>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="destructive" 
                            size="icon" 
                            className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={e => e.stopPropagation()}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Êtes-vous sûr?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Cette action supprimera le dossier et tout son contenu définitivement.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteFolder(folder.id);
                              }} 
                              className="bg-red-500 hover:bg-red-600"
                            >
                              Supprimer
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="glass-panel text-center py-20 rounded-xl flex flex-col items-center">
                <FolderIcon className="mx-auto h-16 w-16 text-muted-foreground opacity-30 mb-4" />
                <h3 className="text-xl font-medium">
                  {searchQuery ? 'Aucun dossier trouvé' : 'Vous n\'avez pas encore de dossiers'}
                </h3>
                <p className="text-muted-foreground mt-2 mb-6">
                  {searchQuery 
                    ? 'Essayez avec des termes différents' 
                    : 'Créez votre premier dossier pour organiser vos notes et beats'}
                </p>
                
                {!searchQuery && (
                  <Button onClick={() => setIsCreateDialogOpen(true)} className="rounded-lg shadow-sm">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Créer mon premier dossier
                  </Button>
                )}
              </div>
            )}
          </>
        )}

        {/* Create folder dialog */}
        <CreateFolderDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onSubmit={handleCreateFolder}
        />
      </div>
    </MainLayout>
  );
};

export default Folders;
