
import React, { useState } from 'react';
import { Note } from './NoteItem';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Music, Heart, Mic } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ModernNoteCardProps {
  note: Note;
  onClick: () => void;
  variant?: 'default' | 'list';
}

export function ModernNoteCard({ note, onClick, variant = 'default' }: ModernNoteCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const timeAgo = formatDistanceToNow(new Date(note.updatedAt), {
    addSuffix: true,
    locale: fr,
  });

  const previewContent = note.content.replace(/(<([^>]+)>)/gi, "").substring(0, 100);

  if (variant === 'list') {
    return (
      <motion.div
        whileHover={{ scale: 1.01 }}
        className="note-card p-3 sm:p-4 cursor-pointer"
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                {note.title || "Note sans titre"}
              </h3>
              <div className="flex items-center gap-1">
                {note.audioAttached && (
                  <div className="flex items-center justify-center w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-900/30">
                    <Music className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                  </div>
                )}
                {note.favorite && (
                  <div className="flex items-center justify-center w-5 h-5 rounded-full bg-pink-100 dark:bg-pink-900/30">
                    <Heart className="w-3 h-3 text-pink-600 dark:text-pink-400 fill-current" />
                  </div>
                )}
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
              {previewContent}
              {previewContent.length >= 100 && "..."}
            </p>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-500 ml-4">
            {timeAgo}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={cn(
        'note-card p-3 sm:p-4 lg:p-5 cursor-pointer h-full transition-all duration-300',
        isHovered ? 'shadow-xl border-violet-300 dark:border-violet-600' : ''
      )}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-semibold text-sm sm:text-base lg:text-lg text-slate-900 dark:text-white line-clamp-2 flex-1 pr-2">
            {note.title || "Note sans titre"}
          </h3>
          <div className="flex items-center gap-1 flex-shrink-0">
            {note.audioAttached && (
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500">
                <Music className="w-3 h-3 text-white" />
              </div>
            )}
            {note.favorite && (
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-pink-400 to-rose-500">
                <Heart className="w-3 h-3 text-white fill-current" />
              </div>
            )}
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-3 flex-1 mb-3 leading-relaxed">
          {previewContent}
          {previewContent.length >= 100 && "..."}
        </p>

        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-500">
          <span>Modifié {timeAgo}</span>
          {isHovered && (
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-violet-600 dark:text-violet-400 font-medium"
            >
              Cliquer pour éditer
            </motion.span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
