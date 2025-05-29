
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { VoiceRecorder } from '@/components/audio/VoiceRecorder';
import { VoiceRecordingsList } from '@/components/audio/VoiceRecordingsList';
import { BeatSelector } from '@/components/notes/BeatSelector';
import { NoteSections, SectionType } from '@/components/notes/NoteSections';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Music, Loader2, Trash2 } from 'lucide-react';

interface NoteEditorProps {
  noteId?: string;
  initialTitle?: string;
  initialContent?: string;
  className?: string;
  onSave?: (title: string, content: string, audioUrl?: string) => Promise<void>;
  onDelete?: () => Promise<void>;
  onClose?: () => void;
}

export function NoteEditor({ noteId, initialTitle = '', initialContent = '', className, onSave, onDelete, onClose }: NoteEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [currentContent, setCurrentContent] = useState(initialContent || '');
  const [activeTab, setActiveTab] = useState<'write' | 'record' | 'beats'>('write');
  const [quickRecording, setQuickRecording] = useState<Blob | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedBeatId, setSelectedBeatId] = useState<string | null>(null);
  const [selectedBeat, setSelectedBeat] = useState<any | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchNote = async () => {
      if (noteId) {
        try {
          // Fetch the note
          const { data: noteData, error: noteError } = await supabase
            .from('notes')
            .select('*')
            .eq('id', noteId)
            .single();

          if (noteError) throw noteError;

          if (noteData) {
            setTitle(noteData.title);
            setCurrentContent(noteData.content || '');
            
            // Fetch associated beat if any
            const { data: beatData, error: beatError } = await supabase
              .from('note_beats')
              .select('beat_id')
              .eq('note_id', noteId)
              .eq('is_primary', true)
              .single();
              
            if (!beatError && beatData) {
              setSelectedBeatId(beatData.beat_id);
              
              // Fetch the beat details
              const { data: beat, error: beatDetailsError } = await supabase
                .from('beats')
                .select('*')
                .eq('id', beatData.beat_id)
                .single();
                
              if (!beatDetailsError && beat) {
                setSelectedBeat(beat);
              }
            }
          }
        } catch (error) {
          console.error('Error fetching note:', error);
          toast.error('Erreur lors du chargement de la note');
        }
      }
    };

    fetchNote();
  }, [noteId]);

  const handleRecordingComplete = async (blob: Blob) => {
    setQuickRecording(blob);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Veuillez ajouter un titre à votre note');
      return;
    }

    if (!user) {
      toast.error('Vous devez être connecté pour enregistrer une note');
      return;
    }

    setSaving(true);

    try {
      // Create or update note
      let currentNoteId = noteId;
      
      if (onSave) {
        await onSave(title, currentContent, undefined);
      } else {
        if (noteId) {
          // Mettre à jour une note existante
          const { error } = await supabase
            .from('notes')
            .update({
              title,
              content: currentContent,
              updated_at: new Date().toISOString()
            })
            .eq('id', noteId);

          if (error) throw error;
          currentNoteId = noteId;
          
          toast.success('Note mise à jour avec succès');
        } else {
          // Créer une nouvelle note
          const { error, data } = await supabase
            .from('notes')
            .insert({
              title,
              content: currentContent,
              user_id: user.id
            })
            .select()
            .single();

          if (error) throw error;
          currentNoteId = data.id;
          
          toast.success('Note créée avec succès');
        }
      }
      
      // If we have a quick recording, save it as a separate recording
      if (quickRecording && currentNoteId) {
        // Upload the recording
        const fileExt = 'webm';
        const fileName = `${user.id}/recordings/${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('audio-files')
          .upload(filePath, quickRecording, {
            cacheControl: '3600',
            upsert: false,
            contentType: 'audio/webm'
          });
          
        if (!uploadError) {
          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('audio-files')
            .getPublicUrl(filePath);
          
          // Save recording in database
          const now = new Date();
          const recordingTitle = `Enregistrement du ${now.toLocaleDateString()} à ${now.toLocaleTimeString()}`;
          
          await supabase
            .from('voice_recordings')
            .insert({
              title: recordingTitle,
              audio_url: publicUrl,
              note_id: currentNoteId,
              user_id: user.id
            });
        }
      }
      
    } catch (error: any) {
      console.error('Error saving note:', error);
      toast.error(`Erreur lors de l'enregistrement: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteNote = async () => {
    if (!noteId) return;
    
    setDeleting(true);
    try {
      // Delete the note
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId);
        
      if (error) throw error;
      
      toast.success('Note supprimée avec succès');
      
      if (onDelete) {
        await onDelete();
      } else if (onClose) {
        onClose();
      }
    } catch (error: any) {
      console.error('Error deleting note:', error);
      toast.error(`Erreur lors de la suppression: ${error.message}`);
    } finally {
      setDeleting(false);
    }
  };
  
  const handleAddSection = (sectionType: SectionType) => {
    const sectionMarker = `\n[${sectionType.toUpperCase()}]\n`;
    const newContent = currentContent + sectionMarker;
    setCurrentContent(newContent);
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Title input and actions */}
      <div className="mb-4 flex justify-between items-center">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titre de la chanson"
          className="w-full text-2xl font-heading font-semibold bg-transparent border-0 p-2 focus:outline-none focus:ring-0"
        />
        
        <div className="flex items-center gap-2">
          {noteId && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette action ne peut pas être annulée. Cette note et tout son contenu seront définitivement supprimés.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDeleteNote}
                    className="bg-red-500 hover:bg-red-600"
                  >
                    {deleting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Suppression...
                      </>
                    ) : (
                      'Supprimer la note'
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {/* Beat player */}
      {selectedBeat && (
        <div className="mb-4 p-4 border rounded-lg bg-accent/50">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-medium flex items-center">
              <Music className="h-5 w-5 mr-2 text-primary" />
              Beat: {selectedBeat.title}
            </h3>
          </div>
          <audio 
            controls 
            src={selectedBeat.audio_url}
            className="w-full"
          >
            Votre navigateur ne supporte pas l'élément audio.
          </audio>
        </div>
      )}

      {/* Editor tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'write' | 'record' | 'beats')} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="write">Écrire</TabsTrigger>
          <TabsTrigger value="record">Enregistrements</TabsTrigger>
          <TabsTrigger value="beats">Beat</TabsTrigger>
        </TabsList>
        
        <TabsContent value="write" className="flex flex-col space-y-4 flex-1">
          <div className="mt-4">
            <NoteSections onAddSection={handleAddSection} />
          </div>
          
          <Textarea
            value={currentContent}
            onChange={(e) => setCurrentContent(e.target.value)}
            placeholder="Écrivez votre texte ici... Utilisez les boutons ci-dessus pour insérer des sections."
            className="flex-1 resize-none min-h-[400px] text-base leading-relaxed"
            style={{ whiteSpace: 'pre-wrap' }}
          />
          
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={!title.trim() || saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sauvegarde...
                </>
              ) : (
                'Enregistrer la note'
              )}
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="record" className="flex flex-col space-y-4 flex-1">
          {/* Voice recordings list */}
          {noteId && (
            <VoiceRecordingsList 
              noteId={noteId} 
              onRecordingAdded={() => {
                // Refresh recordings list if needed
              }}
            />
          )}
          
          {/* Quick recording section */}
          <div className="border rounded-md p-4">
            <h3 className="text-lg font-medium mb-3">Enregistrement rapide</h3>
            <VoiceRecorder 
              onRecordingComplete={handleRecordingComplete}
            />
          </div>
          
          <Button
            onClick={handleSave}
            disabled={!title.trim() || saving}
            className="self-end"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sauvegarde...
              </>
            ) : (
              'Enregistrer la note'
            )}
          </Button>
        </TabsContent>
        
        <TabsContent value="beats" className="space-y-4 flex-1">
          {noteId && (
            <BeatSelector 
              noteId={noteId} 
              initialBeatId={selectedBeatId || undefined}
              onBeatSelected={(beatId) => setSelectedBeatId(beatId)}
            />
          )}
          
          <Button
            onClick={handleSave}
            disabled={!title.trim() || saving}
            className="float-right"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sauvegarde...
              </>
            ) : (
              'Enregistrer la note'
            )}
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}
