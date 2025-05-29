
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileNoteEditor } from '@/components/notes/MobileNoteEditor';
import { VoiceRecorder } from '@/components/audio/VoiceRecorder';
import { BeatUploader } from '@/components/audio/BeatUploader';
import { PlusCircle, BookmarkIcon, Music, Mic, X } from 'lucide-react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '@/components/ui/drawer';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export function MobileActions() {
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'note' | 'beat' | 'record'>('note');
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);
  const { user } = useAuth();
  
  // Only show on mobile and on specific pages
  if (!isMobile || !['/notes', '/beats', '/'].includes(location.pathname)) {
    return null;
  }

  const handleSaveNote = async (title: string, content: string, audioUrl?: string) => {
    if (!user) {
      toast.error('Vous devez être connecté pour sauvegarder une note');
      return;
    }
    
    try {
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
      setIsOpen(false);
      
      // Rediriger vers la page des notes si on n'y est pas déjà
      if (location.pathname !== '/notes') {
        navigate('/notes');
      } else {
        // Forcer un rechargement pour voir la nouvelle note
        window.location.reload();
      }
    } catch (error: any) {
      console.error('Error saving note:', error);
      toast.error(`Erreur lors de l'enregistrement: ${error.message}`);
    }
  };

  const handleUploadSuccess = (fileUrl: string, fileName: string) => {
    setIsUploaderOpen(false);
    setIsOpen(false);
    
    // Rediriger vers la page des beats si on n'y est pas déjà
    if (location.pathname !== '/beats') {
      navigate('/beats');
    } else {
      // Forcer un rechargement pour voir le nouveau beat
      window.location.reload();
    }
  };

  const handleFileBeatUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('audio/')) {
        toast.error('Veuillez sélectionner un fichier audio');
        return;
      }
      
      setIsUploaderOpen(true);
    }
  };

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed z-50 bottom-6 right-6"
        >
          <Button 
            onClick={() => setIsOpen(true)}
            className="rounded-full h-14 w-14 shadow-lg bg-primary hover:bg-primary/90"
            aria-label="Créer"
          >
            <PlusCircle className="h-6 w-6" />
          </Button>
        </motion.div>
      </AnimatePresence>
      
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerContent className="px-4 rounded-t-xl">
          <DrawerHeader className="text-center">
            <DrawerTitle className="text-xl">
              {activeTab === 'note' && 'Nouvelle note'}
              {activeTab === 'beat' && 'Ajouter un beat'}
              {activeTab === 'record' && 'Enregistrement vocal'}
            </DrawerTitle>
            
            <div className="flex justify-center space-x-4 mt-4">
              <Button
                variant={activeTab === 'note' ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab('note')}
                className="rounded-full"
              >
                <BookmarkIcon className="h-4 w-4 mr-2" />
                Note
              </Button>
              <Button
                variant={activeTab === 'beat' ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab('beat')}
                className="rounded-full"
              >
                <Music className="h-4 w-4 mr-2" />
                Beat
              </Button>
              <Button
                variant={activeTab === 'record' ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab('record')}
                className="rounded-full"
              >
                <Mic className="h-4 w-4 mr-2" />
                Voix
              </Button>
            </div>
          </DrawerHeader>
          
          <div className="p-4 max-h-[70vh] overflow-y-auto">
            <AnimatePresence mode="wait">
              {activeTab === 'note' && (
                <motion.div
                  key="note-editor"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <MobileNoteEditor onSave={handleSaveNote} />
                </motion.div>
              )}
              
              {activeTab === 'beat' && (
                <motion.div
                  key="beat-upload"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-center h-32"
                >
                  <Button 
                    onClick={() => document.getElementById('mobile-file-upload')?.click()}
                    variant="outline"
                    className="h-20 w-full max-w-xs rounded-xl border-dashed border-2"
                  >
                    <Music className="mr-2 h-5 w-5" />
                    <span>Choisir un fichier audio</span>
                    <input 
                      id="mobile-file-upload" 
                      type="file" 
                      accept="audio/*"
                      className="hidden"
                      onChange={handleFileBeatUpload}
                    />
                  </Button>
                </motion.div>
              )}
              
              {activeTab === 'record' && (
                <motion.div
                  key="voice-recorder"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <VoiceRecorder 
                    onRecordingComplete={(blob) => {
                      toast.success('Enregistrement terminé! Vous pouvez maintenant créer une note avec.');
                      setActiveTab('note');
                    }}
                    className="border rounded-lg p-4 bg-background/50" 
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <DrawerFooter className="pt-2 pb-6">
            <Button onClick={() => setIsOpen(false)} variant="outline" className="rounded-full">
              Fermer
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {isUploaderOpen && (
        <BeatUploader
          isOpen={isUploaderOpen}
          onClose={() => setIsUploaderOpen(false)}
          onUploadSuccess={handleUploadSuccess}
        />
      )}
    </>
  );
}
