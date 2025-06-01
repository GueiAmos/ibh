
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Save, BookText, Mic, Music, ArrowLeft, Trash2, Folder, Play, Pause, X } from 'lucide-react';
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
  const [activeSection, setActiveSection] = useState<'notes' | 'beats' | 'recordings'>('notes');
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={onClose}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold">
                  {noteId ? 'Modifier la note' : 'Nouvelle note'}
                </h1>
                {selectedBeat && (
                  <p className="text-sm text-muted-foreground">
                    Beat: {selectedBeat.title}
                  </p>
                )}
              </div>
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
              
              <Button onClick={handleSave} disabled={saving || !title.trim()} size="sm">
                <Save className="h-4 w-4 mr-1" />
                {saving ? 'Sauvegarde...' : 'Sauvegarder'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar - Navigation */}
          <div className="col-span-2">
            <div className="space-y-2">
              <Button
                variant={activeSection === 'notes' ? 'default' : 'ghost'}
                onClick={() => setActiveSection('notes')}
                className="w-full justify-start"
              >
                <BookText className="h-4 w-4 mr-2" />
                Notes
              </Button>
              <Button
                variant={activeSection === 'beats' ? 'default' : 'ghost'}
                onClick={() => setActiveSection('beats')}
                className="w-full justify-start"
              >
                <Music className="h-4 w-4 mr-2" />
                Beats
              </Button>
              <Button
                variant={activeSection === 'recordings' ? 'default' : 'ghost'}
                onClick={() => setActiveSection('recordings')}
                className="w-full justify-start"
              >
                <Mic className="h-4 w-4 mr-2" />
                Enregistrements
              </Button>
            </div>

            {/* Beat Player */}
            {selectedBeat && (
              <Card className="mt-6">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Music className="h-4 w-4" />
                      Beat principal
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveBeat}
                      className="h-6 w-6 p-0 text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {selectedBeat.title}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <AudioPlayer audioSrc={selectedBeat.audio_url} minimized />
                </CardContent>
              </Card>
            )}

            {/* Folders */}
            {noteId && folders.length > 0 && (
              <Card className="mt-6">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Folder className="h-4 w-4" />
                    Dossiers
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <Select onValueChange={handleFolderToggle}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Gérer les dossiers..." />
                    </SelectTrigger>
                    <SelectContent>
                      {folders.map((folder) => (
                        <SelectItem key={folder.id} value={folder.id}>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full bg-${folder.color}-500`} />
                            {folder.name}
                            {selectedFolderIds.includes(folder.id) && " ✓"}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedFolderIds.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {selectedFolderIds.map(id => {
                        const folder = folders.find(f => f.id === id);
                        if (!folder) return null;
                        
                        return (
                          <Badge key={folder.id} variant="secondary" className="text-xs">
                            {folder.name}
                          </Badge>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Content Area */}
          <div className="col-span-10">
            {activeSection === 'notes' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Informations de la note</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
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
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Sections</CardTitle>
                      <CardDescription>Ajoutez des sections à vos paroles</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <NoteSections onAddSection={addSection} />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Assistant IA</CardTitle>
                      <CardDescription>Suggestions pour compléter vos paroles</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <LyricsSuggestions 
                        currentText={content}
                        onSuggestionSelect={handleSuggestionSelect}
                        context={title}
                      />
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeSection === 'beats' && (
              <Card>
                <CardHeader>
                  <CardTitle>Gestion des beats</CardTitle>
                  <CardDescription>Sélectionnez un beat pour accompagner votre note</CardDescription>
                </CardHeader>
                <CardContent>
                  {allBeats.length === 0 ? (
                    <div className="text-center py-8">
                      <Music className="h-12 w-12 mx-auto mb-2 opacity-20" />
                      <p>Aucun beat disponible</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {allBeats.map((beat) => (
                        <div 
                          key={beat.id}
                          className={`border rounded-lg p-4 ${
                            selectedBeat?.id === beat.id 
                              ? 'border-primary bg-primary/5' 
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-medium">{beat.title}</div>
                            <div className="flex gap-2">
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
                          </div>
                          <AudioPlayer audioSrc={beat.audio_url} />
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {activeSection === 'recordings' && (
              <Card>
                <CardHeader>
                  <CardTitle>Enregistrements vocaux</CardTitle>
                  <CardDescription>Gérez vos enregistrements vocaux pour cette note</CardDescription>
                </CardHeader>
                <CardContent>
                  <VoiceRecordingsList 
                    noteId={noteId}
                    onRecordingAdded={() => {
                      toast.success('Nouvel enregistrement disponible!');
                    }}
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
