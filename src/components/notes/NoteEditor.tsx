
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, ArrowLeft, BookText, Mic, Music } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { NoteSections, SectionType } from './NoteSections';
import { LyricsSuggestions } from './LyricsSuggestions';
import { VoiceRecorder } from '@/components/audio/VoiceRecorder';
import { BeatSelector } from './BeatSelector';

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

export function NoteEditor({ noteId, initialTitle = '', initialContent = '', onSave, onDelete, onClose }: NoteEditorProps) {
  const [note, setNote] = useState<Note | null>(null);
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (noteId) {
      fetchNote();
    }
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

  const handleRecordingComplete = (audioBlob: Blob) => {
    toast.success('Enregistrement terminé! Vous pouvez l\'ajouter à votre note.');
  };

  const handleBeatSelect = (beatId: string, beatTitle: string) => {
    toast.success(`Beat "${beatTitle}" sélectionné pour cette note!`);
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
    <div className="space-y-6">
      {onClose && (
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={onClose}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={saving || !title.trim()}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </div>
      )}

      <div className="space-y-4">
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
          </TabsContent>
          
          <TabsContent value="recording" className="mt-4">
            <div>
              <Label>Enregistrement vocal</Label>
              <div className="mt-2">
                <VoiceRecorder 
                  onRecordingComplete={handleRecordingComplete}
                  className="border rounded-lg p-4 bg-background/50" 
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="beats" className="mt-4">
            <div>
              <Label>Sélectionner un beat</Label>
              <div className="mt-2">
                <BeatSelector 
                  onBeatSelect={handleBeatSelect}
                  selectedBeatId={null}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {!onClose && (
          <div className="flex justify-end">
            <Button 
              onClick={handleSave} 
              disabled={saving || !title.trim()}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
