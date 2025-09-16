'use client';

import GradientGenerator, { GradientGeneratorRef, MeshPoint } from '@/components/GradientGenerator';
import CookieBanner from '@/components/CookieBanner';
import CodeModal from '@/components/CodeModal';
import GradientExporter from '@/components/GradientExporter';
import MuiBlurSlider from '@/components/MuiBlurSlider';
import MuiAngleSlider from '@/components/MuiAngleSlider';
import ColorPicker from '@/components/ColorPicker';
import SketchColorPicker from '@/components/SketchColorPicker';
import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { Camera, ImageUp, RemoveFormatting, Bot, Sparkles, Pipette, PaintRoller, FireExtinguisher, CircleDashed, Shapes, Copy } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import GIF from 'gif.js';
import html2canvas from 'html2canvas';

// Star SVG components - All as wireframes
const starTypes = [
  // Row 1
  { id: 1, svg: <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2l2.5 7.5h7.5l-6 4.5 2.5 7.5-6-4.5-6 4.5 2.5-7.5-6-4.5h7.5z"/><circle cx="8" cy="8" r="1.5"/><circle cx="16" cy="8" r="1.5"/><circle cx="8" cy="16" r="1.5"/><circle cx="16" cy="16" r="1.5"/></svg> },
  { id: 2, svg: <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2l2.5 7.5h7.5l-6 4.5 2.5 7.5-6-4.5-6 4.5 2.5-7.5-6-4.5h7.5z"/><circle cx="12" cy="6" r="1"/><circle cx="12" cy="18" r="1"/></svg> },
  { id: 3, svg: <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l3 6h6l-5 4 2 6-6-4-6 4 2-6-5-4h6z"/></svg> },
  { id: 4, svg: <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6z"/><path d="M8 8l2 2-2 2 2 2-2 2"/><path d="M16 8l-2 2 2 2-2 2 2 2"/><path d="M8 16l2-2 2 2-2 2"/><path d="M16 16l-2-2-2 2 2 2"/></svg> },
  { id: 5, svg: <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2l2.5 7.5h7.5l-6 4.5 2.5 7.5-6-4.5-6 4.5 2.5-7.5-6-4.5h7.5z"/><path d="M12 2l1.5 4.5h4.5l-3.5 2.5 1.5 4.5-3.5-2.5-3.5 2.5 1.5-4.5-3.5-2.5h4.5z"/><circle cx="12" cy="18" r="1"/><circle cx="12" cy="20" r="1"/></svg> },
  { id: 6, svg: <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2l2 8h8l-6 4 2 8-6-4-6 4 2-8-6-4h8z"/></svg> },
  
  // Row 2
  { id: 7, svg: <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2l1 4h4l-3 2 1 4-3-2-3 2 1-4-3-2h4z"/><circle cx="6" cy="6" r="0.8"/><circle cx="18" cy="6" r="0.8"/><circle cx="6" cy="18" r="0.8"/><circle cx="18" cy="18" r="0.8"/></svg> },
  { id: 8, svg: <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2l1.5 4.5h4.5l-3.5 2.5 1.5 4.5-3.5-2.5-3.5 2.5 1.5-4.5-3.5-2.5h4.5z"/></svg> },
  { id: 9, svg: <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="1.5"/><circle cx="16" cy="8" r="1.5"/><circle cx="12" cy="12" r="2"/><circle cx="6" cy="16" r="1"/><circle cx="18" cy="16" r="1"/></svg> },
  { id: 10, svg: <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 2l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6z"/></svg> },
  { id: 11, svg: <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2l1.5 4.5h4.5l-3.5 2.5 1.5 4.5-3.5-2.5-3.5 2.5 1.5-4.5-3.5-2.5h4.5z"/><circle cx="6" cy="6" r="0.8"/><circle cx="18" cy="6" r="0.8"/><circle cx="6" cy="18" r="0.8"/><circle cx="18" cy="18" r="0.8"/></svg> },
  { id: 12, svg: <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="1.5"/><circle cx="16" cy="12" r="1"/><circle cx="12" cy="16" r="1"/></svg> },
  
  // Row 3
  { id: 13, svg: <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2l1.5 4.5h4.5l-3.5 2.5 1.5 4.5-3.5-2.5-3.5 2.5 1.5-4.5-3.5-2.5h4.5z"/><circle cx="6" cy="6" r="0.8"/><circle cx="18" cy="6" r="0.8"/><circle cx="6" cy="18" r="0.8"/><circle cx="18" cy="18" r="0.8"/></svg> },
  { id: 14, svg: <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="16" cy="12" r="1.5"/><circle cx="10" cy="8" r="1"/><circle cx="14" cy="8" r="1"/><circle cx="10" cy="16" r="1"/><circle cx="14" cy="16" r="1"/></svg> },
  { id: 15, svg: <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2l1.5 4.5h4.5l-3.5 2.5 1.5 4.5-3.5-2.5-3.5 2.5 1.5-4.5-3.5-2.5h4.5z"/></svg> },
  { id: 16, svg: <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6z"/><circle cx="8" cy="8" r="0.8"/><circle cx="16" cy="8" r="0.8"/><circle cx="12" cy="16" r="0.8"/></svg> },
  { id: 17, svg: <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2l1 4h4l-3 2 1 4-3-2-3 2 1-4-3-2h4z"/><path d="M12 8l1 2h2l-1.5 1 0.5 2-1.5-1-1.5 1 0.5-2-1.5-1h2z"/><path d="M12 16l1 2h2l-1.5 1 0.5 2-1.5-1-1.5 1 0.5-2-1.5-1h2z"/></svg> },
  { id: 18, svg: <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2l1 2h2l-1.5 1 0.5 2-1.5-1-1.5 1 0.5-2-1.5-1h2z"/><circle cx="8" cy="8" r="0.8"/><circle cx="16" cy="8" r="0.8"/><circle cx="12" cy="16" r="0.8"/></svg> },
  { id: 19, svg: <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5"><defs><radialGradient id="starGlow19" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#ffffff" stopOpacity="1"/><stop offset="20%" stopColor="#00ff00" stopOpacity="0.9"/><stop offset="50%" stopColor="#00ff00" stopOpacity="0.6"/><stop offset="80%" stopColor="#00ff00" stopOpacity="0.3"/><stop offset="100%" stopColor="#00ff00" stopOpacity="0"/></radialGradient><filter id="glow19"><feGaussianBlur stdDeviation="2" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><circle cx="12" cy="12" r="10" fill="url(#starGlow19)"/><path d="M12 2l2 8h8l-6 4 2 8-6-4-6 4 2-8-6-4h8z" fill="none" stroke="#00ff00" strokeWidth="2" filter="url(#glow19)"/><path d="M12 2l1.5 4.5h4.5l-3.5 2.5 1.5 4.5-3.5-2.5-3.5 2.5 1.5-4.5-3.5-2.5h4.5z" fill="none" stroke="#00ff00" strokeWidth="1.5" filter="url(#glow19)"/><circle cx="12" cy="12" r="1.5" fill="#ffffff"/></svg> }
];

export default function Home() {
  const gradientRef = useRef<GradientGeneratorRef>(null);
  const router = useRouter();
  
  // Fast navigation handler
  const handleUpgradeClick = useCallback(() => {
    router.push('/upgrade');
  }, [router]);
  
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [generatedCSS, setGeneratedCSS] = useState('');
  const [selectedColorId, setSelectedColorId] = useState<string | null>(null);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [linearManualDropdownOpen, setLinearManualDropdownOpen] = useState<string | null>(null);
  const [dragState, setDragState] = useState<{
    isDragging: boolean;
    dragOffset: { x: number; y: number };
    targetId: string | null;
  }>({
    isDragging: false,
    dragOffset: { x: 0, y: 0 },
    targetId: null
  });
  
  const [dropdownPositions, setDropdownPositions] = useState<Record<string, { x: number; y: number }>>({});
  const [colorSwatchDragState, setColorSwatchDragState] = useState<{
    isDragging: boolean;
    dragOffset: { x: number; y: number };
    targetId: string | null;
    hasDragged: boolean;
    startPosition: { x: number; y: number };
  }>({
    isDragging: false,
    dragOffset: { x: 0, y: 0 },
    targetId: null,
    hasDragged: false,
    startPosition: { x: 0, y: 0 }
  });
  const [colorSwatchPositions, setColorSwatchPositions] = useState<Record<string, { x: number; y: number }>>({});
  const [backgroundColor, setBackgroundColor] = useState('#000000');
  const [backgroundColorPickerOpen, setBackgroundColorPickerOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenKey, setFullscreenKey] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [gradientType, setGradientType] = useState<'linear' | 'radial' | 'circular' | 'nothing'>('nothing');
  const [enabledGradientTypes, setEnabledGradientTypes] = useState<{
    linear: boolean;
    radial: boolean;
    circular: boolean;
  }>({
    linear: false,
    radial: false,
    circular: false
  });
  const [gradientAngle, setGradientAngle] = useState(0);
  const [meshPoints, setMeshPoints] = useState<MeshPoint[]>([
    { id: '1', x: 30, y: 40, color: '#0DD162', name: 'Bright Green', blur: 100, hideColor: false, hideBalls: false, textureType: 'circular' },
    { id: '2', x: 70, y: 60, color: '#0D7CD1', name: 'Blue', blur: 100, hideColor: false, hideBalls: false, textureType: 'circular' }
  ]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [isLooping, setIsLooping] = useState(false);
  const [isPersonalDropdownOpen, setIsPersonalDropdownOpen] = useState(false);
  const [isDeveloperDropdownOpen, setIsDeveloperDropdownOpen] = useState(false);
  const [hideAllColors, setHideAllColors] = useState(false);
  const [hideAllBalls, setHideAllBalls] = useState(false);
  const [showDeletedColors, setShowDeletedColors] = useState(true);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [showPenMenu, setShowPenMenu] = useState(false);
  const [showShapesMenu, setShowShapesMenu] = useState(false);
  const [selectedShape, setSelectedShape] = useState<'triangle' | 'circle' | 'square' | null>(null);
  const [uploadedImages, setUploadedImages] = useState<Array<{
    id: string;
    src: string;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    isSelected: boolean;
  }>>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [penThickness, setPenThickness] = useState(3);
  const [penColor, setPenColor] = useState('#ffffff');
  const [penFadeLeft, setPenFadeLeft] = useState(0);
  const [penFadeRight, setPenFadeRight] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingPaths, setDrawingPaths] = useState<Array<{
    points: Array<{x: number, y: number}>;
    color: string;
    thickness: number;
    fadeLeft: number;
    fadeRight: number;
  }>>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [originalMeshPoints, setOriginalMeshPoints] = useState<MeshPoint[]>([]);
  const [isShareDropdownOpen, setIsShareDropdownOpen] = useState(false);
  const [isShareArrowRotated, setIsShareArrowRotated] = useState(false);
  const [isDeveloperArrowRotated, setIsDeveloperArrowRotated] = useState(false);
  
  // Premium feature popup state
  const [showPremiumPopup, setShowPremiumPopup] = useState(false);
  
  // Recording and saving state variables
  const [recordedGradientStates, setRecordedGradientStates] = useState<Array<{
    gradientType: 'linear' | 'radial' | 'circular' | 'nothing';
    meshPoints: MeshPoint[];
  }>>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveButton, setShowSaveButton] = useState(false);
  const [recordingCompleted, setRecordingCompleted] = useState(false);
  const [recordedFrames, setRecordedFrames] = useState<HTMLCanvasElement[]>([]);
  
  // Star/shiners functionality
  const [showStarMenu, setShowStarMenu] = useState(false);
  const [placedStars, setPlacedStars] = useState<Array<{
    id: string;
    x: number;
    y: number;
    starType: number;
    size: number;
  }>>([]);
  const [selectedStarId, setSelectedStarId] = useState<string | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [tempStarSize, setTempStarSize] = useState<number | null>(null);

  
  // Create a stable hash of base mesh points for animation keyframes dependency
  // This should only depend on the base meshPoints, not animated ones
  const baseMeshPointsHash = useMemo(() => {
    return meshPoints.map(p => `${p.id}-${p.x}-${p.y}-${p.color}-${p.blur}`).join(',');
  }, [meshPoints]);
  
  // Generate animation keyframes only when animation starts or mesh points change
  const animationKeyframes = useMemo(() => {
    if (!isAnimating || meshPoints.length === 0) return [];
    
    const keyframes: MeshPoint[][] = [];
    const totalFrames = 60; // 60 frames for smooth animation
    
    for (let frame = 0; frame < totalFrames; frame++) {
      const progress = (frame / totalFrames) * Math.PI * 2; // Full circle
      
      const framePoints = meshPoints.map((point, index) => {
        const phaseOffset = index * (Math.PI / meshPoints.length);
        const timePhase = progress + phaseOffset;
        
        const baseRadius = 15 + Math.sin(timePhase * 0.3) * 8;
        const xOffset = Math.cos(timePhase) * baseRadius;
        const yOffset = Math.sin(timePhase) * baseRadius;
        
        const driftX = Math.sin(timePhase * 0.7) * 5;
        const driftY = Math.cos(timePhase * 0.5) * 5;
        
        const newX = Math.max(15, Math.min(85, point.x + xOffset * 0.1 + driftX * 0.05));
        const newY = Math.max(15, Math.min(85, point.y + yOffset * 0.1 + driftY * 0.05));
        
        const blurVariation = Math.sin(timePhase * 1.2) * 30;
        const newBlur = Math.round(Math.max(50, Math.min(180, (point.blur || 100) + blurVariation)));
        
        return { ...point, x: newX, y: newY, blur: newBlur };
      });
      
      keyframes.push(framePoints);
    }
    
    return keyframes;
  }, [isAnimating, meshPoints]);
  const [currentKeyframe, setCurrentKeyframe] = useState(0);
  const [animationStartTime, setAnimationStartTime] = useState<number | null>(null);
  const keyframesGeneratedRef = useRef(false);
  const keyframesRef = useRef(animationKeyframes);
  const keyframesLengthRef = useRef(0);
  const currentKeyframeRef = useRef(0);
  const isAnimatingRef = useRef(isAnimating);
  const [isResetting, setIsResetting] = useState(false);
  const [isResetSpinning, setIsResetSpinning] = useState(false);
  
  // Drag and drop state for color reordering
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  


  // History management for undo functionality
  const [history, setHistory] = useState<{
    meshPoints: typeof meshPoints;
    gradientType: typeof gradientType;
    gradientAngle: typeof gradientAngle;
    backgroundColor: typeof backgroundColor;
  }[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Initialize history with current state
  useEffect(() => {
    if (history.length === 0) {
      const initialState = {
        meshPoints,
        gradientType,
        gradientAngle,
        backgroundColor,
      };
      setHistory([initialState]);
      setHistoryIndex(0);
    }
  }, [meshPoints, gradientType, gradientAngle, backgroundColor, history.length]);

  // Ensure client-side only operations
  useEffect(() => {
    // This effect runs only on the client side after hydration
    if (typeof window !== 'undefined') {
      console.log('Client-side save functions ready');
    }
  }, []);

  // Save current state to history
  const saveToHistory = useCallback(() => {
    const currentState = {
      meshPoints,
      gradientType,
      gradientAngle,
      backgroundColor
    };

    setHistory(prev => {
      // Remove any future history if we're not at the end
      const newHistory = prev.slice(0, historyIndex + 1);
      // Add new state
      newHistory.push(currentState);
      // Limit history to 50 items
      if (newHistory.length > 50) {
        newHistory.shift();
        return newHistory;
      }
      return newHistory;
    });

    setHistoryIndex(prev => Math.min(prev + 1, 49));
  }, [meshPoints, gradientType, gradientAngle, backgroundColor, historyIndex]);

  // Close dropdowns when clicking outside or pressing ESC
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.personal-dropdown') && !target.closest('.developer-dropdown')) {
        setIsPersonalDropdownOpen(false);
        setIsDeveloperDropdownOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsPersonalDropdownOpen(false);
        setIsDeveloperDropdownOpen(false);
      }
    };

    if (isPersonalDropdownOpen || isDeveloperDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isPersonalDropdownOpen, isDeveloperDropdownOpen]);

  // Undo functionality
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const previousState = history[historyIndex - 1];
      setMeshPoints(previousState.meshPoints);
      setGradientType(previousState.gradientType);
      setGradientAngle(previousState.gradientAngle);
      setBackgroundColor(previousState.backgroundColor);
      setHistoryIndex(prev => prev - 1);
    }
  }, [history, historyIndex]);

  const handleCodeButtonClick = () => {
    if (gradientRef.current) {
      let css = gradientRef.current.generateCSS();

      // Add animation CSS if animation is active
      if (isAnimating && keyframesLengthRef.current > 0) {
        css += generateAnimationCSS();
      }

      setGeneratedCSS(css);
      setIsCodeModalOpen(true);
    }
  };

  const handleExportButtonClick = () => {
    if (gradientRef.current) {
      let css = gradientRef.current.generateCSS();

      // Add animation CSS if animation is active
      if (isAnimating && keyframesLengthRef.current > 0) {
        css += generateAnimationCSS();
      }

      setGeneratedCSS(css);
      setIsExportModalOpen(true);
    }
  };

  const handleDownloadClick = () => {
    if (!gradientRef.current) return;
    
    const css = gradientRef.current.generateCSS();
    const filename = 'gradient.css';
    
    const blob = new Blob([css], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };


  const handleSaveAsFolder = () => {
    if (!gradientRef.current) return;
    
    const css = gradientRef.current.generateCSS();
    
    // Download CSS file
    const cssBlob = new Blob([css], { type: 'text/css' });
    const cssUrl = URL.createObjectURL(cssBlob);
    const cssLink = document.createElement('a');
    cssLink.href = cssUrl;
    cssLink.download = 'gradient.css';
    document.body.appendChild(cssLink);
    cssLink.click();
    document.body.removeChild(cssLink);
    URL.revokeObjectURL(cssUrl);
    
    // Download HTML file
    setTimeout(() => {
      const html = `<!DOCTYPE html>
<html>
<head>
  <title>Gradient</title>
  <style>${css}</style>
</head>
<body>
  <div class="mesh-gradient"></div>
</body>
</html>`;
      
      const htmlBlob = new Blob([html], { type: 'text/html' });
      const htmlUrl = URL.createObjectURL(htmlBlob);
      const htmlLink = document.createElement('a');
      htmlLink.href = htmlUrl;
      htmlLink.download = 'gradient.html';
      document.body.appendChild(htmlLink);
      htmlLink.click();
      document.body.removeChild(htmlLink);
      URL.revokeObjectURL(htmlUrl);
    }, 500);
    
    setIsPersonalDropdownOpen(false);
  };

  const handleSaveAsWallpaper = () => {
    if (!gradientRef.current) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = 1920;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      const gradient = ctx.createRadialGradient(576, 432, 0, 576, 432, 600);
      const currentPoints = getCurrentMeshPoints();
      
      currentPoints.forEach((point, index) => {
        const position = index / Math.max(1, currentPoints.length - 1);
        gradient.addColorStop(position, point.color);
      });
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'gradient-wallpaper.png';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
      }, 'image/png');
    }
    
    setIsPersonalDropdownOpen(false);
  };


  const handleSaveAsMP4 = () => {
    alert('MP4 video generation feature coming soon! This would create a video of your animated gradient.');
    setIsPersonalDropdownOpen(false);
  };

  const handleSaveAsScreenSaver = () => {
    if (!gradientRef.current) return;
    
    const css = gradientRef.current.generateCSS();
    const html = `<!DOCTYPE html>
<html>
<head>
    <title>Gradient Screensaver</title>
    <style>
        ${css}
        body { margin: 0; overflow: hidden; }
        .mesh-gradient { width: 100vw; height: 100vh; }
    </style>
</head>
<body>
    <div class="mesh-gradient"></div>
</body>
</html>`;
    
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gradient-screensaver.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setIsPersonalDropdownOpen(false);
  };

  // Developer export functions
  const handleSaveAsJSON = () => {
    const exportData = {
      meshPoints,
      gradientType,
      gradientAngle,
      backgroundColor,
      isAnimating,
      animationSpeed,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gradient-config.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setIsDeveloperDropdownOpen(false);
  };

  const handleSaveAsGIF = async () => {
    if (!gradientRef.current) return;

    try {
      // Find the gradient display element
      const gradientElement = document.querySelector('.gradient-display');
      if (!gradientElement) {
        alert('Gradient display element not found.');
        setIsDeveloperDropdownOpen(false);
        return;
      }

      // Create a new GIF encoder
      const gif = new GIF({
        workers: 2,
        quality: 10,
        width: 400,
        height: 300,
        workerScript: '/gif.worker.js'
      });

      // Capture 10 frames for a short animation
      for (let i = 0; i < 10; i++) {
        // Capture the gradient element as canvas
        const canvas = await html2canvas(gradientElement as HTMLElement, {
          width: 400,
          height: 300,
          backgroundColor: backgroundColor,
          scale: 1,
          logging: false,
          useCORS: true
        });

        // Add frame to GIF
        gif.addFrame(canvas, { copy: true, delay: 200 });
        
        // Small delay between captures
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Render the GIF
      gif.on('finished', function(blob: Blob) {
        // Create download link
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'gradient-animation.gif';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        setIsDeveloperDropdownOpen(false);
        alert('GIF exported successfully!');
      });

      gif.render();
    } catch (error: unknown) {
      // Improved error handling for frame capture
      console.error('Error capturing frame:', error);
      let message = 'Failed to capture frame.';
      if (error && typeof error === 'object' && 'message' in error) {
        message += ` ${error.message}`;
      }
        alert(message);
      setIsDeveloperDropdownOpen(false);
    }
  };

  const handleSaveAsMP4Dev = () => {
    alert('MP4 export feature coming soon! This will export your gradient animation as an MP4 video file.');
    setIsDeveloperDropdownOpen(false);
  };

  const handleSaveAsWEBM = () => {
    alert('WEBM export feature coming soon! This will export your gradient animation as a WEBM video file.');
    setIsDeveloperDropdownOpen(false);
  };

  const handleSaveAsSVG = () => {
    if (!gradientRef.current) return;
    
    // Generate SVG with gradient definitions
    const svg = `<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <defs>
    ${meshPoints.map((point, index) => `
    <radialGradient id="gradient-${index}" cx="${point.x}%" cy="${point.y}%">
      <stop offset="0%" stop-color="${point.color}" stop-opacity="0.8"/>
      <stop offset="50%" stop-color="${point.color}" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="${point.color}" stop-opacity="0"/>
    </radialGradient>`).join('')}
  </defs>
  <rect width="100%" height="100%" fill="${backgroundColor}"/>
  ${meshPoints.map((point, index) => `
  <circle cx="${point.x * 8}" cy="${point.y * 6}" r="${(point.blur || 100) * 2}" fill="url(#gradient-${index})" opacity="0.6"/>`).join('')}
</svg>`;

    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gradient.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setIsDeveloperDropdownOpen(false);
  };

  const handleSaveAsPNG = async () => {
    // Only allow saving when not animating (static gradient)
    if (isAnimating) {
      setIsPersonalDropdownOpen(false);
      return;
    }

    try {
      // Find the actual gradient display element
      const gradientElement = document.querySelector('.gradient-display');
      if (!gradientElement) {
        console.error('Gradient display element not found');
        setIsPersonalDropdownOpen(false);
        return;
      }

      // Use the most basic approach to preserve original radial gradient state
      const canvas = await html2canvas(gradientElement as HTMLElement, {
        backgroundColor: null, // Use null to preserve original background exactly
      });

      // Use the same simple download approach
      const link = document.createElement('a');
      link.download = 'gradient-recordings/gradient.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
      console.log('✅ PNG saved to gradient-recordings folder');
    } catch (error) {
      console.error('Error saving PNG:', error);
    }
    
    setIsPersonalDropdownOpen(false);
  };

  const handleSaveAsJPG = async () => {
    // Only allow saving when not animating (static gradient)
    if (isAnimating) {
      setIsPersonalDropdownOpen(false);
      return;
    }

    try {
      // Find the actual gradient display element
      const gradientElement = document.querySelector('.gradient-display');
      if (!gradientElement) {
        console.error('Gradient display element not found');
        setIsPersonalDropdownOpen(false);
        return;
      }

      // Capture the actual visual element using html2canvas
      const canvas = await html2canvas(gradientElement as HTMLElement, {
        backgroundColor: backgroundColor,
        scale: 2, // Higher quality
        logging: false,
        useCORS: true,
        allowTaint: true
      });

      // Save as JPG
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'gradient-recordings/gradient.jpg';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          console.log('✅ JPG saved to gradient-recordings folder');
        }
      }, 'image/jpeg', 0.9);
    } catch (error) {
      console.error('Error saving JPG:', error);
    }
    
    setIsPersonalDropdownOpen(false);
  };

  const handleShareFacebook = async () => {
    try {
      // Find the gradient display element directly (like in your example)
      const gradientElement = document.querySelector('.gradient-display');
      if (!gradientElement) {
        console.error('Gradient display element not found');
        setIsShareDropdownOpen(false);
        return;
      }

      // Exact same approach as your working example
      const canvas = await html2canvas(gradientElement as HTMLElement, {
        backgroundColor: null,
      });

      // Exact same download approach as your example
      const link = document.createElement('a');
      link.download = 'gradient-recordings/gradient.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
      console.log('✅ PNG saved to gradient-recordings folder');
    } catch (error) {
      console.error('Error capturing Facebook share image:', error);
    }
    
    setIsShareDropdownOpen(false);
  };

  // Video Recording Functions

  const saveAsSVG = async () => {
    console.log('🎯 saveAsSVG called with', recordedGradientStates.length, 'gradient states');
    
    if (recordedGradientStates.length === 0) {
      console.error('❌ No recorded gradient states to save');
      return;
    }

    console.log('💾 Starting SVG save process...');
    setIsSaving(true);
    
    try {
      console.log('🎨 Creating native SVG from recorded gradient states...');
      
      const frameDelay = 100; // 100ms per frame
      const totalDuration = recordedGradientStates.length * frameDelay;
      const svgWidth = 800; // Standard width
      const svgHeight = 600; // Standard height
      
      // Helper function to convert color to RGB
      const getRgbaFromColor = (color: string, alpha: number = 1) => {
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

      let svgContent = `<svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">
        <defs>`;

      // Create a single animated gradient with multiple color stops that animate over time
      const firstState = recordedGradientStates[0];
      const gradientType = firstState.gradientType;
      
      if (gradientType === 'linear') {
        svgContent += `
          <linearGradient id="animatedGradient" x1="0%" y1="0%" x2="100%" y2="0%">`;
      } else {
        // For radial/circular gradients, animate the center point
        const centerPoint = firstState.meshPoints[0] || { x: 50, y: 50 };
        
        // Get center point positions for animation
        const cxValues = recordedGradientStates.map((state: { gradientType: 'linear' | 'radial' | 'circular' | 'nothing'; meshPoints: MeshPoint[] }) => {
          const firstPoint = state.meshPoints.filter((p: MeshPoint) => !p.hideColor)[0];
          return firstPoint ? `${firstPoint.x}%` : `${centerPoint.x}%`;
        });
        const cyValues = recordedGradientStates.map((state: { gradientType: 'linear' | 'radial' | 'circular' | 'nothing'; meshPoints: MeshPoint[] }) => {
          const firstPoint = state.meshPoints.filter((p: MeshPoint) => !p.hideColor)[0];
          return firstPoint ? `${firstPoint.y}%` : `${centerPoint.y}%`;
        });
        
        svgContent += `
          <radialGradient id="animatedGradient" r="70%">
            <animate attributeName="cx" 
              values="${cxValues.join(';')};${cxValues[0]}" 
              dur="${totalDuration}ms" 
              repeatCount="indefinite"/>
            <animate attributeName="cy" 
              values="${cyValues.join(';')};${cyValues[0]}" 
              dur="${totalDuration}ms" 
              repeatCount="indefinite"/>`;
      }

      // Create animated color stops based on the mesh points
      const maxPoints = Math.max(...recordedGradientStates.map((state: { gradientType: 'linear' | 'radial' | 'circular' | 'nothing'; meshPoints: MeshPoint[] }) => state.meshPoints.filter((p: MeshPoint) => !p.hideColor).length));
      
      for (let pointIndex = 0; pointIndex < maxPoints; pointIndex++) {
        const offset = (pointIndex / Math.max(1, maxPoints - 1)) * 100;
        
        // Get color values for this point across all frames
        const colorValues = recordedGradientStates.map((state: { gradientType: 'linear' | 'radial' | 'circular' | 'nothing'; meshPoints: MeshPoint[] }) => {
          const visiblePoints = state.meshPoints.filter((p: MeshPoint) => !p.hideColor);
          return visiblePoints[pointIndex]?.color || visiblePoints[0]?.color || '#000000';
        });
        
        // Create smooth color animation
        const colorString = colorValues.join(';');
        
        svgContent += `
          <stop offset="${offset}%">
            <animate attributeName="stop-color" 
              values="${colorString};${colorValues[0]}" 
              dur="${totalDuration}ms" 
              repeatCount="indefinite"/>
          </stop>`;
      }
      
      svgContent += gradientType === 'linear' ? `
          </linearGradient>` : `
          </radialGradient>`;

      svgContent += `
        </defs>
        
        <!-- Background -->
        <rect width="100%" height="100%" fill="${backgroundColor}" />
        
        <!-- Single animated gradient rectangle -->
        <rect width="100%" height="100%" fill="url(#animatedGradient)" />`;

      svgContent += `
      </svg>`;

      // Simulate processing time for better UX
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create and download SVG file
      console.log('📁 Creating blob and download link...');
      const blob = new Blob([svgContent], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const filename = `gradient-recording-${Date.now()}.svg`;
      link.download = filename;
      link.href = url;
      
      console.log('📥 Triggering download:', filename);
      console.log('🔗 Download URL:', url);
      console.log('📄 SVG content preview:', svgContent.substring(0, 200) + '...');
      
      link.click();
      URL.revokeObjectURL(url);
      
      console.log('✅ Native SVG download triggered successfully with', recordedGradientStates.length, 'gradient states');
      
      // Clear recorded states and hide save button after successful save
      setRecordedGradientStates([]);
      setShowSaveButton(false);
      setRecordingCompleted(false);
    } catch (error) {
      console.error('Error saving SVG:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const saveAsMP4 = async () => {
    if (recordedFrames.length === 0) {
      console.error('No recorded frames to save');
      return;
    }

    try {
      // Create a WebM video from the recorded frames
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1080;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        console.error('Could not get canvas context');
        return;
      }

      // Create a MediaRecorder to record the frames as video
      const stream = canvas.captureStream(10); // 10 FPS
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
      });

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'gradient-recordings/gradient-recording.webm'; // Save as WebM (MP4 alternative)
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        console.log('✅ WebM video saved to gradient-recordings folder');
      };

      // Start recording
      mediaRecorder.start();

      // Draw each frame to the canvas
      recordedFrames.forEach((frame: HTMLCanvasElement, index: number) => {
        setTimeout(() => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(frame, 0, 0, canvas.width, canvas.height);
        }, index * 100); // 100ms delay between frames
      });

      // Stop recording after all frames are drawn
      setTimeout(() => {
        mediaRecorder.stop();
      }, recordedFrames.length * 100 + 100);

    } catch (error) {
      console.error('Error saving as MP4:', error);
      // Fallback to high-quality GIF if WebM fails
      try {
        const gif = new GIF({
          workers: 4,
          quality: 1,
          width: 1080,
          height: 1080,
          workerScript: '/gif.worker.js',
          dither: 'FloydSteinberg',
        });

        recordedFrames.forEach((frame: HTMLCanvasElement, index: number) => {
          gif.addFrame(frame, { delay: 100 });
        });

        gif.on('finished', (blob) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'gradient-recordings/gradient-recording.gif'; // Fallback to GIF
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          console.log('✅ GIF fallback saved to gradient-recordings folder');
        });

        gif.render();
      } catch (fallbackError) {
        console.error('Fallback GIF creation also failed:', fallbackError);
      }
    }
  };

  const saveAsGIF = async () => {
    if (recordedFrames.length === 0) {
      console.error('No recorded frames to save');
      return;
    }

    try {
      const gif = new GIF({
        workers: 4,
        quality: 1,
        width: 1080,
        height: 1080,
        workerScript: '/gif.worker.js',
        dither: 'FloydSteinberg',
      });

      recordedFrames.forEach((frame: HTMLCanvasElement, index: number) => {
        gif.addFrame(frame, { delay: 100 });
      });

      gif.on('finished', (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'gradient-recordings/gradient-recording.gif'; // Save in gradient-recordings folder
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        console.log('✅ GIF saved to gradient-recordings folder');
      });

      gif.render();
    } catch (error) {
      console.error('Error saving as GIF:', error);
    }
  };


  const handleShareInstagram = async () => {
    try {
      // Find the gradient display element
      const gradientElement = document.querySelector('.gradient-display');
      if (!gradientElement) {
        console.error('Gradient display element not found');
        setIsShareDropdownOpen(false);
        return;
      }

      // Create high-quality animated GIF with 2-second recording approach
      const gif = new GIF({
        workers: 4, // More workers for faster processing
        quality: 1, // Highest quality (1 = best, 10 = worst)
        width: 1080,
        height: 1080,
        workerScript: '/gif.worker.js',
        dither: 'FloydSteinberg' // High-quality dithering
      });

      // Record for 2 seconds (20% of original 10 seconds)
      const frameCount = 20; // 20 frames for 2 seconds
      const frameDelay = 100; // 100ms = 10fps for smooth animation

      console.log('🎬 Starting 2-second recording...');
      
      // Record frames
      for (let i = 0; i < frameCount; i++) {
        // Wait for animation frame
        await new Promise(resolve => setTimeout(resolve, frameDelay));
        
        // Capture current frame with high quality settings
        const canvas = await html2canvas(gradientElement as HTMLElement, {
          backgroundColor: null,
          width: 1080,
          height: 1080,
          scale: 2, // High quality capture
          logging: false,
          useCORS: false,
          allowTaint: false,
          foreignObjectRendering: false,
          removeContainer: true,
          imageTimeout: 0
        });
        
        gif.addFrame(canvas, { delay: frameDelay });
        
        // Show progress
        const progress = Math.round((i + 1) / frameCount * 100);
        console.log(`📹 Recording progress: ${progress}% (${i + 1}/${frameCount} frames)`);
      }

      console.log('🎬 Recording complete! Rendering GIF...');

      // Render the high-quality GIF
      gif.on('finished', (blob) => {
        console.log('✅ High-quality GIF ready for download!');
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'gradient-recordings/gradient-recording-2s.gif';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });

      gif.render();
    } catch (error) {
      console.error('Error creating high-quality recording:', error);
    }
    
    setIsShareDropdownOpen(false);
  };

  const handleShareTikTok = () => {
    if (!gradientRef.current) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      const gradient = ctx.createRadialGradient(540, 960, 0, 540, 960, 800);
      const currentPoints = getCurrentMeshPoints();
      
      currentPoints.forEach((point, index) => {
        const position = index / Math.max(1, currentPoints.length - 1);
        gradient.addColorStop(position, point.color);
      });
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'gradient-tiktok.png';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
      }, 'image/png');
    }
    
    setIsShareDropdownOpen(false);
  };

  const handleShareWhatsApp = () => {
    if (!gradientRef.current) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      const gradient = ctx.createRadialGradient(400, 400, 0, 400, 400, 400);
      const currentPoints = getCurrentMeshPoints();
      
      currentPoints.forEach((point, index) => {
        const position = index / Math.max(1, currentPoints.length - 1);
        gradient.addColorStop(position, point.color);
      });
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'gradient-whatsapp.png';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
      }, 'image/png');
    }
    
    setIsShareDropdownOpen(false);
  };

  const handleAddColor = () => {
    saveToHistory(); // Save current state before making changes
    
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
      const newPoint = {
      id: `${Date.now()}-${Math.random()}`,
      x: Math.random() * 80 + 10, // Random position between 10% and 90%
        y: Math.random() * 80 + 10,
        color: randomColor,
      blur: 100,  // Start with 100px blur for new colors
        name: 'Custom Color'
      };
    
    const newPoints = [...meshPoints, newPoint];
    setMeshPoints(newPoints);
    
    // Stop animation and return to static when 4th color is added
    if (newPoints.length === 4) {
      setIsAnimating(false);
      setCurrentKeyframe(0);
      setAnimationStartTime(null);
      keyframesGeneratedRef.current = false;
    }
  };

  const handleRemoveColor = (pointId: string) => {
    saveToHistory(); // Save current state before making changes
    
    const newPoints = meshPoints.filter(point => point.id !== pointId);
    setMeshPoints(newPoints);
    
    // If removed color was selected, clear selection
    if (selectedColorId === pointId) {
      setSelectedColorId(null);
    }
    
    // If we go back to 1-3 colors, reset animation state to allow animation again
    if (newPoints.length >= 1 && newPoints.length <= 3) {
      setCurrentKeyframe(0);
      setAnimationStartTime(null);
      keyframesGeneratedRef.current = false;
    }
  };

  const handleRowSelect = (pointId: string) => {
    setSelectedColorId(pointId);
    // Don't open color picker, just select the row
  };

  const handleColorSwatchClick = (pointId: string) => {
    setSelectedColorId(pointId);
    setColorPickerOpen(true);
  };


  const handleColorChange = (newColor: string) => {
    if (selectedColorId) {
      saveToHistory(); // Save current state before making changes
      
      setMeshPoints(prev => prev.map(point => 
        point.id === selectedColorId ? { ...point, color: newColor } : point
      ));
    }
  };

  const handleCloseColorPicker = () => {
    setColorPickerOpen(false);
    setSelectedColorId(null);
  };


  const handleBlurChange = (blurValue: number) => {
    if (selectedColorId) {
      saveToHistory(); // Save current state before making changes
      
      // Allow blur to go to 0 for no blur effect
      const adjustedBlur = Math.max(0, Math.round(blurValue));
      
      // Update local state
      setMeshPoints(prev => prev.map(point => 
        point.id === selectedColorId ? { ...point, blur: adjustedBlur } : point
      ));
    }
  };


  const getSelectedColorBlur = () => {
    if (!selectedColorId) return 0;
    const selectedPoint = meshPoints.find(point => point.id === selectedColorId);
    return Math.max(0, selectedPoint?.blur || 100);
  };



  // Removed handleColorChange function

  const handleToggleHideColor = (pointId: string) => {
    saveToHistory(); // Save current state before making changes
    
    setMeshPoints(prev => prev.map(point => 
      point.id === pointId ? { ...point, hideColor: !(point.hideColor ?? false) } : point
    ));
  };

  const handleTextureTypeChange = (pointId: string, textureType: 'linear' | 'radial' | 'circular') => {
    saveToHistory(); // Save current state before making changes
    
    setMeshPoints(prev => prev.map(point => {
      if (point.id === pointId) {
        const updatedPoint = { ...point, textureType };
        
        // When switching to linear, move the ball to create a linear gradient effect
        if (textureType === 'linear') {
          // Calculate a new position based on the current gradient angle
          // Position the ball along the gradient direction for a linear effect
          const angleRad = (gradientAngle * Math.PI) / 180;
          const centerX = 50;
          const centerY = 50;
          const distance = 30; // Distance from center
          
          const newX = Math.max(10, Math.min(90, centerX + Math.cos(angleRad) * distance));
          const newY = Math.max(10, Math.min(90, centerY + Math.sin(angleRad) * distance));
          
          updatedPoint.x = newX;
          updatedPoint.y = newY;
        }
        
        return updatedPoint;
      }
      return point;
    }));
    
    // If gradient type is "nothing", also change the main gradient type
    if (gradientType === 'nothing') {
      if (textureType === 'linear') {
        setGradientType('linear');
      } else if (textureType === 'radial') {
        setGradientType('radial');
      } else if (textureType === 'circular') {
        setGradientType('circular');
      }
    }
  };

  const handleToggleHideBalls = (pointId: string) => {
    saveToHistory(); // Save current state before making changes
    
    setMeshPoints(prev => prev.map(point => 
      point.id === pointId ? { ...point, hideBalls: !(point.hideBalls ?? false) } : point
    ));
  };

  const handleToggleLinearManualDropdown = (pointId: string) => {
    saveToHistory(); // Save current state before making changes
    
    // Toggle the manual linear mode for this color
    setMeshPoints(prev => prev.map(point => 
      point.id === pointId ? { ...point, isManualLinear: !point.isManualLinear } : point
    ));
    
    setLinearManualDropdownOpen(prev => prev === pointId ? null : pointId);
  };

  const handleCloseLinearManualDropdown = () => {
    setLinearManualDropdownOpen(null);
  };

  const handleResetPosition = (pointId: string) => {
    setDropdownPositions(prev => {
      const newPositions = { ...prev };
      delete newPositions[pointId];
      return newPositions;
    });
  };

  // Helper function to check if a color has any individual fade values set or is in manual linear mode
  const hasIndividualFades = (item: MeshPoint) => {
    return item.isManualLinear || 
           (item.individualFadeLeft && item.individualFadeLeft > 0) ||
           (item.individualFadeRight && item.individualFadeRight > 0) ||
           (item.individualFadeTop && item.individualFadeTop > 0) ||
           (item.individualFadeBottom && item.individualFadeBottom > 0);
  };

  const handleDragStart = (e: React.MouseEvent, targetId: string) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const currentPosition = dropdownPositions[targetId] || { x: rect.left, y: rect.top };
    
    setDragState({
      isDragging: true,
      dragOffset: {
        x: e.clientX - currentPosition.x,
        y: e.clientY - currentPosition.y
      },
      targetId
    });
  };

  const handleDragMove = useCallback((e: MouseEvent) => {
    if (dragState.isDragging && dragState.targetId) {
      const newPosition = {
        x: e.clientX - dragState.dragOffset.x,
        y: e.clientY - dragState.dragOffset.y
      };
      
      setDropdownPositions(prev => ({
        ...prev,
        [dragState.targetId!]: newPosition
      }));
    }
  }, [dragState.isDragging, dragState.targetId, dragState.dragOffset]);

  const handleDragEnd = useCallback(() => {
    setDragState(prev => ({
      ...prev,
      isDragging: false,
      targetId: null
    }));
  }, []);

  // Color swatch drag handlers
  const handleColorSwatchDragStart = (e: React.MouseEvent, targetId: string) => {
    if (isAnimating) {
      // During animation, prevent all interactions
      return;
    }
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const currentPosition = colorSwatchPositions[targetId] || { x: rect.left, y: rect.top };
    
    setColorSwatchDragState({
      isDragging: true,
      dragOffset: {
        x: e.clientX - currentPosition.x,
        y: e.clientY - currentPosition.y
      },
      targetId,
      hasDragged: false,
      startPosition: { x: e.clientX, y: e.clientY }
    });
  };

  const handleColorSwatchDragMove = useCallback((e: MouseEvent) => {
    if (colorSwatchDragState.isDragging && colorSwatchDragState.targetId) {
      const deltaX = Math.abs(e.clientX - colorSwatchDragState.startPosition.x);
      const deltaY = Math.abs(e.clientY - colorSwatchDragState.startPosition.y);
      const dragThreshold = 5; // pixels
      
      // Mark as dragged if moved more than threshold
      if ((deltaX > dragThreshold || deltaY > dragThreshold) && !colorSwatchDragState.hasDragged) {
        setColorSwatchDragState(prev => ({ ...prev, hasDragged: true }));
      }
      
      // Only update position if we've started dragging
      if (colorSwatchDragState.hasDragged || deltaX > dragThreshold || deltaY > dragThreshold) {
        const newPosition = {
          x: e.clientX - colorSwatchDragState.dragOffset.x,
          y: e.clientY - colorSwatchDragState.dragOffset.y
        };
        
        setColorSwatchPositions(prev => ({
          ...prev,
          [colorSwatchDragState.targetId!]: newPosition
        }));
      }
    }
  }, [colorSwatchDragState]);

  const handleColorSwatchDragEnd = useCallback(() => {
    const wasDragged = colorSwatchDragState.hasDragged;
    const targetId = colorSwatchDragState.targetId;
    
    setColorSwatchDragState(prev => ({
      ...prev,
      isDragging: false,
      targetId: null,
      hasDragged: false
    }));
    
    // Color picker is now only opened via eye dropper button
    // Clicks on color swatch only allow dragging
  }, [colorSwatchDragState.hasDragged, colorSwatchDragState.targetId]);

  // Add global mouse event listeners for dragging
  useEffect(() => {
    if (dragState.isDragging) {
      document.addEventListener('mousemove', handleDragMove);
      document.addEventListener('mouseup', handleDragEnd);
      document.body.style.cursor = 'grabbing';
      return () => {
        document.removeEventListener('mousemove', handleDragMove);
        document.removeEventListener('mouseup', handleDragEnd);
        document.body.style.cursor = '';
      };
    }
  }, [dragState.isDragging, handleDragMove, handleDragEnd]);

  // Add global mouse event listeners for color swatch dragging
  useEffect(() => {
    if (colorSwatchDragState.isDragging) {
      document.addEventListener('mousemove', handleColorSwatchDragMove);
      document.addEventListener('mouseup', handleColorSwatchDragEnd);
      document.body.style.cursor = 'grabbing';
      return () => {
        document.removeEventListener('mousemove', handleColorSwatchDragMove);
        document.removeEventListener('mouseup', handleColorSwatchDragEnd);
        document.body.style.cursor = '';
      };
    }
  }, [colorSwatchDragState.isDragging, handleColorSwatchDragMove, handleColorSwatchDragEnd]);

  // Hydration fix
  useEffect(() => {
    setIsHydrated(true);
  }, []);


  // Master control handlers
  const handleToggleAllColors = () => {
    setHideAllColors(prev => !prev);
  };

  const handleToggleAllBalls = () => {
    setHideAllBalls(prev => !prev);
  };

  const handleDeleteAllColors = () => {
    // Always delete all colors (no toggle behavior)
    if (meshPoints.length > 0) {
      // Store current mesh points before deleting
      setOriginalMeshPoints([...meshPoints]);
      // Clear all colors
      setMeshPoints([]);
      // Keep showDeletedColors as true so UI stays normal
      setShowDeletedColors(true);
    }
  };

  // Drawing functionality handlers
  const handleToggleDrawing = () => {
    setShowPenMenu(true); // Always open menu when pen icon clicked
    setIsDrawingMode(false); // Don't activate drawing yet
  };

  // Shapes functionality handlers
  const handleToggleShapes = () => {
    setShowShapesMenu(!showShapesMenu);
    setSelectedShape(null);
  };

  const handleShapeSelect = (shape: 'triangle' | 'circle' | 'square') => {
    setSelectedShape(shape);
    setShowShapesMenu(false);
    setIsDrawingMode(true); // Activate drawing mode for shape placement
  };

  // Image upload functionality handlers
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Image upload triggered', event.target.files);
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      console.log('Valid image file selected:', file.name, file.type);
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageId = `image-${Date.now()}`;
        const newImage = {
          id: imageId,
          src: e.target?.result as string,
          x: 50, // Center position
          y: 50,
          width: 25, // Slightly larger default size for better visibility
          height: 25,
          rotation: 0,
          isSelected: true // Auto-select the uploaded image for immediate interaction
        };
        console.log('Adding new image:', newImage);
        // Deselect all existing images and add the new selected image
        setUploadedImages(prev => [
          ...prev.map(img => ({ ...img, isSelected: false })),
          newImage
        ]);
        setSelectedImageId(imageId);
      };
      reader.readAsDataURL(file);
    } else {
      console.log('Invalid file type or no file selected');
    }
    // Reset the input
    event.target.value = '';
  };

  const handleImageSelect = (imageId: string) => {
    setSelectedImageId(imageId);
    setUploadedImages(prev => prev.map(img => ({
      ...img,
      isSelected: img.id === imageId
    })));
  };

  const handleImageUpdate = (imageId: string, updates: Partial<{
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
  }>) => {
    setUploadedImages(prev => prev.map(img => 
      img.id === imageId ? { ...img, ...updates } : img
    ));
  };

  const handleImageDelete = (imageId: string) => {
    setUploadedImages(prev => prev.filter(img => img.id !== imageId));
    if (selectedImageId === imageId) {
      setSelectedImageId(null);
    }
  };

  const handleUploadClick = () => {
    console.log('Upload button clicked');
    if (fileInputRef.current) {
      console.log('Triggering file input click');
      fileInputRef.current.click();
    } else {
      console.log('File input ref not found');
    }
  };


  const handleClosePenMenu = () => {
    setShowPenMenu(false);
    setIsDrawingMode(true); // Activate drawing mode when X is pressed
  };

  const handlePenThicknessChange = (thickness: number) => {
    setPenThickness(thickness);
  };

  const handlePenColorChange = (color: string) => {
    setPenColor(color);
  };

  const handlePenFadeLeftChange = (fade: number) => {
    setPenFadeLeft(fade);
  };

  const handlePenFadeRightChange = (fade: number) => {
    setPenFadeRight(fade);
  };


  const handleClearDrawing = () => {
    setDrawingPaths([]);
  };

  // Generate CSS animation code
  const generateAnimationCSS = () => {
    if (!keyframesLengthRef.current) return '';

    const duration = 2; // Fast 2 seconds for full animation cycle
    
    return `
/* HTML Structure:
<div class="mesh-gradient">
  <div class="individual-layer-1"></div>
  <div class="individual-layer-2"></div>
  <div class="individual-layer-3"></div>
</div>
*/

/* CSS */
.mesh-gradient {
  position: relative;
  width: 100%;
  height: 400px;
  overflow: hidden;
  background-color: #000000;
}

.mesh-gradient .individual-layer-1 {
    position: absolute;
    top: 0;
    left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(48deg, #0DD162 0%, rgba(13, 209, 98, 0.7) 30%, rgba(13, 209, 98, 0.4) 60%, transparent 100%);
  opacity: 0.6;
  transform: scale(1.3) rotate(48deg);
  transform-origin: 31% 78%;
  filter: blur(10px);
  animation: layer1-animate ${duration}s ease-in-out infinite;
}

.mesh-gradient .individual-layer-2 {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(48deg, #0D7CD1 0%, rgba(13, 124, 209, 0.7) 30%, rgba(13, 124, 209, 0.4) 60%, transparent 100%);
  opacity: 0.6;
  transform: scale(1.3) rotate(48deg);
  transform-origin: 49% 20%;
  filter: blur(10px);
  animation: layer2-animate ${duration}s ease-in-out infinite;
}

.mesh-gradient .individual-layer-3 {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(48deg, #ea0f2a 0%, rgba(234, 15, 42, 0.7) 30%, rgba(234, 15, 42, 0.4) 60%, transparent 100%);
  opacity: 0.6;
  transform: scale(1.3) rotate(48deg);
  transform-origin: 47% 53%;
  filter: blur(10px);
  animation: layer3-animate ${duration}s ease-in-out infinite;
}

/* Fast animations */
@keyframes layer1-animate {
  0% { transform: scale(1.3) rotate(48deg) translate(0px, 0px); }
  25% { transform: scale(1.5) rotate(52deg) translate(10px, -5px); }
  50% { transform: scale(1.2) rotate(45deg) translate(-5px, 8px); }
  75% { transform: scale(1.4) rotate(55deg) translate(8px, 3px); }
  100% { transform: scale(1.3) rotate(48deg) translate(0px, 0px); }
}

@keyframes layer2-animate {
  0% { transform: scale(1.3) rotate(48deg) translate(0px, 0px); }
  25% { transform: scale(1.2) rotate(45deg) translate(-8px, 5px); }
  50% { transform: scale(1.5) rotate(52deg) translate(5px, -8px); }
  75% { transform: scale(1.1) rotate(42deg) translate(-3px, 10px); }
  100% { transform: scale(1.3) rotate(48deg) translate(0px, 0px); }
}

@keyframes layer3-animate {
  0% { transform: scale(1.3) rotate(48deg) translate(0px, 0px); }
  25% { transform: scale(1.4) rotate(50deg) translate(6px, 4px); }
  50% { transform: scale(1.1) rotate(46deg) translate(-7px, -6px); }
  75% { transform: scale(1.5) rotate(54deg) translate(4px, -4px); }
  100% { transform: scale(1.3) rotate(48deg) translate(0px, 0px); }
}`;
  };

  const handleIndividualFadeChange = (pointId: string, direction: 'left' | 'right' | 'top' | 'bottom', value: number) => {
    saveToHistory(); // Save current state before making changes
    
    setMeshPoints(prev => prev.map(point => 
      point.id === pointId ? { 
        ...point, 
        [`individualFade${direction.charAt(0).toUpperCase() + direction.slice(1)}`]: value 
      } : point
    ));
  };

  // Color picker functionality removed

  const handleBackgroundColorChange = (newColor: string) => {
    saveToHistory(); // Save current state before making changes
    setBackgroundColor(newColor);
    setBackgroundColorPickerOpen(false);
  };

  const handleBackgroundColorSquareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setBackgroundColorPickerOpen(!backgroundColorPickerOpen);
  };

  const handleCopyColorClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedColorId) {
      // Get the color from the currently selected mesh point
      const selectedPoint = meshPoints.find(point => point.id === selectedColorId);
      if (selectedPoint) {
        // Add a new mesh point with the same color as the selected one
        const newPoint: MeshPoint = {
          id: `point-${Date.now()}`,
          x: Math.random() * 0.8 + 0.1, // Random position between 0.1 and 0.9
          y: Math.random() * 0.8 + 0.1,
          color: selectedPoint.color, // Use the same color as the selected point
          blur: selectedPoint.blur || 100, // Use the same blur as the selected point
          name: selectedPoint.name || 'Copied Color', // Use the same name or default
          hideColor: false,
          hideBalls: false,
          textureType: selectedPoint.textureType || 'circular'
        };
        
        saveToHistory(); // Save current state before making changes
        setMeshPoints(prev => [...prev, newPoint]);
      }
    }
  };

  const handleSparklesClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowStarMenu(!showStarMenu);
  };

  // Handle premium feature click
  const handlePremiumFeatureClick = () => {
    setShowPremiumPopup(true);
    // Auto-hide after 3 seconds
    setTimeout(() => {
      setShowPremiumPopup(false);
    }, 3000);
  };

  const handleStarSelect = (starType: number) => {
    setShowStarMenu(false);
    // Add the selected star to the gradient display
    const newStar = {
      id: `star-${Date.now()}-${Math.random()}`,
      x: 50, // Default center position
      y: 50,
      starType,
      size: 1
    };
    setPlacedStars(prev => [...prev, newStar]);
  };

  const handleGradientClick = (e: React.MouseEvent) => {
    if (showStarMenu) {
      setShowStarMenu(false);
      return;
    }
    
    // Deselect any selected star when clicking on empty space
    setSelectedStarId(null);
    
    // Handle star placement if a star is selected
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Update the last placed star's position
    if (placedStars.length > 0) {
      const lastStar = placedStars[placedStars.length - 1];
      setPlacedStars(prev => prev.map(star => 
        star.id === lastStar.id ? { ...star, x, y } : star
      ));
    }
  };

  const handleStarClick = (e: React.MouseEvent, starId: string) => {
    e.stopPropagation();
    setSelectedStarId(selectedStarId === starId ? null : starId);
  };

  const handleStarSizeChange = (starId: string, newSize: number) => {
    setPlacedStars(prev => prev.map(star => 
      star.id === starId ? { ...star, size: Math.max(0.1, Math.min(3, newSize)) } : star
    ));
  };

  const handleDeleteStar = (starId: string) => {
    setPlacedStars(prev => prev.filter(star => star.id !== starId));
    setSelectedStarId(null);
  };

  const handleGradientTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    saveToHistory(); // Save current state before making changes
    setGradientType(e.target.value as 'linear' | 'radial' | 'circular' | 'nothing');
  };

  const handleGradientTypeToggle = (type: 'linear' | 'radial' | 'circular') => {
    saveToHistory(); // Save current state before making changes

    // Special handling for each gradient type - set all colors to corresponding texture type
    if (type === 'linear') {
      setMeshPoints(prev => prev.map(point => ({
        ...point,
        textureType: 'linear' as const
      })));
    } else if (type === 'circular') {
      setMeshPoints(prev => prev.map(point => ({
        ...point,
        textureType: 'circular' as const
      })));
    } else if (type === 'radial') {
      setMeshPoints(prev => prev.map(point => ({
        ...point,
        textureType: 'radial' as const
      })));
    }

    setEnabledGradientTypes(prev => ({
      ...prev,
      [type]: !prev[type]
    }));

    // If no gradient types are enabled, set to 'nothing'
    const newEnabledTypes = {
      ...enabledGradientTypes,
      [type]: !enabledGradientTypes[type]
    };

    if (!newEnabledTypes.linear && !newEnabledTypes.radial && !newEnabledTypes.circular) {
      setGradientType('nothing');
    } else {
      // If any gradient types are enabled, set to 'nothing' to allow individual rendering
      setGradientType('nothing');
    }
  };

  const handleShufflePositions = () => {
    saveToHistory(); // Save current state before making changes
    
    // Generate new random positions for all mesh points
    const shuffledPoints = meshPoints.map(point => ({
      ...point,
      x: Math.floor(Math.random() * 80) + 10, // Random position between 10% and 90%
      y: Math.floor(Math.random() * 80) + 10  // Random position between 10% and 90%
    }));

    if (!checkForDuplicateIds(shuffledPoints)) {
      setMeshPoints(shuffledPoints);
    }
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      // When opening fullscreen, force update with current data
      setFullscreenKey(Date.now());
    }
    setIsFullscreen(!isFullscreen);
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Close fullscreen with ESC key
      if (event.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
        return;
      }
      
      // Undo with Ctrl+Z (Cmd+Z on Mac)
      if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
        event.preventDefault();
        handleUndo();
        return;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [isFullscreen, handleUndo]);

  // Close color pickers when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      
      if (backgroundColorPickerOpen && !target.closest('.background-color-picker-container')) {
        setBackgroundColorPickerOpen(false);
      }
      
      if (showPenMenu && !target.closest('.pen-menu-container') && !target.closest('button[title*="drawing"]')) {
        setShowPenMenu(false);
        setIsDrawingMode(true); // Activate drawing mode when clicking outside
      }
      
      if (showShapesMenu && !target.closest('.shapes-menu-container') && !target.closest('button[title*="Shapes"]')) {
        setShowShapesMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [backgroundColorPickerOpen, showPenMenu, showShapesMenu]);

  // Update fullscreen when mesh points, background color, gradient type, or angle change
  useEffect(() => {
    if (isFullscreen) {
      setFullscreenKey(Date.now());
    }
  }, [meshPoints, backgroundColor, gradientType, gradientAngle, isFullscreen]);

  // Auto-generate CSS whenever gradient parameters change (use base meshPoints, not animated ones)
  useEffect(() => {
    if (gradientRef.current) {
      let css = gradientRef.current.generateCSS();
      
      // Add animation CSS if animation is active
      if (isAnimating && keyframesLengthRef.current > 0) {
        css += generateAnimationCSS();
      }
      
      setGeneratedCSS(css);
    }
  }, [meshPoints, backgroundColor, gradientType, gradientAngle, isAnimating]);

  // Utility function to check for duplicate IDs
  const checkForDuplicateIds = (points: { id: string }[]) => {
    const uniqueIds = new Set(points.map(p => p.id));
    const hasDuplicates = uniqueIds.size !== points.length;
    if (hasDuplicates) {
      console.error('Duplicate IDs detected:', points);
      console.error('Expected unique IDs:', uniqueIds.size, 'Actual points:', points.length);
    }
    return hasDuplicates;
  };

  // Callback for fullscreen mesh points changes
  const handleFullscreenMeshPointsChange = useCallback((newPoints: MeshPoint[]) => {
    if (!checkForDuplicateIds(newPoints)) {
      // Save current state before making changes
      const currentState = {
        meshPoints,
        gradientType,
        gradientAngle,
        backgroundColor
      };

      setHistory(prev => {
        // Remove any future history if we're not at the end
        const newHistory = prev.slice(0, historyIndex + 1);
        // Add new state
        newHistory.push(currentState);
        // Limit history to 50 items
        if (newHistory.length > 50) {
          newHistory.shift();
          return newHistory;
        }
        return newHistory;
      });
      setHistoryIndex(prev => Math.min(prev + 1, 49));

      const pointsWithNames = newPoints.map(point => ({
        ...point,
        name: point.name || 'Custom Color',
        blur: point.blur || 100,
        textureType: point.textureType || 'circular'
      }));
      setMeshPoints(pointsWithNames);
    }
  }, [meshPoints, gradientType, gradientAngle, backgroundColor, historyIndex]);

  const handlePointSelect = useCallback((pointId: string) => {
    setSelectedColorId(pointId);
    // Don't open color picker automatically when clicking circles
  }, []);

  const handleGenerate = () => {
    saveToHistory(); // Save current state before making changes
    
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

    // Generate new random gradient by updating parent state directly
      const newPoints = meshPoints.map(point => ({
        ...point,
      color: generateRandomColor(),
      ...generateRandomPosition(),
      blur: Math.round(100 + Math.floor(Math.random() * 100)) // 100-200px, rounded
    }));
    
    if (!checkForDuplicateIds(newPoints)) {
      setMeshPoints(newPoints);
    }
  };

  // Generate animation keyframes (only once when animation starts)

  // Animation functions - simple toggle without automatic recording
  const handleToggleAnimation = () => {
    setIsAnimating(!isAnimating);
  };





  const handleToggleLoop = () => {
    setIsLooping(!isLooping);
  };

  const handleResetAnimation = () => {
    setIsResetting(true);
    setIsResetSpinning(true);
    setIsAnimating(false);
    setCurrentKeyframe(0);
    setAnimationStartTime(null);
    keyframesGeneratedRef.current = false;
    
    
    // Show reset text animation and stop spinning
    setTimeout(() => {
      setIsResetting(false);
      setIsResetSpinning(false);
    }, 1000);
  };

  // Drag and drop handlers for color reordering
  const handleColorDragStart = (e: React.DragEvent, itemId: string) => {
    setDraggedItemId(itemId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleColorDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleColorDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleColorDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (!draggedItemId) return;
    
    const draggedIndex = meshPoints.findIndex(item => item.id === draggedItemId);
    if (draggedIndex === -1 || draggedIndex === dropIndex) {
      setDraggedItemId(null);
      setDragOverIndex(null);
      return;
    }
    
    saveToHistory(); // Save current state before making changes
    
    // Reorder the mesh points array
    const newMeshPoints = [...meshPoints];
    const [draggedItem] = newMeshPoints.splice(draggedIndex, 1);
    newMeshPoints.splice(dropIndex, 0, draggedItem);
    
    setMeshPoints(newMeshPoints);
    setDraggedItemId(null);
    setDragOverIndex(null);
  };

  const handleColorDragEnd = () => {
    setDraggedItemId(null);
    setDragOverIndex(null);
  };

  // Get current mesh points - either animated keyframe or base points
  const getCurrentMeshPoints = useCallback(() => {
    let points = meshPoints;
    
    if (isAnimating && keyframesLengthRef.current > 0) {
      points = keyframesRef.current[currentKeyframeRef.current] || meshPoints;
    }
    
    // Apply global controls
    if (!showDeletedColors) {
      return [];
    }
    
    return points.map(point => ({
      ...point,
      hideColor: hideAllColors || point.hideColor,
      hideBalls: hideAllBalls || point.hideBalls
    }));
  }, [isAnimating, meshPoints, hideAllColors, hideAllBalls, showDeletedColors]);

  // Set animation start time when animation starts  
  useEffect(() => {
    if (isAnimating && !keyframesGeneratedRef.current) {
      if (keyframesLengthRef.current > 0) {
        setAnimationStartTime(Date.now());
        keyframesGeneratedRef.current = true;
      }
    } else if (!isAnimating) {
      keyframesGeneratedRef.current = false;
    }
  }, [isAnimating]); // Only depend on isAnimating, use ref for length

  // Keep refs up to date
  useEffect(() => {
    keyframesRef.current = animationKeyframes;
    keyframesLengthRef.current = animationKeyframes.length;
  }, [animationKeyframes]);

  useEffect(() => {
    isAnimatingRef.current = isAnimating;
  }, [isAnimating]);

  // Animation loop that cycles through keyframes
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    let renderInterval: NodeJS.Timeout | null = null;
    
    if (isAnimating && keyframesLengthRef.current > 0) {
      // Update the ref every frame for smooth animation
      interval = setInterval(() => {
        currentKeyframeRef.current = (currentKeyframeRef.current + 1) % keyframesLengthRef.current;
      }, 167);
      
      // Update the state less frequently to trigger re-renders (every 3 frames)
      renderInterval = setInterval(() => {
        setCurrentKeyframe(currentKeyframeRef.current);
      }, 167 * 3);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
      if (renderInterval) {
        clearInterval(renderInterval);
      }
    };
  }, [isAnimating]); // Only depend on isAnimating, use ref for length

  // Separate effect to reset keyframe when animation stops
  useEffect(() => {
    if (!isAnimating) {
      setCurrentKeyframe(0);
      currentKeyframeRef.current = 0;
    }
  }, [isAnimating]);

  // Timer to trigger re-renders for the 10-second export button delay
  useEffect(() => {
    if (!animationStartTime) return;
    
    const interval = setInterval(() => {
      // Force re-render to check if 10 seconds have passed
      if (Date.now() - animationStartTime >= 10000) {
        clearInterval(interval);
      }
    }, 1000); // Check every second
    
    return () => clearInterval(interval);
  }, [animationStartTime]);


  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* CSS Keyframes for Gradient Master Text Animation */}
      <style jsx>{`
        @keyframes layer1-animate {
          0% { transform: scale(1.3) rotate(48deg) translate(0px, 0px); }
          25% { transform: scale(1.5) rotate(52deg) translate(10px, -5px); }
          50% { transform: scale(1.2) rotate(45deg) translate(-5px, 8px); }
          75% { transform: scale(1.4) rotate(55deg) translate(8px, 3px); }
          100% { transform: scale(1.3) rotate(48deg) translate(0px, 0px); }
        }
        
        @keyframes layer2-animate {
          0% { transform: scale(1.3) rotate(48deg) translate(0px, 0px); }
          25% { transform: scale(1.2) rotate(45deg) translate(-8px, 5px); }
          50% { transform: scale(1.5) rotate(52deg) translate(5px, -8px); }
          75% { transform: scale(1.1) rotate(42deg) translate(-3px, 10px); }
          100% { transform: scale(1.3) rotate(48deg) translate(0px, 0px); }
        }
      `}</style>
      
      {/* Premium Feature Popup */}
      {showPremiumPopup && (
        <div className="fixed top-4 right-4 z-50 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 rounded-lg shadow-xl border border-purple-400 animate-pulse">
          <div className="flex items-center space-x-3">
            <svg className="w-6 h-6 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <div>
              <div className="font-bold text-sm">Premium Feature</div>
              <div className="text-xs opacity-90">This function is only available in the paid version</div>
            </div>
          </div>
        </div>
      )}

      {/* Top Navigation Bar */}
      <nav className="bg-gray-800 px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-white p-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          {/* Logo Section */}
          <div className="flex items-center space-x-4">
            {/* Gradient Master Logo */}
            <div className="flex items-center">
              {/* Text */}
              <div 
                className="flex flex-col mt-8 ml-4 px-6 py-4 rounded-2xl relative"
                style={{
                  background: 'radial-gradient(circle at center, rgba(59, 130, 246, 0.3) 0%, rgba(75, 85, 99, 0.2) 50%, rgba(31, 41, 55, 0.1) 100%)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <span 
                  className="font-bold text-4xl leading-tight relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(48deg, #FF3366, #00FFCC, #00BFFF, #00FF7F, #FFFF00, #FF69B4, #00FFE5, #FFD700)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    animation: 'layer1-animate 2s ease-in-out infinite',
                    textShadow: '3px 3px 6px rgba(0, 0, 0, 0.9), 0 0 10px rgba(0, 0, 0, 0.7), 0 2px 4px rgba(0, 0, 0, 0.4), 0 4px 8px rgba(0, 0, 0, 0.3), 0 6px 12px rgba(0, 0, 0, 0.2), 0 8px 16px rgba(0, 0, 0, 0.1), 0 10px 20px rgba(0, 0, 0, 0.05)'
                  }}
                >
                  Gradient
                </span>
                <span 
                  className="font-bold text-4xl leading-tight relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(48deg, #FF3366, #00FFCC, #00BFFF, #00FF7F, #FFFF00, #FF69B4, #00FFE5, #FFD700)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    animation: 'layer2-animate 2s ease-in-out infinite',
                    textShadow: '3px 3px 6px rgba(0, 0, 0, 0.9), 0 0 10px rgba(0, 0, 0, 0.7), 0 2px 4px rgba(0, 0, 0, 0.4), 0 4px 8px rgba(0, 0, 0, 0.3), 0 6px 12px rgba(0, 0, 0, 0.2), 0 8px 16px rgba(0, 0, 0, 0.1), 0 10px 20px rgba(0, 0, 0, 0.05)'
                  }}
                >
                  Master
                </span>
                <span 
                  className="font-bold text-4xl leading-tight relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(48deg, #FF3366, #00FFCC, #00BFFF, #00FF7F, #FFFF00, #FF69B4, #00FFE5, #FFD700)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    animation: 'layer2-animate 2s ease-in-out infinite',
                    textShadow: '3px 3px 6px rgba(0, 0, 0, 0.9), 0 0 10px rgba(0, 0, 0, 0.7), 0 2px 4px rgba(0, 0, 0, 0.4), 0 4px 8px rgba(0, 0, 0, 0.3), 0 6px 12px rgba(0, 0, 0, 0.2), 0 8px 16px rgba(0, 0, 0, 0.1), 0 10px 20px rgba(0, 0, 0, 0.05)',
                    marginTop: '8px'
                  }}
                >
                  .Pro
                </span>
                <span 
                  className="absolute bottom-2 right-3 text-xs text-white/70 font-medium"
                >
                  V2
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4 sm:space-x-8">
            {/* Navigation Links - Hidden on mobile */}
            <div className="hidden md:flex items-center space-x-6">
              <a href="#" className="text-gray-300 hover:text-white transition-colors text-lg">Discover</a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors text-lg">Palettes</a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors text-lg">Gradients</a>
              <div className="flex items-center space-x-1">
                <a href="#" className="text-gray-300 hover:text-white transition-colors text-lg">Tools</a>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
          
          {/* Center Tool Icons */}
          <div className="flex items-center justify-center space-x-4">
            {/* Drawing Pen Icon */}
            <div 
              className="flex items-center justify-center w-10 h-10 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 cursor-pointer transition-colors" 
              title="Drawing tools"
              onClick={handlePremiumFeatureClick}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>

            {/* Sparkles Icon */}
             <div 
               className="flex items-center justify-center w-10 h-10 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 cursor-pointer transition-colors" 
               title="Add shiners"
               onClick={handlePremiumFeatureClick}
             >
              <Sparkles className="w-6 h-6" />
            </div>

            {/* Star Menu Popup */}
            {showStarMenu && (
              <div className="absolute top-12 left-0 bg-gray-800 border border-gray-600 rounded-lg p-4 shadow-xl z-50">
                <div className="text-white text-sm mb-3 font-medium">Choose a star:</div>
                <div className="grid grid-cols-6 gap-3">
                  {starTypes.map((star) => (
                    <button
                      key={star.id}
                      onClick={() => handleStarSelect(star.id)}
                      className="p-3 rounded hover:bg-gray-700 transition-colors text-white flex items-center justify-center"
                      title={`Star ${star.id}`}
                    >
                      <div className="w-8 h-8 flex items-center justify-center">
                        {star.svg}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Image Icon */}
            <button
              onClick={handlePremiumFeatureClick}
              className="flex items-center justify-center w-10 h-10 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
              title="Upload image"
            >
              <ImageUp className="w-6 h-6" />
            </button>

            {/* Text Icon */}
            <div 
              className="flex items-center justify-center w-10 h-10 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 cursor-pointer transition-colors" 
              title="Add text"
              onClick={handlePremiumFeatureClick}
            >
              <RemoveFormatting className="w-6 h-6" />
            </div>

            {/* Bot Icon */}
            <div 
              className="flex items-center justify-center w-10 h-10 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 cursor-pointer transition-colors" 
              title="AI Assistant"
              onClick={handlePremiumFeatureClick}
            >
              <Bot className="w-5 h-5" />
            </div>

            {/* Shapes Icon */}
            <div 
              className="flex items-center justify-center w-10 h-10 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 cursor-pointer transition-colors" 
              title="Add shapes"
              onClick={handlePremiumFeatureClick}
            >
              <Shapes className="w-5 h-5" />
            </div>
          </div>
          
          {/* Right side buttons */}
          <div className="flex items-center space-x-4">
            <Link href="/upgrade" className="text-gray-300 hover:text-white transition-colors" prefetch={true}>Upgrade</Link>
            <button className="text-gray-300 hover:text-white transition-colors">Sign in</button>
            <button 
              className="text-gray-600 px-4 py-2 rounded-lg transition-colors relative overflow-hidden font-bold"
              style={{
                background: 'linear-gradient(48deg, #FF6B6B, #FF4444, #4ECDC4, #45B7D1, #96CEB4, #FFEAA7, #DDA0DD, #98D8C8, #F7DC6F)',
                backgroundSize: '400% 400%',
                animation: 'gradientShift 3s ease infinite'
              }}
            >
              Create account
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="fixed left-0 top-0 h-full w-80 bg-gray-800 border-r border-gray-700 p-6 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-white">Controls</h2>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-6">
              {/* Mobile Control Panel Content - Same as desktop */}
              <div>
                <div className="inline-block bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded mb-3">
                  FEATURED
                </div>
                <h1 className="text-xl font-semibold text-white">Mesh Gradient Generator</h1>
              </div>
              
              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={handleGenerate}
                  disabled={isAnimating}
                  className="flex items-center justify-center space-x-1 bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Generate</span>
                </button>
                <button
                  onClick={handleCodeButtonClick}
                  className="flex items-center justify-center space-x-1 bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg transition-colors text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  <span>Code</span>
                </button>
                <button
                  onClick={handleExportButtonClick}
                  className="flex items-center justify-center space-x-1 bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg transition-colors text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Export</span>
                </button>
                <button 
                  onClick={handleShufflePositions}
                  disabled={isAnimating}
                  className="flex items-center justify-center space-x-1 bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Shuffle</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-col md:flex-row h-[calc(100vh-80px)] md:h-[calc(100vh-73px)] min-h-0">
        {/* Left Control Panel - Hidden on mobile */}
        <div className="hidden md:block w-80 bg-gray-800 border-r border-gray-700 p-6 overflow-y-auto overflow-x-visible">
          <div className="space-y-6">
            {/* Featured Tag and Title */}
            <div>
              <div className="inline-block bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded mb-3">
                FEATURED
              </div>
              <h1 className="text-xl font-semibold text-white">Mesh Gradient Generator</h1>
            </div>
            
            {/* Action Buttons */}
            <div className="grid grid-cols-4 gap-2">
              <button 
                onClick={handleGenerate}
                disabled={isAnimating}
                className="flex items-center justify-center space-x-1 bg-gray-700 hover:bg-gray-600 text-white px-2 py-2 rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Generate</span>
              </button>
              <button
                onClick={handleCodeButtonClick}
                className="flex items-center justify-center space-x-1 bg-gray-700 hover:bg-gray-600 text-white px-2 py-2 rounded-lg transition-colors text-sm"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                <span>Code</span>
              </button>
              <button
                onClick={handleExportButtonClick}
                className="flex items-center justify-center space-x-1 bg-gray-700 hover:bg-gray-600 text-white px-2 py-2 rounded-lg transition-colors text-sm"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Export</span>
              </button>
              <button 
                onClick={handleShufflePositions}
                disabled={isAnimating}
                className="flex items-center justify-center space-x-1 bg-gray-700 hover:bg-gray-600 text-white px-2 py-2 rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Shuffle</span>
              </button>
            </div>
            
            {/* Animation Controls - Show until 6th color is added */}
            {meshPoints.length < 6 && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Animation</label>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={handleToggleAnimation}
                    className={`px-3 py-2 rounded-lg transition-all duration-200 flex-1 flex items-center justify-center space-x-2 ${
                      isAnimating 
                        ? 'bg-green-600 hover:bg-green-700 text-white' 
                        : 'bg-gray-700 hover:bg-gray-600 text-white'
                    }`}
                    title={isAnimating ? "Stop animation" : "Start animation"}
                  >
{isAnimating ? (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <rect x="6" y="4" width="4" height="16" />
                        <rect x="14" y="4" width="4" height="16" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    )}
                    <span>{isAnimating ? 'Stop' : 'Animate'}</span>
                  </button>
                  <button 
                    onClick={handleResetAnimation}
                    className="relative p-2 rounded-lg transition-colors bg-gray-700 hover:bg-gray-600 text-white"
                    title="Reset animation - record new sequence"
                  >
                    {isResetting && (
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs text-white bg-black/80 px-2 py-1 rounded animate-fadeInOut">
                        Reset
                      </div>
                    )}
                    <svg className={`w-4 h-4 transition-transform duration-1000 ${isResetSpinning ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                </div>
                {isAnimating && (
                  <div className="mt-3">
                    <div className="flex items-center space-x-2">
                    </div>
                    
                    
                  </div>
                )}
              </div>
            )}

            
            {/* Colors Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-300">Colors</h3>
                <button 
                  onClick={handleAddColor}
                  disabled={isAnimating}
                  className="text-sm transition-all duration-300 hover:scale-105 relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  style={{
                    background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4, #45B7D1, #96CEB4, #FFEAA7, #DDA0DD, #98D8C8, #F7DC6F)',
                    backgroundSize: '400% 400%',
                    animation: 'gradientShift 3s ease infinite',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  + Add color
                </button>
              </div>

              {/* Master Control Button */}
              <div className="flex items-center space-x-3 p-2 rounded-lg bg-gray-900 mb-3 transition-all duration-200 relative">
                <div className="flex-1"></div>
                <div className="flex items-center space-x-1">
                  {/* Eye icon - Hide/Show all color buttons */}
                  <button
                    onClick={handleToggleAllColors}
                    disabled={isAnimating}
                    className={`transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      isHydrated && hideAllColors 
                        ? 'text-red-400 hover:text-red-300' 
                        : 'text-gray-400 hover:text-orange-400'
                    }`}
                    title={hideAllColors ? "Show all colors" : "Hide all colors"}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {isHydrated && hideAllColors ? (
                        <>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3l18 18" />
                        </>
                      ) : (
                        <>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </>
                      )}
                    </svg>
                  </button>

                  {/* Circle icon - Hide/Show all balls */}
                  <button
                    onClick={handleToggleAllBalls}
                    disabled={isAnimating}
                    className={`transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      isHydrated && hideAllBalls 
                        ? 'text-red-400 hover:text-red-300' 
                        : 'text-gray-400 hover:text-blue-400'
                    }`}
                    title={hideAllBalls ? "Show all balls" : "Hide all balls"}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {isHydrated && hideAllBalls ? (
                        // Crossed out ball icon when hidden
                        <>
                          <circle cx="12" cy="12" r="4" strokeWidth={2} />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4l16 16" />
                        </>
                      ) : (
                        // Regular ball icon when visible
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 12v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                      )}
                    </svg>
                  </button>

                  {/* Bin icon - Delete/Restore all colors */}
                  <button
                    onClick={handleDeleteAllColors}
                    disabled={isAnimating}
                    className="transition-colors text-gray-400 hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete all colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Pen Menu Popup */}
              {showPenMenu && (
                <div className="pen-menu-container fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-800 rounded-xl border border-gray-700 shadow-2xl p-3 w-48 z-[9999]">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-white">Drawing Tools</h3>
                    <button
                      onClick={handleClosePenMenu}
                      className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-gray-700"
                      title="Close pen menu and start drawing"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  {/* Pen Thickness */}
                  <div className="mb-3">
                    <label className="block text-xs font-medium text-gray-200 mb-2">Line Size (1-10)</label>
                    <div className="flex justify-center items-center space-x-2 mb-2">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((thickness) => (
                        <button
                          key={thickness}
                          onClick={() => handlePenThicknessChange(thickness)}
                          className={`transition-all duration-200 hover:scale-110 flex-shrink-0 ${
                            penThickness === thickness 
                              ? 'ring-2 ring-purple-400 ring-offset-1 ring-offset-gray-800' 
                              : 'hover:ring-1 hover:ring-gray-400'
                          }`}
                          style={{ 
                            width: `${Math.max(thickness * 2, 4)}px`, 
                            height: `${Math.max(thickness * 2, 4)}px`,
                            minWidth: `${Math.max(thickness * 2, 4)}px`,
                            minHeight: `${Math.max(thickness * 2, 4)}px`,
                            borderRadius: '50%',
                            backgroundColor: penThickness === thickness ? '#8b5cf6' : '#ffffff',
                            boxShadow: penThickness === thickness ? '0 0 8px rgba(139, 92, 246, 0.5)' : '0 1px 3px rgba(0, 0, 0, 0.2)',
                            aspectRatio: '1 / 1'
                          }}
                          title={`Size ${thickness}`}
                        />
                      ))}
                    </div>
                    {/* Thickness preview */}
                    <div className="flex justify-center items-center space-x-1">
                      <span className="text-xs text-gray-400">Selected:</span>
                      <div 
                        className="bg-white rounded-full shadow-sm"
                        style={{ 
                          width: `${Math.max(penThickness * 2, 4)}px`, 
                          height: `${Math.max(penThickness * 2, 4)}px` 
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Color Selection */}
                  <div className="mb-3">
                    <label className="block text-xs font-medium text-gray-200 mb-2">Colors</label>
                    
                    {/* Current Color Preview */}
                    <div className="flex items-center justify-center mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-300">Selected:</span>
                        <div 
                          className="w-6 h-6 rounded border border-white shadow-sm"
                          style={{ backgroundColor: penColor }}
                        ></div>
                        <span className="text-xs text-gray-400 font-mono">{penColor.toUpperCase()}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-1">
                      {[
                        '#ffffff', '#000000', '#ff0000', '#00ff00', 
                        '#0000ff', '#ffff00', '#ff00ff', '#00ffff'
                      ].map((color) => (
                        <button
                          key={color}
                          onClick={() => handlePenColorChange(color)}
                          className={`w-6 h-6 rounded border transition-all duration-200 hover:scale-110 ${
                            penColor === color ? 'border-white shadow-sm scale-110' : 'border-gray-600 hover:border-gray-400'
                          }`}
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Fade Controls */}
                  <div className="mb-3">
                    <label className="block text-xs font-medium text-gray-200 mb-2">Line Fade Effects</label>
                    
                    {/* Left Fade Slider */}
                    <div className="mb-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-300">Left Fade</span>
                        <span className="text-xs text-gray-400 font-mono">{penFadeLeft}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="90"
                        step="5"
                        value={penFadeLeft}
                        onChange={(e) => handlePenFadeLeftChange(parseInt(e.target.value))}
                        className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                        style={{
                          background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(penFadeLeft / 90) * 100}%, #374151 ${(penFadeLeft / 90) * 100}%, #374151 100%)`
                        }}
                      />
                    </div>
                    
                    {/* Right Fade Slider */}
                    <div className="mb-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-300">Right Fade</span>
                        <span className="text-xs text-gray-400 font-mono">{penFadeRight}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="90"
                        step="5"
                        value={penFadeRight}
                        onChange={(e) => handlePenFadeRightChange(parseInt(e.target.value))}
                        className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                        style={{
                          background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(penFadeRight / 90) * 100}%, #374151 ${(penFadeRight / 90) * 100}%, #374151 100%)`
                        }}
                      />
                    </div>
                    
                    {/* Fade Preview */}
                    <div className="flex justify-center">
                      <div className="w-full h-2 bg-gray-700 rounded relative overflow-hidden">
                        <div 
                          className="absolute inset-0 rounded"
                          style={{
                            background: `linear-gradient(to right, 
                              ${penColor}00 0%, 
                              ${penColor}${Math.floor(penFadeLeft * 2.55).toString(16).padStart(2, '0')} ${penFadeLeft}%, 
                              ${penColor}FF ${Math.max(penFadeLeft, 100 - penFadeRight)}%, 
                              ${penColor}${Math.floor(penFadeRight * 2.55).toString(16).padStart(2, '0')} ${100 - penFadeRight}%, 
                              ${penColor}00 100%)`
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-600">
                    <button
                      onClick={handleClearDrawing}
                      disabled={isAnimating}
                      className="px-2 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Clear All
                    </button>
                    <div className="text-xs text-gray-300 text-center">
                      <div className="font-medium">Ready to draw!</div>
                      <div className="text-xs text-gray-400">Hold mouse button and drag</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Shapes Menu */}
              {showShapesMenu && (
                <div className="shapes-menu-container fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-800 rounded-xl border border-gray-700 shadow-2xl p-3 w-48 z-[9999]">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-white">Shapes</h3>
                    <button
                      onClick={handleToggleShapes}
                      disabled={isAnimating}
                      className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Close shapes menu"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    {/* Triangle */}
                    <button
                      onClick={() => handleShapeSelect('triangle')}
                      className={`w-full flex items-center space-x-2 p-2 rounded-lg transition-colors ${
                        selectedShape === 'triangle' 
                          ? 'bg-purple-600 text-white' 
                          : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2L22 20H2L12 2Z" />
                      </svg>
                      <span className="text-xs font-medium">Triangle</span>
                    </button>

                    {/* Circle */}
                    <button
                      onClick={() => handleShapeSelect('circle')}
                      className={`w-full flex items-center space-x-2 p-2 rounded-lg transition-colors ${
                        selectedShape === 'circle' 
                          ? 'bg-purple-600 text-white' 
                          : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="8" strokeWidth="2" />
                      </svg>
                      <span className="text-xs font-medium">Circle</span>
                    </button>

                    {/* Square */}
                    <button
                      onClick={() => handleShapeSelect('square')}
                      className={`w-full flex items-center space-x-2 p-2 rounded-lg transition-colors ${
                        selectedShape === 'square' 
                          ? 'bg-purple-600 text-white' 
                          : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <rect x="3" y="3" width="18" height="18" strokeWidth="2" />
                      </svg>
                      <span className="text-xs font-medium">Square</span>
                    </button>
                  </div>

                  <div className="mt-3 pt-2 border-t border-gray-600">
                    <div className="text-xs text-gray-300 text-center">
                      <div className="font-medium">Click to place shape</div>
                      <div className="text-xs text-gray-400">Click on canvas to draw</div>
                    </div>
                  </div>
                </div>
              )}


              
              <div className="space-y-2">
                {/* Color items */}
                {showDeletedColors && meshPoints.map((item, index) => (
                  <div 
                    key={item.id} 
                    draggable={!isAnimating}
                    onDragStart={isAnimating ? undefined : (e) => handleColorDragStart(e, item.id)}
                    onDragOver={isAnimating ? undefined : (e) => handleColorDragOver(e, index)}
                    onDragLeave={isAnimating ? undefined : handleColorDragLeave}
                    onDrop={isAnimating ? undefined : (e) => handleColorDrop(e, index)}
                    onDragEnd={isAnimating ? undefined : handleColorDragEnd}
                    className={`flex items-center space-x-3 p-2 rounded-lg ${isAnimating ? 'cursor-not-allowed' : 'cursor-move'} transition-all duration-200 ${
                      selectedColorId === item.id 
                        ? 'bg-gray-700 border-2 border-white' 
                        : 'bg-gray-700 hover:bg-gray-600 border-2 border-transparent'
                    } ${
                      draggedItemId === item.id 
                        ? 'opacity-50 scale-105 shadow-lg' 
                        : 'opacity-100 scale-100'
                    } ${
                      dragOverIndex === index && draggedItemId !== item.id
                        ? 'border-blue-400 bg-gray-600' 
                        : ''
                    }`}
                    onClick={(e) => {
                      // Don't select row if we're in the middle of dragging or animating
                      if (!draggedItemId && !isAnimating) {
                        handleRowSelect(item.id);
                      }
                    }}
                  >
                    <div className="flex items-center">
                      <div className="relative flex items-center space-x-2">
                        <div 
                          className="w-6 h-6 rounded border border-gray-600 cursor-default transition-colors"
                          style={{ 
                            backgroundColor: item.color
                          }}
                          title="Color display only"
                        ></div>
                        {/* Eye Dropper Button - moved close to color swatch */}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleColorSwatchClick(item.id);
                        }}
                        className="text-gray-400 hover:text-blue-400 transition-colors"
                        title="Open color picker"
                      >
                        <Pipette className="w-4 h-4" />
                      </button>
                      </div>
                    </div>
                    <div className="flex-1"></div>
                    <div className="flex items-center space-x-1">

                      {/* Copy Color Button */}
                      <button 
                        onClick={handleCopyColorClick}
                        className={`transition-colors ${selectedColorId ? 'text-gray-400 hover:text-blue-400' : 'text-gray-600 cursor-not-allowed'}`}
                        title={selectedColorId ? "Add new color with same color as selected" : "Select a color first to copy"}
                        disabled={!selectedColorId}
                      >
                        <Copy className="w-4 h-4" />
                      </button>

                      {/* Texture Type Buttons - Always visible */}
                      <div className="flex items-center space-x-1">
                        {/* Linear Button */}
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTextureTypeChange(item.id, 'linear');
                          }}
                          className={`transition-colors ${
                            item.textureType === 'linear'
                              ? 'text-green-400 hover:text-green-300' 
                              : 'text-gray-400 hover:text-green-400'
                          }`}
                          title="Linear texture"
                        >
                          <PaintRoller className="w-4 h-4" />
                        </button>

                        {/* Radial Button */}
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTextureTypeChange(item.id, 'radial');
                          }}
                          className={`transition-colors ${
                            item.textureType === 'radial'
                              ? 'text-green-400 hover:text-green-300' 
                              : 'text-gray-400 hover:text-green-400'
                          }`}
                          title="Radial texture"
                        >
                          <FireExtinguisher className="w-4 h-4" />
                        </button>

                        {/* Circular Button */}
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTextureTypeChange(item.id, 'circular');
                          }}
                          className={`transition-colors ${
                            item.textureType === 'circular'
                              ? 'text-green-400 hover:text-green-300' 
                              : 'text-gray-400 hover:text-green-400'
                          }`}
                          title="Circular texture"
                        >
                          <CircleDashed className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Hide Color Button */}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleHideColor(item.id);
                        }}
                        className={`transition-colors ${
                          item.hideColor ?? false
                            ? 'text-orange-400 hover:text-orange-300' 
                            : 'text-gray-400 hover:text-orange-400'
                        }`}
                        title={item.hideColor ?? false ? "Show color" : "Hide color"}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.hideColor ?? false ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" : "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"} />
                        </svg>
                      </button>

                      {/* Hide Balls Button */}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleHideBalls(item.id);
                        }}
                        className={`transition-colors ${
                          item.hideBalls ?? false
                            ? 'text-red-400 hover:text-red-300' 
                            : 'text-gray-400 hover:text-blue-400'
                        }`}
                        title={item.hideBalls ?? false ? "Show control ball" : "Hide control ball"}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {item.hideBalls ?? false ? (
                            // Crossed out ball icon when hidden
                            <>
                              <circle cx="12" cy="12" r="4" strokeWidth={2} />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4l16 16" />
                            </>
                          ) : (
                            // Regular ball icon when visible
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 12v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                          )}
                        </svg>
                      </button>

                      {/* Remove Color Button */}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveColor(item.id);
                        }}
                        className="text-gray-400 hover:text-red-400 transition-colors"
                        title="Remove color"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Center Gradient Preview Area */}
        <div 
          className="flex-1 w-full h-full md:h-full overflow-hidden relative -mt-4 md:mt-0 min-h-0 gradient-preview-area" 
          style={{ backgroundColor: backgroundColor }}
          onClick={handleGradientClick}
        >
          <GradientGenerator 
            key={`main-${isAnimating ? currentKeyframe : 'static'}`}
            ref={gradientRef} 
            selectedColorId={selectedColorId || undefined} 
            backgroundColor={backgroundColor}
            meshPoints={getCurrentMeshPoints()}
            onMeshPointsChange={handleFullscreenMeshPointsChange}
            onPointSelect={handlePointSelect}
            gradientType={gradientType}
            gradientAngle={gradientAngle}
            enabledGradientTypes={enabledGradientTypes}
            isDrawingMode={isDrawingMode}
            penColor={penColor}
            penThickness={penThickness}
            penFadeLeft={penFadeLeft}
            penFadeRight={penFadeRight}
            drawingPaths={drawingPaths}
            onDrawingPathsChange={setDrawingPaths}
          />
          
          {/* Rendered Stars */}
          {placedStars.map((star) => {
            const starData = starTypes.find(s => s.id === star.starType);
            if (!starData) return null;
            const isSelected = selectedStarId === star.id;
            const isCurrentlyResizing = isResizing && isSelected;
            const displaySize = isCurrentlyResizing && tempStarSize !== null ? tempStarSize : star.size;
            
            return (
              <div key={star.id}>
                {/* Star Element */}
                <div
                  className="absolute cursor-pointer hover:opacity-80 transition-opacity"
                  style={{
                    left: `${star.x}%`,
                    top: `${star.y}%`,
                    transform: 'translate(-50%, -50%)',
                    color: 'white',
                    fontSize: `${displaySize * 24}px`,
                    zIndex: isSelected ? 20 : 10
                  }}
                  onClick={(e) => handleStarClick(e, star.id)}
                  title="Click to select star"
                >
                  {starData.svg}
                </div>
                
                 {/* Square Wireframe Controls */}
                 {isSelected && (
                   <div
                     className="absolute border-2 border-blue-400"
                     style={{
                       left: `${star.x}%`,
                       top: `${star.y}%`,
                       transform: 'translate(-50%, -50%)',
                       width: `${displaySize * 40}px`,
                       height: `${displaySize * 40}px`,
                       zIndex: 15,
                       pointerEvents: 'none'
                     }}
                   >
                     {/* Top-left corner node */}
                     <div
                       className="absolute w-3 h-3 bg-blue-400 border border-white cursor-nw-resize"
                       style={{
                         left: '-6px',
                         top: '-6px',
                         zIndex: 25,
                         pointerEvents: 'auto'
                       }}
                       onMouseDown={(e) => {
                         e.stopPropagation();
                         const startX = e.clientX;
                         const startY = e.clientY;
                         const startSize = star.size;
                         setIsResizing(true);
                         setTempStarSize(startSize);
                         
                         const handleMouseMove = (e: MouseEvent) => {
                           // Calculate distance from center to mouse position
                           const currentX = e.clientX;
                           const currentY = e.clientY;
                           const deltaX = currentX - startX;
                           const deltaY = currentY - startY;
                           
                           // Calculate scale factor based on distance from start point
                           const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                           const scaleFactor = 1 + (distance / 100); // Adjust sensitivity
                           const newSize = Math.max(0.1, Math.min(3, startSize * scaleFactor));
                           setTempStarSize(newSize);
                         };
                         
                         const handleMouseUp = () => {
                           const finalSize = tempStarSize || startSize;
                           handleStarSizeChange(star.id, finalSize);
                           setIsResizing(false);
                           setTempStarSize(null);
                           document.removeEventListener('mousemove', handleMouseMove);
                           document.removeEventListener('mouseup', handleMouseUp);
                         };
                         
                         document.addEventListener('mousemove', handleMouseMove);
                         document.addEventListener('mouseup', handleMouseUp);
                       }}
                       title="Drag to resize star"
                     />
                     
                     {/* Top-right corner node */}
                     <div
                       className="absolute w-3 h-3 bg-blue-400 border border-white cursor-ne-resize"
                       style={{
                         right: '-6px',
                         top: '-6px',
                         zIndex: 25,
                         pointerEvents: 'auto'
                       }}
                       onMouseDown={(e) => {
                         e.stopPropagation();
                         const startX = e.clientX;
                         const startY = e.clientY;
                         const startSize = star.size;
                         setIsResizing(true);
                         setTempStarSize(startSize);
                         
                         const handleMouseMove = (e: MouseEvent) => {
                           // Calculate distance from center to mouse position
                           const currentX = e.clientX;
                           const currentY = e.clientY;
                           const deltaX = currentX - startX;
                           const deltaY = currentY - startY;
                           
                           // Calculate scale factor based on distance from start point
                           const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                           const scaleFactor = 1 + (distance / 100); // Adjust sensitivity
                           const newSize = Math.max(0.1, Math.min(3, startSize * scaleFactor));
                           setTempStarSize(newSize);
                         };
                         
                         const handleMouseUp = () => {
                           const finalSize = tempStarSize || startSize;
                           handleStarSizeChange(star.id, finalSize);
                           setIsResizing(false);
                           setTempStarSize(null);
                           document.removeEventListener('mousemove', handleMouseMove);
                           document.removeEventListener('mouseup', handleMouseUp);
                         };
                         
                         document.addEventListener('mousemove', handleMouseMove);
                         document.addEventListener('mouseup', handleMouseUp);
                       }}
                       title="Drag to resize star"
                     />
                     
                     {/* Bottom-left corner node */}
                     <div
                       className="absolute w-3 h-3 bg-blue-400 border border-white cursor-sw-resize"
                       style={{
                         left: '-6px',
                         bottom: '-6px',
                         zIndex: 25,
                         pointerEvents: 'auto'
                       }}
                       onMouseDown={(e) => {
                         e.stopPropagation();
                         const startX = e.clientX;
                         const startY = e.clientY;
                         const startSize = star.size;
                         setIsResizing(true);
                         setTempStarSize(startSize);
                         
                         const handleMouseMove = (e: MouseEvent) => {
                           // Calculate distance from center to mouse position
                           const currentX = e.clientX;
                           const currentY = e.clientY;
                           const deltaX = currentX - startX;
                           const deltaY = currentY - startY;
                           
                           // Calculate scale factor based on distance from start point
                           const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                           const scaleFactor = 1 + (distance / 100); // Adjust sensitivity
                           const newSize = Math.max(0.1, Math.min(3, startSize * scaleFactor));
                           setTempStarSize(newSize);
                         };
                         
                         const handleMouseUp = () => {
                           const finalSize = tempStarSize || startSize;
                           handleStarSizeChange(star.id, finalSize);
                           setIsResizing(false);
                           setTempStarSize(null);
                           document.removeEventListener('mousemove', handleMouseMove);
                           document.removeEventListener('mouseup', handleMouseUp);
                         };
                         
                         document.addEventListener('mousemove', handleMouseMove);
                         document.addEventListener('mouseup', handleMouseUp);
                       }}
                       title="Drag to resize star"
                     />
                     
                     {/* Bottom-right corner node */}
                     <div
                       className="absolute w-3 h-3 bg-blue-400 border border-white cursor-se-resize"
                       style={{
                         right: '-6px',
                         bottom: '-6px',
                         zIndex: 25,
                         pointerEvents: 'auto'
                       }}
                       onMouseDown={(e) => {
                         e.stopPropagation();
                         const startX = e.clientX;
                         const startY = e.clientY;
                         const startSize = star.size;
                         setIsResizing(true);
                         setTempStarSize(startSize);
                         
                         const handleMouseMove = (e: MouseEvent) => {
                           // Calculate distance from center to mouse position
                           const currentX = e.clientX;
                           const currentY = e.clientY;
                           const deltaX = currentX - startX;
                           const deltaY = currentY - startY;
                           
                           // Calculate scale factor based on distance from start point
                           const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                           const scaleFactor = 1 + (distance / 100); // Adjust sensitivity
                           const newSize = Math.max(0.1, Math.min(3, startSize * scaleFactor));
                           setTempStarSize(newSize);
                         };
                         
                         const handleMouseUp = () => {
                           const finalSize = tempStarSize || startSize;
                           handleStarSizeChange(star.id, finalSize);
                           setIsResizing(false);
                           setTempStarSize(null);
                           document.removeEventListener('mousemove', handleMouseMove);
                           document.removeEventListener('mouseup', handleMouseUp);
                         };
                         
                         document.addEventListener('mousemove', handleMouseMove);
                         document.addEventListener('mouseup', handleMouseUp);
                       }}
                       title="Drag to resize star"
                     />
                     
                     {/* Delete button */}
                     <div
                       className="absolute w-6 h-6 bg-red-500 text-white rounded-full cursor-pointer flex items-center justify-center text-xs font-bold hover:bg-red-600 transition-colors"
                       style={{
                         right: '-12px',
                         top: '-12px',
                         zIndex: 25,
                         pointerEvents: 'auto'
                       }}
                       onClick={(e) => {
                         e.stopPropagation();
                         handleDeleteStar(star.id);
                       }}
                       title="Delete star"
                     >
                       ×
                     </div>
                   </div>
                 )}
              </div>
            );
          })}
          
          {/* Fullscreen Button */}
          {!isFullscreen && !isCodeModalOpen && (
            <div className="absolute top-4 right-4 z-[99999]">
              <button
                onClick={toggleFullscreen}
                className="bg-black/50 hover:bg-black/70 text-white p-3 rounded-lg transition-all duration-200 backdrop-blur-sm group shadow-lg hover:shadow-xl border border-white/10 hover:border-white/20"
                title="View fullscreen"
              >
              <svg 
                className="w-6 h-6 group-hover:scale-110 transition-transform" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" 
                />
              </svg>
            </button>
            </div>
          )}
        </div>

        {/* Right Settings Panel */}
        <div className="w-80 bg-gray-800 border-l border-gray-700 p-6 overflow-y-auto">
          <div className="space-y-6">
            {/* Button Grid */}
            <div className="grid grid-cols-2 gap-2">
              
              <button
                onClick={handleDownloadClick}
                disabled={isAnimating}
                className="flex items-center justify-center space-x-2 bg-gray-600 hover:bg-gray-500 text-white px-4 py-3 rounded-lg transition-colors w-32 h-12 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                <span className="text-xs">Download</span>
              </button>
              
              <div className="relative">
                <button
                  onClick={() => {
                    setIsShareDropdownOpen(!isShareDropdownOpen);
                    setIsShareArrowRotated(!isShareArrowRotated);
                  }}
                  className="flex items-center justify-center space-x-2 bg-gray-600 hover:bg-gray-500 text-white px-4 py-3 rounded-lg transition-colors w-32 h-12"
                  title="Save as options"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path>
                  </svg>
                  <span className="text-xs">Save As</span>
                  <svg className={`w-3 h-3 transition-transform ${isShareArrowRotated ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
                
                {isShareDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 w-40 bg-gray-700 rounded-lg shadow-lg border border-gray-600 z-50">
                    <button
                      onClick={handleShareFacebook}
                      className="w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-600 rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                      <span>PNG</span>
                    </button>
                  </div>
                )}
              </div>
              

              {/* Developer Dropdown - DISABLED */}
              <div className="relative" style={{display: 'none'}}>
                <button
                  onClick={() => {
                    setIsDeveloperDropdownOpen(!isDeveloperDropdownOpen);
                    setIsDeveloperArrowRotated(!isDeveloperArrowRotated);
                  }}
                  className="flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-500 text-white px-4 py-3 rounded-lg transition-colors w-32 h-12"
                  title="Developer export options"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
                  </svg>
                  <span className="text-xs">Developer</span>
                  <svg className={`w-3 h-3 transition-transform ${isDeveloperArrowRotated ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
                
                {isDeveloperDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 w-40 bg-gray-700 rounded-lg shadow-lg border border-gray-600 z-50">
                    <button
                      onClick={handleSaveAsJSON}
                      className="w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-600 rounded-t-lg transition-colors flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                      <span>.JSON</span>
                    </button>
                    <button
                      onClick={handleSaveAsGIF}
                      className="w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-600 transition-colors flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                      <span>.GIF</span>
                    </button>
                    <button
                      onClick={handleSaveAsMP4Dev}
                      className="w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-600 transition-colors flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                      </svg>
                      <span>.MP4</span>
                    </button>
                    <button
                      onClick={handleSaveAsWEBM}
                      className="w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-600 transition-colors flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                      </svg>
                      <span>.WEBM</span>
                    </button>
                    <button
                      onClick={handleSaveAsPNG}
                      className="w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-600 transition-colors flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                      <span>.PNG</span>
                    </button>
                    <button
                      onClick={handleSaveAsSVG}
                      className="w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-600 rounded-b-lg transition-colors flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                      <span>.SVG</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Background Color */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Background color</label>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div 
                    className="w-8 h-8 rounded border border-gray-600 cursor-pointer hover:border-gray-400 transition-colors"
                    style={{ backgroundColor: backgroundColor }}
                    onClick={handleBackgroundColorSquareClick}
                    title="Click to change background color"
                  ></div>
                </div>
                <span className="text-sm text-gray-300">{backgroundColor}</span>
              </div>
            </div>

            
            
            {/* Gradient Type */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Gradient Types</label>
              <div className="flex space-x-2">
                {/* Linear Gradient Button */}
                <button
                  onClick={() => handleGradientTypeToggle('linear')}
                  className={`flex items-center justify-center w-10 h-10 rounded-lg border-2 transition-all duration-200 ${
                    enabledGradientTypes.linear
                      ? 'bg-blue-500 border-blue-400 text-white shadow-lg'
                      : 'bg-gray-700 border-gray-600 text-gray-400 hover:border-gray-500 hover:text-gray-300'
                  }`}
                  title="Linear Gradient"
                >
                  <PaintRoller className="w-5 h-5" />
                </button>

                {/* Circular Gradient Button */}
                <button
                  onClick={() => handleGradientTypeToggle('circular')}
                  className={`flex items-center justify-center w-10 h-10 rounded-lg border-2 transition-all duration-200 ${
                    enabledGradientTypes.circular
                      ? 'bg-green-500 border-green-400 text-white shadow-lg'
                      : 'bg-gray-700 border-gray-600 text-gray-400 hover:border-gray-500 hover:text-gray-300'
                  }`}
                  title="Circular Gradient"
                >
                  <CircleDashed className="w-5 h-5" />
                </button>

                {/* Radial Gradient Button */}
                <button
                  onClick={() => handleGradientTypeToggle('radial')}
                  className={`flex items-center justify-center w-10 h-10 rounded-lg border-2 transition-all duration-200 ${
                    enabledGradientTypes.radial
                      ? 'bg-red-500 border-red-400 text-white shadow-lg'
                      : 'bg-gray-700 border-gray-600 text-gray-400 hover:border-gray-500 hover:text-gray-300'
                  }`}
                  title="Radial Gradient"
                >
                  <FireExtinguisher className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {enabledGradientTypes.linear || enabledGradientTypes.radial || enabledGradientTypes.circular
                  ? 'Multiple gradient types enabled - they will work together'
                  : 'No gradient types selected - individual textures will be used'}
              </p>
            </div>
            
            {/* Angle */}
            <div>
              <MuiAngleSlider
                value={gradientAngle}
                onChange={(value) => {
                  saveToHistory(); // Save current state before making changes
                  setGradientAngle(value);
                }}
                min={0}
                max={360}
                label="Angle (degrees)"
                showValue={true}
              />
            </div>
            
            
            
            {/* Blur */}
            <div>
              <MuiBlurSlider
                value={getSelectedColorBlur()}
                onChange={handleBlurChange}
                min={0}
                max={200}
                disabled={!selectedColorId}
                label={selectedColorId ? "Blur Selected Color" : "Select a color to blur"}
                showValue={true}
              />
              {!selectedColorId && (
                <p className="text-xs text-gray-500 mt-1">Click on a color above to select it for blur effects</p>
              )}
            </div>

            
            
            
          </div>
        </div>
      </div>

      {/* Bottom Elements */}
      <div className="fixed bottom-0 left-0 right-0">
        
        {/* Cookie Consent Banner */}
        <CookieBanner />
      </div>

      {/* Code Modal */}
      <CodeModal
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
        cssCode={generatedCSS}
        generateCSS={(format) => gradientRef.current?.generateCSS(format) || ''}
        hasAnimation={isAnimating && keyframesLengthRef.current > 0}
      />

      {/* Export Modal */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Export Gradient</h2>
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <GradientExporter cssString={generatedCSS} />
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 animate-in fade-in duration-300">
          {/* Close Button */}
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={toggleFullscreen}
              className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-lg transition-all duration-200 backdrop-blur-sm group"
              title="Exit fullscreen"
            >
              <svg 
                className="w-6 h-6 group-hover:scale-110 transition-transform" 
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
          </div>
          

          {/* Fullscreen Gradient Display */}
          <div className="w-full h-full" style={{ backgroundColor: backgroundColor }}>
            <GradientGenerator 
              key={`fullscreen-${fullscreenKey}-${isAnimating ? currentKeyframe : 'static'}`}
              backgroundColor={backgroundColor}
              hideControls={true}
              meshPoints={getCurrentMeshPoints()}
              onPointSelect={handlePointSelect}
              gradientType={gradientType}
              gradientAngle={gradientAngle}
              enabledGradientTypes={enabledGradientTypes}
              isDrawingMode={isDrawingMode}
              penColor={penColor}
              penThickness={penThickness}
              penFadeLeft={penFadeLeft}
              penFadeRight={penFadeRight}
              drawingPaths={drawingPaths}
              onDrawingPathsChange={setDrawingPaths}
              selectedShape={selectedShape}
              uploadedImages={uploadedImages}
              selectedImageId={selectedImageId}
              onImageSelect={handleImageSelect}
              onImageUpdate={handleImageUpdate}
              onImageDelete={handleImageDelete}
            />
          </div>
          
        </div>
      )}

      {/* Dragged Color Swatches - Renders outside containers for unrestricted movement */}
      {showDeletedColors && !hideAllColors && meshPoints.map(item => (
        colorSwatchPositions[item.id] && (
          <div 
            key={`dragged-${item.id}`}
            className="fixed w-6 h-6 rounded border border-gray-600 cursor-default transition-colors z-[2147483647]"
            style={{ 
              backgroundColor: item.color,
              left: `${colorSwatchPositions[item.id].x}px`,
              top: `${colorSwatchPositions[item.id].y}px`,
              transform: 'translate(-50%, -50%)'
            }}
            title="Color display only"
          />
        )
      ))}

      {/* SketchColorPicker - Floating Window with Maximum Z-Index */}
      {colorPickerOpen && selectedColorId && (
        <div style={{ zIndex: 2147483647 }}>
          <SketchColorPicker
            color={meshPoints.find(point => point.id === selectedColorId)?.color || '#000000'}
            onChange={handleColorChange}
            onClose={handleCloseColorPicker}
          />
        </div>
      )}


      {/* Linear Fades Popup - Floating Over Entire Page */}
      {linearManualDropdownOpen && !isAnimating && (
        <div 
          className={`fixed bg-gray-800 border border-gray-600 rounded-lg shadow-xl min-w-[280px] ${dragState.isDragging && dragState.targetId === linearManualDropdownOpen ? 'cursor-grabbing' : 'cursor-auto'}`}
          style={{
            zIndex: 2147483647,
            pointerEvents: 'auto',
            ...(dropdownPositions[linearManualDropdownOpen] ? {
              left: `${dropdownPositions[linearManualDropdownOpen].x}px`,
              top: `${dropdownPositions[linearManualDropdownOpen].y}px`,
              transform: 'none',
            } : {
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
            })
          }}
        >
          <div 
            className="flex items-center justify-between mb-3 p-4 pb-2 cursor-grab active:cursor-grabbing border-b border-gray-700"
            onMouseDown={(e) => {
              e.preventDefault();
              handleDragStart(e, linearManualDropdownOpen);
            }}
            onDoubleClick={() => handleResetPosition(linearManualDropdownOpen)}
            title="Drag to move, double-click to reset position"
          >
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2zM3 16a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z"/>
              </svg>
              <h4 className="text-sm font-medium text-gray-300 select-none">
                Linear Fades {meshPoints.find(point => point.id === linearManualDropdownOpen)?.color || '#000000'}
              </h4>
            </div>
            <div className="flex items-center space-x-1">
              {dropdownPositions[linearManualDropdownOpen] && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleResetPosition(linearManualDropdownOpen);
                  }}
                  className="text-gray-400 hover:text-blue-400 transition-colors"
                  title="Reset position"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              )}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleCloseLinearManualDropdown();
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <div className="px-4 pb-4">
            <div className="space-y-3">
              <MuiBlurSlider
                value={meshPoints.find(point => point.id === linearManualDropdownOpen)?.individualFadeLeft || 0}
                onChange={(value) => handleIndividualFadeChange(linearManualDropdownOpen, 'left', value)}
                min={0}
                max={1000}
                label="Fade Left"
                showValue={true}
              />
              
              <MuiBlurSlider
                value={meshPoints.find(point => point.id === linearManualDropdownOpen)?.individualFadeRight || 0}
                onChange={(value) => handleIndividualFadeChange(linearManualDropdownOpen, 'right', value)}
                min={0}
                max={1000}
                label="Fade Right"
                showValue={true}
              />
              
              <MuiBlurSlider
                value={meshPoints.find(point => point.id === linearManualDropdownOpen)?.individualFadeTop || 0}
                onChange={(value) => handleIndividualFadeChange(linearManualDropdownOpen, 'top', value)}
                min={0}
                max={1000}
                label="Fade Top"
                showValue={true}
              />
              
              <MuiBlurSlider
                value={meshPoints.find(point => point.id === linearManualDropdownOpen)?.individualFadeBottom || 0}
                onChange={(value) => handleIndividualFadeChange(linearManualDropdownOpen, 'bottom', value)}
                min={0}
                max={1000}
                label="Fade Bottom"
                showValue={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* Hidden file input for image upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        style={{ display: 'none' }}
      />

    </div>
  );
}
