
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { NotesGrid } from '@/components/notes/NotesGrid';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, Music, BookText, Plus } from 'lucide-react';
import { Note } from '@/components/notes/NoteItem';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Beat = {
  id: string;
  title: string;
  audio_url: string;
  created_at: string;
};

export function FolderContent() {
  const { folderId } = useParams<{ folderId: string }>();
  const [folder, setFolder] = useState<{ id: string; name: string; color: string } | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [beats, setBeats] = useState<Beat[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingItem, setAddingItem] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [availableNotes, setAvailableNotes] = useState<Note[]>([]);
  const [availableBeats, setAvailableBeats] = useState<Beat[]>([]);
  const [activeItemType, setActiveItemType] = useState<'notes' | 'beats'>('notes');
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch folder details and items
  useEffect(() => {
    const fetchFolderAndItems = async () => {
      if (!user || !folderId) return;
      
      setLoading(true);
      
      try {
        // Fetch folder details
        const { data: folderData, error: folderError } = await supabase
          .from('folders')
          .select('id, name, color')
          .eq('id', folderId)
          .single();
          
        if (folderError) throw folderError;
        
        setFolder(folderData);
        
        // Fetch notes in this folder
        const { data: folderNotes, error: notesError } = await (supabase as any)
          .from('folder_items')
          .select(`
            item_id,
            notes:item_id (*)
          `)
          .eq('folder_id', folderId)
          .eq('item_type', 'note');
          
        if (notesError) throw notesError;
        
        if (folderNotes && folderNotes.length > 0) {
          const formattedNotes = folderNotes
            .map(item => {
              if (item.notes) {
                return {
                  id: item.notes.id,
                  title: item.notes.title,
                  content: item.notes.content || '',
                  createdAt: new Date(item.notes.created_at),
                  updatedAt: new Date(item.notes.updated_at),
                  favorite: false,
                  audioAttached: !!item.notes.audio_url,
                  sections: []
                };
              }
              return null;
            })
            .filter(Boolean) as Note[];
            
          setNotes(formattedNotes);
        }
        
        // Fetch beats in this folder
        const { data: folderBeats, error: beatsError } = await (supabase as any)
          .from('folder_items')
          .select(`
            item_id,
            beats:item_id (*)
          `)
          .eq('folder_id', folderId)
          .eq('item_type', 'beat');
          
        if (beatsError) throw beatsError;
        
        if (folderBeats && folderBeats.length > 0) {
          const formattedBeats = folderBeats
            .map(item => item.beats)
            .filter(Boolean) as Beat[];
            
          setBeats(formattedBeats);
        }
        
        // Fetch available notes (not in this folder)
        const { data: allNotes, error: allNotesError } = await supabase
          .from('notes')
          .select('*')
          .eq('user_id', user.id);
          
        if (allNotesError) throw allNotesError;
        
        if (allNotes) {
          const noteIds = new Set(folderNotes?.map(note => note.item_id) || []);
          
          const availableFormattedNotes = allNotes
            .filter(note => !noteIds.has(note.id))
            .map(note => ({
              id: note.id,
              title: note.title,
              content: note.content || '',
              createdAt: new Date(note.created_at),
              updatedAt: new Date(note.updated_at),
              favorite: false,
              audioAttached: !!note.audio_url,
              sections: []
            }));
            
          setAvailableNotes(availableFormattedNotes);
        }
        
        // Fetch available beats (not in this folder)
        const { data: allBeats, error: allBeatsError } = await supabase
          .from('beats')
          .select('*')
          .eq('user_id', user.id);
          
        if (allBeatsError) throw allBeatsError;
        
        if (allBeats) {
          const beatIds = new Set(folderBeats?.map(beat => beat.item_id) || []);
          const availableFormattedBeats = allBeats.filter(beat => !beatIds.has(beat.id));
          setAvailableBeats(availableFormattedBeats);
        }
        
      } catch (error: any) {
        console.error('Error fetching folder data:', error);
        toast.error(`Erreur lors du chargement du dossier: ${error.message}`);
        navigate('/folders');
      } finally {
        setLoading(false);
      }
    };
    
    fetchFolderAndItems();
  }, [folderId, user, navigate]);
  
  const handleAddItemToFolder = async () => {
    if (!selectedItemId || !folderId || !user) return;
    
    setAddingItem(true);
    
    try {
      const itemType = activeItemType === 'notes' ? 'note' : 'beat';
      
      // Add item to folder
      const { error } = await (supabase as any)
        .from('folder_items')
        .insert({
          folder_id: folderId,
          item_id: selectedItemId,
          item_type: itemType
        });
        
      if (error) throw error;
      
      toast.success(
        activeItemType === 'notes' 
          ? 'Note ajoutée au dossier' 
          : 'Beat ajouté au dossier'
      );
      
      // Refresh the folder contents
      if (activeItemType === 'notes') {
        const selectedNote = availableNotes.find(note => note.id === selectedItemId);
        if (selectedNote) {
          setNotes([...notes, selectedNote]);
          setAvailableNotes(availableNotes.filter(note => note.id !== selectedItemId));
        }
      } else {
        const selectedBeat = availableBeats.find(beat => beat.id === selectedItemId);
        if (selectedBeat) {
          setBeats([...beats, selectedBeat]);
          setAvailableBeats(availableBeats.filter(beat => beat.id !== selectedItemId));
        }
      }
      
      setSelectedItemId('');
      
    } catch (error: any) {
      console.error('Error adding item to folder:', error);
      toast.error(`Erreur lors de l'ajout de l'élément: ${error.message}`);
    } finally {
      setAddingItem(false);
    }
  };

  const handleNoteSelect = (note: Note) => {
    navigate(`/notes?note=${note.id}`);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Chargement du dossier...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/folders')} 
          className="mb-4 group"
        >
          <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Retour aux dossiers
        </Button>
        
        <h1 
          className="text-2xl md:text-3xl font-bold flex items-center"
          style={{ color: folder?.color === 'purple' ? 'rgb(147, 51, 234)' : 
                          folder?.color === 'blue' ? 'rgb(59, 130, 246)' :
                          folder?.color === 'green' ? 'rgb(34, 197, 94)' :
                          folder?.color === 'orange' ? 'rgb(249, 115, 22)' : 
                          'inherit' }}
        >
          {folder?.name || 'Dossier'}
        </h1>
      </div>
      
      <div className="flex justify-between mb-4">
        <Tabs defaultValue="notes" onValueChange={(v) => setActiveItemType(v as 'notes' | 'beats')}>
          <TabsList>
            <TabsTrigger value="notes" className="flex items-center">
              <BookText className="h-4 w-4 mr-1" />
              Notes
            </TabsTrigger>
            <TabsTrigger value="beats" className="flex items-center">
              <Music className="h-4 w-4 mr-1" />
              Beats
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Ajouter
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {activeItemType === 'notes' ? 'Ajouter une note' : 'Ajouter un beat'}
              </AlertDialogTitle>
              <AlertDialogDescription>
                Sélectionnez {activeItemType === 'notes' ? 'une note' : 'un beat'} à ajouter à ce dossier.
              </AlertDialogDescription>
            </AlertDialogHeader>
            
            <div className="py-4">
              {activeItemType === 'notes' ? (
                <Select value={selectedItemId} onValueChange={setSelectedItemId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une note" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Notes disponibles</SelectLabel>
                      {availableNotes.length === 0 ? (
                        <SelectItem value="none" disabled>Aucune note disponible</SelectItem>
                      ) : (
                        availableNotes.map(note => (
                          <SelectItem key={note.id} value={note.id}>
                            {note.title}
                          </SelectItem>
                        ))
                      )}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              ) : (
                <Select value={selectedItemId} onValueChange={setSelectedItemId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un beat" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Beats disponibles</SelectLabel>
                      {availableBeats.length === 0 ? (
                        <SelectItem value="none" disabled>Aucun beat disponible</SelectItem>
                      ) : (
                        availableBeats.map(beat => (
                          <SelectItem key={beat.id} value={beat.id}>
                            {beat.title}
                          </SelectItem>
                        ))
                      )}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            </div>
            
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleAddItemToFolder} 
                disabled={!selectedItemId || addingItem}
              >
                {addingItem ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Ajout en cours...
                  </>
                ) : (
                  'Ajouter'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <Tabs.TabsContent value="notes">
        {notes.length > 0 ? (
          <NotesGrid notes={notes} onNoteSelect={handleNoteSelect} />
        ) : (
          <div className="glass-panel text-center py-10 rounded-xl">
            <BookText className="mx-auto h-12 w-12 text-muted-foreground opacity-30 mb-4" />
            <h3 className="text-lg font-medium">Aucune note dans ce dossier</h3>
            <p className="text-muted-foreground mt-2 mb-4">
              Ajoutez des notes à ce dossier pour les organiser.
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter une note
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Ajouter une note</AlertDialogTitle>
                  <AlertDialogDescription>
                    Sélectionnez une note à ajouter à ce dossier.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                
                <div className="py-4">
                  <Select value={selectedItemId} onValueChange={setSelectedItemId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une note" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Notes disponibles</SelectLabel>
                        {availableNotes.length === 0 ? (
                          <SelectItem value="none" disabled>Aucune note disponible</SelectItem>
                        ) : (
                          availableNotes.map(note => (
                            <SelectItem key={note.id} value={note.id}>
                              {note.title}
                            </SelectItem>
                          ))
                        )}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleAddItemToFolder} 
                    disabled={!selectedItemId || addingItem}
                  >
                    {addingItem ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Ajout en cours...
                      </>
                    ) : (
                      'Ajouter'
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </Tabs.TabsContent>
      
      <Tabs.TabsContent value="beats">
        {beats.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {beats.map((beat) => (
              <div key={beat.id} className="glass-panel p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-2">{beat.title}</h3>
                <audio
                  controls
                  src={beat.audio_url}
                  className="w-full mt-2"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-panel text-center py-10 rounded-xl">
            <Music className="mx-auto h-12 w-12 text-muted-foreground opacity-30 mb-4" />
            <h3 className="text-lg font-medium">Aucun beat dans ce dossier</h3>
            <p className="text-muted-foreground mt-2 mb-4">
              Ajoutez des beats à ce dossier pour les organiser.
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter un beat
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Ajouter un beat</AlertDialogTitle>
                  <AlertDialogDescription>
                    Sélectionnez un beat à ajouter à ce dossier.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                
                <div className="py-4">
                  <Select value={selectedItemId} onValueChange={setSelectedItemId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un beat" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Beats disponibles</SelectLabel>
                        {availableBeats.length === 0 ? (
                          <SelectItem value="none" disabled>Aucun beat disponible</SelectItem>
                        ) : (
                          availableBeats.map(beat => (
                            <SelectItem key={beat.id} value={beat.id}>
                              {beat.title}
                            </SelectItem>
                          ))
                        )}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleAddItemToFolder} 
                    disabled={!selectedItemId || addingItem}
                  >
                    {addingItem ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Ajout en cours...
                      </>
                    ) : (
                      'Ajouter'
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </Tabs.TabsContent>
    </div>
  );
}
