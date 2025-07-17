import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { MainLayout } from '@/components/layout/MainLayout';
import { ModernNotesGrid } from '@/components/notes/ModernNotesGrid';
import { ModernNoteEditor } from '@/components/notes/ModernNoteEditor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Grid3X3, List, LayoutGrid, Filter } from 'lucide-react';
import { Note } from '@/components/notes/NoteItem';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function Notes() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'masonry' | 'list'>('masonry');

  const fetchNotes = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const transformedNotes: Note[] = data.map(note => ({
        id: note.id,
        title: note.title,
        content: note.content || '',
        createdAt: new Date(note.created_at),
        updatedAt: new Date(note.updated_at),
        favorite: false,
        audioAttached: !!note.audio_url,
        sections: []
      }));

      setNotes(transformedNotes);
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast.error('Erreur lors du chargement des notes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [user]);

  const handleCreateNote = async (title: string, content: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notes')
        .insert({
          title,
          content,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      const newNote: Note = {
        id: data.id,
        title: data.title,
        content: data.content || '',
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        favorite: false,
        audioAttached: false,
        sections: []
      };

      setNotes(prev => [newNote, ...prev]);
      setSelectedNote(newNote);
      setIsCreating(false);
      toast.success('Note créée avec succès');
    } catch (error) {
      console.error('Error creating note:', error);
      toast.error('Erreur lors de la création de la note');
    }
  };

  const handleUpdateNote = async (noteId: string, title: string, content: string) => {
    try {
      const { error } = await supabase
        .from('notes')
        .update({
          title,
          content,
          updated_at: new Date().toISOString()
        })
        .eq('id', noteId);

      if (error) throw error;

      setNotes(prev => prev.map(note => 
        note.id === noteId 
          ? { ...note, title, content, updatedAt: new Date() }
          : note
      ));

      if (selectedNote?.id === noteId) {
        setSelectedNote(prev => prev ? { ...prev, title, content, updatedAt: new Date() } : null);
      }

      toast.success('Note mise à jour');
    } catch (error) {
      console.error('Error updating note:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;

      setNotes(prev => prev.filter(note => note.id !== noteId));
      if (selectedNote?.id === noteId) {
        setSelectedNote(null);
      }
      toast.success('Note supprimée');
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (selectedNote || isCreating) {
    return (
      <MainLayout>
        <ModernNoteEditor
          note={selectedNote}
          onSave={selectedNote ? handleUpdateNote : handleCreateNote}
          onDelete={selectedNote ? () => handleDeleteNote(selectedNote.id) : undefined}
          onBack={() => {
            setSelectedNote(null);
            setIsCreating(false);
          }}
        />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="music-card p-6 border border-music-indigo/20"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-music-emerald to-music-indigo bg-clip-text text-transparent">
                Mes Notes
              </h1>
              <p className="text-muted-foreground">
                {notes.length} note{notes.length > 1 ? 's' : ''} • Organisez vos créations musicales
              </p>
            </div>
            
            <Button 
              onClick={() => setIsCreating(true)}
              className="modern-button bg-gradient-to-r from-music-emerald to-music-indigo hover:from-music-emerald/90 hover:to-music-indigo/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle note
            </Button>
          </div>
        </motion.div>

        {/* Controls Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="music-card p-4 border border-music-deep-purple/20"
        >
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher dans vos notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 modern-input bg-gradient-to-r from-background/50 to-music-midnight/30 border-music-deep-purple/30"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 p-1 rounded-xl bg-gradient-to-r from-secondary/50 to-music-midnight/30 border border-music-deep-purple/20">
              <Button
                variant={viewMode === 'masonry' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('masonry')}
                className={viewMode === 'masonry' 
                  ? 'bg-gradient-to-r from-music-emerald to-music-indigo text-white' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-music-deep-purple/20'
                }
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className={viewMode === 'grid' 
                  ? 'bg-gradient-to-r from-music-emerald to-music-indigo text-white' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-music-deep-purple/20'
                }
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className={viewMode === 'list' 
                  ? 'bg-gradient-to-r from-music-emerald to-music-indigo text-white' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-music-deep-purple/20'
                }
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Notes Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="music-card p-6 animate-pulse">
                  <div className="h-4 bg-gradient-to-r from-music-deep-purple/20 to-music-indigo/20 rounded mb-3"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gradient-to-r from-music-deep-purple/20 to-music-indigo/20 rounded w-4/5"></div>
                    <div className="h-3 bg-gradient-to-r from-music-deep-purple/20 to-music-indigo/20 rounded w-3/5"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="text-center py-16">
              <div className="music-card p-12 border-dashed border-2 border-music-indigo/30">
                <div className="vinyl-effect w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-music-emerald/20 to-music-indigo/20"></div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">
                  {searchTerm ? 'Aucun résultat trouvé' : 'Aucune note pour le moment'}
                </h3>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                  {searchTerm 
                    ? `Aucune note ne correspond à "${searchTerm}"`
                    : 'Commencez par créer votre première note pour organiser vos idées musicales'
                  }
                </p>
                {!searchTerm && (
                  <Button 
                    onClick={() => setIsCreating(true)}
                    className="modern-button bg-gradient-to-r from-music-emerald to-music-indigo hover:from-music-emerald/90 hover:to-music-indigo/90"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Créer ma première note
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <ModernNotesGrid
              notes={filteredNotes}
              onNoteSelect={setSelectedNote}
              viewMode={viewMode}
            />
          )}
        </motion.div>
      </div>
    </MainLayout>
  );
}
