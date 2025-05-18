
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useState } from 'react';
import { BookmarkIcon, Music } from 'lucide-react';

export type Note = {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  favorite: boolean;
  audioAttached: boolean;
  sections: {
    type: 'verse' | 'chorus' | 'bridge' | 'hook' | 'outro';
    content: string;
  }[];
};

type NoteItemProps = {
  note: Note;
  onClick: (note: Note) => void;
  isSelected?: boolean;
};

export function NoteItem({ note, onClick, isSelected = false }: NoteItemProps) {
  const [isFavorite, setIsFavorite] = useState(note.favorite);
  
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    // Add actual favorite logic here
  };

  const timeAgo = formatDistanceToNow(new Date(note.updatedAt), {
    addSuffix: true,
    locale: fr,
  });

  return (
    <div
      onClick={() => onClick(note)}
      className={cn(
        'p-4 rounded-lg transition-all cursor-pointer border',
        'hover:border-ibh-purple/50',
        isSelected 
          ? 'border-ibh-purple bg-ibh-purple/5 dark:bg-ibh-purple/10' 
          : 'border-border bg-card'
      )}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-lg truncate pr-2">{note.title}</h3>
        <div className="flex gap-1.5">
          {note.audioAttached && (
            <Music size={18} className="text-ibh-blue" />
          )}
          <BookmarkIcon 
            size={18} 
            className={cn(
              "cursor-pointer transition-colors",
              isFavorite 
                ? "fill-ibh-purple text-ibh-purple" 
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={handleFavoriteClick}
          />
        </div>
      </div>
      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
        {note.content}
      </p>
      <div className="text-xs text-muted-foreground">
        Modifié {timeAgo}
      </div>
    </div>
  );
}
