
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AudioPlayer } from '@/components/audio/AudioPlayer';
import { VoiceRecorder } from '@/components/audio/VoiceRecorder';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Music, Loader2 } from 'lucide-react';

type SectionType = 'verse' | 'chorus' | 'bridge' | 'hook' | 'outro';

type Section = {
  id: string;
  type: SectionType;
  content: string;
};

interface NoteEditorProps {
  noteId?: string;
  initialTitle?: string;
  initialContent?: string;
  className?: string;
  onSave?: (title: string, content: string, audioUrl?: string) => Promise<void>;
}

export function NoteEditor({ noteId, initialTitle = '', initialContent = '', className, onSave }: NoteEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [currentContent, setCurrentContent] = useState('');
  const [sections, setSections] = useState<Section[]>([]);
  const [activeTab, setActiveTab] = useState<'write' | 'record'>('write');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [sectionType, setSectionType] = useState<SectionType>('verse');
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchNote = async () => {
      if (noteId) {
        try {
          const { data, error } = await supabase
            .from('notes')
            .select('*')
            .eq('id', noteId)
            .single();

          if (error) throw error;

          if (data) {
            setTitle(data.title);
            setCurrentContent(data.content || '');
            
            if (data.audio_url) {
              setAudioUrl(data.audio_url);
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

  const handleSaveSection = () => {
    if (!currentContent.trim()) return;
    
    const newSection: Section = {
      id: Date.now().toString(),
      type: sectionType,
      content: currentContent
    };
    
    setSections([...sections, newSection]);
    setCurrentContent('');
  };

  const handleRecordingComplete = async (blob: Blob) => {
    setAudioBlob(blob);
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
      let uploadedAudioUrl = audioUrl;

      // Si un nouveau fichier audio a été enregistré, on l'upload
      if (audioBlob) {
        const fileExt = 'webm';
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('audio-files')
          .upload(filePath, audioBlob, {
            cacheControl: '3600',
            upsert: false
          });
          
        if (uploadError) throw uploadError;
        
        // Récupérer l'URL publique
        const { data: { publicUrl } } = supabase.storage
          .from('audio-files')
          .getPublicUrl(filePath);
          
        uploadedAudioUrl = publicUrl;
      }

      // Compiler le contenu de la note (inclure les sections)
      const fullContent = sections.map(section => 
        `[${section.type.toUpperCase()}]\n${section.content}`
      ).join('\n\n') || currentContent;

      // Utiliser la fonction de sauvegarde passée en prop ou la sauvegarde interne
      if (onSave) {
        await onSave(title, fullContent, uploadedAudioUrl || undefined);
      } else {
        if (noteId) {
          // Mettre à jour une note existante
          const { error } = await supabase
            .from('notes')
            .update({
              title,
              content: fullContent,
              audio_url: uploadedAudioUrl,
              updated_at: new Date().toISOString()
            })
            .eq('id', noteId);

          if (error) throw error;
          
          toast.success('Note mise à jour avec succès');
        } else {
          // Créer une nouvelle note
          const { error } = await supabase
            .from('notes')
            .insert({
              title,
              content: fullContent,
              audio_url: uploadedAudioUrl,
              user_id: user.id
            });

          if (error) throw error;
          
          toast.success('Note créée avec succès');
        }
      }
    } catch (error: any) {
      console.error('Error saving note:', error);
      toast.error(`Erreur lors de l'enregistrement: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const sectionLabels: Record<SectionType, string> = {
    verse: 'Couplet',
    chorus: 'Refrain',
    bridge: 'Pont',
    hook: 'Hook',
    outro: 'Outro'
  };

  const sectionClasses: Record<SectionType, string> = {
    verse: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700/30',
    chorus: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700/30',
    bridge: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700/30',
    hook: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700/30',
    outro: 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-700/30'
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Title input */}
      <div className="mb-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titre de la chanson"
          className="w-full text-2xl font-heading font-semibold bg-transparent border-0 p-2 focus:outline-none focus:ring-0"
        />
      </div>

      {/* Audio player */}
      {(audioUrl || audioBlob) && (
        <div className="mb-4">
          <AudioPlayer 
            audioSrc={audioBlob ? URL.createObjectURL(audioBlob) : audioUrl || ''}
          />
        </div>
      )}

      {/* Sections list */}
      {sections.length > 0 && (
        <div className="mb-6 space-y-3">
          {sections.map(section => (
            <div 
              key={section.id}
              className={cn(
                "p-3 rounded-md border",
                sectionClasses[section.type]
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {sectionLabels[section.type]}
                </span>
              </div>
              <p className="whitespace-pre-wrap">{section.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* Editor tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'write' | 'record')} className="flex-1">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="write">Écrire</TabsTrigger>
          <TabsTrigger value="record">Enregistrer</TabsTrigger>
        </TabsList>
        
        <TabsContent value="write" className="flex flex-col space-y-4">
          <div className="mt-4 flex gap-2">
            <select
              value={sectionType}
              onChange={(e) => setSectionType(e.target.value as SectionType)}
              className="px-3 py-1 rounded-md border border-input bg-background text-sm"
            >
              <option value="verse">Couplet</option>
              <option value="chorus">Refrain</option>
              <option value="bridge">Pont</option>
              <option value="hook">Hook</option>
              <option value="outro">Outro</option>
            </select>
          </div>
          
          <textarea
            value={currentContent}
            onChange={(e) => setCurrentContent(e.target.value)}
            placeholder="Écrivez votre texte ici..."
            className="flex-1 resize-none p-3 rounded-md border border-input bg-background min-h-[150px] focus:outline-none focus:ring-1 focus:ring-ring"
          />
          
          <div className="flex justify-end space-x-2">
            <Button onClick={handleSaveSection} disabled={!currentContent.trim()}>
              Ajouter la section
            </Button>
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
        
        <TabsContent value="record" className="flex flex-col">
          <VoiceRecorder 
            onRecordingComplete={handleRecordingComplete}
            className="mt-4 border rounded-md"
          />
          <Button
            onClick={handleSave}
            disabled={!title.trim() || (!audioBlob && !audioUrl) || saving}
            className="mt-4 self-end"
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
