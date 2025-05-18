
import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { BookText, Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { NotesGrid } from '@/components/notes/NotesGrid';
import { NoteEditor } from '@/components/notes/NoteEditor';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Note } from '@/components/notes/NoteItem';

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

  const handleSaveNote = async (title: string, content: string, audioUrl?: string) => {
    if (!user) {
      toast.error('Vous devez être connecté pour enregistrer une note');
      return;
    }

    try {
      if (selectedNote) {
        // Update existing note
        const { error } = await supabase
          .from('notes')
          .update({
            title,
            content,
            audio_url: audioUrl,
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedNote.id);

        if (error) throw error;
        
        toast.success('Note mise à jour avec succès');
      } else {
        // Create new note
        const { error } = await supabase
          .from('notes')
          .insert({
            title,
            content,
            audio_url: audioUrl,
            user_id: user.id
          });

        if (error) throw error;
        
        toast.success('Note créée avec succès');
      }

      // Refresh notes list
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
      handleCloseEditor();

    } catch (error: any) {
      console.error('Error saving note:', error);
      toast.error(`Erreur lors de l'enregistrement de la note: ${error.message}`);
    }
  };

  return (
    <MainLayout>
      <div className="ibh-container py-4">
        {isEditorOpen ? (
          <div>
            <Button variant="outline" onClick={handleCloseEditor} className="mb-4">
              ← Retour aux notes
            </Button>
            <NoteEditor 
              noteId={selectedNote?.id} 
              initialTitle={selectedNote?.title}
              initialContent={selectedNote?.content}
              onSave={handleSaveNote}
            />
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl md:text-3xl font-bold flex items-center">
                <BookText className="mr-2 h-6 w-6" />
                Mes Notes
              </h1>
              <Button onClick={handleNewNote}>
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle note
              </Button>
            </div>
            
            <div className="relative mb-6">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher dans vos notes..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-8"
              />
            </div>
            
            {loading ? (
              <div className="flex justify-center my-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ibh-purple"></div>
              </div>
            ) : filteredNotes.length === 0 ? (
              <div className="text-center py-12">
                <BookText className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                <h3 className="mt-4 text-lg font-medium">
                  {searchTerm.trim() !== '' ? 'Aucun résultat trouvé' : 'Aucune note trouvée'}
                </h3>
                <p className="text-muted-foreground mt-2">
                  {searchTerm.trim() !== '' 
                    ? 'Essayez avec des termes différents'
                    : 'Commencez par créer une nouvelle note'}
                </p>
                {searchTerm.trim() === '' && (
                  <Button className="mt-4" onClick={handleNewNote}>
                    <Plus className="mr-2 h-4 w-4" />
                    Créer une note
                  </Button>
                )}
              </div>
            ) : (
              <NotesGrid 
                notes={filteredNotes} 
                onNoteSelect={handleNoteSelect}
              />
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default Notes;
