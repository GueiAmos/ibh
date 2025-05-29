
import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { BookText, Plus, Search, ArrowLeft, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { NotesGrid } from '@/components/notes/NotesGrid';
import { NoteEditor } from '@/components/notes/NoteEditor';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Note } from '@/components/notes/NoteItem';
import { motion, AnimatePresence } from 'framer-motion';

const Notes = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
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
          favorite: false, // À implémenter ultérieurement
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
    // Refresh notes after closing editor
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

  const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  };

  return (
    <MainLayout>
      <div className="ibh-container py-6">
        <AnimatePresence mode="wait">
          {isEditorOpen ? (
            <motion.div
              key="editor"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
            >
              <div className="glass-panel p-4 md:p-6 rounded-xl">
                <NoteEditor 
                  noteId={selectedNote?.id} 
                  initialTitle={selectedNote?.title}
                  initialContent={selectedNote?.content}
                  onSave={refreshNotes}
                  onDelete={handleDeleteNote}
                  onClose={handleCloseEditor}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="notes"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold flex items-center">
                    <BookText className="mr-2 h-6 w-6 text-primary" />
                    Mes Notes
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Organisez et rédigez vos textes
                  </p>
                </div>
                <Button onClick={handleNewNote} className="rounded-lg shadow-sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Nouvelle note
                </Button>
              </div>
              
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher dans vos notes..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="pl-9 bg-background/50"
                />
              </div>
              
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                  <p className="text-muted-foreground">Chargement de vos notes...</p>
                </div>
              ) : filteredNotes.length === 0 ? (
                <div className="glass-panel text-center py-20 rounded-xl flex flex-col items-center">
                  <BookText className="mx-auto h-16 w-16 text-muted-foreground opacity-30 mb-4" />
                  <h3 className="text-xl font-medium">
                    {searchTerm.trim() !== '' ? 'Aucun résultat trouvé' : 'Aucune note trouvée'}
                  </h3>
                  <p className="text-muted-foreground mt-2 mb-6 max-w-md mx-auto">
                    {searchTerm.trim() !== '' 
                      ? 'Essayez avec des termes différents'
                      : 'Commencez par créer une nouvelle note pour donner vie à vos idées'}
                  </p>
                  {searchTerm.trim() === '' && (
                    <Button onClick={handleNewNote} className="rounded-lg shadow-sm">
                      <Plus className="mr-2 h-4 w-4" />
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
