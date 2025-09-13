"use client";

import { useState, useRef, useEffect } from "react";
import { SketchPicker } from "react-color";

interface SketchColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  onClose?: () => void;
}

export default function SketchColorPicker({ color, onChange, onClose }: SketchColorPickerProps) {
  const [localColor, setLocalColor] = useState(color);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [hasBeenDragged, setHasBeenDragged] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  const handleColorChange = (updatedColor: { hex?: string; hexString?: string }) => {
    // Ensure we only use hex colors to avoid oklab issues
    const hexColor = updatedColor.hex || updatedColor.hexString || '#000000';
    setLocalColor(hexColor);
    onChange(hexColor);
  };

  const handleClose = () => {
    // Reset all drag states when closing
    setIsDragging(false);
    setHasBeenDragged(false);
    setPosition({ x: 0, y: 0 });
    setDragOffset({ x: 0, y: 0 });
    setIsInitialized(false);
    if (onClose) {
      onClose();
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Allow dragging from any dark grey area (the main container)
    // Exclude the SketchPicker component and its children
    const target = e.target as Element;
    const isSketchPicker = target.closest('.sketch-picker') || target.closest('[class*="sketch"]');
    const isCloseButton = target.closest('button[title="Close color picker"]');
    
    // Don't start dragging if clicking the close button
    if (!isSketchPicker && !isCloseButton) {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
      setHasBeenDragged(true);
      
      const rect = pickerRef.current?.getBoundingClientRect();
      if (rect) {
        setDragOffset({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
        // Set initial position when starting to drag
        setPosition({
          x: rect.left,
          y: rect.top
        });
      }
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      e.preventDefault();
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Initialize position in center of screen
  useEffect(() => {
    if (!isInitialized) {
      const centerX = window.innerWidth / 2 - 140; // Half picker width
      const centerY = window.innerHeight / 2 - 190; // Half picker height
      setPosition({ x: centerX, y: centerY });
      setHasBeenDragged(true);
      setIsInitialized(true);
    }
  }, [isInitialized]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  return (
    <div className="relative">
      
      {/* Color Picker */}
      <div 
        ref={pickerRef}
        className={`${hasBeenDragged ? 'fixed' : 'relative'} z-[2147483647]`}
        style={{ 
          padding: "16px",
          left: hasBeenDragged ? `${position.x}px` : 'auto',
          top: hasBeenDragged ? `${position.y}px` : 'auto',
          transform: hasBeenDragged ? 'none' : 'none',
          cursor: isDragging ? 'grabbing' : 'grab',
          width: 'fit-content',
          height: 'fit-content',
          minWidth: '280px',
          minHeight: '380px'
        }}
      >
        <div 
          className="rounded-lg shadow-lg p-4 bg-gray-900 cursor-grab"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={handleMouseDown}
          style={{ 
            cursor: isDragging ? 'grabbing' : 'grab',
            display: 'flex',
            flexDirection: 'column',
            width: 'fit-content',
            height: 'fit-content',
            minWidth: '248px',
            minHeight: '348px'
          }}
        >
          {/* Header with Close Button in Top Right */}
          <div 
            className="flex items-center justify-between mb-4 color-picker-header cursor-grab"
            onMouseDown={handleMouseDown}
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
          >
            <h2 className="text-lg font-semibold text-white select-none">
              Color Picker
            </h2>
            {onClose && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleClose();
                }}
                className="text-gray-400 hover:text-white transition-colors"
                title="Close color picker"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <SketchPicker
              color={localColor}
              onChange={handleColorChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
