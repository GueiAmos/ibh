
import { NoteItem, Note } from './NoteItem';
import { useMemo } from 'react';
import { motion } from 'framer-motion';

type NotesGridProps = {
  notes: Note[];
  onNoteSelect: (note: Note) => void;
  selectedNoteId?: string;
};

export function NotesGrid({ notes, onNoteSelect, selectedNoteId }: NotesGridProps) {
  const sortedNotes = useMemo(() => {
    return [...notes].sort((a, b) => {
      // First by favorite
      if (a.favorite && !b.favorite) return -1;
      if (!a.favorite && b.favorite) return 1;
      
      // Then by date
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [notes]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {sortedNotes.map((note, index) => (
        <NoteItem
          key={note.id}
          note={note}
          onClick={onNoteSelect}
          isSelected={note.id === selectedNoteId}
          index={index}
        />
      ))}
    </motion.div>
  );
}
