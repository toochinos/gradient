'use client';

import { useRef, useState, useCallback } from 'react';

interface FocusedGradientRecorderProps {
  targetElement?: HTMLElement | null; // The container to record
  duration?: number; // Recording duration in seconds
  fps?: number;
  onRecordingComplete?: (blob: Blob) => void;
  isWebGLMode?: boolean; // Whether WebGL mode is active
  webglCanvas?: HTMLCanvasElement | null; // WebGL canvas reference
}

export default function FocusedGradientRecorder({
  targetElement,
  duration = 5,
  fps = 30,
  onRecordingComplete,
  isWebGLMode = false,
  webglCanvas
}: FocusedGradientRecorderProps) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const compositeCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingProgress, setRecordingProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);

  // Count canvases in the target element
  const getCanvasInfo = useCallback(() => {
    if (!targetElement) return { count: 0, hasAnimations: false };

    let count = 0;
    let hasAnimations = false;

    if (isWebGLMode && webglCanvas) count++;

    const allCanvases = targetElement.querySelectorAll('canvas');
    allCanvases.forEach(canvas => {
      if (isWebGLMode && canvas === webglCanvas) return;
      count++;
      hasAnimations = true;
    });

    return { count, hasAnimations };
  }, [targetElement, isWebGLMode, webglCanvas]);

  // Create a composite canvas that renders all content together
  const createCompositeCanvas = useCallback(() => {
    if (!targetElement) return null;

    const rect = targetElement.getBoundingClientRect();
    const canvas = document.createElement('canvas');
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    compositeCanvasRef.current = canvas;

    return canvas;
  }, [targetElement]);

  // Render frame by combining CSS background + all canvases
  const renderFrame = useCallback((composite: HTMLCanvasElement) => {
    if (!targetElement) return;

    const ctx = composite.getContext('2d');
    if (!ctx) return;

    const rect = targetElement.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Draw CSS background (simplified - solid color)
    const computedStyle = window.getComputedStyle(targetElement);
    const bgColor = computedStyle.backgroundColor;

    if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)') {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, rect.width, rect.height);
    }

    // Draw all canvases
    const allCanvases = targetElement.querySelectorAll('canvas');
    allCanvases.forEach(canvas => {
      try {
        const canvasRect = canvas.getBoundingClientRect();
        const offsetX = canvasRect.left - rect.left;
        const offsetY = canvasRect.top - rect.top;

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
  }, [targetElement]);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      const canvasInfo = getCanvasInfo();

      let stream: MediaStream;

      if (isWebGLMode && webglCanvas && !canvasInfo.hasAnimations) {
        // Pure WebGL - direct canvas capture
        stream = webglCanvas.captureStream(fps);
        console.log('Recording pure WebGL canvas');
      } else {
        // Mixed mode - create composite canvas
        const composite = createCompositeCanvas();
        if (!composite) {
          throw new Error('Could not create composite canvas');
        }

        console.log(`Recording composite: ${canvasInfo.count} canvases`);

        // Animation loop to update composite canvas
        let isAnimating = true;
        const animate = () => {
          if (!isAnimating) return;
          renderFrame(composite);
          animationRef.current = requestAnimationFrame(animate);
        };
        animate();

        // Create stream from composite
        stream = composite.captureStream(fps);

        // Stop animation when recording stops
        const originalStop = () => {
          isAnimating = false;
          if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
          }
        };

        setTimeout(originalStop, duration * 1000);
      }

      // Set up MediaRecorder
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : MediaRecorder.isTypeSupported('video/webm;codecs=vp8')
        ? 'video/webm;codecs=vp8'
        : 'video/webm';

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType,
        videoBitsPerSecond: 4000000
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

        // Cleanup
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
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

      // Progress tracking
      const startTime = Date.now();
      const updateProgress = () => {
        const elapsed = (Date.now() - startTime) / 1000;
        const progress = Math.min((elapsed / duration) * 100, 100);
        setRecordingProgress(progress);

        if (elapsed < duration && isRecording) {
          requestAnimationFrame(updateProgress);
        }
      };
      updateProgress();

      // Auto-stop
      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          stopRecording();
        }
      }, duration * 1000);

    } catch (err) {
      console.error('Failed to start recording:', err);
      setError('Recording failed. This method captures the WebGL area directly without screen sharing.');
    }
  }, [targetElement, duration, fps, onRecordingComplete, isWebGLMode, webglCanvas, getCanvasInfo, createCompositeCanvas, renderFrame, isRecording]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  }, []);

  const downloadRecording = useCallback(() => {
    if (!downloadUrl) return;

    const link = document.createElement('a');
    link.href = downloadUrl;
    const timestamp = Date.now();
    const canvasInfo = getCanvasInfo();
    const mode = isWebGLMode ? 'webgl' : 'css';
    const suffix = canvasInfo.hasAnimations ? '-composite' : '';
    link.download = `focused-gradient-${mode}${suffix}-${timestamp}.webm`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [downloadUrl, isWebGLMode, getCanvasInfo]);

  const clearRecording = useCallback(() => {
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null);
    }
    setError(null);
    setRecordingProgress(0);
  }, [downloadUrl]);

  // Get current recording info
  const canvasInfo = getCanvasInfo();
  const recordingMode = isWebGLMode
    ? (canvasInfo.hasAnimations ? 'WebGL + Animations' : 'WebGL Only')
    : (canvasInfo.hasAnimations ? 'CSS + Animations' : 'CSS Only');

  const isDirectCapture = isWebGLMode && webglCanvas && !canvasInfo.hasAnimations;

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Recording Mode Info */}
      <div className="text-center">
        <div className="text-white text-sm font-medium">
          {recordingMode}
        </div>
        <div className="text-gray-400 text-xs">
          {canvasInfo.count > 0
            ? `${canvasInfo.count} canvas(es) • ${isDirectCapture ? 'Direct capture' : 'Composite render'}`
            : 'CSS only'}
        </div>
        <div className="text-green-400 text-xs mt-1">
          ✅ No screen sharing required
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
          title="Records WebGL area directly"
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
              Record Area
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
        Duration: {duration}s • FPS: {fps} • Format: WebM<br/>
        <span className="text-green-500">Direct WebGL area capture</span>
      </div>
    </div>
  );
}