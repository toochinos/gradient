import { Video } from 'lucide-react';
import { useState, useRef } from 'react';

interface CameraProps {
  size?: number;
  className?: string;
  onRecordingChange?: (isRecording: boolean) => void;
  onToggleFullscreen?: () => void;
  isFullscreen?: boolean;
}

const Camera = ({ size = 24, className = '', onRecordingChange, onToggleFullscreen, isFullscreen = false }: CameraProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startScreenRecording = async () => {
    try {
      // If not already in fullscreen, enter fullscreen mode
      if (!isFullscreen) {
        onToggleFullscreen?.();
        // Wait a moment for fullscreen to activate
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Show user instruction
      const shouldContinue = confirm(
        "📺 Ready to record gradient display!\n\n" +
        "When the screen capture dialog appears:\n" +
        "1. Select 'This tab' or 'Current window'\n" +
        "2. Make sure the gradient display is visible\n" +
        "3. Click 'Share'\n\n" +
        "Ready to start recording?"
      );

      if (!shouldContinue) {
        // Exit fullscreen only if we entered it for this recording
        if (!isFullscreen) {
          onToggleFullscreen?.();
        }
        return;
      }

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false
      });

      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
      });
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `gradient-screen-recording-${Date.now()}.webm`;
        a.click();
        
        URL.revokeObjectURL(url);

        // Note: User can choose to stay in fullscreen after recording
      };

      // Stop recording when the user stops screen sharing
      stream.getVideoTracks()[0].addEventListener('ended', () => {
        stopScreenRecording();
      });

      mediaRecorderRef.current.start();
      setIsRecording(true);
      onRecordingChange?.(true);
    } catch (err) {
      console.error('Error starting screen recording:', err);
      // Exit fullscreen on error
      onToggleFullscreen?.();
    }
  };

  const stopScreenRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    setIsRecording(false);
    onRecordingChange?.(false);
    // Note: Fullscreen remains active - user can exit manually if desired
  };

  const handleClick = () => {
    if (isRecording) {
      stopScreenRecording();
    } else {
      startScreenRecording();
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`p-2 rounded hover:bg-gray-700 transition-colors ${className}`}
      title={isRecording ? "Stop recording" : "Start recording"}
    >
      <Video 
        className={`w-${size} h-${size} ${isRecording ? 'text-red-500 animate-pulse' : 'text-gray-400'}`}
        size={size}
      />
    </button>
  );
};

export default Camera;
