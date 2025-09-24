'use client';

import { useRef, useState, useCallback } from 'react';

interface UniversalGradientRecorderProps {
  targetElement?: HTMLElement | null; // The container to record
  duration?: number; // Recording duration in seconds
  fps?: number;
  onRecordingComplete?: (blob: Blob) => void;
  isWebGLMode?: boolean; // Whether WebGL mode is active
  webglCanvas?: HTMLCanvasElement | null; // WebGL canvas reference
}

export default function UniversalGradientRecorder({
  targetElement,
  duration = 5,
  fps = 30,
  onRecordingComplete,
  isWebGLMode = false,
  webglCanvas
}: UniversalGradientRecorderProps) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingProgress, setRecordingProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = useCallback(async () => {
    try {
      let stream: MediaStream;

      if (isWebGLMode && webglCanvas) {
        // For WebGL mode, capture the WebGL canvas directly
        stream = webglCanvas.captureStream(fps);
        console.log('Recording WebGL canvas');
      } else if (targetElement) {
        // For CSS mode or when Three.js overlays are active, use screen capture of the target area
        try {
          // Try to use the newer getDisplayMedia API with area selection
          const displayStream = await navigator.mediaDevices.getDisplayMedia({
            video: {
              mediaSource: 'screen',
              width: { ideal: targetElement.clientWidth },
              height: { ideal: targetElement.clientHeight },
              frameRate: { ideal: fps }
            },
            audio: false
          });
          stream = displayStream;
          console.log('Recording screen area');
        } catch (displayError) {
          // Fallback: Use html2canvas approach (will be less smooth for animations)
          console.log('Screen capture not available, falling back to element capture');
          throw new Error('Screen capture required for CSS + Three.js recording');
        }
      } else {
        throw new Error('No recording target available');
      }

      // Check if MediaRecorder supports WebM
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : MediaRecorder.isTypeSupported('video/webm;codecs=vp8')
        ? 'video/webm;codecs=vp8'
        : MediaRecorder.isTypeSupported('video/webm')
        ? 'video/webm'
        : 'video/mp4'; // Fallback

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType,
        videoBitsPerSecond: 4000000 // 4 Mbps for high quality
      });

      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setDownloadUrl(url);
        setIsRecording(false);
        setRecordingProgress(0);
        onRecordingComplete?.(blob);

        // Clean up the stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        setError('Recording failed');
        setIsRecording(false);
      };

      mediaRecorderRef.current = mediaRecorder;
      streamRef.current = stream;
      mediaRecorder.start();
      setIsRecording(true);
      setError(null);

      // Progress tracking
      const startTime = Date.now();
      const updateProgress = () => {
        if (!isRecording) return;

        const elapsed = (Date.now() - startTime) / 1000;
        const progress = Math.min((elapsed / duration) * 100, 100);
        setRecordingProgress(progress);

        if (elapsed < duration) {
          requestAnimationFrame(updateProgress);
        }
      };
      requestAnimationFrame(updateProgress);

      // Auto-stop after duration
      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          stopRecording();
        }
      }, duration * 1000);

    } catch (err) {
      console.error('Failed to start recording:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Recording failed. Please try screen sharing when prompted.');
      }
    }
  }, [targetElement, duration, fps, onRecordingComplete, isWebGLMode, webglCanvas, isRecording]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const downloadRecording = useCallback(() => {
    if (!downloadUrl) return;

    const link = document.createElement('a');
    link.href = downloadUrl;
    const timestamp = Date.now();
    const mode = isWebGLMode ? 'webgl' : 'css';
    link.download = `gradient-${mode}-${timestamp}.webm`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [downloadUrl, isWebGLMode]);

  const clearRecording = useCallback(() => {
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null);
    }
    setError(null);
    setRecordingProgress(0);
  }, [downloadUrl]);

  // Determine recording mode info
  const recordingMode = isWebGLMode ? 'WebGL Canvas' : 'Full Display';
  const recordingDescription = isWebGLMode
    ? 'Records WebGL gradients directly'
    : 'Records gradients + Three.js effects (requires screen sharing)';

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Recording Mode Info */}
      <div className="text-center">
        <div className="text-white text-sm font-medium">
          {recordingMode} Recording
        </div>
        <div className="text-gray-400 text-xs">
          {recordingDescription}
        </div>
      </div>

      {/* Recording Controls */}
      <div className="flex gap-2">
        <button
          onClick={startRecording}
          disabled={isRecording || (!targetElement && !webglCanvas)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            isRecording || (!targetElement && !webglCanvas)
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
          title={`Record ${recordingMode.toLowerCase()}`}
        >
          {isRecording ? (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
              Recording...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
              </svg>
              Record WebM
            </div>
          )}
        </button>

        {isRecording && (
          <button
            onClick={stopRecording}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
          >
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-300 rounded-sm"></div>
              Stop
            </div>
          </button>
        )}

        {downloadUrl && (
          <>
            <button
              onClick={downloadRecording}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                </svg>
                Download
              </div>
            </button>
            <button
              onClick={clearRecording}
              className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              title="Clear recording"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Progress Bar */}
      {isRecording && (
        <div className="w-48">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Recording...</span>
            <span>{Math.round(recordingProgress)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-1.5">
            <div
              className="bg-red-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${recordingProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="text-red-400 text-sm bg-red-900/20 px-3 py-2 rounded-lg border border-red-800/30 max-w-xs text-center">
          {error}
        </div>
      )}

      {/* Info */}
      <div className="text-xs text-gray-500 text-center">
        Duration: {duration}s • FPS: {fps} • Format: WebM
      </div>
    </div>
  );
}