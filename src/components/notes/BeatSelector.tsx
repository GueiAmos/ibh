
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { AudioPlayer } from "@/components/audio/AudioPlayer";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Music, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { BeatUploader } from "@/components/audio/BeatUploader";

interface Beat {
  id: string;
  title: string;
  audio_url: string;
  created_at: string;
}

interface BeatSelectorProps {
  noteId?: string;
  initialBeatId?: string;
  onBeatSelected?: (beatId: string | null) => void;
}

export function BeatSelector({ noteId, initialBeatId, onBeatSelected }: BeatSelectorProps) {
  const [beats, setBeats] = useState<Beat[]>([]);
  const [selectedBeatId, setSelectedBeatId] = useState<string | null>(initialBeatId || null);
  const [selectedBeat, setSelectedBeat] = useState<Beat | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();
  
  // Fetch all beats
  useEffect(() => {
    const fetchBeats = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('beats')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        setBeats(data || []);
      } catch (error: any) {
        console.error('Error fetching beats:', error);
        toast.error('Erreur lors du chargement des beats');
      } finally {
        setLoading(false);
      }
    };
    
    fetchBeats();
  }, [user]);
  
  // Fetch initial selected beat if any
  useEffect(() => {
    if (!initialBeatId) return;
    
    const fetchSelectedBeat = async () => {
      try {
        const { data, error } = await supabase
          .from('beats')
          .select('*')
          .eq('id', initialBeatId)
          .single();
          
        if (error) throw error;
        setSelectedBeat(data as Beat);
      } catch (error) {
        console.error('Error fetching selected beat:', error);
      }
    };
    
    fetchSelectedBeat();
  }, [initialBeatId]);
  
  const handleBeatSelect = async (beatId: string) => {
    if (!noteId) return;
    
    try {
      // Find the beat
      const beat = beats.find(b => b.id === beatId);
      if (!beat) return;
      
      // Update the note with the selected beat
      const { error } = await supabase
        .from('note_beats')
        .upsert({
          note_id: noteId,
          beat_id: beatId,
          is_primary: true
        });
        
      if (error) throw error;
      
      setSelectedBeatId(beatId);
      setSelectedBeat(beat);
      
      if (onBeatSelected) {
        onBeatSelected(beatId);
      }
      
      toast.success('Beat associé à la note');
    } catch (error: any) {
      console.error('Error selecting beat:', error);
      toast.error('Erreur lors de la sélection du beat');
    }
  };
  
  const handleRemoveBeat = async () => {
    if (!noteId || !selectedBeatId) return;
    
    try {
      // Remove the association between note and beat
      const { error } = await supabase
        .from('note_beats')
        .delete()
        .eq('note_id', noteId)
        .eq('beat_id', selectedBeatId);
        
      if (error) throw error;
      
      setSelectedBeatId(null);
      setSelectedBeat(null);
      
      if (onBeatSelected) {
        onBeatSelected(null);
      }
      
      toast.success('Beat retiré de la note');
    } catch (error: any) {
      console.error('Error removing beat:', error);
      toast.error('Erreur lors de la suppression du beat');
    }
  };
  
  const handleUploadSuccess = (fileUrl: string, fileName: string) => {
    // Refetch beats after upload
    const fetchBeats = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('beats')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        setBeats(data || []);
        
        // Select the newly added beat (it should be first)
        if (data && data.length > 0) {
          handleBeatSelect(data[0].id);
        }
      } catch (error: any) {
        console.error('Error fetching beats:', error);
      }
    };
    
    fetchBeats();
    setIsUploaderOpen(false);
  };
  
  // Filter beats by search query
  const filteredBeats = searchQuery.trim() === ''
    ? beats
    : beats.filter(beat => 
        beat.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Beat associé</h3>
        <Dialog>
          <DialogTrigger asChild>
            <Button 
              size="sm" 
              variant="outline"
            >
              <Music className="mr-1 h-4 w-4" />
              {selectedBeat ? 'Changer de beat' : 'Ajouter un beat'}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Sélectionner un beat</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Rechercher un beat..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  variant="outline" 
                  onClick={() => setIsUploaderOpen(true)}
                >
                  Importer
                </Button>
              </div>
              
              {loading ? (
                <div className="text-center py-4">
                  Chargement des beats...
                </div>
              ) : filteredBeats.length === 0 ? (
                <div className="text-center py-8">
                  <Music className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p>Aucun beat trouvé</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setIsUploaderOpen(true)}
                  >
                    Importer un beat
                  </Button>
                </div>
              ) : (
                <div className="max-h-[300px] overflow-y-auto space-y-2">
                  {filteredBeats.map((beat) => (
                    <div 
                      key={beat.id}
                      className="border rounded-md p-3 bg-background flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{beat.title}</div>
                        <DialogClose asChild>
                          <Button 
                            size="sm" 
                            onClick={() => handleBeatSelect(beat.id)}
                          >
                            Sélectionner
                          </Button>
                        </DialogClose>
                      </div>
                      <AudioPlayer audioSrc={beat.audio_url} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      {selectedBeat ? (
        <div className="border rounded-md p-3 bg-background">
          <div className="flex items-center justify-between mb-2">
            <div className="font-medium">{selectedBeat.title}</div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleRemoveBeat}
              className="h-8 text-destructive hover:text-destructive"
            >
              <X className="h-4 w-4 mr-1" />
              Retirer
            </Button>
          </div>
          <AudioPlayer audioSrc={selectedBeat.audio_url} />
        </div>
      ) : (
        <div className="text-center py-6 bg-muted/30 border rounded-md text-muted-foreground">
          <Music className="h-12 w-12 mx-auto mb-2 opacity-20" />
          <p>Aucun beat associé à cette note</p>
        </div>
      )}
      
      <BeatUploader 
        isOpen={isUploaderOpen} 
        onClose={() => setIsUploaderOpen(false)} 
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  );
}
