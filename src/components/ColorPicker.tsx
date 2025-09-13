'use client';

import { useState, useEffect, useRef } from 'react';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  onApply?: () => void;
}

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s;
  const l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
      default: h = 0;
    }
    h /= 6;
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToHex(h: number, s: number, l: number): string {
  h /= 360;
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h * 6) % 2 - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;

  if (0 <= h && h < 1/6) {
    r = c; g = x; b = 0;
  } else if (1/6 <= h && h < 1/3) {
    r = x; g = c; b = 0;
  } else if (1/3 <= h && h < 1/2) {
    r = 0; g = c; b = x;
  } else if (1/2 <= h && h < 2/3) {
    r = 0; g = x; b = c;
  } else if (2/3 <= h && h < 5/6) {
    r = x; g = 0; b = c;
  } else if (5/6 <= h && h < 1) {
    r = c; g = 0; b = x;
  }

  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export default function ColorPicker({ color, onChange, onApply }: ColorPickerProps) {
  const [localColor, setLocalColor] = useState(color);
  const [hsl, setHsl] = useState(hexToHsl(color));
  const isDraggingHue = useRef(false);
  const isDraggingSV = useRef(false);
  const hueSliderRef = useRef<HTMLDivElement>(null);
  const svPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalColor(color);
    setHsl(hexToHsl(color));
  }, [color]);

  const updateColor = (newHsl: { h: number; s: number; l: number }) => {
    const newHex = hslToHex(newHsl.h, newHsl.s, newHsl.l);
    setLocalColor(newHex.toUpperCase());
    setHsl(newHsl);
    onChange(newHex.toUpperCase());
  };

  const handleHueMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isDraggingHue.current = true;
    handleHueMove(e);
  };

  const handleHueMove = (e: React.MouseEvent) => {
    if (!isDraggingHue.current || !hueSliderRef.current) return;
    
    const rect = hueSliderRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const newH = (x / rect.width) * 360;
    
    updateColor({ ...hsl, h: newH });
  };

  const handleSVMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isDraggingSV.current = true;
    handleSVMove(e);
  };

  const handleSVMove = (e: React.MouseEvent) => {
    if (!isDraggingSV.current || !svPickerRef.current) return;
    
    const rect = svPickerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
    
    const s = (x / rect.width) * 100;
    const l = 100 - (y / rect.height) * 100;
    
    updateColor({ ...hsl, s, l });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingHue.current && hueSliderRef.current) {
        const rect = hueSliderRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
        const newH = (x / rect.width) * 360;
        updateColor({ ...hsl, h: newH });
      } else if (isDraggingSV.current && svPickerRef.current) {
        const rect = svPickerRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
        const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
        const s = (x / rect.width) * 100;
        const l = 100 - (y / rect.height) * 100;
        updateColor({ ...hsl, s, l });
      }
    };

    const handleMouseUp = () => {
      isDraggingHue.current = false;
      isDraggingSV.current = false;
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [hsl]);

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg w-64">
      {/* Saturation/Lightness Picker */}
      <div 
        ref={svPickerRef}
        className="relative w-full h-40 mb-4 cursor-crosshair rounded"
        style={{
          background: `linear-gradient(to top, black, transparent), linear-gradient(to right, white, hsl(${hsl.h}, 100%, 50%))`
        }}
        onMouseDown={handleSVMouseDown}
      >
        <div 
          className="absolute w-3 h-3 border-2 border-white rounded-full pointer-events-none"
          style={{
            left: `${(hsl.s / 100) * 100}%`,
            top: `${100 - (hsl.l / 100) * 100}%`,
            transform: 'translate(-50%, -50%)'
          }}
        />
      </div>

      {/* Hue Slider */}
      <div 
        ref={hueSliderRef}
        className="relative w-full h-6 mb-4 cursor-pointer rounded"
        style={{
          background: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)'
        }}
        onMouseDown={handleHueMouseDown}
      >
        <div 
          className="absolute w-4 h-8 bg-white border border-gray-400 rounded pointer-events-none"
          style={{
            left: `${(hsl.h / 360) * 100}%`,
            top: '-4px',
            transform: 'translateX(-50%)'
          }}
        />
      </div>

      {/* Color Preview and Hex Input */}
      <div className="flex items-center space-x-3 mb-4">
        <div 
          className="w-12 h-12 rounded border border-gray-600"
          style={{ backgroundColor: localColor }}
        />
        <input
          type="text"
          value={localColor}
          onChange={(e) => {
            const value = e.target.value.toUpperCase();
            setLocalColor(value);
            if (value.match(/^#[0-9A-F]{6}$/)) {
              const newHsl = hexToHsl(value);
              setHsl(newHsl);
              onChange(value);
            }
          }}
          className="flex-1 px-3 py-2 text-sm border border-gray-600 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="#000000"
        />
      </div>

    </div>
  );
}