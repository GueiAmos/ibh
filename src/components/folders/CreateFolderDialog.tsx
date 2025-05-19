
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface CreateFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (name: string, color: string) => void;
}

export const CreateFolderDialog = ({
  open,
  onOpenChange,
  onSubmit,
}: CreateFolderDialogProps) => {
  const [folderName, setFolderName] = useState('');
  const [folderColor, setFolderColor] = useState('purple');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (folderName.trim()) {
      onSubmit(folderName, folderColor);
      setFolderName('');
      setFolderColor('purple');
    }
  };

  const colorOptions = [
    { value: 'purple', label: 'Violet', className: 'bg-purple-500' },
    { value: 'blue', label: 'Bleu', className: 'bg-blue-500' },
    { value: 'green', label: 'Vert', className: 'bg-green-500' },
    { value: 'amber', label: 'Ambre', className: 'bg-amber-500' },
    { value: 'rose', label: 'Rose', className: 'bg-rose-500' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Créer un nouveau dossier</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nom du dossier</Label>
              <Input
                id="name"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="Mon nouveau dossier"
                maxLength={30}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label>Couleur du dossier</Label>
              <RadioGroup
                value={folderColor}
                onValueChange={setFolderColor}
                className="flex gap-2"
              >
                {colorOptions.map((color) => (
                  <div key={color.value} className="flex flex-col items-center">
                    <RadioGroupItem
                      value={color.value}
                      id={color.value}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={color.value}
                      className={`h-8 w-8 rounded-full cursor-pointer ring-offset-background transition-all peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-data-[state=checked]:ring-2 peer-data-[state=checked]:ring-primary ${color.className}`}
                    />
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Créer</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

