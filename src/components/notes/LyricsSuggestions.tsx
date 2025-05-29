
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Lightbulb, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface LyricsSuggestionsProps {
  currentText: string;
  onSuggestionSelect: (suggestion: string) => void;
  context?: string;
}

export function LyricsSuggestions({ currentText, onSuggestionSelect, context }: LyricsSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const generateSuggestions = async () => {
    if (!currentText.trim()) {
      toast.error('Écrivez quelques mots avant de demander des suggestions');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-lyrics-suggestions', {
        body: {
          currentText: currentText.slice(-200), // Only send last 200 chars for context
          context
        }
      });

      if (error) throw error;

      setSuggestions(data.suggestions || []);
      if (data.suggestions?.length === 0) {
        toast.error('Aucune suggestion générée. Essayez avec plus de texte.');
      }
    } catch (error) {
      console.error('Error generating suggestions:', error);
      toast.error('Erreur lors de la génération des suggestions');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <Button 
        onClick={generateSuggestions}
        disabled={loading || !currentText.trim()}
        variant="outline"
        size="sm"
        className="w-full"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Lightbulb className="h-4 w-4 mr-2" />
        )}
        {loading ? 'Génération...' : 'Suggérer des paroles'}
      </Button>

      {suggestions.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            Suggestions IA:
          </p>
          {suggestions.map((suggestion, index) => (
            <Button
              key={index}
              variant="ghost"
              className="w-full text-left justify-start h-auto p-3 whitespace-normal"
              onClick={() => onSuggestionSelect(suggestion)}
            >
              <span className="text-sm">{suggestion}</span>
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
