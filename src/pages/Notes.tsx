
import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { FileText, Plus, Search, Filter, Grid3X3, List, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { NotesGrid } from '@/components/notes/NotesGrid';
import { NoteEditor } from '@/components/notes/NoteEditor';
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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
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

  return (
    <MainLayout>
      <div className="container py-6 space-y-6">
        <AnimatePresence mode="wait">
          {isEditorOpen ? (
            <motion.div
              key="editor"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <NoteEditor 
                noteId={selectedNote?.id} 
                initialTitle={selectedNote?.title}
                initialContent={selectedNote?.content}
                onSave={refreshNotes}
                onDelete={handleDeleteNote}
                onClose={handleCloseEditor}
              />
            </motion.div>
          ) : (
            <motion.div
              key="notes"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Header moderne */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/20">
                      <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <h1 className="text-2xl font-bold">Mes Notes</h1>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {notes.length} note{notes.length !== 1 ? 's' : ''} • Dernière modification aujourd'hui
                  </p>
                </div>
                
                <Button onClick={handleNewNote} className="gap-2 rounded-lg">
                  <Plus className="h-4 w-4" />
                  Nouvelle note
                </Button>
              </div>
              
              {/* Barre de recherche et filtres */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher dans vos notes..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="pl-10 bg-background border-border/50"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Filter className="h-4 w-4" />
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
                  
                  <div className="flex rounded-lg border border-border/50 p-1">
                    <Button
                      variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                      className="h-7 w-7 p-0"
                    >
                      <Grid3X3 className="h-3 w-3" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className="h-7 w-7 p-0"
                    >
                      <List className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Contenu */}
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                  <p className="text-sm text-muted-foreground">Chargement de vos notes...</p>
                </div>
              ) : filteredNotes.length === 0 ? (
                <div className="content-card text-center py-16">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted mx-auto mb-4">
                    <FileText className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    {searchTerm.trim() !== '' ? 'Aucun résultat trouvé' : 'Aucune note trouvée'}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                    {searchTerm.trim() !== '' 
                      ? 'Essayez avec des termes différents'
                      : 'Commencez par créer une nouvelle note pour donner vie à vos idées'}
                  </p>
                  {searchTerm.trim() === '' && (
                    <Button onClick={handleNewNote} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Créer ma première note
                    </Button>
                  )}
                </div>
              ) : (
                <NotesGrid 
                  notes={filteredNotes} 
                  onNoteSelect={handleNoteSelect}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MainLayout>
  );
};

export default Notes;
