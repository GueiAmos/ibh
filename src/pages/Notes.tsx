
import { useState, useEffect } from 'react';
import { ModernLayout } from '@/components/layout/ModernLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  Loader2,
  StickyNote,
  Sparkles,
  Music2
} from 'lucide-react';
import { ModernNotesGrid } from '@/components/notes/ModernNotesGrid';
import { ModernNoteEditor } from '@/components/notes/ModernNoteEditor';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Note } from '@/components/notes/NoteItem';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

const Notes = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'masonry' | 'grid' | 'list'>('masonry');
  const { user } = useAuth();

  useEffect(() => {
    const fetchNotes = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('notes')
          .select('*')
          .order('updated_at', { ascending: false });

        if (error) throw error;

        const formattedNotes = data?.map(note => ({
          id: note.id,
          title: note.title,
          content: note.content || '',
          createdAt: new Date(note.created_at),
          updatedAt: new Date(note.updated_at),
          favorite: false,
          audioAttached: !!note.audio_url,
          sections: []
        })) || [];

        setNotes(formattedNotes);
      } catch (error: any) {
        console.error('Error fetching notes:', error);
        toast.error(`Erreur lors du chargement des notes: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [user]);

  const handleNoteSelect = (note: Note) => {
    setSelectedNote(note);
    setIsEditorOpen(true);
  };

  const handleNewNote = () => {
    setSelectedNote(null);
    setIsEditorOpen(true);
  };

  const handleCloseEditor = () => {
    setIsEditorOpen(false);
    setSelectedNote(null);
    refreshNotes();
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredNotes = searchTerm.trim() === ''
    ? notes
    : notes.filter(note =>
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content.toLowerCase().includes(searchTerm.toLowerCase())
      );

  const refreshNotes = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const formattedNotes = data?.map(note => ({
        id: note.id,
        title: note.title,
        content: note.content || '',
        createdAt: new Date(note.created_at),
        updatedAt: new Date(note.updated_at),
        favorite: false,
        audioAttached: !!note.audio_url,
        sections: []
      })) || [];

      setNotes(formattedNotes);
    } catch (error: any) {
      console.error('Error refreshing notes:', error);
      toast.error(`Erreur lors du rafraîchissement des notes: ${error.message}`);
    }
  };

  const handleDeleteNote = async () => {
    refreshNotes();
    handleCloseEditor();
  };

  if (isEditorOpen) {
    return (
      <ModernNoteEditor 
        noteId={selectedNote?.id} 
        initialTitle={selectedNote?.title}
        initialContent={selectedNote?.content}
        onSave={refreshNotes}
        onDelete={handleDeleteNote}
        onClose={handleCloseEditor}
      />
    );
  }

  return (
    <ModernLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4 sm:space-y-6"
      >
        {/* Header with stats - Mobile optimized */}
        <div className="glass-card p-4 sm:p-6 mobile-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center">
                  <Music2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mobile-title">
                    Mes Notes
                  </h1>
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mobile-subtitle">
                    {notes.length} note{notes.length !== 1 ? 's' : ''} • 
                    Organisez vos idées créatives
                  </p>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={handleNewNote} 
              className="modern-button gap-2 w-full sm:w-auto mobile-button"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              Nouvelle note
            </Button>
          </div>
        </div>
        
        {/* Search and filters - Mobile optimized */}
        <div className="glass-card p-3 sm:p-4 mobile-card">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
              <Input
                placeholder="Rechercher dans vos notes..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10 sm:pl-12 modern-input"
              />
            </div>
            
            {/* Controls */}
            <div className="flex items-center gap-2 sm:gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2 mobile-button">
                    <Filter className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Filtrer</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Récentes</DropdownMenuItem>
                  <DropdownMenuItem>Anciennes</DropdownMenuItem>
                  <DropdownMenuItem>Avec audio</DropdownMenuItem>
                  <DropdownMenuItem>Favoris</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* View mode selector */}
              <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                <Button
                  variant={viewMode === 'masonry' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('masonry')}
                  className="px-2 sm:px-3 h-8"
                >
                  <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="px-2 sm:px-3 h-8"
                >
                  <Grid3X3 className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="px-2 sm:px-3 h-8"
                >
                  <List className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Content */}
        {loading ? (
          <div className="glass-card py-12 sm:py-20 mobile-card">
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-violet-600 mb-4" />
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">Chargement de vos notes...</p>
            </div>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="glass-card py-12 sm:py-20 mobile-card">
            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <StickyNote className="w-6 h-6 sm:w-8 sm:h-8 text-slate-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white mb-2 mobile-title">
                {searchTerm.trim() !== '' ? 'Aucun résultat trouvé' : 'Aucune note pour le moment'}
              </h3>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-4 sm:mb-6 max-w-md mx-auto mobile-subtitle">
                {searchTerm.trim() !== '' 
                  ? 'Essayez avec des termes différents ou créez une nouvelle note.'
                  : 'Commencez par créer votre première note pour organiser vos idées.'}
              </p>
              {searchTerm.trim() === '' && (
                <Button onClick={handleNewNote} className="modern-button gap-2 mobile-button">
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                  Créer ma première note
                </Button>
              )}
            </div>
          </div>
        ) : (
          <ModernNotesGrid 
            notes={filteredNotes} 
            onNoteSelect={handleNoteSelect}
            viewMode={viewMode}
          />
        )}
      </motion.div>
    </ModernLayout>
  );
};

export default Notes;
