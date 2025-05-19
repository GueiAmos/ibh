
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Music, Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface BeatUploaderProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (fileUrl: string, fileName: string) => void;
}

export function BeatUploader({ isOpen, onClose, onUploadSuccess }: BeatUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState('');
  const { user } = useAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Check if file is an audio file
      if (!selectedFile.type.startsWith('audio/')) {
        toast.error('Veuillez sélectionner un fichier audio valide');
        return;
      }
      
      setFile(selectedFile);
      
      // Use filename as default title (without extension)
      if (!title) {
        const fileName = selectedFile.name.replace(/\.[^/.]+$/, "");
        setTitle(fileName);
      }
    }
  };

  const handleSubmit = async () => {
    if (!file || !user) {
      toast.error('Veuillez sélectionner un fichier audio ou vous connecter');
      return;
    }

    setUploading(true);

    try {
      // Créer un nom de fichier unique avec le userId pour le stockage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;
      
      // Upload du fichier dans le bucket
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('audio-files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type
        });
      
      if (uploadError) throw uploadError;
      
      // Récupérer l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('audio-files')
        .getPublicUrl(filePath);
      
      console.log('File uploaded successfully:', publicUrl);
      
      // Ajouter le beat dans la base de données
      const { error: insertError } = await supabase
        .from('beats')
        .insert({
          title: title || file.name,
          audio_url: publicUrl,
          user_id: user.id
        });
      
      if (insertError) throw insertError;
      
      // Appeler le callback de succès
      onUploadSuccess(publicUrl, title || file.name);
      
      toast.success('Beat ajouté avec succès');
      
      // Réinitialiser le formulaire
      setFile(null);
      setTitle('');
      onClose();
      
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(`Erreur lors du téléchargement: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Music className="mr-2 h-5 w-5 text-primary" />
            Télécharger un nouveau beat
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex flex-col space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Titre du beat
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Afro Vibez"
            />
          </div>
          
          <div className="flex flex-col space-y-2">
            <label htmlFor="file" className="text-sm font-medium">
              Fichier audio
            </label>
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-background hover:bg-background/90 dark:bg-background/10 hover:border-primary border-muted-foreground/30"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
                  <p className="mb-2 text-sm text-muted-foreground">
                    <span className="font-semibold">Cliquez pour télécharger</span> ou glissez-déposez
                  </p>
                  <p className="text-xs text-muted-foreground">
                    MP3, WAV (MAX. 10 MB)
                  </p>
                  {file && (
                    <p className="mt-2 text-sm font-medium text-primary">
                      {file.name}
                    </p>
                  )}
                </div>
                <Input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept="audio/*"
                />
              </label>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!file || uploading}
            className="relative"
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Téléchargement...
              </>
            ) : (
              <>
                <Music className="mr-2 h-4 w-4" />
                Télécharger
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
