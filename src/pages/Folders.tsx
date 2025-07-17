
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreateFolderDialog } from '@/components/folders/CreateFolderDialog';
import { FolderContent } from '@/components/folders/FolderContent';
import { Folder, FolderOpen, Search, Plus, ArrowLeft, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Folder as FolderType } from '@/types/folders';

export default function Folders() {
  const { user } = useAuth();
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<FolderType | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const fetchFolders = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('folders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFolders(data || []);
    } catch (error) {
      console.error('Error fetching folders:', error);
      toast.error('Erreur lors du chargement des dossiers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFolders();
  }, [user]);

  const handleFolderCreated = () => {
    fetchFolders();
    setShowCreateDialog(false);
    toast.success('Dossier créé avec succès');
  };

  const handleDeleteFolder = async (folderId: string) => {
    try {
      const { error } = await supabase
        .from('folders')
        .delete()
        .eq('id', folderId);

      if (error) throw error;
      
      setFolders(prev => prev.filter(folder => folder.id !== folderId));
      toast.success('Dossier supprimé');
    } catch (error) {
      console.error('Error deleting folder:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const filteredFolders = folders.filter(folder =>
    folder.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (selectedFolder) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="music-card p-6 border border-music-copper/20"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  onClick={() => setSelectedFolder(null)}
                  className="hover:bg-music-copper/20"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour
                </Button>
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${selectedFolder.color}20` }}
                  >
                    <FolderOpen className="w-5 h-5" style={{ color: selectedFolder.color }} />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">{selectedFolder.name}</h1>
                    <p className="text-muted-foreground">Contenu du dossier</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          
          <FolderContent folder={selectedFolder} />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="music-card p-6 border border-music-copper/20"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-music-copper to-music-crimson bg-clip-text text-transparent">
                Mes Dossiers
              </h1>
              <p className="text-muted-foreground">
                {folders.length} dossier{folders.length > 1 ? 's' : ''} • Organisez votre contenu
              </p>
            </div>
            
            <Button 
              onClick={() => setShowCreateDialog(true)}
              className="modern-button bg-gradient-to-r from-music-copper to-music-crimson hover:from-music-copper/90 hover:to-music-crimson/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouveau dossier
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
              placeholder="Rechercher un dossier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 modern-input bg-gradient-to-r from-background/50 to-music-midnight/30 border-music-deep-purple/30"
            />
          </div>
        </motion.div>

        {/* Create Folder Dialog */}
        <CreateFolderDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onFolderCreated={handleFolderCreated}
        />

        {/* Folders Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <Card key={i} className="music-card animate-pulse border-music-deep-purple/20">
                  <CardHeader>
                    <div className="h-6 bg-gradient-to-r from-music-copper/20 to-music-crimson/20 rounded"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-4 bg-gradient-to-r from-music-copper/20 to-music-crimson/20 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredFolders.length === 0 ? (
            <div className="text-center py-16">
              <div className="music-card p-12 border-dashed border-2 border-music-copper/30">
                <div className="vinyl-effect w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-music-copper/20 to-music-crimson/20"></div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">
                  {searchTerm ? 'Aucun dossier trouvé' : 'Aucun dossier pour le moment'}
                </h3>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                  {searchTerm 
                    ? `Aucun dossier ne correspond à "${searchTerm}"`
                    : 'Créez votre premier dossier pour organiser vos notes et beats'
                  }
                </p>
                {!searchTerm && (
                  <Button 
                    onClick={() => setShowCreateDialog(true)}
                    className="modern-button bg-gradient-to-r from-music-copper to-music-crimson hover:from-music-copper/90 hover:to-music-crimson/90"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Créer mon premier dossier
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredFolders.map((folder, index) => (
                <motion.div
                  key={folder.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card 
                    className="music-card border border-music-deep-purple/20 hover:border-music-copper/40 transition-all duration-300 cursor-pointer group"
                    onClick={() => setSelectedFolder(folder)}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-10 h-10 rounded-xl flex items-center justify-center vinyl-effect"
                            style={{ backgroundColor: `${folder.color}20` }}
                          >
                            <Folder className="w-5 h-5" style={{ color: folder.color }} />
                          </div>
                          <span className="text-foreground truncate">{folder.name}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFolder(folder.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/20 hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-muted-foreground">
                        Créé le {new Date(folder.created_at).toLocaleDateString('fr-FR')}
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
