
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Beat {
  id: string;
  title: string;
  audio_url: string;
}

interface GlobalBeatPlayerProps {
  beat: Beat | null;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onClose: () => void;
}

export function GlobalBeatPlayer({ beat, isPlaying, onPlay, onPause, onClose }: GlobalBeatPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !beat) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      setProgress((audio.currentTime / audio.duration) * 100);
    };

    const handleLoadedData = () => {
      setDuration(audio.duration);
      audio.volume = isMuted ? 0 : volume;
    };

    const handleEnded = () => {
      onPause();
      setProgress(0);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('ended', handleEnded);
    
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [beat, volume, isMuted, onPause]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play();
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleProgressChange = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;

    const newTime = (value[0] / 100) * duration;
    audio.currentTime = newTime;
    setProgress(value[0]);
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0] / 100;
    setVolume(newVolume);
    setIsMuted(false);
    
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? volume : 0;
    }
  };

  if (!beat) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 shadow-lg"
      >
        <audio ref={audioRef} src={beat.audio_url} preload="metadata" />
        
        <div className="px-4 py-3 lg:px-6 lg:py-4">
          <div className="flex items-center gap-3 lg:gap-4">
            {/* Contrôles de lecture */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={isPlaying ? onPause : onPlay}
                className="h-8 w-8 lg:h-10 lg:w-10 p-0"
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 lg:w-5 lg:h-5" />
                ) : (
                  <Play className="w-4 h-4 lg:w-5 lg:h-5" />
                )}
              </Button>
            </div>

            {/* Informations du beat */}
            <div className="flex-1 min-w-0">
              <p className="text-sm lg:text-base font-medium text-slate-900 dark:text-white truncate">
                {beat.title}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-slate-500">
                  {formatTime(currentTime)}
                </span>
                <div className="flex-1">
                  <Slider
                    value={[progress]}
                    min={0}
                    max={100}
                    step={0.1}
                    onValueChange={handleProgressChange}
                    className="w-full"
                  />
                </div>
                <span className="text-xs text-slate-500">
                  {formatTime(duration)}
                </span>
              </div>
            </div>

            {/* Contrôles de volume */}
            <div className="hidden lg:flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMute}
                className="h-8 w-8 p-0"
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </Button>
              <div className="w-20">
                <Slider
                  value={[isMuted ? 0 : volume * 100]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={handleVolumeChange}
                />
              </div>
            </div>

            {/* Bouton fermer */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 text-slate-500 hover:text-slate-700"
            >
              ×
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
