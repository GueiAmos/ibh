
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
import { AudioPlayer } from '@/components/audio/AudioPlayer';
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
    if (noteId) {
      fetchBeats();
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
        
      if (error) throw error;
      
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

      if (noteId) {
        const { error } = await supabase
          .from('notes')
          .update(noteData)
          .eq('id', noteId)
          .eq('user_id', user.id);

        if (error) throw error;
        toast.success('Note mise à jour !');
      } else {
        const { error } = await supabase
          .from('notes')
          .insert(noteData);

        if (error) throw error;
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
    if (!noteId) return;
    
    try {
      const beat = allBeats.find(b => b.id === beatId);
      if (!beat) return;
      
      const { error } = await supabase
        .from('note_beats')
        .upsert({
          note_id: noteId,
          beat_id: beatId,
          is_primary: true
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
      toast.success('Beat retiré de la note');
    } catch (error: any) {
      console.error('Error removing beat:', error);
      toast.error('Erreur lors de la suppression du beat');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-slate-50 dark:bg-slate-900"
    >
      {/* Header Mobile Optimized */}
      <div className="floating-header">
        <div className="px-3 py-3 sm:px-4 sm:py-4 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 sm:h-9 sm:w-9">
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
              <div>
                <h1 className="text-sm sm:text-xl font-bold text-slate-900 dark:text-white mobile-title">
                  {noteId ? 'Modifier la note' : 'Nouvelle note'}
                </h1>
                {selectedBeat && (
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mobile-subtitle">
                    🎵 {selectedBeat.title}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              {/* Voice Panel Toggle */}
              <Sheet open={showVoicePanel} onOpenChange={setShowVoicePanel}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 sm:h-9 sm:w-9">
                    <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full sm:w-96">
                  <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                      <Mic className="w-4 h-4" />
                      Enregistrements vocaux
                    </SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
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
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 sm:h-9 sm:w-9">
                    <MoreHorizontal className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <FolderPlus className="w-4 h-4 mr-2" />
                    Ajouter au dossier
                  </DropdownMenuItem>
                  {noteId && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem 
                          className="text-red-600 dark:text-red-400"
                          onSelect={(e) => e.preventDefault()}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
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
                className="modern-button mobile-button"
              >
                <Save className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                {saving ? 'Sauvegarde...' : 'Sauvegarder'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-3 py-4 sm:px-4 sm:py-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card p-4 sm:p-6 lg:p-8 mobile-card">
            <div className="space-y-4 sm:space-y-6">
              {/* Title */}
              <div>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Titre de votre note..."
                  className="text-lg sm:text-2xl font-bold border-none bg-transparent px-0 focus-visible:ring-0 placeholder:text-slate-400"
                />
              </div>

              {/* Beat Selection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <Music className="w-4 h-4 music-purple" />
                    Beat instrumental
                  </h3>
                </div>
                
                {selectedBeat ? (
                  <div className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-xl p-3 sm:p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm sm:text-base text-slate-900 dark:text-white truncate">
                          {selectedBeat.title}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveBeat}
                        className="h-6 w-6 p-0 text-slate-500 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                    <AudioPlayer audioSrc={selectedBeat.audio_url} />
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-4 text-center">
                    <Music className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                      Aucun beat sélectionné
                    </p>
                    {allBeats.length > 0 && (
                      <Select onValueChange={handleBeatSelect}>
                        <SelectTrigger className="w-full">
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

              {/* Content */}
              <div>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Écrivez vos paroles ici..."
                  className="min-h-[400px] sm:min-h-[500px] border-none bg-transparent px-0 resize-none focus-visible:ring-0 text-sm sm:text-base leading-relaxed placeholder:text-slate-400"
                />
              </div>

              {/* Stats */}
              <div className="flex justify-between text-xs sm:text-sm text-slate-500 dark:text-slate-400 pt-4 border-t border-slate-200 dark:border-slate-700">
                <span>Caractères: {content.length}</span>
                <span>Mots: {content.split(/\s+/).filter(word => word.length > 0).length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
