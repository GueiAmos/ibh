
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { AudioPlayer } from "@/components/audio/AudioPlayer";
import { VoiceRecorder } from "@/components/audio/VoiceRecorder";
import { Input } from "@/components/ui/input";
import { Mic, Trash2, Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
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
import { motion } from 'framer-motion';

export interface VoiceRecording {
  id: string;
  title: string;
  audio_url: string;
  created_at: string;
}

interface VoiceRecordingsListProps {
  noteId?: string;
  onRecordingAdded?: () => void;
}

export function VoiceRecordingsList({ noteId, onRecordingAdded }: VoiceRecordingsListProps) {
  const [recordings, setRecordings] = useState<VoiceRecording[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const { user } = useAuth();
  
  // Fetch recordings for this note
  useEffect(() => {
    if (!noteId) {
      setRecordings([]);
      setLoading(false);
      return;
    }
    
    const fetchRecordings = async () => {
      setLoading(true);
      try {
        // Use the any type to bypass TypeScript errors until Supabase types are updated
        const { data, error } = await (supabase as any)
          .from('voice_recordings')
          .select('*')
          .eq('note_id', noteId)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        setRecordings(data || []);
      } catch (error: any) {
        console.error('Error fetching recordings:', error);
        toast.error('Erreur lors du chargement des enregistrements');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecordings();
  }, [noteId]);
  
  const handleRecordingComplete = async (audioBlob: Blob) => {
    if (!noteId || !user) {
      toast.error('Impossible d\'enregistrer');
      return;
    }
    
    try {
      // Upload audio file
      const fileExt = 'webm';
      const fileName = `${user.id}/recordings/${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('audio-files')
        .upload(filePath, audioBlob, {
          cacheControl: '3600',
          upsert: false,
          contentType: 'audio/webm'
        });
        
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('audio-files')
        .getPublicUrl(filePath);
      
      // Create title for recording based on date and time
      const now = new Date();
      const title = `Enregistrement du ${now.toLocaleDateString()} à ${now.toLocaleTimeString()}`;
      
      // Save recording in database
      const { data, error } = await (supabase as any)
        .from('voice_recordings')
        .insert({
          title,
          audio_url: publicUrl,
          note_id: noteId,
          user_id: user.id
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Add to recordings list
      setRecordings([data as VoiceRecording, ...recordings]);
      toast.success('Enregistrement ajouté avec succès');
      
      if (onRecordingAdded) {
        onRecordingAdded();
      }
    } catch (error: any) {
      console.error('Error saving recording:', error);
      toast.error(`Erreur lors de l'enregistrement: ${error.message}`);
    } finally {
      setIsRecording(false);
    }
  };
  
  const handleDeleteRecording = async (recordingId: string) => {
    try {
      // Delete the recording from database
      const { error } = await (supabase as any)
        .from('voice_recordings')
        .delete()
        .eq('id', recordingId);
        
      if (error) throw error;
      
      // Remove from recordings list
      setRecordings(recordings.filter(r => r.id !== recordingId));
      toast.success('Enregistrement supprimé');
      
      // Note: For simplicity, we're not deleting the audio file from storage
      // In a production app, you might want to do that as well
    } catch (error: any) {
      console.error('Error deleting recording:', error);
      toast.error('Erreur lors de la suppression');
    }
  };
  
  const handleRenameRecording = async (recordingId: string) => {
    if (!editingTitle.trim()) {
      toast.error('Le titre ne peut pas être vide');
      return;
    }
    
    try {
      const { error } = await (supabase as any)
        .from('voice_recordings')
        .update({ title: editingTitle })
        .eq('id', recordingId);
        
      if (error) throw error;
      
      // Update in the list
      setRecordings(recordings.map(r => 
        r.id === recordingId ? { ...r, title: editingTitle } : r
      ));
      
      // Reset editing state
      setEditingId(null);
      setEditingTitle('');
      
      toast.success('Enregistrement renommé');
    } catch (error: any) {
      console.error('Error renaming recording:', error);
      toast.error('Erreur lors du renommage');
    }
  };
  
  const startEditing = (recording: VoiceRecording) => {
    setEditingId(recording.id);
    setEditingTitle(recording.title);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Enregistrements vocaux</h3>
        <Button 
          size="sm" 
          variant={isRecording ? "destructive" : "outline"} 
          onClick={() => setIsRecording(!isRecording)}
        >
          {isRecording ? 'Annuler' : (
            <>
              <Plus className="mr-1 h-4 w-4" />
              Nouvel enregistrement
            </>
          )}
        </Button>
      </div>
      
      {isRecording && (
        <div className="border rounded-md p-4 bg-muted/30">
          <VoiceRecorder onRecordingComplete={handleRecordingComplete} />
        </div>
      )}
      
      {loading ? (
        <div className="text-center py-4 text-muted-foreground">
          Chargement des enregistrements...
        </div>
      ) : recordings.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground">
          <Mic className="h-12 w-12 mx-auto mb-2 opacity-20" />
          <p>Aucun enregistrement pour cette note</p>
          <p className="text-sm">Cliquez sur "Nouvel enregistrement" pour commencer</p>
        </div>
      ) : (
        <div className="space-y-3">
          {recordings.map((recording) => (
            <motion.div 
              key={recording.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border rounded-md p-3 bg-background flex flex-col sm:flex-row gap-3 items-start sm:items-center"
            >
              {editingId === recording.id ? (
                <div className="flex-1">
                  <Input
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    autoFocus
                    className="mb-2"
                  />
                  <div className="flex gap-2 justify-end">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => setEditingId(null)}
                    >
                      Annuler
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => handleRenameRecording(recording.id)}
                    >
                      Enregistrer
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex-1">
                    <div className="font-medium mb-1">{recording.title}</div>
                    <AudioPlayer audioSrc={recording.audio_url} />
                  </div>
                  <div className="flex gap-2 mt-2 sm:mt-0">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => startEditing(recording)}
                      className="h-8 w-8"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Cette action ne peut pas être annulée. Cet enregistrement sera supprimé définitivement.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDeleteRecording(recording.id)}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            Supprimer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
