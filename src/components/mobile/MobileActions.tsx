
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { NoteEditor } from '@/components/notes/NoteEditor';
import { VoiceRecorder } from '@/components/audio/VoiceRecorder';
import { BeatUploader } from '@/components/audio/BeatUploader';
import { PlusCircle, BookmarkIcon, Music, Mic, X } from 'lucide-react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '@/components/ui/drawer';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

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
      <Button 
        onClick={() => setIsOpen(true)}
        className="fixed z-50 bottom-6 right-6 rounded-full h-14 w-14 shadow-lg"
      >
        <PlusCircle className="h-6 w-6" />
      </Button>
      
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerContent className="px-4">
          <DrawerHeader>
            <DrawerTitle className="text-center">
              {activeTab === 'note' && 'Nouvelle note'}
              {activeTab === 'beat' && 'Ajouter un beat'}
              {activeTab === 'record' && 'Enregistrer votre voix'}
            </DrawerTitle>
            
            <div className="flex justify-center space-x-4 mt-2">
              <Button
                variant={activeTab === 'note' ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab('note')}
              >
                <BookmarkIcon className="h-4 w-4" />
              </Button>
              <Button
                variant={activeTab === 'beat' ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab('beat')}
              >
                <Music className="h-4 w-4" />
              </Button>
              <Button
                variant={activeTab === 'record' ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab('record')}
              >
                <Mic className="h-4 w-4" />
              </Button>
            </div>
          </DrawerHeader>
          
          <div className="p-4 max-h-[70vh] overflow-y-auto">
            {activeTab === 'note' && (
              <NoteEditor onSave={handleSaveNote} />
            )}
            {activeTab === 'beat' && (
              <div className="flex items-center justify-center h-32">
                <Button 
                  onClick={() => document.getElementById('mobile-file-upload')?.click()}
                  variant="outline"
                  className="h-20"
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
              </div>
            )}
            {activeTab === 'record' && (
              <VoiceRecorder 
                onRecordingComplete={(blob) => {
                  toast.success('Enregistrement terminé! Vous pouvez maintenant créer une note avec.');
                  setActiveTab('note');
                }}
                className="border rounded-md p-4" 
              />
            )}
          </div>
          
          <DrawerFooter>
            <Button onClick={() => setIsOpen(false)} variant="outline">
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
