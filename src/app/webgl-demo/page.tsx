'use client';

import React, { useState, useRef } from 'react';
import WebGLMeshGradient from '@/components/WebGLMeshGradient';
import { MeshPoint } from '@/components/GradientGenerator';

export default function WebGLDemo() {
  const [meshPoints, setMeshPoints] = useState<MeshPoint[]>([
    { id: '1', x: 30, y: 40, color: '#0DD162', blur: 100 },
    { id: '2', x: 70, y: 60, color: '#0D7CD1', blur: 100 },
    { id: '3', x: 50, y: 20, color: '#FF6B6B', blur: 80 },
  ]);

  const [gradientType, setGradientType] = useState<'linear' | 'radial' | 'circular' | 'effects' | 'nothing'>('circular');
  const [gradientAngle, setGradientAngle] = useState(0);
  const [backgroundColor, setBackgroundColor] = useState('#111827');
  const [isWebGLMode, setIsWebGLMode] = useState(true);

  const addMeshPoint = () => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
    const newPoint: MeshPoint = {
      id: `${Date.now()}`,
      x: Math.random() * 80 + 10,
      y: Math.random() * 80 + 10,
      color: colors[Math.floor(Math.random() * colors.length)],
      blur: Math.random() * 100 + 50,
    };
    setMeshPoints([...meshPoints, newPoint]);
  };

  const removeMeshPoint = (id: string) => {
    setMeshPoints(meshPoints.filter(point => point.id !== id));
  };

  const updateMeshPoint = (id: string, updates: Partial<MeshPoint>) => {
    setMeshPoints(meshPoints.map(point => 
      point.id === id ? { ...point, ...updates } : point
    ));
  };

  const generateRandomGradient = () => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'];
    const newPoints = meshPoints.map(point => ({
      ...point,
      color: colors[Math.floor(Math.random() * colors.length)],
      x: Math.random() * 80 + 10,
      y: Math.random() * 80 + 10,
      blur: Math.random() * 100 + 50,
    }));
    setMeshPoints(newPoints);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">WebGL Gradient Demo</h1>
          <p className="text-gray-400 mb-6">
            Compare CSS gradients vs WebGL rendering for mesh gradients
          </p>
          
          <div className="flex justify-center gap-4 mb-6">
            <button
              onClick={() => setIsWebGLMode(true)}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                isWebGLMode 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              WebGL Mode
            </button>
            <button
              onClick={() => setIsWebGLMode(false)}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                !isWebGLMode 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              CSS Mode
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Gradient Display */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold mb-4">
              {isWebGLMode ? 'WebGL Renderer' : 'CSS Renderer'}
            </h2>
            
            <div className="relative w-full h-96 border-2 border-gray-600 rounded-lg overflow-hidden">
              {isWebGLMode ? (
                <WebGLMeshGradient
                  meshPoints={meshPoints}
                  gradientType={gradientType}
                  gradientAngle={gradientAngle}
                  backgroundColor={backgroundColor}
                  width={800}
                  height={400}
                  className="w-full h-full"
                />
              ) : (
                <div 
                  className="w-full h-full"
                  style={{
                    background: `radial-gradient(circle at 30% 40%, #0DD162 0%, rgba(13, 209, 98, 0.6) 15%, rgba(13, 209, 98, 0.4) 30%, rgba(13, 209, 98, 0.2) 50%, transparent 100%),
                                radial-gradient(circle at 70% 60%, #0D7CD1 0%, rgba(13, 124, 209, 0.6) 15%, rgba(13, 124, 209, 0.4) 30%, rgba(13, 124, 209, 0.2) 50%, transparent 100%),
                                radial-gradient(circle at 50% 20%, #FF6B6B 0%, rgba(255, 107, 107, 0.6) 15%, rgba(255, 107, 107, 0.4) 30%, rgba(255, 107, 107, 0.2) 50%, transparent 100%)`,
                    backgroundColor: backgroundColor
                  }}
                />
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold mb-4">Controls</h2>
            
            {/* Gradient Type */}
            <div>
              <label className="block text-sm font-medium mb-2">Gradient Type</label>
              <select
                value={gradientType}
                onChange={(e) => setGradientType(e.target.value as 'circular' | 'linear' | 'radial' | 'effects' | 'nothing')}
                className="w-full p-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
              >
                <option value="circular">Circular</option>
                <option value="linear">Linear</option>
                <option value="radial">Radial</option>
                <option value="effects">Effects</option>
                <option value="nothing">Nothing</option>
              </select>
            </div>

            {/* Gradient Angle */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Gradient Angle: {gradientAngle}°
              </label>
              <input
                type="range"
                min="0"
                max="360"
                value={gradientAngle}
                onChange={(e) => setGradientAngle(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Background Color */}
            <div>
              <label className="block text-sm font-medium mb-2">Background Color</label>
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="w-full h-10 rounded-lg border border-gray-600"
              />
            </div>

            {/* Mesh Points */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium">Mesh Points</label>
                <button
                  onClick={addMeshPoint}
                  className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm"
                >
                  Add Point
                </button>
              </div>
              
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {meshPoints.map((point, index) => (
                  <div key={point.id} className="flex items-center gap-2 p-2 bg-gray-800 rounded">
                    <div 
                      className="w-4 h-4 rounded-full border border-white"
                      style={{ backgroundColor: point.color }}
                    />
                    <span className="text-sm text-gray-300">Point {index + 1}</span>
                    <input
                      type="color"
                      value={point.color}
                      onChange={(e) => updateMeshPoint(point.id, { color: e.target.value })}
                      className="w-6 h-6 rounded border border-gray-600"
                    />
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={point.blur || 100}
                      onChange={(e) => updateMeshPoint(point.id, { blur: parseInt(e.target.value) })}
                      className="flex-1"
                    />
                    <button
                      onClick={() => removeMeshPoint(point.id)}
                      className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <button
                onClick={generateRandomGradient}
                className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors"
              >
                Random Gradient
              </button>
            </div>

            {/* Performance Info */}
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Performance Info</h3>
              <div className="text-sm text-gray-300 space-y-1">
                <p><strong>WebGL Mode:</strong> GPU-accelerated rendering</p>
                <p><strong>CSS Mode:</strong> CPU-based CSS rendering</p>
                <p><strong>Points:</strong> {meshPoints.length}</p>
                <p><strong>Type:</strong> {gradientType}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Comparison */}
        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-6 text-center">WebGL vs CSS Comparison</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4 text-green-400">WebGL Advantages</h3>
              <ul className="space-y-2 text-gray-300">
                <li>• GPU-accelerated rendering</li>
                <li>• Real-time shader effects</li>
                <li>• Better performance with many points</li>
                <li>• Custom blending modes</li>
                <li>• Animated effects possible</li>
                <li>• Precise control over rendering</li>
              </ul>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4 text-blue-400">CSS Advantages</h3>
              <ul className="space-y-2 text-gray-300">
                <li>• Browser-optimized rendering</li>
                <li>• Better browser compatibility</li>
                <li>• Easier to debug and modify</li>
                <li>• No WebGL context limitations</li>
                <li>• Works without GPU</li>
                <li>• Standard web technologies</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
