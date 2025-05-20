import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { NoteItem, Note } from '@/components/notes/NoteItem';
import { AudioPlayer } from '@/components/audio/AudioPlayer';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Trash2, ArrowLeft, Loader2 } from 'lucide-react';
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
import { motion } from 'framer-motion';
import { FolderItem } from '@/types/folders';

interface Beat {
  id: string;
  title: string;
  audio_url: string;
  created_at: string;
}

interface FolderContentProps {
  folderId: string;
  folderName: string;
  onBack: () => void;
  onItemDeleted: () => void;
}

export const FolderContent = ({ folderId, folderName, onBack, onItemDeleted }: FolderContentProps) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [beats, setBeats] = useState<Beat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFolderContent = async () => {
      setLoading(true);
      
      try {
        // Fetch notes in this folder
        const { data: noteItems, error: notesError } = await supabase
          .from('folder_items')
          .select('*')
          .eq('folder_id', folderId)
          .eq('item_type', 'note');
          
        if (notesError) throw notesError;
        
        if (noteItems?.length) {
          const noteIds = noteItems.map((item: FolderItem) => item.item_id);
          
          const { data: notesContent, error: notesContentError } = await supabase
            .from('notes')
            .select('*')
            .in('id', noteIds);
            
          if (notesContentError) throw notesContentError;
          
          const formattedNotes = notesContent?.map((note) => ({
            id: note.id,
            title: note.title,
            content: note.content || '',
            createdAt: new Date(note.created_at),
            updatedAt: new Date(note.updated_at),
            favorite: false,
            audioAttached: !!note.audio_url,
            sections: []
          })) || [];
          
          setNotes(formattedNotes);
        }
        
        // Fetch beats in this folder
        const { data: beatItems, error: beatsError } = await supabase
          .from('folder_items')
          .select('*')
          .eq('folder_id', folderId)
          .eq('item_type', 'beat');
          
        if (beatsError) throw beatsError;
        
        if (beatItems?.length) {
          const beatIds = beatItems.map((item: FolderItem) => item.item_id);
          
          const { data: beatsContent, error: beatsContentError } = await supabase
            .from('beats')
            .select('*')
            .in('id', beatIds);
            
          if (beatsContentError) throw beatsContentError;
          
          setBeats(beatsContent || []);
        }
      } catch (error: any) {
        console.error('Error fetching folder content:', error);
        toast.error('Erreur lors du chargement du contenu du dossier');
      } finally {
        setLoading(false);
      }
    };
    
    fetchFolderContent();
  }, [folderId]);
  
  const handleDeleteNote = async (noteId: string) => {
    try {
      // First remove from folder
      const { error: folderItemError } = await supabase
        .from('folder_items')
        .delete()
        .eq('folder_id', folderId)
        .eq('item_id', noteId)
        .eq('item_type', 'note');
        
      if (folderItemError) throw folderItemError;
      
      // Then delete the note itself
      const { error: noteError } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId);
        
      if (noteError) throw noteError;
      
      setNotes(notes.filter(note => note.id !== noteId));
      toast.success('Note supprimée');
      onItemDeleted();
    } catch (error: any) {
      console.error('Error deleting note:', error);
      toast.error('Erreur lors de la suppression de la note');
    }
  };
  
  const handleDeleteBeat = async (beatId: string) => {
    try {
      // First remove from folder
      const { error: folderItemError } = await supabase
        .from('folder_items')
        .delete()
        .eq('folder_id', folderId)
        .eq('item_id', beatId)
        .eq('item_type', 'beat');
        
      if (folderItemError) throw folderItemError;
      
      // Then delete the beat itself
      const { error: beatError } = await supabase
        .from('beats')
        .delete()
        .eq('id', beatId);
        
      if (beatError) throw beatError;
      
      setBeats(beats.filter(beat => beat.id !== beatId));
      toast.success('Beat supprimé');
      onItemDeleted();
    } catch (error: any) {
      console.error('Error deleting beat:', error);
      toast.error('Erreur lors de la suppression du beat');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="group">
          <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Retour aux dossiers
        </Button>
        <h2 className="text-2xl font-bold">{folderName}</h2>
      </div>
      
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Chargement du contenu...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {notes.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Notes ({notes.length})</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {notes.map((note) => (
                  <div key={note.id} className="relative">
                    <NoteItem
                      note={note}
                      onClick={() => {}}
                      isSelected={false}
                      index={0}
                    />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="destructive" 
                          size="icon" 
                          className="absolute top-2 right-2 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Êtes-vous sûr?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Cette action ne peut pas être annulée. Cette note sera supprimée définitivement.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDeleteNote(note.id)} 
                            className="bg-red-500 hover:bg-red-600"
                          >
                            Supprimer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {beats.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Beats ({beats.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {beats.map((beat) => (
                  <motion.div 
                    key={beat.id} 
                    className="glass-panel p-5 rounded-xl hover:shadow-md transition-all relative group"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <h3 className="font-medium text-lg mb-3 truncate pr-10">{beat.title}</h3>
                    <AudioPlayer audioSrc={beat.audio_url} />
                    <p className="text-xs text-muted-foreground mt-2">
                      Ajouté le {new Date(beat.created_at).toLocaleDateString()}
                    </p>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="destructive" 
                          size="icon" 
                          className="absolute top-3 right-3 h-8 w-8 rounded-full"
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
                  </motion.div>
                ))}
              </div>
            </div>
          )}
          
          {notes.length === 0 && beats.length === 0 && (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">Ce dossier est vide</p>
              <p className="text-sm text-muted-foreground mt-2">
                Ajoutez des notes ou des beats depuis leurs pages respectives
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
