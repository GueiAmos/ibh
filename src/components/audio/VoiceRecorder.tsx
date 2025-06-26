
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, CirclePlay, Square } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type VoiceRecorderProps = {
  onRecordingComplete?: (audioBlob: Blob) => void;
  className?: string;
};

export function VoiceRecorder({ onRecordingComplete, className }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        if (audioChunksRef.current.length === 0) {
          toast.error("Aucun audio n'a été enregistré");
          return;
        }
        
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        
        if (onRecordingComplete) {
          onRecordingComplete(audioBlob);
        }
      };

      mediaRecorder.start(100); // Collect data in 100ms chunks
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prevTime => prevTime + 1);
      }, 1000);

    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast.error("Impossible d'accéder au microphone. Veuillez vérifier les autorisations.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Stop all audio tracks
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      
      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  // Format recording time as mm:ss
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className={cn("p-3 flex flex-col space-y-2", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {isRecording ? (
            <Mic className="text-red-600 animate-pulse mr-2" size={20} />
          ) : (
            <MicOff className="text-muted-foreground mr-2" size={20} />
          )}
          <span className={cn(
            "font-mono text-sm",
            isRecording ? "text-red-600" : "text-muted-foreground"
          )}>
            {isRecording ? formatTime(recordingTime) : "Prêt à enregistrer"}
          </span>
        </div>

        <Button
          variant={isRecording ? "destructive" : "default"}
          size="sm"
          onClick={isRecording ? stopRecording : startRecording}
          className={cn(
            "gap-1",
            !isRecording && "bg-blue-600 hover:bg-blue-700 text-white"
          )}
        >
          {isRecording ? (
            <>
              <Square size={16} />
              Arrêter
            </>
          ) : (
            <>
              <CirclePlay size={16} />
              Enregistrer
            </>
          )}
        </Button>
      </div>

      {audioUrl && !isRecording && (
        <audio src={audioUrl} controls className="w-full h-10 mt-2" />
      )}
    </div>
  );
}
