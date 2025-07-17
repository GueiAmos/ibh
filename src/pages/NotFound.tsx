
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Music, Home, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-music-midnight via-background to-music-midnight flex items-center justify-center p-4">
      {/* Background Elements */}
      <div className="absolute top-20 right-10 w-64 h-64 rounded-full bg-gradient-to-br from-music-emerald/10 to-music-indigo/10 blur-3xl" />
      <div className="absolute bottom-20 left-10 w-80 h-80 rounded-full bg-gradient-to-br from-music-royal-blue/10 to-music-deep-purple/10 blur-3xl" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md mx-auto"
      >
        <div className="music-card p-12 border border-music-deep-purple/30">
          {/* Animated vinyl record */}
          <motion.div 
            className="vinyl-effect w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-music-emerald to-music-indigo flex items-center justify-center"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <Music className="w-10 h-10 text-white" />
          </motion.div>

          {/* Error code */}
          <motion.h1 
            className="text-8xl font-bold mb-4 bg-gradient-to-r from-music-emerald via-music-indigo to-music-royal-blue bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            404
          </motion.h1>

          {/* Error message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-2xl font-semibold mb-3 text-foreground">
              Page introuvable
            </h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Cette page n'existe pas ou a été déplacée. 
              Le rythme semble s'être perdu en chemin...
            </p>
          </motion.div>

          {/* Action buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Button 
              asChild 
              className="modern-button bg-gradient-to-r from-music-emerald to-music-indigo hover:from-music-emerald/90 hover:to-music-indigo/90"
            >
              <Link to="/">
                <Home className="w-4 h-4 mr-2" />
                Retour à l'accueil
              </Link>
            </Button>
            
            <Button 
              asChild 
              variant="outline"
              className="modern-button-secondary border-music-deep-purple/30 hover:bg-music-deep-purple/20"
              onClick={() => window.history.back()}
            >
              <Link to="#" onClick={(e) => { e.preventDefault(); window.history.back(); }}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Page précédente
              </Link>
            </Button>
          </motion.div>

          {/* Additional info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-8 pt-6 border-t border-music-deep-purple/20"
          >
            <p className="text-xs text-muted-foreground">
              URL demandée : <code className="bg-music-midnight/50 px-2 py-1 rounded text-music-emerald">{location.pathname}</code>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
