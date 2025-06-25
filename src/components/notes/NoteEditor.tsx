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
  Play, 
  Pause, 
  X,
  ChevronDown,
  Folder,
  Plus
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
  Card,
  CardContent,
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
  const [activeTab, setActiveTab] = useState<'notes' | 'beats' | 'recordings'>('notes');
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

  const tabItems = [
    { id: 'notes', label: 'Texte', icon: FileText },
    { id: 'beats', label: 'Beats', icon: Music },
    { id: 'recordings', label: 'Audio', icon: Mic },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header moderne et compact */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex flex-col">
              <h1 className="text-sm font-medium leading-tight">
                {noteId ? 'Modifier' : 'Nouvelle note'}
              </h1>
              {selectedBeat && (
                <p className="text-xs text-muted-foreground">
                  🎵 {selectedBeat.title}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            {/* Sélecteur de dossiers compact */}
            {noteId && folders.length > 0 && (
              <Select onValueChange={handleFolderToggle}>
                <SelectTrigger className="h-7 w-7 p-0 border-0">
                  <Folder className="h-3 w-3" />
                </SelectTrigger>
                <SelectContent>
                  {folders.map((folder) => (
                    <SelectItem key={folder.id} value={folder.id}>
                      <div className="flex items-center gap-2 text-xs">
                        <div className={`w-2 h-2 rounded-full bg-${folder.color}-500`} />
                        {folder.name}
                        {selectedFolderIds.includes(folder.id) && " ✓"}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {noteId && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive">
                    <Trash2 className="h-3 w-3" />
                  </Button>
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
            
            <Button 
              onClick={handleSave} 
              disabled={saving || !title.trim()} 
              size="sm"
              className="h-7 px-2 text-xs"
            >
              <Save className="h-3 w-3 mr-1" />
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </Button>
          </div>
        </div>

        {/* Beat player compact en haut */}
        {selectedBeat && (
          <div className="px-3 pb-2">
            <div className="flex items-center gap-2 bg-primary/5 rounded-lg p-2">
              <Music className="h-3 w-3 text-primary" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{selectedBeat.title}</p>
                <div className="mt-1">
                  <AudioPlayer audioSrc={selectedBeat.audio_url} minimized />
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveBeat}
                className="h-6 w-6 p-0 text-destructive"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}

        {/* Navigation par onglets stylisée */}
        <div className="flex border-t bg-muted/30">
          {tabItems.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-primary bg-background border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                }`}
              >
                <Icon className="h-3 w-3" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Contenu principal avec espacements réduits */}
      <div className="p-3 space-y-3">
        {activeTab === 'notes' && (
          <div className="space-y-3">
            {/* Champs de base */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-xs font-medium">Titre</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Titre de votre chanson..."
                className="text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content" className="text-xs font-medium">Paroles</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Écrivez vos paroles ici..."
                className="min-h-[250px] text-sm resize-none"
                rows={12}
              />
            </div>

            {/* Sections et IA dans des cartes compactes */}
            <div className="grid gap-3 md:grid-cols-2">
              <Card className="border-0 bg-muted/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Plus className="h-3 w-3" />
                    Sections
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <NoteSections onAddSection={addSection} />
                </CardContent>
              </Card>

              <Card className="border-0 bg-muted/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    ✨ Assistant IA
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <LyricsSuggestions 
                    currentText={content}
                    onSuggestionSelect={handleSuggestionSelect}
                    context={title}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Dossiers sélectionnés */}
            {selectedFolderIds.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs font-medium">Dossiers</Label>
                <div className="flex flex-wrap gap-1">
                  {selectedFolderIds.map(id => {
                    const folder = folders.find(f => f.id === id);
                    if (!folder) return null;
                    
                    return (
                      <Badge key={folder.id} variant="secondary" className="text-xs h-5">
                        <div className={`w-2 h-2 rounded-full bg-${folder.color}-500 mr-1`} />
                        {folder.name}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'beats' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <Music className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-medium">Sélectionner un beat</h2>
            </div>
            
            {allBeats.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Music className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Aucun beat disponible</p>
              </div>
            ) : (
              <div className="space-y-2">
                {allBeats.map((beat) => (
                  <div 
                    key={beat.id}
                    className={`border rounded-lg p-3 transition-colors ${
                      selectedBeat?.id === beat.id 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50 hover:bg-muted/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-medium truncate flex-1 mr-2">{beat.title}</div>
                      <div className="flex gap-1">
                        {selectedBeat?.id === beat.id ? (
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={handleRemoveBeat}
                            className="h-6 px-2 text-xs"
                          >
                            Retirer
                          </Button>
                        ) : (
                          <Button 
                            size="sm" 
                            onClick={() => handleBeatSelect(beat.id)}
                            className="h-6 px-2 text-xs"
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
          </div>
        )}

        {activeTab === 'recordings' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <Mic className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-medium">Enregistrements vocaux</h2>
            </div>
            
            <VoiceRecordingsList 
              noteId={noteId}
              onRecordingAdded={() => {
                toast.success('Nouvel enregistrement disponible!');
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
