
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
  Music2,
  TrendingUp,
  Calendar,
  BookOpen,
  Star
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

  // Statistiques pour le tableau de bord
  const recentNotes = notes.slice(0, 5);
  const totalNotes = notes.length;
  const notesWithAudio = notes.filter(note => note.audioAttached).length;
  const favoriteNotes = notes.filter(note => note.favorite).length;

  return (
    <ModernLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4 mobile-spacing max-w-7xl mx-auto"
      >
        {/* Header principal */}
        <div className="glass-card p-4 mobile-card">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mobile-compact">
            <div className="flex items-center gap-3 mobile-compact">
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Music2 className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg lg:text-2xl font-bold text-slate-900 dark:text-white mobile-title">
                  Mes Notes Musicales
                </h1>
                <p className="text-xs lg:text-sm text-slate-600 dark:text-slate-400 mobile-subtitle">
                  Créez et organisez vos paroles et idées musicales
                </p>
              </div>
            </div>
            
            <Button 
              onClick={handleNewNote} 
              className="modern-button mobile-button"
            >
              <Plus className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
              Nouvelle note
            </Button>
          </div>
        </div>

        {/* Tableau de bord avec statistiques */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          <div className="glass-card p-3 lg:p-4 mobile-card">
            <div className="flex items-center gap-2 mobile-compact">
              <div className="w-6 h-6 lg:w-8 lg:h-8 bg-blue-100 dark:bg-blue-900/30 rounded-md flex items-center justify-center">
                <BookOpen className="w-3 h-3 lg:w-4 lg:h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs lg:text-sm font-medium text-slate-600 dark:text-slate-400">Total</p>
                <p className="text-lg lg:text-xl font-bold text-slate-900 dark:text-white">{totalNotes}</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-3 lg:p-4 mobile-card">
            <div className="flex items-center gap-2 mobile-compact">
              <div className="w-6 h-6 lg:w-8 lg:h-8 bg-green-100 dark:bg-green-900/30 rounded-md flex items-center justify-center">
                <Music2 className="w-3 h-3 lg:w-4 lg:h-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs lg:text-sm font-medium text-slate-600 dark:text-slate-400">Avec audio</p>
                <p className="text-lg lg:text-xl font-bold text-slate-900 dark:text-white">{notesWithAudio}</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-3 lg:p-4 mobile-card">
            <div className="flex items-center gap-2 mobile-compact">
              <div className="w-6 h-6 lg:w-8 lg:h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-md flex items-center justify-center">
                <Star className="w-3 h-3 lg:w-4 lg:h-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-xs lg:text-sm font-medium text-slate-600 dark:text-slate-400">Favoris</p>
                <p className="text-lg lg:text-xl font-bold text-slate-900 dark:text-white">{favoriteNotes}</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-3 lg:p-4 mobile-card">
            <div className="flex items-center gap-2 mobile-compact">
              <div className="w-6 h-6 lg:w-8 lg:h-8 bg-purple-100 dark:bg-purple-900/30 rounded-md flex items-center justify-center">
                <TrendingUp className="w-3 h-3 lg:w-4 lg:h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-xs lg:text-sm font-medium text-slate-600 dark:text-slate-400">Cette semaine</p>
                <p className="text-lg lg:text-xl font-bold text-slate-900 dark:text-white">{recentNotes.length}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Barre de recherche et filtres */}
        <div className="glass-card p-3 lg:p-4 mobile-card">
          <div className="flex flex-col sm:flex-row gap-3 mobile-compact">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 lg:w-4 lg:h-4 text-slate-400" />
              <Input
                placeholder="Rechercher dans vos notes..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-8 lg:pl-10 modern-input text-xs lg:text-sm"
              />
            </div>
            
            <div className="flex items-center gap-2 mobile-compact">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="text-xs lg:text-sm px-2 lg:px-3">
                    <Filter className="w-3 h-3 lg:w-4 lg:h-4 mr-1" />
                    Filtrer
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Récentes</DropdownMenuItem>
                  <DropdownMenuItem>Anciennes</DropdownMenuItem>
                  <DropdownMenuItem>Avec audio</DropdownMenuItem>
                  <DropdownMenuItem>Favoris</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <div className="flex bg-slate-100 dark:bg-slate-800 rounded-md p-1">
                <Button
                  variant={viewMode === 'masonry' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('masonry')}
                  className="px-1.5 lg:px-2 h-6 lg:h-7"
                >
                  <StickyNote className="w-3 h-3 lg:w-4 lg:h-4" />
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="px-1.5 lg:px-2 h-6 lg:h-7"
                >
                  <Grid3X3 className="w-3 h-3 lg:w-4 lg:h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="px-1.5 lg:px-2 h-6 lg:h-7"
                >
                  <List className="w-3 h-3 lg:w-4 lg:h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Contenu principal */}
        {loading ? (
          <div className="glass-card py-8 lg:py-12 mobile-card">
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="w-5 h-5 lg:w-6 lg:h-6 animate-spin text-blue-600 mb-3" />
              <p className="text-xs lg:text-sm text-slate-600 dark:text-slate-400">Chargement de vos notes...</p>
            </div>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="glass-card py-8 lg:py-12 mobile-card">
            <div className="text-center">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center mx-auto mb-3 lg:mb-4">
                <StickyNote className="w-5 h-5 lg:w-6 lg:h-6 text-slate-400" />
              </div>
              <h3 className="text-base lg:text-lg font-semibold text-slate-900 dark:text-white mb-2 mobile-title">
                {searchTerm.trim() !== '' ? 'Aucun résultat trouvé' : 'Aucune note pour le moment'}
              </h3>
              <p className="text-xs lg:text-sm text-slate-600 dark:text-slate-400 mb-4 max-w-md mx-auto mobile-subtitle">
                {searchTerm.trim() !== '' 
                  ? 'Essayez avec des termes différents ou créez une nouvelle note.'
                  : 'Commencez par créer votre première note pour organiser vos idées musicales.'}
              </p>
              {searchTerm.trim() === '' && (
                <Button onClick={handleNewNote} className="modern-button mobile-button">
                  <Plus className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
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
