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
  BookOpen
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

  const recentNotes = notes.slice(0, 5);
  const totalNotes = notes.length;
  const notesWithAudio = notes.filter(note => note.audioAttached).length;

  return (
    <ModernLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6 max-w-7xl mx-auto"
      >
        {/* Header principal */}
        <div className="music-card p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center vinyl-effect">
                <Music2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                  Mes Notes Musicales
                </h1>
                <p className="text-sm lg:text-base text-muted-foreground">
                  Créez et organisez vos paroles et idées musicales
                </p>
              </div>
            </div>
            
            <Button 
              onClick={handleNewNote} 
              className="modern-button"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle note
            </Button>
          </div>
        </div>

        {/* Tableau de bord avec statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="music-card p-6 group hover:scale-105 transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold text-foreground beat-pulse">{totalNotes}</p>
              </div>
            </div>
          </div>

          <div className="music-card p-6 group hover:scale-105 transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-music-blue/20 to-music-purple/20 rounded-xl flex items-center justify-center">
                <Music2 className="w-6 h-6 text-music-blue" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avec audio</p>
                <p className="text-2xl font-bold text-foreground">{notesWithAudio}</p>
              </div>
            </div>
          </div>

          <div className="music-card p-6 group hover:scale-105 transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-music-gold/20 to-music-accent/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-music-gold" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cette semaine</p>
                <p className="text-2xl font-bold text-foreground">{recentNotes.length}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Barre de recherche et filtres */}
        <div className="music-card p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher dans vos notes..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10 modern-input"
              />
            </div>
            
            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="modern-button-secondary">
                    <Filter className="w-4 h-4 mr-2" />
                    Filtrer
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Récentes</DropdownMenuItem>
                  <DropdownMenuItem>Anciennes</DropdownMenuItem>
                  <DropdownMenuItem>Avec audio</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <div className="flex bg-secondary/50 rounded-xl p-1 border border-border/30">
                <Button
                  variant={viewMode === 'masonry' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('masonry')}
                  className="h-8 px-3"
                >
                  <StickyNote className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="h-8 px-3"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="h-8 px-3"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Contenu principal */}
        {loading ? (
          <div className="music-card py-12">
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
              <p className="text-sm text-muted-foreground">Chargement de vos notes...</p>
            </div>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="music-card py-12">
            <div className="text-center">
              <div className="vinyl-effect w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-muted to-secondary"></div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {searchTerm.trim() !== '' ? 'Aucun résultat trouvé' : 'Aucune note pour le moment'}
              </h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                {searchTerm.trim() !== '' 
                  ? 'Essayez avec des termes différents ou créez une nouvelle note.'
                  : 'Commencez par créer votre première note pour organiser vos idées musicales.'}
              </p>
              {searchTerm.trim() === '' && (
                <Button onClick={handleNewNote} className="modern-button">
                  <Plus className="w-4 h-4 mr-2" />
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
