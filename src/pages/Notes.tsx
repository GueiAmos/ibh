
import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { NoteEditor } from '@/components/notes/NoteEditor';
import { NotesGrid } from '@/components/notes/NotesGrid'; 
import { Note } from '@/components/notes/NoteItem';
import { Button } from '@/components/ui/button';
import { MobileActions } from '@/components/mobile/MobileActions';
import { BookmarkPlus, Search } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from '@/components/ui/drawer';

// Mock data
const mockNotes: Note[] = [
  {
    id: '1',
    title: 'Rêves d\'Abidjan',
    content: 'Dans les rues d\'Abidjan, je marche avec mes rêves. Le soleil brille sur la lagune...',
    createdAt: new Date('2023-11-15'),
    updatedAt: new Date('2023-11-18'),
    favorite: true,
    audioAttached: true,
    sections: [
      { type: 'verse', content: 'Dans les rues d\'Abidjan, je marche avec mes rêves...' },
      { type: 'chorus', content: 'Abidjan oh Abidjan, ville de lumière...' }
    ]
  },
  {
    id: '2',
    title: 'Nuit Sans Fin',
    content: 'Quand la nuit tombe sur la ville, les étoiles deviennent mes témoins...',
    createdAt: new Date('2023-12-02'),
    updatedAt: new Date('2023-12-05'),
    favorite: false,
    audioAttached: false,
    sections: [
      { type: 'verse', content: 'Quand la nuit tombe sur la ville...' }
    ]
  },
  {
    id: '3',
    title: 'Flow de l\'Ouest',
    content: 'Venu de l\'ouest avec mon style unique, personne ne peut m\'arrêter maintenant...',
    createdAt: new Date('2023-12-10'),
    updatedAt: new Date('2023-12-11'),
    favorite: true,
    audioAttached: true,
    sections: [
      { type: 'verse', content: 'Venu de l\'ouest avec mon style unique...' },
      { type: 'chorus', content: 'Flow de l\'ouest, style qui reste...' }
    ]
  }
];

const Notes = () => {
  const [notes, setNotes] = useState<Note[]>(mockNotes);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isMobileEditorOpen, setIsMobileEditorOpen] = useState(false);
  const isMobile = useIsMobile();
  
  // Filter notes based on search query
  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectNote = (note: Note) => {
    setSelectedNote(note);
    setIsCreating(false);
    
    if (isMobile) {
      setIsMobileEditorOpen(true);
    }
  };

  const handleCreateNew = () => {
    setSelectedNote(null);
    setIsCreating(true);
    
    if (isMobile) {
      setIsMobileEditorOpen(true);
    }
  };

  return (
    <MainLayout>
      <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
        {/* Notes list sidebar */}
        <div className="w-full md:w-[350px] lg:w-[450px] border-r flex flex-col overflow-hidden">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Notes</h2>
              <Button onClick={handleCreateNew} variant="ghost" size="icon">
                <BookmarkPlus className="h-5 w-5" />
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Rechercher..."
                className="w-full pl-9 pr-4 py-2 rounded-md border bg-background"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            <NotesGrid 
              notes={filteredNotes} 
              onNoteSelect={handleSelectNote}
              selectedNoteId={selectedNote?.id}
            />
          </div>
        </div>
        
        {/* Editor area - desktop */}
        <div className="hidden md:flex flex-1 overflow-hidden">
          <div className="flex-1 p-6 overflow-y-auto">
            {selectedNote ? (
              <NoteEditor noteId={selectedNote.id} />
            ) : isCreating ? (
              <NoteEditor />
            ) : (
              <div className="h-full flex items-center justify-center text-center">
                <div>
                  <p className="text-muted-foreground mb-4">
                    Sélectionnez une note ou créez-en une nouvelle
                  </p>
                  <Button onClick={handleCreateNew}>
                    <BookmarkPlus className="mr-2 h-4 w-4" />
                    Nouvelle note
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile editor drawer */}
      {isMobile && (
        <>
          <MobileActions />
          
          <Drawer open={isMobileEditorOpen} onOpenChange={setIsMobileEditorOpen}>
            <DrawerContent className="h-[85vh] max-h-[85vh]">
              <DrawerHeader>
                <DrawerTitle>
                  {selectedNote ? selectedNote.title : 'Nouvelle note'}
                </DrawerTitle>
                <DrawerClose />
              </DrawerHeader>
              <div className="px-4 pb-4 overflow-y-auto h-full">
                {selectedNote ? (
                  <NoteEditor noteId={selectedNote.id} />
                ) : (
                  <NoteEditor />
                )}
              </div>
            </DrawerContent>
          </Drawer>
        </>
      )}
    </MainLayout>
  );
};

export default Notes;
