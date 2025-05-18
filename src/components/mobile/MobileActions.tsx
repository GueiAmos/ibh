
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { NoteEditor } from '@/components/notes/NoteEditor';
import { VoiceRecorder } from '@/components/audio/VoiceRecorder';
import { BeatUploader } from '@/components/audio/BeatUploader';
import { PlusCircle, BookmarkIcon, Music, Mic, X } from 'lucide-react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '@/components/ui/drawer';
import { useLocation } from 'react-router-dom';

export function MobileActions() {
  const isMobile = useIsMobile();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'note' | 'beat' | 'record'>('note');
  
  // Only show on mobile and on specific pages
  if (!isMobile || !['/notes', '/beats'].includes(location.pathname)) {
    return null;
  }

  const handleActionComplete = () => {
    setIsOpen(false);
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
              <NoteEditor />
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
                  />
                </Button>
              </div>
            )}
            {activeTab === 'record' && (
              <VoiceRecorder className="border rounded-md p-4" />
            )}
          </div>
          
          <DrawerFooter>
            <Button onClick={() => setIsOpen(false)} variant="outline">
              Fermer
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
