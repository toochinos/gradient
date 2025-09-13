'use client';

import { useEffect, useRef, useState } from 'react';
import { CircularOverlay } from './GradientGenerator';
import ColorPicker from './ColorPicker';
import MuiBlurSlider from './MuiBlurSlider';

interface OverlayControlsWindowProps {
  overlays: CircularOverlay[];
  onUpdate: (overlays: CircularOverlay[]) => void;
  onClose: () => void;
  isOpen: boolean;
}

export default function OverlayControlsWindow({ 
  overlays, 
  onUpdate, 
  onClose, 
  isOpen 
}: OverlayControlsWindowProps) {
  const windowRef = useRef<HTMLDivElement>(null);
  const [selectedOverlayId, setSelectedOverlayId] = useState<string | null>(null);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && overlays.length > 0 && !selectedOverlayId) {
      setSelectedOverlayId(overlays[0].id);
    }
  }, [isOpen, overlays, selectedOverlayId]);

  if (!isOpen) return null;

  const addOverlay = () => {
    const newOverlay: CircularOverlay = {
      id: Math.random().toString(36).substr(2, 9),
      color: '#ffffff',
      opacity: 0.3,
      size: 200,
      x: Math.random() * 80 + 10, // Random position between 10-90%
      y: Math.random() * 80 + 10,
      blur: 20,
    };
    
    const newOverlays = [...overlays, newOverlay];
    onUpdate(newOverlays);
    setSelectedOverlayId(newOverlay.id);
  };

  const removeOverlay = (overlayId: string) => {
    const newOverlays = overlays.filter(o => o.id !== overlayId);
    onUpdate(newOverlays);
    
    if (selectedOverlayId === overlayId) {
      setSelectedOverlayId(newOverlays.length > 0 ? newOverlays[0].id : null);
    }
  };

  const updateSelectedOverlay = (updates: Partial<CircularOverlay>) => {
    if (!selectedOverlayId) return;
    
    const newOverlays = overlays.map(o => 
      o.id === selectedOverlayId ? { ...o, ...updates } : o
    );
    onUpdate(newOverlays);
  };

  const selectedOverlay = overlays.find(o => o.id === selectedOverlayId);

  return (
    <div
      ref={windowRef}
      className="fixed top-20 right-6 bg-white rounded-2xl shadow-xl border border-gray-200 p-6 w-80 max-h-[80vh] overflow-y-auto z-50"
      style={{ 
        animation: isOpen ? 'slideIn 0.2s ease-out' : undefined 
      }}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Circular Overlays</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          aria-label="Close"
        >
          ×
        </button>
      </div>

      {/* Add Overlay Button */}
      <div className="mb-6">
        <button
          onClick={addOverlay}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
        >
          <span>+</span>
          Add New Overlay
        </button>
      </div>

      {overlays.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          <p>No overlays yet.</p>
          <p className="text-sm mt-2">Click &quot;Add New Overlay&quot; to get started!</p>
        </div>
      ) : (
        <>
          {/* Overlay List */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Overlay ({overlays.length})
            </label>
            <div className="grid grid-cols-2 gap-2">
              {overlays.map((overlay, index) => (
                <button
                  key={overlay.id}
                  onClick={() => setSelectedOverlayId(overlay.id)}
                  className={`px-3 py-2 rounded-xl text-sm border transition-colors ${
                    selectedOverlayId === overlay.id
                      ? 'bg-blue-100 text-blue-800 border-blue-200'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: overlay.color }}
                    />
                    Overlay {index + 1}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Selected Overlay Controls */}
          {selectedOverlay && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-800">
                  Overlay {overlays.findIndex(o => o.id === selectedOverlayId) + 1} Settings
                </h3>
                <button
                  onClick={() => removeOverlay(selectedOverlayId!)}
                  className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Remove
                </button>
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color
                </label>
                <ColorPicker
                  color={selectedOverlay.color}
                  onChange={(color) => updateSelectedOverlay({ color })}
                />
              </div>

              {/* Opacity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Opacity: {Math.round(selectedOverlay.opacity * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={selectedOverlay.opacity}
                  onChange={(e) => updateSelectedOverlay({ opacity: parseFloat(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-xl appearance-none cursor-pointer"
                />
              </div>

              {/* Size */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Size: {selectedOverlay.size}px
                </label>
                <input
                  type="range"
                  min="50"
                  max="500"
                  step="10"
                  value={selectedOverlay.size}
                  onChange={(e) => updateSelectedOverlay({ size: parseInt(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-xl appearance-none cursor-pointer"
                />
              </div>

              {/* Position */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Position
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      X: {selectedOverlay.x}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      value={selectedOverlay.x}
                      onChange={(e) => updateSelectedOverlay({ x: parseInt(e.target.value) })}
                      className="w-full h-2 bg-gray-200 rounded-xl appearance-none cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Y: {selectedOverlay.y}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      value={selectedOverlay.y}
                      onChange={(e) => updateSelectedOverlay({ y: parseInt(e.target.value) })}
                      className="w-full h-2 bg-gray-200 rounded-xl appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Blur */}
              <div>
                <MuiBlurSlider
                  value={selectedOverlay.blur}
                  onChange={(value) => updateSelectedOverlay({ blur: value })}
                  min={0}
                  max={200}
                  label="Blur"
                  showValue={true}
                />
              </div>
            </div>
          )}
        </>
      )}

      {/* Footer */}
      <div className="flex justify-between gap-3 mt-8">
        <button
          onClick={onClose}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
        >
          Close
        </button>
        {overlays.length > 0 && (
          <button
            onClick={() => {
              onUpdate([]);
              setSelectedOverlayId(null);
            }}
            className="px-4 py-2 text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Clear All
          </button>
        )}
      </div>

      {/* Add CSS animation styles */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
