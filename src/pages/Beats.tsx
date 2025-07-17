
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BeatUploader } from '@/components/audio/BeatUploader';
import { AudioPlayer } from '@/components/audio/AudioPlayer';
import { Music, Search, Upload, Play, Pause, Trash2, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface Beat {
  id: string;
  title: string;
  audio_url: string;
  created_at: string;
}

export default function Beats() {
  const { user } = useAuth();
  const [beats, setBeats] = useState<Beat[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showUploader, setShowUploader] = useState(false);

  const fetchBeats = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('beats')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBeats(data || []);
    } catch (error) {
      console.error('Error fetching beats:', error);
      toast.error('Erreur lors du chargement des beats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBeats();
  }, [user]);

  const handleBeatUploaded = () => {
    fetchBeats();
    setShowUploader(false);
    toast.success('Beat ajouté avec succès');
  };

  const handleDeleteBeat = async (beatId: string) => {
    try {
      const { error } = await supabase
        .from('beats')
        .delete()
        .eq('id', beatId);

      if (error) throw error;
      
      setBeats(prev => prev.filter(beat => beat.id !== beatId));
      toast.success('Beat supprimé');
    } catch (error) {
      console.error('Error deleting beat:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const filteredBeats = beats.filter(beat =>
    beat.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="music-card p-6 border border-music-royal-blue/20"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-music-royal-blue to-music-deep-purple bg-clip-text text-transparent">
                Ma Collection de Beats
              </h1>
              <p className="text-muted-foreground">
                {beats.length} beat{beats.length > 1 ? 's' : ''} • Votre bibliothèque musicale
              </p>
            </div>
            
            <Button 
              onClick={() => setShowUploader(true)}
              className="modern-button bg-gradient-to-r from-music-royal-blue to-music-deep-purple hover:from-music-royal-blue/90 hover:to-music-deep-purple/90"
            >
              <Upload className="w-4 h-4 mr-2" />
              Ajouter un beat
            </Button>
          </div>
        </motion.div>

        {/* Search Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="music-card p-4 border border-music-deep-purple/20"
        >
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un beat..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 modern-input bg-gradient-to-r from-background/50 to-music-midnight/30 border-music-deep-purple/30"
            />
          </div>
        </motion.div>

        {/* Upload Modal */}
        {showUploader && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="music-card p-6 max-w-md w-full border border-music-royal-blue/30"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-foreground">Ajouter un nouveau beat</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowUploader(false)}
                  className="hover:bg-music-deep-purple/20"
                >
                  ×
                </Button>
              </div>
              <BeatUploader onBeatUploaded={handleBeatUploaded} />
            </motion.div>
          </motion.div>
        )}

        {/* Beats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <Card key={i} className="music-card animate-pulse border-music-deep-purple/20">
                  <CardHeader>
                    <div className="h-6 bg-gradient-to-r from-music-royal-blue/20 to-music-deep-purple/20 rounded"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-12 bg-gradient-to-r from-music-royal-blue/20 to-music-deep-purple/20 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredBeats.length === 0 ? (
            <div className="text-center py-16">
              <div className="music-card p-12 border-dashed border-2 border-music-royal-blue/30">
                <div className="vinyl-effect w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-music-royal-blue/20 to-music-deep-purple/20"></div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">
                  {searchTerm ? 'Aucun beat trouvé' : 'Aucun beat pour le moment'}
                </h3>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                  {searchTerm 
                    ? `Aucun beat ne correspond à "${searchTerm}"`
                    : 'Commencez par ajouter votre premier beat pour créer votre collection musicale'
                  }
                </p>
                {!searchTerm && (
                  <Button 
                    onClick={() => setShowUploader(true)}
                    className="modern-button bg-gradient-to-r from-music-royal-blue to-music-deep-purple hover:from-music-royal-blue/90 hover:to-music-deep-purple/90"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter mon premier beat
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBeats.map((beat, index) => (
                <motion.div
                  key={beat.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="music-card border border-music-deep-purple/20 hover:border-music-royal-blue/40 transition-all duration-300 group">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="vinyl-effect w-10 h-10 bg-gradient-to-br from-music-royal-blue to-music-deep-purple flex items-center justify-center">
                            <Music className="w-5 h-5 text-white" />
                          </div>
                          <span className="text-foreground truncate">{beat.title}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteBeat(beat.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/20 hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <AudioPlayer 
                        src={beat.audio_url} 
                        title={beat.title}
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground mt-3">
                        Ajouté le {new Date(beat.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </MainLayout>
  );
}
