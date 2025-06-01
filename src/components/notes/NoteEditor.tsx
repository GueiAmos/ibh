
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, BookText, Mic, Music, ArrowLeft, Trash2, Folder } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { NoteSections, SectionType } from './NoteSections';
import { LyricsSuggestions } from './LyricsSuggestions';
import { VoiceRecordingsList } from '@/components/audio/VoiceRecordingsList';
import { BeatSelector } from './BeatSelector';
import { AudioPlayer } from '@/components/audio/AudioPlayer';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

interface NoteEditorProps {
  noteId?: string;
  initialTitle?: string;
  initialContent?: string;
  onSave?: () => void;
  onDelete?: () => void;
  onClose?: () => void;
}

interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

interface Beat {
  id: string;
  title: string;
  audio_url: string;
}

interface Folder {
  id: string;
  name: string;
  color: string;
}

export function NoteEditor({ noteId, initialTitle = '', initialContent = '', onSave, onDelete, onClose }: NoteEditorProps) {
  const [note, setNote] = useState<Note | null>(null);
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedBeat, setSelectedBeat] = useState<Beat | null>(null);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolderIds, setSelectedFolderIds] = useState<string[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (noteId) {
      fetchNote();
      fetchNoteFolders();
      fetchNoteBeat();
    }
    fetchFolders();
  }, [noteId]);

  useEffect(() => {
    setTitle(initialTitle);
    setContent(initialContent);
  }, [initialTitle, initialContent]);

  const fetchNote = async () => {
    if (!noteId || !user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('id', noteId)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      setNote(data);
      setTitle(data.title);
      setContent(data.content || '');
    } catch (error) {
      console.error('Error fetching note:', error);
      toast.error('Erreur lors du chargement de la note');
    } finally {
      setLoading(false);
    }
  };

  const fetchFolders = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('folders')
        .select('*')
        .eq('user_id', user.id)
        .order('name');
      
      if (error) throw error;
      
      setFolders(data || []);
    } catch (error: any) {
      console.error('Error fetching folders:', error);
    }
  };

  const fetchNoteFolders = async () => {
    if (!noteId || !user) return;
    
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

  const fetchNoteBeat = async () => {
    if (!noteId || !user) return;
    
    try {
      const { data, error } = await supabase
        .from('note_beats')
        .select(`
          beat_id,
          beats (
            id,
            title,
            audio_url
          )
        `)
        .eq('note_id', noteId)
        .eq('is_primary', true)
        .single();
        
      if (error) throw error;
      
      if (data && data.beats) {
        setSelectedBeat(data.beats as Beat);
      }
    } catch (error: any) {
      console.error('Error fetching note beat:', error);
    }
  };

  const handleSave = async () => {
    if (!user) {
      toast.error('Vous devez être connecté pour sauvegarder');
      return;
    }

    if (!title.trim()) {
      toast.error('Le titre est requis');
      return;
    }

    setSaving(true);
    try {
      const noteData = {
        title: title.trim(),
        content: content.trim(),
        user_id: user.id,
        updated_at: new Date().toISOString()
      };

      if (noteId) {
        const { error } = await supabase
          .from('notes')
          .update(noteData)
          .eq('id', noteId)
          .eq('user_id', user.id);

        if (error) throw error;
        toast.success('Note mise à jour avec succès!');
      } else {
        const { error } = await supabase
          .from('notes')
          .insert(noteData);

        if (error) throw error;
        toast.success('Note créée avec succès!');
      }

      onSave?.();
      onClose?.();
    } catch (error) {
      console.error('Error saving note:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!noteId || !user) return;

    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Note supprimée avec succès!');
      onDelete?.();
      onClose?.();
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const addSection = (sectionType: SectionType) => {
    const sectionText = `\n\n[${sectionType.toUpperCase()}]\n`;
    setContent(prev => prev + sectionText);
  };

  const handleSuggestionSelect = (suggestion: string) => {
    setContent(prev => {
      if (prev.trim()) {
        return prev + '\n' + suggestion;
      } else {
        return suggestion;
      }
    });
    toast.success('Suggestion ajoutée!');
  };

  const handleBeatSelected = (beatId: string | null) => {
    if (beatId) {
      toast.success('Beat sélectionné pour cette note!');
      fetchNoteBeat(); // Refresh the selected beat
    }
  };

  const handleFolderToggle = async (folderId: string) => {
    if (!noteId || !user) return;
    
    try {
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
    } catch (error: any) {
      console.error('Error updating folder:', error);
      toast.error('Erreur lors de la mise à jour du dossier');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-6">
      {/* Header with actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onClose}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-semibold">
            {noteId ? 'Modifier la note' : 'Nouvelle note'}
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
          {noteId && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-1" />
                  Supprimer
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette action ne peut pas être annulée. Cette note sera supprimée définitivement.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>
                    Supprimer
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          
          <Button 
            onClick={handleSave} 
            disabled={saving || !title.trim()}
            size="sm"
          >
            <Save className="h-4 w-4 mr-1" />
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </div>
      </div>

      {/* Beat player section */}
      {selectedBeat && (
        <div className="border rounded-lg p-4 bg-background/50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Music className="h-4 w-4 text-primary" />
              <span className="font-medium">Beat principal: {selectedBeat.title}</span>
            </div>
          </div>
          <AudioPlayer audioSrc={selectedBeat.audio_url} />
        </div>
      )}

      {/* Folder selector dropdown */}
      {noteId && folders.length > 0 && (
        <div className="border rounded-lg p-4 bg-background/50">
          <div className="flex items-center gap-4">
            <Folder className="h-4 w-4 text-primary" />
            <Label className="font-medium">Dossiers :</Label>
            <Select onValueChange={handleFolderToggle}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Ajouter/retirer d'un dossier..." />
              </SelectTrigger>
              <SelectContent>
                {folders.map((folder) => (
                  <SelectItem key={folder.id} value={folder.id}>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full bg-${folder.color}-500`} />
                      {folder.name}
                      {selectedFolderIds.includes(folder.id) && " ✓"}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {selectedFolderIds.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedFolderIds.map(id => {
                const folder = folders.find(f => f.id === id);
                if (!folder) return null;
                
                return (
                  <div 
                    key={folder.id}
                    className={`rounded-full px-3 py-1 text-sm flex items-center gap-1 bg-${folder.color}-100 text-${folder.color}-800 dark:bg-${folder.color}-900/30 dark:text-${folder.color}-300`}
                  >
                    <div className={`w-2 h-2 rounded-full bg-${folder.color}-500`} />
                    {folder.name}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Main content area */}
      <div className="w-full">
        <Tabs defaultValue="notes" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="notes" className="flex items-center gap-2">
              <BookText className="h-4 w-4" />
              Notes
            </TabsTrigger>
            <TabsTrigger value="recording" className="flex items-center gap-2">
              <Mic className="h-4 w-4" />
              Enregistrement
            </TabsTrigger>
            <TabsTrigger value="beats" className="flex items-center gap-2">
              <Music className="h-4 w-4" />
              Beats
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="notes" className="mt-4 space-y-4">
            <div>
              <Label htmlFor="title">Titre</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Titre de votre chanson..."
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="content">Paroles</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Écrivez vos paroles ici..."
                className="mt-1 min-h-[400px] resize-none"
                rows={20}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Sections</Label>
                <div className="mt-2">
                  <NoteSections onAddSection={addSection} />
                </div>
              </div>

              <div>
                <Label>Assistant IA</Label>
                <div className="mt-2">
                  <LyricsSuggestions 
                    currentText={content}
                    onSuggestionSelect={handleSuggestionSelect}
                    context={title}
                  />
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="recording" className="mt-4">
            <VoiceRecordingsList 
              noteId={noteId}
              onRecordingAdded={() => {
                toast.success('Nouvel enregistrement disponible!');
              }}
            />
          </TabsContent>
          
          <TabsContent value="beats" className="mt-4">
            <BeatSelector 
              noteId={noteId}
              onBeatSelected={handleBeatSelected}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
