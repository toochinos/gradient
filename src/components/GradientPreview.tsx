import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { CircularOverlay } from './GradientGenerator';
import OverlayPopup from './OverlayPopup';

interface GradientPreviewProps {
  css: string;
  overlays: CircularOverlay[];
  onOverlaysUpdate: (overlays: CircularOverlay[]) => void;
  onCSSUpdate?: (css: string) => void;
}

export default function GradientPreview({ css, overlays, onOverlaysUpdate, onCSSUpdate }: GradientPreviewProps) {
  const [selectedOverlayId, setSelectedOverlayId] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [artworkPosition, setArtworkPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const fullscreenRef = useRef<HTMLDivElement>(null);
  const [originalCSS, setOriginalCSS] = useState<string>('');

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    if (isFullscreen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isFullscreen]);

  // Handle drag functionality
  const handleDragStart = (clientX: number, clientY: number) => {
    setIsDragging(true);
    setDragStart({ x: clientX - artworkPosition.x, y: clientY - artworkPosition.y });
  };

  const handleDragMove = (clientX: number, clientY: number) => {
    if (isDragging) {
      setArtworkPosition({
        x: clientX - dragStart.x,
        y: clientY - dragStart.y
      });
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // Function to modify CSS gradient positions based on drag offset
  const modifyGradientCSS = (originalCSS: string, offsetX: number, offsetY: number) => {
    if (!originalCSS) return originalCSS;
    
    // Convert pixel offset to percentage based on viewport (approximate)
    const percentageX = (offsetX / window.innerWidth) * 100;
    const percentageY = (offsetY / window.innerHeight) * 100;
    
    // Handle radial-gradient positioning
    const radialGradientRegex = /radial-gradient\(circle at (\d+\.?\d*)% (\d+\.?\d*)%/g;
    let modifiedCSS = originalCSS.replace(radialGradientRegex, (match, x, y) => {
      const newX = Math.max(0, Math.min(100, parseFloat(x) + percentageX));
      const newY = Math.max(0, Math.min(100, parseFloat(y) + percentageY));
      return `radial-gradient(circle at ${newX.toFixed(2)}% ${newY.toFixed(2)}%`;
    });
    
    // Handle background-position for linear gradients
    if (modifiedCSS.includes('linear-gradient')) {
      // Add background-position to shift linear gradients
      modifiedCSS = modifiedCSS.replace(
        /background:\s*linear-gradient\([^;]+\);/g,
        (match) => `${match}\n  background-position: ${percentageX.toFixed(2)}% ${percentageY.toFixed(2)}%;`
      );
    }
    
    return modifiedCSS;
  };

  // Update CSS when artwork position changes
  useEffect(() => {
    if (isFullscreen && onCSSUpdate && originalCSS) {
      const modifiedCSS = modifyGradientCSS(originalCSS, artworkPosition.x, artworkPosition.y);
      onCSSUpdate(modifiedCSS);
    }
  }, [artworkPosition, isFullscreen, onCSSUpdate, originalCSS]);

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only start drag if clicking on the background, not on overlays or buttons
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('[data-overlay]')) {
      return;
    }
    e.preventDefault();
    handleDragStart(e.clientX, e.clientY);
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    // Only start drag if touching the background, not on overlays or buttons
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('[data-overlay]')) {
      return;
    }
    e.preventDefault();
    const touch = e.touches[0];
    handleDragStart(touch.clientX, touch.clientY);
  };

  // Global mouse/touch events for fullscreen dragging
  useEffect(() => {
    if (!isFullscreen) return;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        e.preventDefault();
        handleDragMove(e.clientX, e.clientY);
      }
    };

    const handleGlobalMouseUp = (e: MouseEvent) => {
      if (isDragging) {
        e.preventDefault();
        handleDragEnd();
      }
    };

    const handleGlobalTouchMove = (e: TouchEvent) => {
      if (isDragging && e.touches.length > 0) {
        e.preventDefault();
        const touch = e.touches[0];
        handleDragMove(touch.clientX, touch.clientY);
      }
    };

    const handleGlobalTouchEnd = (e: TouchEvent) => {
      if (isDragging) {
        e.preventDefault();
        handleDragEnd();
      }
    };

    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);
    document.addEventListener('touchmove', handleGlobalTouchMove, { passive: false });
    document.addEventListener('touchend', handleGlobalTouchEnd);

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('touchmove', handleGlobalTouchMove);
      document.removeEventListener('touchend', handleGlobalTouchEnd);
    };
  }, [isFullscreen, isDragging, artworkPosition, dragStart, handleDragMove, handleDragEnd]);

  const toggleFullscreen = () => {
    const wasFullscreen = isFullscreen;
    setIsFullscreen(!isFullscreen);
    
    // Reset position when entering fullscreen
    if (!wasFullscreen) {
      setArtworkPosition({ x: 0, y: 0 });
      // Store original CSS when entering fullscreen
      setOriginalCSS(css);
    } else {
      // When exiting fullscreen, reset to original CSS
      if (onCSSUpdate && originalCSS) {
        onCSSUpdate(originalCSS);
      }
    }
  };
  
  const handleOverlayClick = (event: React.MouseEvent, overlayId: string) => {
    event.stopPropagation();
    setSelectedOverlayId(overlayId);
    setPopupPosition({
      x: event.clientX,
      y: event.clientY,
    });
    setShowPopup(true);
  };

  const getOverlayStyle = (overlay: CircularOverlay) => {
    // Calculate blur effect: 0px = fade to background, 200px = cover background
    const blurValue = overlay.blur || 0;
    const baseOpacity = overlay.opacity;
    const blurOpacity = blurValue === 0 ? 0.15 : Math.min(1, 0.15 + (blurValue / 200) * 0.85);
    const finalOpacity = baseOpacity * blurOpacity;
    const scale = blurValue === 0 ? 0.8 : Math.min(1.8, 0.8 + (blurValue / 200) * 1.0);
    const blurFilter = blurValue > 0 ? `blur(${blurValue * 0.15}px)` : 'none';
    
    return {
      position: 'absolute' as const,
      top: `${overlay.y}%`,
      left: `${overlay.x}%`,
      width: `${overlay.size}px`,
      height: `${overlay.size}px`,
      borderRadius: '50%',
      background: `radial-gradient(circle, ${overlay.color} 0%, ${overlay.color}60 15%, ${overlay.color}40 30%, ${overlay.color}20 50%, transparent 100%)`,
      opacity: finalOpacity,
      filter: blurFilter,
      transform: `translate(-50%, -50%) scale(${scale})`,
      pointerEvents: 'auto' as const,
      cursor: 'pointer',
    };
  };

  return (
    <>
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Preview</h2>
          <button
            onClick={toggleFullscreen}
            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm flex items-center gap-2"
            title="View in fullscreen"
          >
            <svg 
              className="w-4 h-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" 
              />
            </svg>
            Fullscreen
          </button>
        </div>
        <div 
          className="w-full h-64 rounded-lg border shadow-inner relative overflow-hidden cursor-pointer"
          style={{
            background: css,
          }}
          onClick={toggleFullscreen}
        >
          {overlays.map((overlay) => (
            <div 
              key={overlay.id}
              style={getOverlayStyle(overlay)} 
              onClick={(e) => {
                e.stopPropagation();
                handleOverlayClick(e, overlay.id);
              }}
              title="Click to edit overlay"
            />
          ))}
        </div>
        
        {selectedOverlayId && (
          <OverlayPopup
            overlay={overlays.find(o => o.id === selectedOverlayId)!}
            position={popupPosition}
            onUpdate={(updates) => {
              const updatedOverlays = overlays.map(o => 
                o.id === selectedOverlayId ? { ...o, ...updates } : o
              );
              onOverlaysUpdate(updatedOverlays);
            }}
            onClose={() => setShowPopup(false)}
            isVisible={showPopup}
          />
        )}
      </div>

      {/* Fullscreen Modal - Using Portal */}
      {isFullscreen && typeof window !== 'undefined' && createPortal(
        <div 
          ref={fullscreenRef}
          className="fixed inset-0 bg-black overflow-hidden select-none"
          style={{
            zIndex: 999999,
            width: '100vw',
            height: '100vh',
            top: 0,
            left: 0,
            position: 'fixed',
            cursor: isDragging ? 'grabbing' : 'grab',
            touchAction: 'none',
          }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          {/* Draggable Artwork Container */}
          <div
            className="w-full h-full"
            style={{
              background: css,
              transform: `translate(${artworkPosition.x}px, ${artworkPosition.y}px)`,
              transition: isDragging ? 'none' : 'transform 0.2s ease-out',
              minWidth: '100vw',
              minHeight: '100vh',
            }}
          >
            {overlays.map((overlay) => (
              <div 
                key={overlay.id}
                data-overlay="true"
                style={getOverlayStyle(overlay)} 
                onClick={(e) => {
                  e.stopPropagation();
                  handleOverlayClick(e, overlay.id);
                }}
                title="Click to edit overlay"
              />
            ))}
          </div>
          
          {/* Instructions */}
          <div 
            className="absolute top-6 left-6 bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg pointer-events-none"
            style={{ zIndex: 1000000 }}
          >
            <p className="text-sm">Touch and drag to reposition</p>
          </div>

          {/* Exit Fullscreen Button */}
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-6 right-6 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-colors"
            title="Exit fullscreen (Press Esc)"
            style={{ zIndex: 1000000 }}
          >
            <svg 
              className="w-6 h-6" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          </button>

          {/* Reset Position Button */}
          <button
            onClick={() => setArtworkPosition({ x: 0, y: 0 })}
            className="absolute top-6 right-20 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-colors"
            title="Reset position"
            style={{ zIndex: 1000000 }}
          >
            <svg 
              className="w-6 h-6" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
              />
            </svg>
          </button>

          {/* Fullscreen Overlay Popup */}
          {selectedOverlayId && (
            <OverlayPopup
              overlay={overlays.find(o => o.id === selectedOverlayId)!}
              position={popupPosition}
              onUpdate={(updates) => {
                const updatedOverlays = overlays.map(o => 
                  o.id === selectedOverlayId ? { ...o, ...updates } : o
                );
                onOverlaysUpdate(updatedOverlays);
              }}
              onClose={() => setShowPopup(false)}
              isVisible={showPopup}
            />
          )}
        </div>,
        document.body
      )}
    </>
  );
}