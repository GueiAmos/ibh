
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Save } from 'lucide-react';
import { NoteSections, SectionType } from './NoteSections';
import { LyricsSuggestions } from './LyricsSuggestions';

interface MobileNoteEditorProps {
  onSave: (title: string, content: string, audioUrl?: string) => Promise<void>;
}

export function MobileNoteEditor({ onSave }: MobileNoteEditorProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) {
      return;
    }

    setSaving(true);
    try {
      await onSave(title.trim(), content.trim());
      setTitle('');
      setContent('');
    } catch (error) {
      console.error('Error saving note:', error);
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
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="mobile-title">Titre</Label>
        <Input
          id="mobile-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titre de votre chanson..."
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="mobile-content">Paroles</Label>
        <Textarea
          id="mobile-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Écrivez vos paroles ici..."
          className="mt-1 min-h-[200px] resize-none"
          rows={8}
        />
      </div>

      <div className="space-y-4">
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

      <Button 
        onClick={handleSave} 
        disabled={saving || !title.trim()}
        className="w-full flex items-center gap-2"
      >
        <Save className="h-4 w-4" />
        {saving ? 'Sauvegarde...' : 'Sauvegarder'}
      </Button>
    </div>
  );
}
