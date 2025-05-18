
import { useState, useRef, useEffect } from 'react';
import { Pause, Play, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

type AudioPlayerProps = {
  audioSrc: string;
  className?: string;
  onPlay?: () => void;
  onPause?: () => void;
  minimized?: boolean;
};

export function AudioPlayer({ 
  audioSrc, 
  className, 
  onPlay, 
  onPause,
  minimized = false
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  // Set up audio element
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      setProgress((audio.currentTime / audio.duration) * 100);
    };

    const handleLoadedData = () => {
      setDuration(audio.duration);
      audio.volume = volume;
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadeddata', handleLoadedData);
    
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadeddata', handleLoadedData);
    };
  }, [audioSrc, volume]);

  // Format time for display (mm:ss)
  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Handle play/pause
  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      onPause?.();
    } else {
      audio.play();
      setIsPlaying(true);
      onPlay?.();
    }
  };

  // Handle seeking
  const handleProgressChange = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;

    const newTime = (value[0] / 100) * duration;
    audio.currentTime = newTime;
    setProgress(value[0]);
    setCurrentTime(newTime);
  };

  // Handle volume change
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0] / 100;
    setVolume(newVolume);
    
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  return (
    <div className={cn(
      "flex flex-col rounded-lg p-3 bg-white/50 dark:bg-black/20 backdrop-blur-sm border border-border",
      className
    )}>
      <audio ref={audioRef} src={audioSrc} preload="metadata" />
      
      <div className="flex items-center gap-2 w-full">
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-ibh-purple hover:text-ibh-purple/90 hover:bg-ibh-purple/10"
          onClick={togglePlayPause}
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </Button>
        
        {!minimized && (
          <div className="flex-1 flex flex-col">
            <div className="w-full">
              <Slider
                value={[progress]}
                min={0}
                max={100}
                step={0.1}
                onValueChange={handleProgressChange}
                className="mb-1"
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        )}
        
        {!minimized && (
          <div className="flex items-center gap-2 ml-2">
            <Volume2 size={16} className="text-muted-foreground" />
            <Slider
              value={[volume * 100]}
              min={0}
              max={100}
              step={1}
              onValueChange={handleVolumeChange}
              className="w-20"
            />
          </div>
        )}
      </div>
    </div>
  );
}
