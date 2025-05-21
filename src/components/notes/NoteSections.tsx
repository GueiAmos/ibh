
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  PlusCircle, 
  ChevronDown
} from "lucide-react";

export type SectionType = 'verse' | 'chorus' | 'bridge' | 'hook' | 'outro' | string;

interface NoteSectionsProps {
  onAddSection: (sectionType: SectionType) => void;
}

export function NoteSections({ onAddSection }: NoteSectionsProps) {
  const [customSectionName, setCustomSectionName] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const defaultSections: Array<{type: SectionType, label: string}> = [
    { type: 'verse', label: 'Couplet' },
    { type: 'chorus', label: 'Refrain' },
    { type: 'bridge', label: 'Pont' },
    { type: 'hook', label: 'Hook' },
    { type: 'outro', label: 'Outro' }
  ];
  
  const handleAddCustomSection = () => {
    if (customSectionName.trim()) {
      onAddSection(customSectionName.trim().toLowerCase());
      setCustomSectionName('');
      setShowCustomInput(false);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddCustomSection();
    } else if (e.key === 'Escape') {
      setShowCustomInput(false);
      setCustomSectionName('');
    }
  };
  
  const handleShowCustomInput = () => {
    setShowCustomInput(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };
  
  const sectionColors: Record<string, string> = {
    verse: 'blue',
    chorus: 'purple',
    bridge: 'green',
    hook: 'orange',
    outro: 'gray',
  };
  
  return (
    <div className="flex flex-wrap gap-2 items-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            Insérer section
            <ChevronDown className="h-4 w-4 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {defaultSections.map((section) => (
            <DropdownMenuItem
              key={section.type}
              className="cursor-pointer"
              onClick={() => onAddSection(section.type)}
            >
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  `bg-${sectionColors[section.type]}-500`
                )} />
                {section.label}
              </div>
            </DropdownMenuItem>
          ))}
          <DropdownMenuItem 
            className="cursor-pointer"
            onClick={handleShowCustomInput}
          >
            <PlusCircle className="h-4 w-4 mr-2" /> 
            Section personnalisée
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      {showCustomInput && (
        <div className="flex items-center gap-2">
          <Input
            ref={inputRef}
            type="text"
            placeholder="Nom de la section"
            value={customSectionName}
            onChange={(e) => setCustomSectionName(e.target.value)}
            onKeyDown={handleKeyPress}
            className="max-w-[200px]"
          />
          <Button size="sm" onClick={handleAddCustomSection}>
            Ajouter
          </Button>
        </div>
      )}
    </div>
  );
}
