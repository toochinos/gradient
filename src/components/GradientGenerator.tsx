'use client';

import React, { useState, useRef, useCallback, useImperativeHandle, forwardRef, useEffect, JSX } from 'react';

export interface MeshPoint {
  id: string;
  x: number;
  y: number;
  color: string;
  blur?: number;
  name?: string;
  hideColor?: boolean;
  hideBalls?: boolean;
  individualFadeLeft?: number;
  individualFadeRight?: number;
  individualFadeTop?: number;
  individualFadeBottom?: number;
  isManualLinear?: boolean;
  textureType?: 'linear' | 'radial' | 'circular';
}

export interface ColorStop {
  id: string;
  color: string;
  position: number;
}

export interface CircularOverlay {
  id: string;
  color: string;
  opacity: number;
  size: number;
  x: number;
  y: number;
  blur: number;
  enabled?: boolean;
}

export interface GradientConfig {
  type: 'linear' | 'radial';
  angle: number;
  colorStops: ColorStop[];
  overlay: CircularOverlay;
  overlays: CircularOverlay[];
}

interface GradientGeneratorProps {
  onCSSGenerate?: (css: string) => void;
  onMeshPointsChange?: (points: MeshPoint[]) => void;
  onPointSelect?: (pointId: string) => void;
  selectedColorId?: string;
  backgroundColor?: string;
  hideControls?: boolean;
  meshPoints?: MeshPoint[];
  gradientType?: 'linear' | 'radial' | 'circular' | 'effects' | 'nothing';
  gradientAngle?: number;
  enabledGradientTypes?: {
    linear: boolean;
    radial: boolean;
    circular: boolean;
  };
  addNoise?: boolean;
  noiseIntensity?: number;
  isDrawingMode?: boolean;
  penColor?: string;
  penThickness?: number;
  penFadeLeft?: number;
  penFadeRight?: number;
  selectedShape?: 'triangle' | 'circle' | 'square' | null;
  uploadedImages?: Array<{
    id: string;
    src: string;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    isSelected: boolean;
  }>;
  selectedImageId?: string | null;
  onImageSelect?: (imageId: string) => void;
  onImageUpdate?: (imageId: string, updates: Partial<{
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
  }>) => void;
  onImageDelete?: (imageId: string) => void;
  drawingPaths?: Array<{
    points: Array<{x: number, y: number}>;
    color: string;
    thickness: number;
    fadeLeft: number;
    fadeRight: number;
  }>;
  onDrawingPathsChange?: (paths: Array<{
    points: Array<{x: number, y: number}>;
    color: string;
    thickness: number;
    fadeLeft: number;
    fadeRight: number;
  }>) => void;
}

export interface GradientGeneratorRef {
  generateCSS: (format?: 'html' | 'react' | 'css') => string;
  addMeshPoint: (color: string) => void;
  removeMeshPoint: (pointId: string) => void;
  getMeshPoints: () => MeshPoint[];
  generateRandomGradient: () => void;
  updatePointBlur: (pointId: string, blur: number) => void;
  updatePointColor: (pointId: string, color: string) => void;
  getGradientElement: () => HTMLDivElement | null;
}

const GradientGenerator = forwardRef<GradientGeneratorRef, GradientGeneratorProps>(
  ({ onCSSGenerate, onMeshPointsChange, onPointSelect, selectedColorId, backgroundColor = '#111827', hideControls = false, meshPoints: propMeshPoints, gradientType = 'circular', gradientAngle = 0, enabledGradientTypes = { linear: false, radial: false, circular: false, effects: false }, addNoise = false, noiseIntensity = 12, isDrawingMode = false, penColor = '#ffffff', penThickness = 0.2, penFadeLeft = 0, penFadeRight = 0, selectedShape = null, uploadedImages = [], selectedImageId = null, onImageSelect, onImageUpdate, onImageDelete, drawingPaths = [], onDrawingPathsChange }, ref) => {
  const defaultMeshPoints = [
    { id: '1', x: 30, y: 40, color: '#0DD162', blur: 100 },
    { id: '2', x: 70, y: 60, color: '#0D7CD1', blur: 100 },
  ];
  
  const [internalMeshPoints, setInternalMeshPoints] = useState<MeshPoint[]>(defaultMeshPoints);
  
  // Always use propMeshPoints if available, otherwise use internal state
  const meshPoints = propMeshPoints || internalMeshPoints;
  
  
  // Update internal state when propMeshPoints changes (for consistency)
  useEffect(() => {
    if (propMeshPoints) {
      setInternalMeshPoints(propMeshPoints);
    }
  }, [propMeshPoints]);

  const [isDragging, setIsDragging] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<Array<{x: number, y: number}>>([]);
  const [isShiftPressed, setIsShiftPressed] = useState(false);
  
  // Image dragging state
  const [isDraggingImage, setIsDraggingImage] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isResizingImage, setIsResizingImage] = useState<string | null>(null);
  const [isRotatingImage, setIsRotatingImage] = useState<string | null>(null);

  const updateMeshPoints = useCallback((newPoints: MeshPoint[]) => {
    if (propMeshPoints && onMeshPointsChange) {
      // If controlled by parent, use callback
      onMeshPointsChange(newPoints);
    } else {
      // If internal state, update directly
      setInternalMeshPoints(newPoints);
    }
  }, [propMeshPoints, onMeshPointsChange]);

  // Handle shift key for straight lines and sharp curves
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        setIsShiftPressed(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        setIsShiftPressed(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Generate shape paths
  const generateShapePath = useCallback((centerX: number, centerY: number, size: number = 10) => {
    const points: Array<{x: number, y: number}> = [];
    
    switch (selectedShape) {
      case 'triangle':
        // Triangle points
        points.push({x: centerX, y: centerY - size});
        points.push({x: centerX - size * 0.866, y: centerY + size * 0.5});
        points.push({x: centerX + size * 0.866, y: centerY + size * 0.5});
        points.push({x: centerX, y: centerY - size}); // Close the triangle
        break;
        
      case 'circle':
        // Circle points (approximated with many points)
        const numPoints = 32;
        for (let i = 0; i <= numPoints; i++) {
          const angle = (i / numPoints) * 2 * Math.PI;
          points.push({
            x: centerX + Math.cos(angle) * size,
            y: centerY + Math.sin(angle) * size
          });
        }
        break;
        
      case 'square':
        // Square points
        points.push({x: centerX - size, y: centerY - size});
        points.push({x: centerX + size, y: centerY - size});
        points.push({x: centerX + size, y: centerY + size});
        points.push({x: centerX - size, y: centerY + size});
        points.push({x: centerX - size, y: centerY - size}); // Close the square
        break;
    }
    
    return points;
  }, [selectedShape]);

  // Image interaction handlers
  const handleImageMouseDown = useCallback((e: React.MouseEvent, imageId: string, action: 'drag' | 'resize' | 'rotate') => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const image = uploadedImages.find(img => img.id === imageId);
    if (!image) return;
    
    const mouseX = ((e.clientX - rect.left) / rect.width) * 100;
    const mouseY = ((e.clientY - rect.top) / rect.height) * 100;
    
    if (action === 'drag') {
      setIsDraggingImage(imageId);
      setDragOffset({
        x: mouseX - image.x,
        y: mouseY - image.y
      });
      if (onImageSelect) {
        onImageSelect(imageId);
      }
    } else if (action === 'resize') {
      setIsResizingImage(imageId);
    } else if (action === 'rotate') {
      setIsRotatingImage(imageId);
    }
  }, [uploadedImages, onImageSelect]);

  const handleImageMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * 100;
    const mouseY = ((e.clientY - rect.top) / rect.height) * 100;
    
    if (isDraggingImage && onImageUpdate) {
      onImageUpdate(isDraggingImage, {
        x: mouseX - dragOffset.x,
        y: mouseY - dragOffset.y
      });
    } else if (isResizingImage && onImageUpdate) {
      const image = uploadedImages.find(img => img.id === isResizingImage);
      if (image) {
        const distance = Math.sqrt(
          Math.pow(mouseX - image.x, 2) + Math.pow(mouseY - image.y, 2)
        );
        const newSize = Math.max(5, Math.min(50, distance));
        onImageUpdate(isResizingImage, {
          width: newSize,
          height: newSize
        });
      }
    } else if (isRotatingImage && onImageUpdate) {
      const image = uploadedImages.find(img => img.id === isRotatingImage);
      if (image) {
        const angle = Math.atan2(mouseY - image.y, mouseX - image.x) * (180 / Math.PI);
        onImageUpdate(isRotatingImage, {
          rotation: angle
        });
      }
    }
  }, [isDraggingImage, isResizingImage, isRotatingImage, dragOffset, uploadedImages, onImageUpdate]);

  const handleImageMouseUp = useCallback(() => {
    setIsDraggingImage(null);
    setIsResizingImage(null);
    setIsRotatingImage(null);
    setDragOffset({ x: 0, y: 0 });
  }, []);


  const handleMouseDown = useCallback((e: React.MouseEvent, pointId: string) => {
    e.preventDefault();
    setIsDragging(pointId);
    if (onPointSelect) {
      onPointSelect(pointId);
    }
  }, [onPointSelect]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

    const newPoints = meshPoints.map(point => 
      point.id === isDragging ? { ...point, x, y } : point
    );
    updateMeshPoints(newPoints);
  }, [isDragging, meshPoints, updateMeshPoints]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(null);
  }, []);

  // Drawing handlers
  const handleDrawingMouseDown = useCallback((e: React.MouseEvent) => {
    if (!isDrawingMode || !containerRef.current) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    if (selectedShape) {
      // Place shape immediately on click
      const shapePoints = generateShapePath(x, y, 5); // Size of 5 units
      
      if (onDrawingPathsChange) {
        const newPath = {
          points: shapePoints,
          color: penColor,
          thickness: penThickness,
          fadeLeft: penFadeLeft,
          fadeRight: penFadeRight
        };
        onDrawingPathsChange([...drawingPaths, newPath]);
      }
    } else {
      // Normal drawing mode
      setIsDrawing(true);
      setCurrentPath([{x, y}]);
    }
  }, [isDrawingMode, selectedShape, generateShapePath, penColor, penThickness, penFadeLeft, penFadeRight, drawingPaths, onDrawingPathsChange]);

  const handleDrawingMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDrawing || !isDrawingMode || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setCurrentPath(prev => {
      if (prev.length === 0) {
        return [{x, y}];
      }
      
      if (isShiftPressed) {
        // For straight lines: keep only horizontal, vertical, or 45-degree lines
        const lastPoint = prev[prev.length - 1];
        const deltaX = x - lastPoint.x;
        const deltaY = y - lastPoint.y;
        
        // Determine which direction is more dominant
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          // Horizontal line (or close to it)
          return [...prev, {x, y: lastPoint.y}];
        } else if (Math.abs(deltaY) > Math.abs(deltaX)) {
          // Vertical line (or close to it)
          return [...prev, {x: lastPoint.x, y}];
        } else {
          // 45-degree diagonal line
          const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
          const normalizedX = deltaX / distance;
          const normalizedY = deltaY / distance;
          const newX = lastPoint.x + normalizedX * distance;
          const newY = lastPoint.y + normalizedY * distance;
          return [...prev, {x: newX, y: newY}];
        }
      } else {
        // Create wavy, organic lines with natural variation
        const lastPoint = prev[prev.length - 1];
        const deltaX = x - lastPoint.x;
        const deltaY = y - lastPoint.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        if (distance > 0.5) { // Only add points if moved enough
          // Add some organic variation to create wavy lines
          const waveIntensity = 0.8; // How wavy the lines are
          const waveFrequency = 0.3; // How frequent the waves are
          const time = prev.length * waveFrequency;
          
          // Create perpendicular wave offset
          const perpX = -deltaY / distance;
          const perpY = deltaX / distance;
          
          // Generate wave offset using sine wave
          const waveOffset = Math.sin(time) * waveIntensity;
          
          // Add the wave to the current position
          const wavyX = x + perpX * waveOffset;
          const wavyY = y + perpY * waveOffset;
          
          return [...prev, {x: wavyX, y: wavyY}];
        }
        
        return prev; // Don't add point if too close
      }
    });
  }, [isDrawing, isDrawingMode, isShiftPressed]);

  const handleDrawingMouseUp = useCallback(() => {
    if (!isDrawing || currentPath.length < 2) {
      setIsDrawing(false);
      setCurrentPath([]);
      return;
    }
    
    if (onDrawingPathsChange) {
      const newPath = {
        points: currentPath,
        color: penColor,
        thickness: penThickness,
        fadeLeft: penFadeLeft,
        fadeRight: penFadeRight
      };
      onDrawingPathsChange([...drawingPaths, newPath]);
    }
    
    setIsDrawing(false);
    setCurrentPath([]);
  }, [isDrawing, currentPath, penColor, penThickness, penFadeLeft, penFadeRight, drawingPaths, onDrawingPathsChange]);

  // Touch handlers for better trackpad/touch support
  const handleDrawingTouchStart = useCallback((e: React.TouchEvent) => {
    if (!isDrawingMode || !containerRef.current) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const rect = containerRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const x = ((touch.clientX - rect.left) / rect.width) * 100;
    const y = ((touch.clientY - rect.top) / rect.height) * 100;
    
    if (selectedShape) {
      // Place shape immediately on touch
      const shapePoints = generateShapePath(x, y, 5); // Size of 5 units
      
      if (onDrawingPathsChange) {
        const newPath = {
          points: shapePoints,
          color: penColor,
          thickness: penThickness,
          fadeLeft: penFadeLeft,
          fadeRight: penFadeRight
        };
        onDrawingPathsChange([...drawingPaths, newPath]);
      }
    } else {
      // Normal drawing mode
      setIsDrawing(true);
      setCurrentPath([{x, y}]);
    }
  }, [isDrawingMode, selectedShape, generateShapePath, penColor, penThickness, penFadeLeft, penFadeRight, drawingPaths, onDrawingPathsChange]);

  const handleDrawingTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDrawing || !isDrawingMode || !containerRef.current) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const rect = containerRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const x = ((touch.clientX - rect.left) / rect.width) * 100;
    const y = ((touch.clientY - rect.top) / rect.height) * 100;
    
    setCurrentPath(prev => {
      if (prev.length === 0) {
        return [{x, y}];
      }
      
      if (isShiftPressed) {
        // For straight lines: keep only horizontal, vertical, or 45-degree lines
        const lastPoint = prev[prev.length - 1];
        const deltaX = x - lastPoint.x;
        const deltaY = y - lastPoint.y;
        
        // Determine which direction is more dominant
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          // Horizontal line (or close to it)
          return [...prev, {x, y: lastPoint.y}];
        } else if (Math.abs(deltaY) > Math.abs(deltaX)) {
          // Vertical line (or close to it)
          return [...prev, {x: lastPoint.x, y}];
        } else {
          // 45-degree diagonal line
          const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
          const normalizedX = deltaX / distance;
          const normalizedY = deltaY / distance;
          const newX = lastPoint.x + normalizedX * distance;
          const newY = lastPoint.y + normalizedY * distance;
          return [...prev, {x: newX, y: newY}];
        }
      } else {
        // Create wavy, organic lines with natural variation
        const lastPoint = prev[prev.length - 1];
        const deltaX = x - lastPoint.x;
        const deltaY = y - lastPoint.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        if (distance > 0.5) { // Only add points if moved enough
          // Add some organic variation to create wavy lines
          const waveIntensity = 0.8; // How wavy the lines are
          const waveFrequency = 0.3; // How frequent the waves are
          const time = prev.length * waveFrequency;
          
          // Create perpendicular wave offset
          const perpX = -deltaY / distance;
          const perpY = deltaX / distance;
          
          // Generate wave offset using sine wave
          const waveOffset = Math.sin(time) * waveIntensity;
          
          // Add the wave to the current position
          const wavyX = x + perpX * waveOffset;
          const wavyY = y + perpY * waveOffset;
          
          return [...prev, {x: wavyX, y: wavyY}];
        }
        
        return prev; // Don't add point if too close
      }
    });
  }, [isDrawing, isDrawingMode, isShiftPressed]);

  const handleDrawingTouchEnd = useCallback(() => {
    if (!isDrawing || currentPath.length < 2) {
      setIsDrawing(false);
      setCurrentPath([]);
      return;
    }
    
    if (onDrawingPathsChange) {
      const newPath = {
        points: currentPath,
        color: penColor,
        thickness: penThickness,
        fadeLeft: penFadeLeft,
        fadeRight: penFadeRight
      };
      onDrawingPathsChange([...drawingPaths, newPath]);
    }
    
    setIsDrawing(false);
    setCurrentPath([]);
  }, [isDrawing, currentPath, penColor, penThickness, penFadeLeft, penFadeRight, drawingPaths, onDrawingPathsChange]);

  // Combined mouse handlers
  const handleCombinedMouseDown = useCallback((e: React.MouseEvent) => {
    if (isDrawingMode) {
      handleDrawingMouseDown(e);
    }
    // Don't handle regular mouse down in drawing mode to prevent conflicts
  }, [isDrawingMode, handleDrawingMouseDown]);

  const handleCombinedMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDraggingImage || isResizingImage || isRotatingImage) {
      handleImageMouseMove(e);
    } else if (isDrawingMode) {
      handleDrawingMouseMove(e);
    } else {
      handleMouseMove(e);
    }
  }, [isDraggingImage, isResizingImage, isRotatingImage, handleImageMouseMove, isDrawingMode, handleDrawingMouseMove, handleMouseMove]);

  const handleCombinedMouseUp = useCallback(() => {
    if (isDraggingImage || isResizingImage || isRotatingImage) {
      handleImageMouseUp();
    } else if (isDrawingMode) {
      handleDrawingMouseUp();
    } else {
      handleMouseUp();
    }
  }, [isDraggingImage, isResizingImage, isRotatingImage, handleImageMouseUp, isDrawingMode, handleDrawingMouseUp, handleMouseUp]);

  // Combined touch handlers
  const handleCombinedTouchStart = useCallback((e: React.TouchEvent) => {
    if (isDrawingMode) {
      handleDrawingTouchStart(e);
    }
    // Don't handle regular touch start in drawing mode to prevent conflicts
  }, [isDrawingMode, handleDrawingTouchStart]);

  const handleCombinedTouchMove = useCallback((e: React.TouchEvent) => {
    if (isDrawingMode) {
      handleDrawingTouchMove(e);
    }
    // Don't handle regular touch move in drawing mode to prevent conflicts
  }, [isDrawingMode, handleDrawingTouchMove]);

  const handleCombinedTouchEnd = useCallback(() => {
    if (isDrawingMode) {
      handleDrawingTouchEnd();
    }
    // Don't handle regular touch end in drawing mode to prevent conflicts
  }, [isDrawingMode, handleDrawingTouchEnd]);

  const addMeshPoint = useCallback((color: string) => {
    const newPoint: MeshPoint = {
      id: `${Date.now()}-${Math.random()}`,
      x: Math.random() * 80 + 10, // Random position between 10% and 90%
      y: Math.random() * 80 + 10,
      color: color,
      blur: 100,  // Start with 100px blur for new colors
      name: 'Custom Color',
      textureType: 'circular',  // Default to circular texture
    };
    
    const newPoints = [...meshPoints, newPoint];
    updateMeshPoints(newPoints);
  }, [meshPoints, updateMeshPoints]);

  const removeMeshPoint = useCallback((pointId: string) => {
    const newPoints = meshPoints.filter(point => point.id !== pointId);
    updateMeshPoints(newPoints);
  }, [meshPoints, updateMeshPoints]);

  const getMeshPoints = useCallback(() => {
    return meshPoints;
  }, [meshPoints]);

  const updatePointBlur = useCallback((pointId: string, blur: number) => {
    // Allow blur value to go to 0 for no blur effect
    const adjustedBlur = Math.max(0, blur);
    
    const newPoints = meshPoints.map(point => 
      point.id === pointId ? { ...point, blur: adjustedBlur } : point
    );
    updateMeshPoints(newPoints);
  }, [meshPoints, updateMeshPoints]);

  const updatePointColor = useCallback((pointId: string, color: string) => {
    const newPoints = meshPoints.map(point => 
      point.id === pointId ? { ...point, color } : point
    );
    updateMeshPoints(newPoints);
  }, [meshPoints, updateMeshPoints]);

  // Generate random color
  const generateRandomColor = () => {
    const hue = Math.floor(Math.random() * 360);
    const saturation = Math.floor(Math.random() * 40) + 60; // 60-100%
    const lightness = Math.floor(Math.random() * 30) + 40; // 40-70%
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  // Generate random position
  const generateRandomPosition = () => {
    return {
      x: Math.floor(Math.random() * 80) + 10, // 10-90%
      y: Math.floor(Math.random() * 80) + 10, // 10-90%
    };
  };

  // Generate new random gradient
  const generateRandomGradient = useCallback(() => {
    const textureTypes: ('linear' | 'radial' | 'circular')[] = ['linear', 'radial', 'circular'];
    const newPoints = meshPoints.map(point => ({
      ...point,
      color: generateRandomColor(),
      ...generateRandomPosition(),
      blur: 151 + Math.floor(Math.random() * 50), // Start at 151px, up to 200px
      textureType: textureTypes[Math.floor(Math.random() * textureTypes.length)],
    }));

    updateMeshPoints(newPoints);
  }, [meshPoints, updateMeshPoints]);

  const generateMeshGradientCSS = (format: 'html' | 'react' | 'css' = 'html') => {
    // Helper function for CSS color conversion
    const getRgbaFromColorCSS = (color: string, alpha: number) => {
      if (color.startsWith('hsl')) {
        return `hsla(${color.slice(4, -1)}, ${alpha})`;
      } else if (color.startsWith('#')) {
        const hex = color.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
      } else {
        return color.replace('rgb', 'rgba').replace(')', `, ${alpha})`);
      }
    };

    // Generate noise texture CSS if needed
    const generateNoiseCSS = () => {
      if (!addNoise || noiseIntensity <= 0) return '';
      
      const size = 64;
      const numDots = Math.floor(noiseIntensity * 20);
      const opacity = Math.min(noiseIntensity / 24 * 0.15, 0.15);
      
      let dots = '';
      for (let i = 0; i < numDots; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const radius = Math.random() * 0.8 + 0.2;
        const dotOpacity = Math.random() * opacity;
        dots += `<circle cx="${x}" cy="${y}" r="${radius}" fill="black" opacity="${dotOpacity}" />`;
      }
      
      const svgData = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">${dots}</svg>`;
      const dataUrl = `url("data:image/svg+xml,${encodeURIComponent(svgData)}")`;
      
      return `
.mesh-gradient::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: ${dataUrl};
  background-size: 64px 64px;
  background-repeat: repeat;
  opacity: 1;
  mix-blend-mode: overlay;
  pointer-events: none;
}`;
    };

    // Generate CSS based on gradient type
    let gradientCSS = '';
    let htmlStructure = '';

    if (gradientType === 'linear') {
      // Linear gradient that automatically blends all colors based on their positions
      // Exclude colors that are in manual linear mode from auto-linear blend
      const autoLinearPoints = meshPoints.filter(point => !point.hideColor && !point.isManualLinear);
      const manualLinearPoints = meshPoints.filter(point => !point.hideColor && point.isManualLinear);

      // Create auto-linear gradient if there are points for it
      if (autoLinearPoints.length > 0) {
        // Sort points based on the angle to create proper linear gradient
        const sortedPoints = [...autoLinearPoints].sort((a, b) => {
          const angleRad = (gradientAngle * Math.PI) / 180;
          const aProjection = a.x * Math.cos(angleRad) + a.y * Math.sin(angleRad);
          const bProjection = b.x * Math.cos(angleRad) + b.y * Math.sin(angleRad);
          return aProjection - bProjection;
        });

        // Calculate positions as percentages along the gradient line
        const gradientStops = sortedPoints.map((point, index) => {
          const position = (index / (sortedPoints.length - 1)) * 100;
          return `${point.color} ${position}%`;
        }).join(', ');

        htmlStructure = `/* HTML Structure:
<div class="mesh-gradient">
${manualLinearPoints.map((_, index) => `  <div class="manual-linear-layer-${index + 1}"></div>`).join('\n')}
</div>
*/`;

        const mainCSS = `.mesh-gradient {
  position: relative;
  width: 100%;
  height: 400px;
  overflow: hidden;
  background: linear-gradient(${gradientAngle}deg, ${gradientStops});
}`;

        // Add manual linear layers CSS
        const manualLayersCSS = manualLinearPoints.map((point, index) => {
          const fadeLeft = point.individualFadeLeft || 0;
          const fadeRight = point.individualFadeRight || 0;
          const fadeTop = point.individualFadeTop || 0;
          const fadeBottom = point.individualFadeBottom || 0;
          
          let layerStyles = '';
          
          if (fadeLeft > 0) {
            layerStyles += `
.mesh-gradient .manual-linear-layer-${index + 1}::before {
  content: '';
  position: absolute;
  left: ${point.x}%;
  top: 0%;
  width: ${fadeLeft}px;
  height: 100%;
  transform: translateX(-100%);
  background: linear-gradient(90deg, transparent 0%, ${getRgbaFromColorCSS(point.color, 0.4)} 50%, ${point.color} 100%);
  filter: blur(${fadeLeft * 0.015}px);
}`;
          }
          
          if (fadeRight > 0) {
            layerStyles += `
.mesh-gradient .manual-linear-layer-${index + 1}::after {
  content: '';
  position: absolute;
  left: ${point.x}%;
  top: 0%;
  width: ${fadeRight}px;
  height: 100%;
  background: linear-gradient(90deg, ${point.color} 0%, ${getRgbaFromColorCSS(point.color, 0.4)} 50%, transparent 100%);
  filter: blur(${fadeRight * 0.015}px);
}`;
          }
          
          return `.mesh-gradient .manual-linear-layer-${index + 1} {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}${layerStyles}`;
        }).join('\n\n');

        gradientCSS = `${mainCSS}\n\n${manualLayersCSS}`;
      } else if (manualLinearPoints.length > 0) {
        // Only manual points, no auto-linear background
        htmlStructure = `/* HTML Structure:
<div class="mesh-gradient">
${manualLinearPoints.map((_, index) => `  <div class="manual-linear-layer-${index + 1}"></div>`).join('\n')}
</div>
*/`;

        const mainCSS = `.mesh-gradient {
  position: relative;
  width: 100%;
  height: 400px;
  overflow: hidden;
  background-color: ${backgroundColor};
}`;

        const manualLayersCSS = manualLinearPoints.map((point, index) => {
          const fadeLeft = point.individualFadeLeft || 0;
          const fadeRight = point.individualFadeRight || 0;
          const fadeTop = point.individualFadeTop || 0;
          const fadeBottom = point.individualFadeBottom || 0;
          
          let layerStyles = '';
          
          if (fadeLeft > 0) {
            layerStyles += `
.mesh-gradient .manual-linear-layer-${index + 1}::before {
  content: '';
  position: absolute;
  left: ${point.x}%;
  top: 0%;
  width: ${fadeLeft}px;
  height: 100%;
  transform: translateX(-100%);
  background: linear-gradient(90deg, transparent 0%, ${getRgbaFromColorCSS(point.color, 0.4)} 50%, ${point.color} 100%);
  filter: blur(${fadeLeft * 0.015}px);
}`;
          }
          
          if (fadeRight > 0) {
            layerStyles += `
.mesh-gradient .manual-linear-layer-${index + 1}::after {
  content: '';
  position: absolute;
  left: ${point.x}%;
  top: 0%;
  width: ${fadeRight}px;
  height: 100%;
  background: linear-gradient(90deg, ${point.color} 0%, ${getRgbaFromColorCSS(point.color, 0.4)} 50%, transparent 100%);
  filter: blur(${fadeRight * 0.015}px);
}`;
          }
          
          return `.mesh-gradient .manual-linear-layer-${index + 1} {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}${layerStyles}`;
        }).join('\n\n');

        gradientCSS = `${mainCSS}\n\n${manualLayersCSS}`;
      } else {
        // No points to show
        htmlStructure = `/* HTML Structure:
<div class="mesh-gradient"></div>
*/`;

        gradientCSS = `.mesh-gradient {
  position: relative;
  width: 100%;
  height: 400px;
  overflow: hidden;
  background-color: ${backgroundColor};
}`;
      }
    } else if (gradientType === 'radial') {
      // Radial gradient - individual circular balls at each point
      const visiblePoints = meshPoints.filter(point => !point.hideColor);
      htmlStructure = `/* HTML Structure:
<div class="mesh-gradient">
${visiblePoints.map((_, index) => `  <div class="radial-layer-${index + 1}"></div>`).join('\n')}
</div>
*/`;

      const mainCSS = `.mesh-gradient {
  position: relative;
  width: 100%;
  height: 400px;
  overflow: hidden;
  background-color: ${backgroundColor};
}`;

      const layerCSS = visiblePoints.filter(point => (point.blur || 100) > 0).map((point, index) => {
        const blurValue = Math.max(0, point.blur || 100);
        // Calculate opacity based on blur value
        const opacity = Math.min(0.9, Math.max(0.2, 0.3 + (blurValue / 200) * 0.6));
        const scale = Math.min(1.8, Math.max(1.1, 0.8 + (blurValue / 200) * 1.0));
        const spread = Math.min(80, Math.max(15, 20 + (blurValue / 200) * 60));
        const blurFilter = blurValue > 0 ? `\n  filter: blur(${blurValue * 0.1}px);` : '';
        
        return `.mesh-gradient .radial-layer-${index + 1} {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at ${point.x}% ${point.y}%, ${point.color} 0%, ${getRgbaFromColorCSS(point.color, 0.7)} 15%, ${getRgbaFromColorCSS(point.color, 0.4)} 30%, ${getRgbaFromColorCSS(point.color, 0.1)} 50%, transparent ${spread}%);
  opacity: ${opacity};
  transform: scale(${scale}) rotate(${gradientAngle}deg);
  transform-origin: ${point.x}% ${point.y}%;${blurFilter}
}`;
      }).join('\n\n');

      gradientCSS = `${mainCSS}\n\n${layerCSS}`;
    } else if (gradientType === 'nothing') {
      // Individual texture types - each color uses its own textureType
      const visiblePoints = meshPoints.filter(point => !point.hideColor);
      htmlStructure = `/* HTML Structure:
<div class="mesh-gradient">
${visiblePoints.map((_, index) => `  <div class="individual-layer-${index + 1}"></div>`).join('\n')}
</div>
*/`;

      const mainCSS = `.mesh-gradient {
  position: relative;
  width: 100%;
  height: 400px;
  overflow: hidden;
  background-color: ${backgroundColor};
}`;

      const layerCSS = visiblePoints.filter(point => (point.blur || 100) > 0).map((point, index) => {
        const blurValue = Math.max(0, point.blur || 100);
        // Calculate opacity based on blur value
        const opacity = Math.min(0.9, Math.max(0.2, 0.3 + (blurValue / 200) * 0.6));
        const scale = Math.min(1.8, Math.max(1.1, 0.8 + (blurValue / 200) * 1.0));
        const spread = Math.min(80, Math.max(15, 20 + (blurValue / 200) * 60));
        const blurFilter = blurValue > 0 ? `\n  filter: blur(${blurValue * 0.1}px);` : '';
        
        // Use individual texture type for each point
        const textureType = point.textureType || 'circular';
        let backgroundCSS = '';
        
        if (textureType === 'linear') {
          // Linear gradient for this individual point
          backgroundCSS = `linear-gradient(${gradientAngle}deg, ${point.color} 0%, ${getRgbaFromColorCSS(point.color, 0.7)} 30%, ${getRgbaFromColorCSS(point.color, 0.4)} 60%, transparent 100%)`;
        } else if (textureType === 'radial') {
          // Radial gradient (star-like pattern)
          backgroundCSS = `radial-gradient(circle at ${point.x}% ${point.y}%, ${point.color} 0%, ${getRgbaFromColorCSS(point.color, 0.7)} 15%, ${getRgbaFromColorCSS(point.color, 0.4)} 30%, ${getRgbaFromColorCSS(point.color, 0.1)} 50%, transparent ${spread}%)`;
        } else {
          // Circular gradient (default)
          backgroundCSS = `radial-gradient(circle at ${point.x}% ${point.y}%, ${getRgbaFromColorCSS(point.color, 0.8)} 0%, ${getRgbaFromColorCSS(point.color, 0.4)} 25%, ${getRgbaFromColorCSS(point.color, 0.1)} 50%, transparent ${Math.min(70, Math.max(40, spread))}%)`;
        }
        
        return `.mesh-gradient .individual-layer-${index + 1} {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${backgroundCSS};
  opacity: ${opacity};
  transform: scale(${scale})${textureType === 'linear' ? ` rotate(${gradientAngle}deg)` : ''};
  transform-origin: ${point.x}% ${point.y}%;${blurFilter}
}`;
      }).join('\n\n');

      gradientCSS = `${mainCSS}\n\n${layerCSS}`;
    } else {
      // Circular/mesh mode - individual radial gradients at each point
      const visiblePoints = meshPoints.filter(point => !point.hideColor);
      htmlStructure = `/* HTML Structure:
<div class="mesh-gradient">
${visiblePoints.map((_, index) => `  <div class="layer-${index + 1}"></div>`).join('\n')}
</div>
*/`;

      const mainCSS = `.mesh-gradient {
  position: relative;
  width: 100%;
  height: 400px;
  overflow: hidden;
  background-color: ${backgroundColor};
}`;

      const layerCSS = visiblePoints.filter(point => (point.blur || 100) > 0).map((point, index) => {
        const blurValue = Math.max(0, point.blur || 100);
        // Calculate opacity based on blur value
        const opacity = Math.min(1, Math.max(0.3, 0.15 + (blurValue / 200) * 0.85));
        const scale = Math.min(2.5, Math.max(1.2, 0.7 + (blurValue / 200) * 1.8));
        const spread = Math.min(120, Math.max(25, 60 + (blurValue / 200) * 60));
        const blurFilter = blurValue > 0 ? `\n  filter: blur(${blurValue * 0.15}px);` : '';
        
        return `.mesh-gradient .layer-${index + 1} {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at ${point.x}% ${point.y}%, ${point.color} 0%, ${getRgbaFromColorCSS(point.color, 0.6)} 15%, ${getRgbaFromColorCSS(point.color, 0.4)} 30%, ${getRgbaFromColorCSS(point.color, 0.2)} 50%, transparent ${spread}%);
  opacity: ${opacity};
  transform: scale(${scale});
  transform-origin: ${point.x}% ${point.y}%;${blurFilter}
}`;
      }).join('\n\n');

      gradientCSS = `${mainCSS}\n\n${layerCSS}`;
    }

    const noiseCSS = generateNoiseCSS();
    const fullCSS = `${gradientCSS}${noiseCSS}`;
    
    if (format === 'css') {
      return fullCSS;
    }
    
    if (format === 'react') {
      const visiblePoints = meshPoints.filter(point => !point.hideColor);
      const layerElements = visiblePoints.map((_, index) => 
        `    <div className="individual-layer-${index + 1}"></div>`
      ).join('\n');
      
      return `import React from 'react';

const MeshGradient = () => {
  return (
    <div className="mesh-gradient">
${layerElements}
    </div>
  );
};

export default MeshGradient;

<style jsx>{\`
${fullCSS}
\`}</style>`;
    }
    
    // HTML format (default)
    const visiblePoints = meshPoints.filter(point => !point.hideColor);
    const layerElements = visiblePoints.map((_, index) => 
      `  <div class="individual-layer-${index + 1}"></div>`
    ).join('\n');
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mesh Gradient</title>
    <style>
${fullCSS}
    </style>
</head>
<body>
    <div class="mesh-gradient">
${layerElements}
    </div>
</body>
</html>`;
  };

  useImperativeHandle(ref, () => ({
    generateCSS: (format: 'html' | 'react' | 'css' = 'html') => generateMeshGradientCSS(format),
    addMeshPoint: addMeshPoint,
    removeMeshPoint: removeMeshPoint,
    getMeshPoints: getMeshPoints,
    generateRandomGradient: generateRandomGradient,
    updatePointBlur: updatePointBlur,
    updatePointColor: updatePointColor,
    getGradientElement: () => containerRef.current
  }));

  // Convert color to rgb and create gradient stops
  const getRgbaFromColor = (color: string, alpha: number) => {
    if (color.startsWith('hsl')) {
      return `hsla(${color.slice(4, -1)}, ${alpha})`;
    } else if (color.startsWith('#')) {
      const hex = color.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    } else {
      return color.replace('rgb', 'rgba').replace(')', `, ${alpha})`);
    }
  };

  // Generate noise texture SVG
  const generateNoiseTexture = (intensity: number) => {
    const size = 64; // SVG size for tiling
    const numDots = Math.floor(intensity * 20); // More intensity = more dots
    const opacity = Math.min(intensity / 24 * 0.15, 0.15); // Scale opacity with intensity
    
    let dots = '';
    for (let i = 0; i < numDots; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const radius = Math.random() * 0.8 + 0.2; // Random dot size
      const dotOpacity = Math.random() * opacity;
      dots += `<circle cx="${x}" cy="${y}" r="${radius}" fill="black" opacity="${dotOpacity}" />`;
    }
    
    const svgData = `
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        ${dots}
      </svg>
    `;
    
    return `url("data:image/svg+xml,${encodeURIComponent(svgData)}")`;
  };

  // Render gradient based on enabled gradient types and individual texture types
  const renderGradient = () => {
    const visiblePoints = meshPoints.filter(point => !point.hideColor && (point.blur || 100) > 0);
    const gradientLayers: JSX.Element[] = [];

    // If any gradient types are enabled, render them as background layers
    if (enabledGradientTypes.linear || enabledGradientTypes.radial || enabledGradientTypes.circular || enabledGradientTypes.effects) {
      // Linear gradient layer
      if (enabledGradientTypes.linear) {
        const linearPoints = visiblePoints.filter(point => point.textureType === 'linear' || !point.textureType);
        if (linearPoints.length > 0) {
          // Sort points based on the angle to create proper linear gradient
          const sortedPoints = [...linearPoints].sort((a, b) => {
            const angleRad = (gradientAngle * Math.PI) / 180;
            const aProjection = a.x * Math.cos(angleRad) + a.y * Math.sin(angleRad);
            const bProjection = b.x * Math.cos(angleRad) + b.y * Math.sin(angleRad);
            return aProjection - bProjection;
          });

          // Calculate positions as percentages along the gradient line
          const gradientStops = sortedPoints.map((point, index) => {
            const position = (index / (sortedPoints.length - 1)) * 100;
            return `${point.color} ${position}%`;
          }).join(', ');

          gradientLayers.push(
            <div
              key="linear-gradient-layer"
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `linear-gradient(${gradientAngle}deg, ${gradientStops})`,
                opacity: 0.8
              }}
            />
          );
        }
      }

      // Radial gradient layer
      if (enabledGradientTypes.radial) {
        const radialPoints = visiblePoints.filter(point => point.textureType === 'radial');
        if (radialPoints.length > 0) {
          radialPoints.forEach((point, index) => {
            const blurValue = Math.max(0, point.blur || 100);
                const opacity = Math.min(0.9, Math.max(0.2, 0.3 + (blurValue / 200) * 0.6));
            const scale = Math.min(1.8, Math.max(1.1, 0.8 + (blurValue / 200) * 1.0));
            const spread = Math.min(80, Math.max(15, 20 + (blurValue / 200) * 60));
            
            gradientLayers.push(
              <div
                key={`radial-gradient-${point.id}`}
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `radial-gradient(circle at ${point.x}% ${point.y}%, ${point.color} 0%, ${getRgbaFromColor(point.color, 0.7)} 15%, ${getRgbaFromColor(point.color, 0.4)} 30%, ${getRgbaFromColor(point.color, 0.1)} 50%, transparent ${spread}%)`,
                  opacity: opacity,
                  transform: `scale(${scale})`,
                  transformOrigin: `${point.x}% ${point.y}%`,
                  ...(blurValue > 0 ? { filter: `blur(${blurValue * 0.1}px)` } : {})
                }}
              />
            );
          });
        }
      }

      // Circular gradient layer
      if (enabledGradientTypes.circular) {
        const circularPoints = visiblePoints.filter(point => point.textureType === 'circular' || !point.textureType);
        if (circularPoints.length > 0) {
          circularPoints.forEach((point, index) => {
            const blurValue = Math.max(0, point.blur || 100);
            const circularSpread = Math.min(120, Math.max(25, 60 + (blurValue / 200) * 60));
            const circularOpacity = Math.min(1, Math.max(0.3, 0.15 + (blurValue / 200) * 0.85));
            const circularScale = Math.min(2.5, Math.max(1.2, 0.7 + (blurValue / 200) * 1.8));
            
            gradientLayers.push(
              <div
                key={`circular-gradient-${point.id}`}
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `radial-gradient(circle at ${point.x}% ${point.y}%, ${point.color} 0%, ${getRgbaFromColor(point.color, 0.6)} 15%, ${getRgbaFromColor(point.color, 0.4)} 30%, ${getRgbaFromColor(point.color, 0.2)} 50%, transparent ${circularSpread}%)`,
                  opacity: circularOpacity,
                  transform: `scale(${circularScale})`,
                  transformOrigin: `${point.x}% ${point.y}%`,
                  ...(blurValue > 0 ? { filter: `blur(${blurValue * 0.15}px)` } : {})
                }}
              />
            );
          });
        }
      }

      // Effects gradient layer
      if (enabledGradientTypes.effects) {
        const effectsPoints = visiblePoints.filter(point => point.textureType === 'circular' || !point.textureType);
        if (effectsPoints.length > 0) {
          effectsPoints.forEach((point, index) => {
            const blurValue = Math.max(0, point.blur || 100);
            const effectsSpread = Math.min(150, Math.max(30, 40 + (blurValue / 200) * 110));
            const effectsOpacity = Math.min(1, Math.max(0.4, 0.2 + (blurValue / 200) * 0.8));
            const effectsScale = Math.min(3, Math.max(1.5, 1.0 + (blurValue / 200) * 2.0));
            
            gradientLayers.push(
              <div
                key={`effects-gradient-${point.id}`}
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `radial-gradient(circle at ${point.x}% ${point.y}%, ${point.color} 0%, ${getRgbaFromColor(point.color, 0.8)} 10%, ${getRgbaFromColor(point.color, 0.6)} 25%, ${getRgbaFromColor(point.color, 0.4)} 45%, ${getRgbaFromColor(point.color, 0.2)} 70%, transparent ${effectsSpread}%)`,
                  opacity: effectsOpacity,
                  transform: `scale(${effectsScale})`,
                  transformOrigin: `${point.x}% ${point.y}%`,
                  ...(blurValue > 0 ? { filter: `blur(${blurValue * 0.2}px) brightness(1.2) saturate(1.3)` } : {})
                }}
              />
            );
          });
        }
      }
    } else {
      // Fallback to individual texture types when no gradient types are enabled
      return visiblePoints.map(point => {
        const blurValue = Math.max(0, point.blur || 100);
        const opacity = blurValue === 0 ? 0 : Math.min(0.9, Math.max(0.2, 0.3 + (blurValue / 200) * 0.6));
        const scale = blurValue === 0 ? 0 : Math.min(1.8, Math.max(1.1, 0.8 + (blurValue / 200) * 1.0));
        const spread = blurValue === 0 ? 0 : Math.min(80, Math.max(15, 20 + (blurValue / 200) * 60));
        
        // Use individual texture type for each point
        const textureType = point.textureType || 'circular';
        let backgroundStyle = '';
        let transformStyle = `scale(${scale})`;
        
        if (textureType === 'linear') {
          // Linear gradient for this individual point
          const gradientStops = `${point.color} 0%, ${getRgbaFromColor(point.color, 0.7)} 30%, ${getRgbaFromColor(point.color, 0.4)} 60%, transparent 100%`;
          backgroundStyle = `linear-gradient(${gradientAngle}deg, ${gradientStops})`;
          transformStyle = `scale(${scale})`;
        } else if (textureType === 'radial') {
          // Radial gradient (star-like pattern)
          backgroundStyle = `radial-gradient(circle at ${point.x}% ${point.y}%, ${point.color} 0%, ${getRgbaFromColor(point.color, 0.7)} 15%, ${getRgbaFromColor(point.color, 0.4)} 30%, ${getRgbaFromColor(point.color, 0.1)} 50%, transparent ${spread}%)`;
        } else {
          // Circular gradient (default)
          const circularSpread = Math.min(120, Math.max(25, 60 + (blurValue / 200) * 60));
          const circularOpacity = Math.min(1, Math.max(0.3, 0.15 + (blurValue / 200) * 0.85));
          const circularScale = Math.min(2.5, Math.max(1.2, 0.7 + (blurValue / 200) * 1.8));
          backgroundStyle = `radial-gradient(circle at ${point.x}% ${point.y}%, ${point.color} 0%, ${getRgbaFromColor(point.color, 0.6)} 15%, ${getRgbaFromColor(point.color, 0.4)} 30%, ${getRgbaFromColor(point.color, 0.2)} 50%, transparent ${circularSpread}%)`;
          transformStyle = `scale(${circularScale})`;
          // Update opacity and blur for circular
          return (
            <div
              key={`gradient-${point.id}`}
              className="absolute inset-0 pointer-events-none"
              style={{
                background: backgroundStyle,
                opacity: circularOpacity,
                transform: transformStyle,
                transformOrigin: `${point.x}% ${point.y}%`,
                ...(blurValue > 0 ? { filter: `blur(${blurValue * 0.15}px)` } : {})
              }}
            />
          );
        }
        
        return (
          <div
            key={`gradient-${point.id}`}
            className="absolute inset-0 pointer-events-none"
            style={{
              background: backgroundStyle,
              opacity: opacity,
              transform: transformStyle,
              transformOrigin: `${point.x}% ${point.y}%`,
              ...(blurValue > 0 ? { filter: `blur(${blurValue * 0.1}px)` } : {})
            }}
          />
        );
      });
    }

    return gradientLayers;
  };

  return (
    <div className="w-full h-full">
      <div 
        ref={containerRef}
        className={`gradient-display relative w-full h-full overflow-hidden ${
          hideControls ? 'cursor-default' : 
          isDrawingMode ? 'cursor-crosshair' : 
          'cursor-crosshair'
        }`}
        style={{
          backgroundColor: backgroundColor
        }}
        onMouseDown={hideControls ? undefined : handleCombinedMouseDown}
        onMouseMove={hideControls ? undefined : handleCombinedMouseMove}
        onMouseUp={hideControls ? undefined : handleCombinedMouseUp}
        onMouseLeave={hideControls ? undefined : handleCombinedMouseUp}
        onTouchStart={hideControls ? undefined : handleCombinedTouchStart}
        onTouchMove={hideControls ? undefined : handleCombinedTouchMove}
        onTouchEnd={hideControls ? undefined : handleCombinedTouchEnd}
      >
        {/* Render gradient based on type */}
        {renderGradient()}
        
        {/* Noise overlay */}
        {addNoise && noiseIntensity > 0 && (
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: generateNoiseTexture(noiseIntensity),
              backgroundSize: '64px 64px',
              backgroundRepeat: 'repeat',
              opacity: 1,
              mixBlendMode: 'overlay'
            }}
          />
        )}
        
        {/* Drawing Layer */}
        {(drawingPaths.length > 0 || isDrawingMode) && (
          <svg
            className="absolute inset-0 pointer-events-none w-full h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            style={{ zIndex: 10 }}
          >
            {/* Define filters for glow effects */}
            <defs>
              {drawingPaths.map((path, pathIndex) => {
                if (path.fadeLeft > 0 || path.fadeRight > 0) {
                  const filterId = `glow-filter-${pathIndex}`;
                  const blurAmount = Math.max(path.fadeLeft, path.fadeRight) * 1.5;
                  
                  return (
                    <filter key={filterId} id={filterId} x="-100%" y="-100%" width="300%" height="300%">
                      <feGaussianBlur stdDeviation={blurAmount} result="coloredBlur"/>
                      <feMerge> 
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  );
                }
                return null;
              })}
              
              {/* Current drawing path filter */}
              {isDrawingMode && currentPath.length > 1 && (penFadeLeft > 0 || penFadeRight > 0) && (
                <filter id="current-glow-filter" x="-100%" y="-100%" width="300%" height="300%">
                  <feGaussianBlur stdDeviation={Math.max(penFadeLeft, penFadeRight) * 1.5} result="coloredBlur"/>
                  <feMerge> 
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              )}
            </defs>
            
            {/* Render existing drawing paths with glow effects */}
            {drawingPaths.map((path, pathIndex) => {
              const pathString = path.points.reduce((acc, point, index) => {
                const command = index === 0 ? 'M' : 'L';
                return `${acc} ${command} ${point.x} ${point.y}`;
              }, '');
              
              const hasFade = path.fadeLeft > 0 || path.fadeRight > 0;
              const filterId = hasFade ? `glow-filter-${pathIndex}` : undefined;
              
              return (
                <g key={pathIndex}>
                  {/* Glow effect layer */}
                  {hasFade && (
                    <path
                      d={pathString}
                      stroke={path.color}
                      strokeWidth={path.thickness * 4}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                      vectorEffect="non-scaling-stroke"
                      filter={filterId}
                      opacity={0.3}
                    />
                  )}
                  
                  {/* Main line */}
                  <path
                    d={pathString}
                    stroke={path.color}
                    strokeWidth={path.thickness}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                    vectorEffect="non-scaling-stroke"
                  />
                </g>
              );
            })}
            
            {/* Render current drawing path with glow effects */}
            {isDrawingMode && currentPath.length > 1 && (
              <g>
                {/* Glow effect layer */}
                {(penFadeLeft > 0 || penFadeRight > 0) && (
                  <path
                    d={currentPath.reduce((acc, point, index) => {
                      const command = index === 0 ? 'M' : 'L';
                      return `${acc} ${command} ${point.x} ${point.y}`;
                    }, '')}
                    stroke={penColor}
                    strokeWidth={penThickness * 4}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                    vectorEffect="non-scaling-stroke"
                    filter="url(#current-glow-filter)"
                    opacity={0.3}
                  />
                )}
                
                {/* Main line */}
                <path
                  d={currentPath.reduce((acc, point, index) => {
                    const command = index === 0 ? 'M' : 'L';
                    return `${acc} ${command} ${point.x} ${point.y}`;
                  }, '')}
                  stroke={penColor}
                  strokeWidth={penThickness}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  vectorEffect="non-scaling-stroke"
                />
              </g>
            )}
          </svg>
        )}

        {/* Uploaded Images Layer */}
        {uploadedImages.length > 0 && (
          <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 100 }}>
            {uploadedImages.map((image) => (
              <div
                key={image.id}
                className="absolute pointer-events-auto"
                style={{
                  left: `${image.x}%`,
                  top: `${image.y}%`,
                  width: `${image.width}%`,
                  height: `${image.height}%`,
                  transform: `translate(-50%, -50%) rotate(${image.rotation}deg)`,
                  transformOrigin: 'center',
                }}
              >
                {/* Image */}
                <img
                  src={image.src}
                  alt="Uploaded"
                  className="w-full h-full object-contain select-none"
                  draggable={false}
                  onMouseDown={(e) => handleImageMouseDown(e, image.id, 'drag')}
                />
                
                {/* Selection and control handles */}
                {image.isSelected && (
                  <>
                    {/* Selection border */}
                    <div className="absolute inset-0 border-2 border-blue-400 rounded pointer-events-none" />
                    
                    {/* Resize handle */}
                    <div
                      className="absolute w-3 h-3 bg-blue-400 border border-white rounded-full cursor-nw-resize"
                      style={{
                        right: '-6px',
                        bottom: '-6px',
                        transform: 'translate(50%, 50%)'
                      }}
                      onMouseDown={(e) => handleImageMouseDown(e, image.id, 'resize')}
                    />
                    
                    {/* Rotate handle */}
                    <div
                      className="absolute w-3 h-3 bg-green-400 border border-white rounded-full cursor-grab"
                      style={{
                        right: '-6px',
                        top: '-6px',
                        transform: 'translate(50%, -50%)'
                      }}
                      onMouseDown={(e) => handleImageMouseDown(e, image.id, 'rotate')}
                    />
                    
                    {/* Delete button */}
                    <button
                      className="absolute w-5 h-5 bg-red-500 text-white text-xs rounded-full cursor-pointer flex items-center justify-center"
                      style={{
                        left: '-10px',
                        top: '-10px',
                        transform: 'translate(-50%, -50%)'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onImageDelete) {
                          onImageDelete(image.id);
                        }
                      }}
                    >
                      ×
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
        
        {/* Draggable control points */}
        {!hideControls && meshPoints.filter(point => !point.hideBalls).map((point) => (
          <div
            key={point.id}
            className="absolute w-6 h-6 border-2 border-white rounded-full cursor-move shadow-lg transform -translate-x-1/2 -translate-y-1/2 hover:scale-110 transition-transform"
            style={{
              left: `${point.x}%`,
              top: `${point.y}%`,
              backgroundColor: point.color,
              zIndex: 50, // Below images but above gradient layers
            }}
            onMouseDown={(e) => handleMouseDown(e, point.id)}
          />
        ))}
        
      </div>
    </div>
  );
});

GradientGenerator.displayName = 'GradientGenerator';

export default GradientGenerator;