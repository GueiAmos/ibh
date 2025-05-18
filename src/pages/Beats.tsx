
import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { AudioPlayer } from '@/components/audio/AudioPlayer';
import { Button } from '@/components/ui/button';
import { BeatUploader } from '@/components/audio/BeatUploader';
import { FileAudio, PlusCircle, Search, Play } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type Beat = {
  id: string;
  title: string;
  artist: string;
  duration: number;
  url: string;
  createdAt: Date;
  favorite: boolean;
  tags?: string[];
};

// Mock data
const mockBeats: Beat[] = [
  {
    id: '1',
    title: 'Afro Vibez',
    artist: 'Producer X',
    duration: 182,
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    createdAt: new Date('2023-10-15'),
    favorite: true,
    tags: ['afrobeat', 'dancehall']
  },
  {
    id: '2',
    title: 'Trap Expansion',
    artist: 'BeatMaker Pro',
    duration: 195,
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    createdAt: new Date('2023-11-05'),
    favorite: false,
    tags: ['trap', 'afrotrap']
  },
  {
    id: '3',
    title: 'Abidjan Flow',
    artist: 'DJ Arafat Legacy',
    duration: 210,
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    createdAt: new Date('2023-12-01'),
    favorite: true,
    tags: ['coupé-décalé', 'afro']
  }
];

const Beats = () => {
  const [beats, setBeats] = useState<Beat[]>(mockBeats);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBeat, setSelectedBeat] = useState<Beat | null>(null);
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);
  const isMobile = useIsMobile();

  // Filter beats based on search query
  const filteredBeats = beats.filter(beat =>
    beat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    beat.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
    beat.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handlePlayBeat = (beat: Beat) => {
    setSelectedBeat(beat);
  };

  const handleUploadSuccess = async (fileUrl: string, fileName: string) => {
    const newBeat: Beat = {
      id: Date.now().toString(),
      title: fileName || 'Untitled Beat',
      artist: 'Uploaded',
      duration: 0, // This would be calculated using audio metadata in a full implementation
      url: fileUrl,
      createdAt: new Date(),
      favorite: false
    };
    
    setBeats(prevBeats => [newBeat, ...prevBeats]);
    setIsUploaderOpen(false);
    toast.success('Beat uploaded successfully!');
  };

  return (
    <MainLayout>
      <div className="ibh-container py-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">Beats</h1>
          <Button 
            onClick={() => setIsUploaderOpen(true)}
            size={isMobile ? "icon" : "default"}
          >
            {isMobile ? (
              <PlusCircle className="h-5 w-5" />
            ) : (
              <>
                <PlusCircle className="mr-2 h-4 w-4" /> 
                Ajouter un beat
              </>
            )}
          </Button>
        </div>
        
        {/* Search bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher un beat..."
            className="w-full pl-9 pr-4 py-2 rounded-md border bg-background"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {/* Beat list */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBeats.map(beat => (
            <div 
              key={beat.id}
              className="glass-panel p-4 rounded-lg animate-fade-in"
            >
              <div className="flex items-center mb-2">
                <FileAudio className="h-6 w-6 mr-2 text-ibh-purple" />
                <div>
                  <h3 className="font-medium">{beat.title}</h3>
                  <p className="text-sm text-muted-foreground">{beat.artist}</p>
                </div>
              </div>
              
              <div className="mt-3">
                <Button 
                  onClick={() => handlePlayBeat(beat)} 
                  variant="outline" 
                  className="w-full flex items-center justify-center"
                >
                  <Play className="mr-2 h-4 w-4" /> Écouter
                </Button>
              </div>
              
              {beat.tags && (
                <div className="flex flex-wrap mt-2 gap-1">
                  {beat.tags.map(tag => (
                    <span 
                      key={tag} 
                      className="px-2 py-0.5 text-xs rounded-md bg-ibh-purple/10 text-ibh-purple"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Current playing beat */}
        {selectedBeat && (
          <div className="fixed bottom-16 md:bottom-4 left-0 right-0 px-4 mx-auto max-w-lg">
            <div className="glass-panel p-2">
              <div className="flex items-center justify-between mb-2">
                <div className="truncate">
                  <p className="font-medium truncate">{selectedBeat.title}</p>
                  <p className="text-xs text-muted-foreground">{selectedBeat.artist}</p>
                </div>
              </div>
              <AudioPlayer audioSrc={selectedBeat.url} minimized={isMobile} />
            </div>
          </div>
        )}
        
        {/* Beat uploader */}
        <BeatUploader 
          isOpen={isUploaderOpen} 
          onClose={() => setIsUploaderOpen(false)} 
          onUploadSuccess={handleUploadSuccess}
        />
      </div>
    </MainLayout>
  );
};

export default Beats;
