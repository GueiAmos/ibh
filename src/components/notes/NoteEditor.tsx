import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Save, 
  ArrowLeft, 
  Trash2, 
  Music, 
  Mic, 
  FileText, 
  X,
  Folder,
  Play,
  Pause,
  MoreHorizontal
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { NoteSections, SectionType } from './NoteSections';
import { LyricsSuggestions } from './LyricsSuggestions';
import { VoiceRecordingsList } from '@/components/audio/VoiceRecordingsList';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from 'framer-motion';

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
  const [allBeats, setAllBeats] = useState<Beat[]>([]);
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
    fetchBeats();
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

  const fetchBeats = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('beats')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setAllBeats(data || []);
    } catch (error: any) {
      console.error('Error fetching beats:', error);
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

  const handleBeatSelect = async (beatId: string) => {
    if (!noteId) return;
    
    try {
      const beat = allBeats.find(b => b.id === beatId);
      if (!beat) return;
      
      const { error } = await supabase
        .from('note_beats')
        .upsert({
          note_id: noteId,
          beat_id: beatId,
          is_primary: true
        });
        
      if (error) throw error;
      
      setSelectedBeat(beat);
      toast.success('Beat associé à la note');
    } catch (error: any) {
      console.error('Error selecting beat:', error);
      toast.error('Erreur lors de la sélection du beat');
    }
  };

  const handleRemoveBeat = async () => {
    if (!noteId || !selectedBeat) return;
    
    try {
      const { error } = await supabase
        .from('note_beats')
        .delete()
        .eq('note_id', noteId)
        .eq('beat_id', selectedBeat.id);
        
      if (error) throw error;
      
      setSelectedBeat(null);
      toast.success('Beat retiré de la note');
    } catch (error: any) {
      console.error('Error removing beat:', error);
      toast.error('Erreur lors de la suppression du beat');
    }
  };

  const handleFolderToggle = async (folderId: string) => {
    if (!noteId || !user) return;
    
    try {
      const isAlreadyInFolder = selectedFolderIds.includes(folderId);
      
      if (isAlreadyInFolder) {
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
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-xs text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen bg-background"
    >
      {/* Header moderne et compact */}
      <div className="sticky top-0 z-50 glass-effect border-b border-border/50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-sm font-semibold">
                {noteId ? 'Modifier la note' : 'Nouvelle note'}
              </h1>
              {selectedBeat && (
                <p className="text-xs text-muted-foreground">
                  🎵 {selectedBeat.title}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {noteId && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem 
                        className="text-destructive focus:text-destructive"
                        onSelect={(e) => e.preventDefault()}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer la note
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer la note ?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Cette action est irréversible.
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
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button 
              onClick={handleSave} 
              disabled={saving || !title.trim()} 
              size="sm"
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </Button>
          </div>
        </div>

        {/* Beat player si sélectionné */}
        {selectedBeat && (
          <div className="px-4 pb-3">
            <div className="content-card p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/20">
                  <Music className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{selectedBeat.title}</p>
                  <div className="mt-1">
                    <AudioPlayer audioSrc={selectedBeat.audio_url} minimized />
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveBeat}
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Contenu principal avec layout moderne */}
      <div className="container py-6">
        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="write" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="write" className="gap-2">
                <FileText className="h-4 w-4" />
                Écriture
              </TabsTrigger>
              <TabsTrigger value="beats" className="gap-2">
                <Music className="h-4 w-4" />
                Beats
              </TabsTrigger>
              <TabsTrigger value="audio" className="gap-2">
                <Mic className="h-4 w-4" />
                Audio
              </TabsTrigger>
            </TabsList>

            <TabsContent value="write" className="space-y-6">
              {/* Champs principaux */}
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-4">
                  <div className="content-card p-6 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-sm font-medium">Titre</Label>
                      <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Titre de votre chanson..."
                        className="text-lg font-medium bg-transparent border-none px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="content" className="text-sm font-medium">Paroles</Label>
                      <Textarea
                        id="content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Écrivez vos paroles ici..."
                        className="min-h-[400px] resize-none bg-transparent border-none px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                        rows={20}
                      />
                    </div>
                  </div>
                </div>

                {/* Panneau latéral */}
                <div className="space-y-4">
                  {/* Sections */}
                  <div className="content-card p-4">
                    <h3 className="text-sm font-semibold mb-3">Structure</h3>
                    <NoteSections onAddSection={addSection} />
                  </div>

                  {/* Assistant IA */}
                  <div className="content-card p-4">
                    <h3 className="text-sm font-semibold mb-3">Assistant IA</h3>
                    <LyricsSuggestions 
                      currentText={content}
                      onSuggestionSelect={handleSuggestionSelect}
                      context={title}
                    />
                  </div>

                  {/* Dossiers */}
                  {selectedFolderIds.length > 0 && (
                    <div className="content-card p-4">
                      <h3 className="text-sm font-semibold mb-3">Dossiers</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedFolderIds.map(id => {
                          const folder = folders.find(f => f.id === id);
                          if (!folder) return null;
                          
                          return (
                            <Badge key={folder.id} variant="secondary" className="text-xs">
                              <div className={`w-2 h-2 rounded-full bg-${folder.color}-500 mr-1`} />
                              {folder.name}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="beats" className="space-y-4">
              <div className="content-card p-6">
                <h2 className="text-lg font-semibold mb-4">Sélectionner un beat</h2>
                
                {allBeats.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted mx-auto mb-4">
                      <Music className="h-6 w-6" />
                    </div>
                    <p className="text-sm">Aucun beat disponible</p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {allBeats.map((beat) => (
                      <div 
                        key={beat.id}
                        className={`content-card p-4 transition-all hover:shadow-md ${
                          selectedBeat?.id === beat.id 
                            ? 'ring-2 ring-primary bg-primary/5' 
                            : ''
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-medium truncate flex-1 mr-2">{beat.title}</h3>
                          {selectedBeat?.id === beat.id ? (
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={handleRemoveBeat}
                            >
                              Retirer
                            </Button>
                          ) : (
                            <Button 
                              size="sm" 
                              onClick={() => handleBeatSelect(beat.id)}
                            >
                              Sélectionner
                            </Button>
                          )}
                        </div>
                        <AudioPlayer audioSrc={beat.audio_url} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="audio" className="space-y-4">
              <div className="content-card p-6">
                <h2 className="text-lg font-semibold mb-4">Enregistrements vocaux</h2>
                <VoiceRecordingsList 
                  noteId={noteId}
                  onRecordingAdded={() => {
                    toast.success('Nouvel enregistrement disponible!');
                  }}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </motion.div>
  );
}
