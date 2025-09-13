'use client';

import { useState } from 'react';
import { ColorStop, GradientConfig, CircularOverlay } from './GradientGenerator';
import OverlayControlsWindow from './OverlayControlsWindow';

interface GradientControlsProps {
  gradient: GradientConfig;
  onChange: (gradient: GradientConfig) => void;
}

export default function GradientControls({ gradient, onChange }: GradientControlsProps) {
  const [showOverlayWindow, setShowOverlayWindow] = useState(false);
  const addColorStop = () => {
    const newId = Math.random().toString(36).substr(2, 9);
    const newPosition = Math.max(0, Math.min(100, 50));
    
    const newColorStop: ColorStop = {
      id: newId,
      color: '#888888',
      position: newPosition,
    };

    onChange({
      ...gradient,
      colorStops: [...gradient.colorStops, newColorStop].sort((a, b) => a.position - b.position),
    });
  };

  const removeColorStop = (id: string) => {
    if (gradient.colorStops.length > 2) {
      onChange({
        ...gradient,
        colorStops: gradient.colorStops.filter(stop => stop.id !== id),
      });
    }
  };

  const updateColorStop = (id: string, updates: Partial<ColorStop>) => {
    onChange({
      ...gradient,
      colorStops: gradient.colorStops.map(stop =>
        stop.id === id ? { ...stop, ...updates } : stop
      ),
    });
  };

  const updateType = (type: 'linear' | 'radial') => {
    onChange({ ...gradient, type });
  };

  const updateAngle = (angle: number) => {
    onChange({ ...gradient, angle });
  };

  const updateOverlay = (updates: Partial<CircularOverlay>) => {
    onChange({
      ...gradient,
      overlay: { ...gradient.overlay, ...updates },
    });
  };




  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 space-y-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Controls</h2>

      {/* Gradient Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Gradient Type
        </label>
        <div className="flex space-x-3">
          <button
            onClick={() => updateType('linear')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              gradient.type === 'linear'
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-700'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Linear
          </button>
          <button
            onClick={() => updateType('radial')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              gradient.type === 'radial'
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-700'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Radial
          </button>
          <button
            onClick={() => setShowOverlayWindow(true)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              gradient.overlays.length > 0
                ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 border border-purple-200 dark:border-purple-700'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            ⭕ Overlay {gradient.overlays.length > 0 && `(${gradient.overlays.length})`}
          </button>
        </div>
      </div>

      {/* Angle Control - only for linear gradients */}
      {gradient.type === 'linear' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Angle: {gradient.angle}°
          </label>
          <input
            type="range"
            min="0"
            max="360"
            value={gradient.angle}
            onChange={(e) => updateAngle(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      )}

      {/* Color Stops */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Colors
          </label>
          <button
            onClick={addColorStop}
            className="px-3 py-1 bg-blue-500 dark:bg-blue-600 text-white rounded-md text-sm hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
          >
            Add Color
          </button>
        </div>

        <div className="space-y-4">
          {gradient.colorStops
            .sort((a, b) => a.position - b.position)
            .map((stop, index) => (
              <div key={stop.id} className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md">
                <div 
                  className="w-8 h-8 rounded border border-gray-300 dark:border-gray-600"
                  style={{ backgroundColor: stop.color }}
                ></div>
                
                <span className="text-sm text-gray-700 dark:text-gray-300 min-w-[4rem]">{stop.color}</span>
                
                <div className="flex-1">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={stop.position}
                    onChange={(e) => updateColorStop(stop.id, { position: parseInt(e.target.value) })}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 text-center">
                    {stop.position}%
                  </div>
                </div>

                {gradient.colorStops.length > 2 && (
                  <button
                    onClick={() => removeColorStop(stop.id)}
                    className="px-2 py-1 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
        </div>
      </div>

      {/* Overlay Controls Window */}
      <OverlayControlsWindow
        overlays={gradient.overlays}
        onUpdate={(overlays) => onChange({ ...gradient, overlays })}
        onClose={() => setShowOverlayWindow(false)}
        isOpen={showOverlayWindow}
      />

    </div>
  );
}