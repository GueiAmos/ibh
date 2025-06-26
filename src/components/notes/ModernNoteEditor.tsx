
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft, 
  Save, 
  Music, 
  Mic, 
  MoreHorizontal,
  Trash2,
  FolderPlus,
  Play,
  Pause,
  Plus,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { VoiceRecordingsList } from '@/components/audio/VoiceRecordingsList';
import { GlobalBeatPlayer } from '@/components/audio/GlobalBeatPlayer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ModernNoteEditorProps {
  noteId?: string;
  initialTitle?: string;
  initialContent?: string;
  onSave?: () => void;
  onDelete?: () => void;
  onClose?: () => void;
}

interface Beat {
  id: string;
  title: string;
  audio_url: string;
}

export function ModernNoteEditor({ 
  noteId, 
  initialTitle = '', 
  initialContent = '', 
  onSave, 
  onDelete, 
  onClose 
}: ModernNoteEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [saving, setSaving] = useState(false);
  const [selectedBeat, setSelectedBeat] = useState<Beat | null>(null);
  const [allBeats, setAllBeats] = useState<Beat[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showVoicePanel, setShowVoicePanel] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    setTitle(initialTitle);
    setContent(initialContent);
    fetchBeats();
    if (noteId) {
      fetchNoteBeat();
    }
  }, [initialTitle, initialContent, noteId]);

  const fetchBeats = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('beats')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setAllBeats(data || []);
    } catch (error: any) {
      console.error('Error fetching beats:', error);
    }
  };

  const fetchNoteBeat = async () => {
    if (!noteId || !user) return;
    
    try {
      const { data, error } = await supabase
        .from('note_beats')
        .select(`
          beat_id,
          beats (
            id,
            title,
            audio_url
          )
        `)
        .eq('note_id', noteId)
        .eq('is_primary', true)
        .single();
        
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      if (data && data.beats) {
        setSelectedBeat(data.beats as Beat);
      }
    } catch (error: any) {
      console.error('Error fetching note beat:', error);
    }
  };

  const handleSave = async () => {
    if (!user) {
      toast.error('Vous devez être connecté pour sauvegarder');
      return;
    }

    if (!title.trim()) {
      toast.error('Le titre est requis');
      return;
    }

    setSaving(true);
    try {
      const noteData = {
        title: title.trim(),
        content: content.trim(),
        user_id: user.id,
        updated_at: new Date().toISOString()
      };

      let savedNoteId = noteId;

      if (noteId) {
        const { error } = await supabase
          .from('notes')
          .update(noteData)
          .eq('id', noteId)
          .eq('user_id', user.id);

        if (error) throw error;
        toast.success('Note mise à jour !');
      } else {
        const { data, error } = await supabase
          .from('notes')
          .insert(noteData)
          .select()
          .single();

        if (error) throw error;
        savedNoteId = data.id;
        toast.success('Note créée !');
      }

      onSave?.();
      onClose?.();
    } catch (error) {
      console.error('Error saving note:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!noteId || !user) return;

    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Note supprimée');
      onDelete?.();
      onClose?.();
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleBeatSelect = async (beatId: string) => {
    console.log('Selecting beat:', beatId);
    
    if (!beatId) return;
    
    try {
      const beat = allBeats.find(b => b.id === beatId);
      if (!beat) {
        toast.error('Beat non trouvé');
        return;
      }
      
      // Si on n'a pas de note sauvegardée, on ne peut pas associer de beat
      if (!noteId) {
        toast.error('Veuillez d\'abord sauvegarder la note');
        return;
      }
      
      const { error } = await supabase
        .from('note_beats')
        .upsert({
          note_id: noteId,
          beat_id: beatId,
          is_primary: true
        }, {
          onConflict: 'note_id,beat_id'
        });
        
      if (error) throw error;
      
      setSelectedBeat(beat);
      toast.success('Beat associé à la note');
    } catch (error: any) {
      console.error('Error selecting beat:', error);
      toast.error('Erreur lors de la sélection du beat');
    }
  };

  const handleRemoveBeat = async () => {
    if (!noteId || !selectedBeat) return;
    
    try {
      const { error } = await supabase
        .from('note_beats')
        .delete()
        .eq('note_id', noteId)
        .eq('beat_id', selectedBeat.id);
        
      if (error) throw error;
      
      setSelectedBeat(null);
      setIsPlaying(false);
      toast.success('Beat retiré de la note');
    } catch (error: any) {
      console.error('Error removing beat:', error);
      toast.error('Erreur lors de la suppression du beat');
    }
  };

  const handleBeatPlay = () => {
    setIsPlaying(true);
  };

  const handleBeatPause = () => {
    setIsPlaying(false);
  };

  const handleBeatClose = () => {
    setIsPlaying(false);
    setSelectedBeat(null);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen bg-slate-50 dark:bg-slate-900"
      >
        {/* Header */}
        <div className="floating-header">
          <div className="px-3 py-2 lg:px-6 lg:py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 lg:gap-3">
                <Button variant="ghost" size="sm" onClick={onClose} className="h-7 w-7 lg:h-8 lg:w-8 p-0">
                  <ArrowLeft className="w-3 h-3 lg:w-4 lg:h-4" />
                </Button>
                <div>
                  <h1 className="text-sm lg:text-lg font-bold text-slate-900 dark:text-white mobile-title">
                    {noteId ? 'Modifier la note' : 'Nouvelle note'}
                  </h1>
                </div>
              </div>

              <div className="flex items-center gap-1 lg:gap-2">
                <Sheet open={showVoicePanel} onOpenChange={setShowVoicePanel}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 w-7 lg:h-8 lg:w-8 p-0">
                      <Mic className="w-3 h-3 lg:w-4 lg:h-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-full sm:w-96">
                    <SheetHeader>
                      <SheetTitle className="flex items-center gap-2 text-sm lg:text-base">
                        <Mic className="w-3 h-3 lg:w-4 lg:h-4" />
                        Enregistrements vocaux
                      </SheetTitle>
                    </SheetHeader>
                    <div className="mt-4">
                      <VoiceRecordingsList 
                        noteId={noteId}
                        onRecordingAdded={() => {
                          toast.success('Nouvel enregistrement disponible!');
                        }}
                      />
                    </div>
                  </SheetContent>
                </Sheet>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 w-7 lg:h-8 lg:w-8 p-0">
                      <MoreHorizontal className="w-3 h-3 lg:w-4 lg:h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <FolderPlus className="w-3 h-3 lg:w-4 lg:h-4 mr-2" />
                      Ajouter au dossier
                    </DropdownMenuItem>
                    {noteId && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem 
                            className="text-red-600 dark:text-red-400"
                            onSelect={(e) => e.preventDefault()}
                          >
                            <Trash2 className="w-3 h-3 lg:w-4 lg:h-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Supprimer la note ?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Cette action est irréversible.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete}>
                              Supprimer
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button 
                  onClick={handleSave} 
                  disabled={saving || !title.trim()} 
                  className="modern-button text-xs lg:text-sm px-2 lg:px-3 py-1 lg:py-1.5"
                >
                  <Save className="w-3 h-3 lg:w-4 lg:h-4 mr-1" />
                  {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Contenu */}
        <div className="px-3 py-3 lg:px-6 lg:py-4">
          <div className="max-w-4xl mx-auto">
            <div className="glass-card p-3 lg:p-6 mobile-card">
              <div className="space-y-3 lg:space-y-4">
                {/* Titre */}
                <div>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Titre de votre note..."
                    className="text-base lg:text-xl font-bold border-none bg-transparent px-0 focus-visible:ring-0 placeholder:text-slate-400"
                  />
                </div>

                {/* Sélection de beat */}
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 lg:p-4">
                  <div className="flex items-center justify-between mb-2 lg:mb-3">
                    <h3 className="text-xs lg:text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <Music className="w-3 h-3 lg:w-4 lg:h-4 text-blue-600" />
                      Beat instrumental
                    </h3>
                  </div>
                  
                  {selectedBeat ? (
                    <div className="bg-white dark:bg-slate-700 rounded-lg p-2 lg:p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-xs lg:text-sm text-slate-900 dark:text-white truncate">
                            {selectedBeat.title}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 lg:gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={isPlaying ? handleBeatPause : handleBeatPlay}
                            className="h-6 w-6 lg:h-7 lg:w-7 p-0"
                          >
                            {isPlaying ? (
                              <Pause className="w-3 h-3 lg:w-4 lg:h-4" />
                            ) : (
                              <Play className="w-3 h-3 lg:w-4 lg:h-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleRemoveBeat}
                            className="h-6 w-6 lg:h-7 lg:w-7 p-0 text-slate-500 hover:text-red-500"
                          >
                            <X className="w-3 h-3 lg:w-4 lg:h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-3 text-center">
                      <Music className="w-6 h-6 lg:w-8 lg:h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-xs lg:text-sm text-slate-600 dark:text-slate-400 mb-2">
                        {!noteId ? 'Sauvegardez d\'abord la note pour associer un beat' : 'Aucun beat sélectionné'}
                      </p>
                      {allBeats.length > 0 && noteId && (
                        <Select onValueChange={handleBeatSelect}>
                          <SelectTrigger className="w-full text-xs lg:text-sm">
                            <SelectValue placeholder="Choisir un beat" />
                          </SelectTrigger>
                          <SelectContent>
                            {allBeats.map((beat) => (
                              <SelectItem key={beat.id} value={beat.id}>
                                {beat.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  )}
                </div>

                {/* Contenu */}
                <div>
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Écrivez vos paroles ici..."
                    className="min-h-[300px] lg:min-h-[400px] border-none bg-transparent px-0 resize-none focus-visible:ring-0 text-sm lg:text-base leading-relaxed placeholder:text-slate-400"
                  />
                </div>

                {/* Statistiques */}
                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-200 dark:border-slate-700">
                  <span>Caractères: {content.length}</span>
                  <span>Mots: {content.split(/\s+/).filter(word => word.length > 0).length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Lecteur audio global */}
      <GlobalBeatPlayer
        beat={selectedBeat}
        isPlaying={isPlaying}
        onPlay={handleBeatPlay}
        onPause={handleBeatPause}
        onClose={handleBeatClose}
      />
    </>
  );
}
