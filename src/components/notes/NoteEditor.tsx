
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AudioPlayer } from '@/components/audio/AudioPlayer';
import { VoiceRecorder } from '@/components/audio/VoiceRecorder';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

type SectionType = 'verse' | 'chorus' | 'bridge' | 'hook' | 'outro';

type Section = {
  id: string;
  type: SectionType;
  content: string;
};

interface NoteEditorProps {
  noteId?: string;
  className?: string;
}

export function NoteEditor({ noteId, className }: NoteEditorProps) {
  const [title, setTitle] = useState(noteId ? 'Mon titre de chanson' : '');
  const [currentContent, setCurrentContent] = useState('');
  const [sections, setSections] = useState<Section[]>(noteId ? [
    { id: '1', type: 'verse', content: 'Premier couplet...' },
    { id: '2', type: 'chorus', content: 'Refrain...' },
    { id: '3', type: 'verse', content: 'Deuxième couplet...' }
  ] : []);
  const [activeTab, setActiveTab] = useState<'write' | 'record'>('write');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [sectionType, setSectionType] = useState<SectionType>('verse');

  // For demo purposes only - would come from props in real app
  const demoAudioUrl = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
  
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

  const handleRecordingComplete = (blob: Blob) => {
    setAudioBlob(blob);
    // Here you would typically upload this blob or save it
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
      {(noteId || audioBlob) && (
        <div className="mb-4">
          <AudioPlayer 
            audioSrc={audioBlob ? URL.createObjectURL(audioBlob) : demoAudioUrl}
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
          
          <div className="flex justify-end">
            <Button onClick={handleSaveSection} disabled={!currentContent.trim()}>
              Ajouter la section
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="record" className="flex flex-col">
          <VoiceRecorder 
            onRecordingComplete={handleRecordingComplete}
            className="mt-4 border rounded-md"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
