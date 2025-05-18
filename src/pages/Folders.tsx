
import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { FolderIcon, PlusCircle, Search, Music, BookmarkIcon } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { CreateFolderDialog } from '@/components/folders/CreateFolderDialog';
import { toast } from 'sonner';

type Folder = {
  id: string;
  name: string;
  icon: 'note' | 'beat';
  count: number;
  createdAt: Date;
};

// Mock data
const mockFolders: Folder[] = [
  {
    id: '1',
    name: 'Projet Album',
    icon: 'note',
    count: 5,
    createdAt: new Date('2023-10-10')
  },
  {
    id: '2',
    name: 'Freestyles',
    icon: 'note',
    count: 3,
    createdAt: new Date('2023-11-15')
  },
  {
    id: '3',
    name: 'Beats Afro',
    icon: 'beat',
    count: 7,
    createdAt: new Date('2023-12-05')
  },
  {
    id: '4',
    name: 'Collaborations',
    icon: 'note',
    count: 2,
    createdAt: new Date('2024-01-20')
  }
];

const Folders = () => {
  const [folders, setFolders] = useState<Folder[]>(mockFolders);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const isMobile = useIsMobile();

  // Filter folders based on search query
  const filteredFolders = folders.filter(folder =>
    folder.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateFolder = (name: string, icon: 'note' | 'beat') => {
    const newFolder: Folder = {
      id: Date.now().toString(),
      name,
      icon,
      count: 0,
      createdAt: new Date()
    };
    
    setFolders(prevFolders => [newFolder, ...prevFolders]);
    setIsCreateDialogOpen(false);
    toast.success('Dossier créé avec succès!');
  };

  return (
    <MainLayout>
      <div className="ibh-container py-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">Dossiers</h1>
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            size={isMobile ? "icon" : "default"}
          >
            {isMobile ? (
              <PlusCircle className="h-5 w-5" />
            ) : (
              <>
                <PlusCircle className="mr-2 h-4 w-4" /> 
                Nouveau dossier
              </>
            )}
          </Button>
        </div>
        
        {/* Search bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher un dossier..."
            className="w-full pl-9 pr-4 py-2 rounded-md border bg-background"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {/* Folders grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFolders.map(folder => (
            <div 
              key={folder.id}
              className="glass-panel p-4 rounded-lg hover:shadow-md transition-shadow cursor-pointer animate-fade-in"
            >
              <div className="flex items-center mb-3">
                {folder.icon === 'note' ? (
                  <BookmarkIcon className="h-6 w-6 mr-2 text-ibh-purple" />
                ) : (
                  <Music className="h-6 w-6 mr-2 text-ibh-purple" />
                )}
                <div>
                  <h3 className="font-medium">{folder.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {folder.count} {folder.icon === 'note' ? 'notes' : 'beats'}
                  </p>
                </div>
              </div>
              
              <div className="text-xs text-muted-foreground">
                Créé le {folder.createdAt.toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>

        {/* Create folder dialog */}
        <CreateFolderDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onSubmit={handleCreateFolder}
        />
      </div>
    </MainLayout>
  );
};

export default Folders;
