
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FolderIcon, BookmarkIcon, Music } from 'lucide-react';

interface CreateFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (name: string, icon: 'note' | 'beat') => void;
}

export function CreateFolderDialog({ open, onOpenChange, onSubmit }: CreateFolderDialogProps) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState<'note' | 'beat'>('note');

  const handleSubmit = () => {
    if (name.trim()) {
      onSubmit(name.trim(), icon);
      setName('');
      setIcon('note');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <FolderIcon className="mr-2 h-5 w-5 text-ibh-purple" />
            Créer un nouveau dossier
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex flex-col space-y-2">
            <label htmlFor="folder-name" className="text-sm font-medium">
              Nom du dossier
            </label>
            <Input
              id="folder-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Projet Album"
              autoComplete="off"
            />
          </div>
          
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium">
              Type de contenu
            </label>
            <div className="flex space-x-2">
              <Button
                type="button"
                variant={icon === 'note' ? "default" : "outline"}
                className="flex-1"
                onClick={() => setIcon('note')}
              >
                <BookmarkIcon className="mr-2 h-4 w-4" />
                Notes
              </Button>
              <Button
                type="button"
                variant={icon === 'beat' ? "default" : "outline"}
                className="flex-1"
                onClick={() => setIcon('beat')}
              >
                <Music className="mr-2 h-4 w-4" />
                Beats
              </Button>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={!name.trim()}>
            <FolderIcon className="mr-2 h-4 w-4" />
            Créer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
