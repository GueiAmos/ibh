
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Folder, Plus, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from '@/lib/utils';

interface FolderType {
  id: string;
  name: string;
  color: string;
  created_at: string;
}

interface FolderSelectorProps {
  noteId?: string;
  onFolderSelected?: (folderId: string | null) => void;
}

export function FolderSelector({ noteId, onFolderSelected }: FolderSelectorProps) {
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [selectedFolderIds, setSelectedFolderIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();
  
  // Fetch all folders
  useEffect(() => {
    const fetchFolders = async () => {
      if (!user) return;
      
      try {
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

  // Fetch note's current folders
  useEffect(() => {
    if (!noteId || !user) return;
    
    const fetchNoteFolders = async () => {
      try {
        const { data, error } = await supabase
          .from('folder_items')
          .select('folder_id')
          .eq('item_id', noteId)
          .eq('item_type', 'note');
          
        if (error) throw error;
        
        const folderIds = data.map(item => item.folder_id);
        setSelectedFolderIds(folderIds);
      } catch (error: any) {
        console.error('Error fetching note folders:', error);
      }
    };
    
    fetchNoteFolders();
  }, [noteId, user]);

  const handleAddToFolder = async (folderId: string) => {
    if (!noteId || !user) return;
    
    try {
      // Check if note is already in this folder
      const isAlreadyInFolder = selectedFolderIds.includes(folderId);
      
      if (isAlreadyInFolder) {
        // Remove from folder
        const { error } = await supabase
          .from('folder_items')
          .delete()
          .eq('folder_id', folderId)
          .eq('item_id', noteId)
          .eq('item_type', 'note');
          
        if (error) throw error;
        
        setSelectedFolderIds(prev => prev.filter(id => id !== folderId));
        toast.success('Note retirée du dossier');
      } else {
        // Add to folder
        const { error } = await supabase
          .from('folder_items')
          .insert({
            folder_id: folderId,
            item_id: noteId,
            item_type: 'note'
          });
          
        if (error) throw error;
        
        setSelectedFolderIds(prev => [...prev, folderId]);
        toast.success('Note ajoutée au dossier');
      }
      
      if (onFolderSelected) {
        onFolderSelected(folderId);
      }
    } catch (error: any) {
      console.error('Error updating folder:', error);
      toast.error('Erreur lors de la mise à jour du dossier');
    }
  };
  
  // Filter folders by search query
  const filteredFolders = searchQuery.trim() === ''
    ? folders
    : folders.filter(folder => 
        folder.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Dossiers associés</h3>
        <Dialog>
          <DialogTrigger asChild>
            <Button 
              size="sm" 
              variant="outline"
            >
              <Folder className="mr-1 h-4 w-4" />
              Gérer les dossiers
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Associer à des dossiers</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Input
                placeholder="Rechercher un dossier..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              
              {loading ? (
                <div className="text-center py-4">
                  Chargement des dossiers...
                </div>
              ) : filteredFolders.length === 0 ? (
                <div className="text-center py-8">
                  <Folder className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p>Aucun dossier trouvé</p>
                </div>
              ) : (
                <div className="max-h-[300px] overflow-y-auto space-y-2">
                  {filteredFolders.map((folder) => {
                    const isSelected = selectedFolderIds.includes(folder.id);
                    return (
                      <div 
                        key={folder.id}
                        className={cn(
                          "border rounded-md p-3 flex items-center justify-between cursor-pointer transition-colors",
                          isSelected ? `bg-${folder.color}-50 border-${folder.color}-200 dark:bg-${folder.color}-900/20 dark:border-${folder.color}-700/30` : "bg-background"
                        )}
                        onClick={() => handleAddToFolder(folder.id)}
                      >
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "w-3 h-3 rounded-full",
                            `bg-${folder.color}-500`
                          )} />
                          <div className="font-medium">{folder.name}</div>
                        </div>
                        <Button 
                          size="sm" 
                          variant={isSelected ? "default" : "outline"}
                          className="h-8"
                        >
                          {isSelected ? (
                            <>
                              <X className="h-4 w-4 mr-1" />
                              Retirer
                            </>
                          ) : (
                            <>
                              <Plus className="h-4 w-4 mr-1" />
                              Ajouter
                            </>
                          )}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <DialogClose asChild>
              <Button className="w-full">Terminer</Button>
            </DialogClose>
          </DialogContent>
        </Dialog>
      </div>
      
      {selectedFolderIds.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {selectedFolderIds.map(id => {
            const folder = folders.find(f => f.id === id);
            if (!folder) return null;
            
            return (
              <div 
                key={folder.id}
                className={cn(
                  "rounded-full px-3 py-1 text-sm flex items-center gap-1",
                  `bg-${folder.color}-100 text-${folder.color}-800 dark:bg-${folder.color}-900/30 dark:text-${folder.color}-300`
                )}
              >
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  `bg-${folder.color}-500`
                )} />
                {folder.name}
                <X 
                  className="h-3 w-3 ml-1 cursor-pointer" 
                  onClick={() => handleAddToFolder(folder.id)}
                />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-4 text-sm text-muted-foreground">
          Cette note n'est associée à aucun dossier
        </div>
      )}
    </div>
  );
}
