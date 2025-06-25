
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useState } from 'react';
import { Music } from 'lucide-react';
import { motion } from 'framer-motion';

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
  index: number;
};

export function NoteItem({ note, onClick, isSelected = false, index }: NoteItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const timeAgo = formatDistanceToNow(new Date(note.updatedAt), {
    addSuffix: true,
    locale: fr,
  });

  // Récupération du contenu textuel pour la prévisualisation
  const previewContent = note.content.replace(/(<([^>]+)>)/gi, "").substring(0, 120);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <div
        onClick={() => onClick(note)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          'p-5 rounded-xl transition-all cursor-pointer border h-full',
          'hover:shadow-md hover:border-primary/30',
          isSelected 
            ? 'border-primary bg-primary/5 dark:bg-primary/10 shadow-sm' 
            : 'border-border bg-card',
          isHovered ? 'transform -translate-y-1' : ''
        )}
      >
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-medium text-lg truncate pr-2">{note.title || "Note sans titre"}</h3>
          {note.audioAttached && (
            <div className="tooltip" data-tip="Audio attaché">
              <Music size={18} className="text-ibh-blue" />
            </div>
          )}
        </div>
        <p className="text-sm text-muted-foreground line-clamp-3 mb-3 min-h-[3rem]">
          {previewContent}
          {previewContent.length >= 120 && "..."}
        </p>
        <div className="text-xs text-muted-foreground flex items-center justify-between">
          <span>Modifié {timeAgo}</span>
          <span className="text-primary/80">Cliquer pour éditer</span>
        </div>
      </div>
    </motion.div>
  );
};
