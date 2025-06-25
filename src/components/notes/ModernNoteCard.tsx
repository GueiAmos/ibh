
import React from 'react';
import { Note } from './NoteItem';
import { FileText, Music, Heart, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ModernNoteCardProps {
  note: Note;
  onClick: () => void;
  variant?: 'card' | 'list';
}

export function ModernNoteCard({ note, onClick, variant = 'card' }: ModernNoteCardProps) {
  const truncateContent = (content: string, maxLength: number) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  if (variant === 'list') {
    return (
      <div
        onClick={onClick}
        className="note-card p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/50"
      >
        <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
          <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
              {note.title}
            </h3>
            {note.audioAttached && (
              <Music className="w-4 h-4 text-purple-500 flex-shrink-0" />
            )}
            {note.favorite && (
              <Heart className="w-4 h-4 text-red-500 flex-shrink-0" />
            )}
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
            {truncateContent(note.content, 100)}
          </p>
          
          <div className="flex items-center gap-1 mt-2 text-xs text-gray-500 dark:text-gray-500">
            <Clock className="w-3 h-3" />
            <span>
              {formatDistanceToNow(note.updatedAt, { addSuffix: true, locale: fr })}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Card variant
  const contentHeight = Math.max(150, Math.min(300, note.content.length * 0.5 + 150));

  return (
    <div
      onClick={onClick}
      className="note-card p-6"
      style={{ height: `${contentHeight}px` }}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="flex gap-1">
              {note.audioAttached && (
                <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <Music className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                </div>
              )}
              {note.favorite && (
                <div className="w-6 h-6 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                  <Heart className="w-3 h-3 text-red-600 dark:text-red-400" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-3 line-clamp-2">
          {note.title}
        </h3>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed line-clamp-6">
            {note.content}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-500">
            <Clock className="w-3 h-3" />
            <span>
              {formatDistanceToNow(note.updatedAt, { addSuffix: true, locale: fr })}
            </span>
          </div>
          
          <div className="text-xs text-gray-400 dark:text-gray-600">
            {note.content.length} caractères
          </div>
        </div>
      </div>
    </div>
  );
}
