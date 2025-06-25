
import React from 'react';
import { Note } from './NoteItem';
import { ModernNoteCard } from './ModernNoteCard';
import { motion } from 'framer-motion';

interface ModernNotesGridProps {
  notes: Note[];
  onNoteSelect: (note: Note) => void;
  viewMode?: 'grid' | 'masonry' | 'list';
}

export function ModernNotesGrid({ notes, onNoteSelect, viewMode = 'masonry' }: ModernNotesGridProps) {
  if (viewMode === 'list') {
    return (
      <div className="space-y-2 sm:space-y-3">
        {notes.map((note, index) => (
          <motion.div
            key={note.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <ModernNoteCard note={note} onClick={() => onNoteSelect(note)} variant="list" />
          </motion.div>
        ))}
      </div>
    );
  }

  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {notes.map((note, index) => (
          <motion.div
            key={note.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <ModernNoteCard note={note} onClick={() => onNoteSelect(note)} />
          </motion.div>
        ))}
      </div>
    );
  }

  // Masonry layout - optimized for mobile
  return (
    <div className="masonry-grid">
      {notes.map((note, index) => (
        <motion.div
          key={note.id}
          className="masonry-item"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05 }}
        >
          <ModernNoteCard note={note} onClick={() => onNoteSelect(note)} />
        </motion.div>
      ))}
    </div>
  );
}
