
import { Note, NoteItem } from './NoteItem';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

interface NotesGridProps {
  notes: Note[];
  onNoteSelect: (note: Note) => void;
  showActions?: boolean;
  onRemove?: (noteId: string) => void;
}

export function NotesGrid({ notes, onNoteSelect, showActions = false, onRemove }: NotesGridProps) {
  const isMobile = useIsMobile();
  
  return (
    <div>
      {notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground mb-4">Vous n'avez aucune note pour le moment.</p>
          <Button asChild>
            <Link to="/notes?new=true">
              <PlusCircle className="mr-2 h-4 w-4" />
              Créer ma première note
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note) => (
            <div key={note.id} className="relative group">
              <NoteItem 
                note={note} 
                onClick={() => onNoteSelect(note)} 
              />
              
              {showActions && onRemove && (
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(note.id);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
