
import { NoteItem, Note } from './NoteItem';
import { useMemo, useState } from 'react';

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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
      {sortedNotes.map((note) => (
        <NoteItem
          key={note.id}
          note={note}
          onClick={onNoteSelect}
          isSelected={note.id === selectedNoteId}
        />
      ))}
    </div>
  );
}
