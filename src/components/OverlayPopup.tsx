'use client';

import { useEffect, useRef } from 'react';
import { CircularOverlay } from './GradientGenerator';
import ColorPicker from './ColorPicker';
import MuiBlurSlider from './MuiBlurSlider';

interface OverlayPopupProps {
  overlay: CircularOverlay;
  position: { x: number; y: number };
  onUpdate: (updates: Partial<CircularOverlay>) => void;
  onClose: () => void;
  isVisible: boolean;
}

export default function OverlayPopup({ 
  overlay, 
  position, 
  onUpdate, 
  onClose, 
  isVisible 
}: OverlayPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div
      ref={popupRef}
      className="absolute bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50 w-64"
      style={{
        left: `${Math.min(position.x, window.innerWidth - 280)}px`,
        top: `${Math.max(position.y - 200, 20)}px`,
      }}
    >
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <img
            src="/star-sparkle.svg"
            alt="Shiny effect"
            className="w-5 h-5 opacity-80 animate-pulse"
          />
          <h3 className="font-semibold text-sm text-gray-800">Overlay Controls</h3>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-sm"
        >
          ✕
        </button>
      </div>

      <div className="space-y-3">
        {/* Color */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Color
          </label>
          <ColorPicker
            color={overlay.color}
            onChange={(color) => onUpdate({ color })}
          />
        </div>

        {/* Opacity */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Opacity: {Math.round(overlay.opacity * 100)}%
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={overlay.opacity}
            onChange={(e) => onUpdate({ opacity: parseFloat(e.target.value) })}
            className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Size */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Size: {overlay.size}px
          </label>
          <input
            type="range"
            min="50"
            max="400"
            value={overlay.size}
            onChange={(e) => onUpdate({ size: parseInt(e.target.value) })}
            className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Blur */}
        <div>
          <MuiBlurSlider
            value={overlay.blur}
            onChange={(value) => onUpdate({ blur: value })}
            min={0}
            max={200}
            label="Blur"
            showValue={true}
          />
        </div>

        {/* Position Controls */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              X: {overlay.x}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={overlay.x}
              onChange={(e) => onUpdate({ x: parseInt(e.target.value) })}
              className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Y: {overlay.y}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={overlay.y}
              onChange={(e) => onUpdate({ y: parseInt(e.target.value) })}
              className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        {/* Remove Button */}
        <button
          onClick={() => onUpdate({ enabled: false })}
          className="w-full mt-3 px-3 py-1 bg-red-100 text-red-700 rounded-md text-xs hover:bg-red-200 transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Remove Overlay
        </button>
      </div>
    </div>
  );
}