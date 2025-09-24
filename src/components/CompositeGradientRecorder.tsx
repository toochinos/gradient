'use client';

import { useRef, useState, useCallback } from 'react';

interface CompositeGradientRecorderProps {
  targetElement?: HTMLElement | null; // The container to record
  duration?: number; // Recording duration in seconds
  fps?: number;
  onRecordingComplete?: (blob: Blob) => void;
  isWebGLMode?: boolean; // Whether WebGL mode is active
  webglCanvas?: HTMLCanvasElement | null; // WebGL canvas reference
}

export default function CompositeGradientRecorder({
  targetElement,
  duration = 5,
  fps = 30,
  onRecordingComplete,
  isWebGLMode = false,
  webglCanvas
}: CompositeGradientRecorderProps) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const compositeCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingProgress, setRecordingProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Find all WebGL canvases in the target element
  const findWebGLCanvases = useCallback((): HTMLCanvasElement[] => {
    if (!targetElement) return [];

    const canvases: HTMLCanvasElement[] = [];

    // Add the main WebGL canvas if in WebGL mode
    if (isWebGLMode && webglCanvas) {
      canvases.push(webglCanvas);
    }

    // Find all Three.js canvases (they have WebGL contexts)
    const allCanvases = targetElement.querySelectorAll('canvas');
    allCanvases.forEach(canvas => {
      try {
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (gl && (!isWebGLMode || canvas !== webglCanvas)) {
          // This is a Three.js canvas
          canvases.push(canvas);
        }
      } catch (e) {
        // Not a WebGL canvas
      }
    });

    return canvases;
  }, [targetElement, isWebGLMode, webglCanvas]);

  // Create a composite canvas that combines CSS background and all WebGL canvases
  const createCompositeCanvas = useCallback((): HTMLCanvasElement | null => {
    if (!targetElement) return null;

    const composite = document.createElement('canvas');
    const rect = targetElement.getBoundingClientRect();

    composite.width = rect.width;
    composite.height = rect.height;

    const ctx = composite.getContext('2d');
    if (!ctx) return null;

    compositeCanvasRef.current = composite;
    return composite;
  }, [targetElement]);

  // Render a frame to the composite canvas
  const renderCompositeFrame = useCallback((composite: HTMLCanvasElement) => {
    if (!targetElement) return;

    const ctx = composite.getContext('2d');
    if (!ctx) return;

    const rect = targetElement.getBoundingClientRect();

    // Clear the canvas
    ctx.clearRect(0, 0, composite.width, composite.height);

    // Draw the CSS background
    const computedStyle = window.getComputedStyle(targetElement);
    const bgColor = computedStyle.backgroundColor;
    const bgImage = computedStyle.backgroundImage;

    if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)') {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, composite.width, composite.height);
    }

    // If there's a CSS gradient background, we need to recreate it
    if (bgImage && bgImage !== 'none') {
      // For CSS gradients, we'll draw a solid color as fallback
      // In a real implementation, you'd need to parse and recreate the gradient
      ctx.fillStyle = bgColor || '#000000';
      ctx.fillRect(0, 0, composite.width, composite.height);
    }

    // Draw all WebGL canvases on top
    const webglCanvases = findWebGLCanvases();
    webglCanvases.forEach(canvas => {
      try {
        // Get the position of this canvas relative to the container
        const canvasRect = canvas.getBoundingClientRect();
        const offsetX = canvasRect.left - rect.left;
        const offsetY = canvasRect.top - rect.top;

        // Draw this WebGL canvas onto the composite
        ctx.drawImage(
          canvas,
          offsetX,
          offsetY,
          canvasRect.width,
          canvasRect.height
        );
      } catch (e) {
        console.warn('Could not draw canvas:', e);
      }
    });
  }, [targetElement, findWebGLCanvases]);

  const startRecording = useCallback(async () => {
    try {
      let stream: MediaStream;

      if (isWebGLMode && webglCanvas && findWebGLCanvases().length <= 1) {
        // Pure WebGL mode with no Three.js overlays - use direct canvas capture
        stream = webglCanvas.captureStream(fps);
        console.log('Recording pure WebGL canvas');
      } else {
        // Mixed mode - create composite canvas
        const composite = createCompositeCanvas();
        if (!composite) {
          throw new Error('Could not create composite canvas');
        }

        // Start the composite rendering loop
        let animationId: number;
        const renderLoop = () => {
          renderCompositeFrame(composite);
          if (isRecording) {
            animationId = requestAnimationFrame(renderLoop);
          }
        };
        renderLoop();

        // Create stream from composite canvas
        stream = composite.captureStream(fps);
        console.log('Recording composite (CSS + WebGL)');
      }

      // Check if MediaRecorder supports WebM
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : MediaRecorder.isTypeSupported('video/webm;codecs=vp8')
        ? 'video/webm;codecs=vp8'
        : 'video/webm';

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

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        setError('Recording failed');
        setIsRecording(false);
      };

      mediaRecorderRef.current = mediaRecorder;
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
      setError('Recording failed. Browser may not support this feature.');
    }
  }, [targetElement, duration, fps, onRecordingComplete, isWebGLMode, webglCanvas, findWebGLCanvases, createCompositeCanvas, renderCompositeFrame, isRecording]);

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
    const canvasCount = findWebGLCanvases().length;
    const mode = isWebGLMode ? 'webgl' : 'css';
    const suffix = canvasCount > 1 ? '-composite' : '';
    link.download = `gradient-${mode}${suffix}-${timestamp}.webm`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [downloadUrl, isWebGLMode, findWebGLCanvases]);

  const clearRecording = useCallback(() => {
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null);
    }
    setError(null);
    setRecordingProgress(0);
  }, [downloadUrl]);

  // Determine what will be recorded
  const webglCanvasCount = findWebGLCanvases().length;
  const hasThreeJS = webglCanvasCount > (isWebGLMode ? 1 : 0);
  const recordingMode = isWebGLMode
    ? (hasThreeJS ? 'WebGL + Three.js' : 'WebGL Only')
    : (hasThreeJS ? 'CSS + Three.js' : 'CSS Only');

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Recording Mode Info */}
      <div className="text-center">
        <div className="text-white text-sm font-medium">
          {recordingMode} Recording
        </div>
        <div className="text-gray-400 text-xs">
          {webglCanvasCount > 0 ? `${webglCanvasCount} WebGL canvas(es) detected` : 'No animations detected'}
        </div>
      </div>

      {/* Recording Controls */}
      <div className="flex gap-2">
        <button
          onClick={startRecording}
          disabled={isRecording || !targetElement}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            isRecording || !targetElement
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
          title="Record everything visible in the gradient area"
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
              Record All
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