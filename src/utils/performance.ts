// Performance monitoring and optimization utilities

export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  isLowEndDevice: boolean;
  recommendedSettings: {
    maxParticles: number;
    targetFPS: number;
    enableComplexShaders: boolean;
  };
}

class PerformanceMonitor {
  private frameCount = 0;
  private lastTime = 0;
  private fpsHistory: number[] = [];
  private frameTimeHistory: number[] = [];
  private isLowEndDevice: boolean = false;

  constructor() {
    this.detectDeviceCapabilities();
  }

  private detectDeviceCapabilities(): void {
    // Skip detection during server-side rendering
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      this.isLowEndDevice = false; // Default to high-end for SSR
      return;
    }

    // Detect low-end devices based on various factors
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext | null;
    
    if (!gl) {
      this.isLowEndDevice = true;
      return;
    }

    // Check WebGL capabilities
    const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    const maxVertexAttribs = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);
    const maxVaryingVectors = gl.getParameter(gl.MAX_VARYING_VECTORS);
    
    // Check device memory (if available)
    const deviceMemory = (navigator as { deviceMemory?: number }).deviceMemory || 4;
    
    // Check CPU cores
    const cores = navigator.hardwareConcurrency || 4;
    
    // Determine if device is low-end
    this.isLowEndDevice = (
      maxTextureSize < 4096 ||
      maxVertexAttribs < 16 ||
      maxVaryingVectors < 8 ||
      deviceMemory < 4 ||
      cores < 4
    );
  }

  updateFrameTime(frameTime: number): void {
    this.frameTimeHistory.push(frameTime);
    if (this.frameTimeHistory.length > 60) {
      this.frameTimeHistory.shift();
    }
  }

  updateFPS(): void {
    const currentTime = performance.now();
    this.frameCount++;
    
    if (currentTime - this.lastTime >= 1000) {
      const fps = (this.frameCount * 1000) / (currentTime - this.lastTime);
      this.fpsHistory.push(fps);
      
      if (this.fpsHistory.length > 10) {
        this.fpsHistory.shift();
      }
      
      this.frameCount = 0;
      this.lastTime = currentTime;
    }
  }

  getMetrics(): PerformanceMetrics {
    const avgFPS = this.fpsHistory.length > 0 
      ? this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length 
      : 60;
    
    const avgFrameTime = this.frameTimeHistory.length > 0
      ? this.frameTimeHistory.reduce((a, b) => a + b, 0) / this.frameTimeHistory.length
      : 16.67;

    return {
      fps: Math.round(avgFPS),
      frameTime: Math.round(avgFrameTime * 100) / 100,
      isLowEndDevice: this.isLowEndDevice,
      recommendedSettings: {
        maxParticles: this.isLowEndDevice ? 200 : 500,
        targetFPS: this.isLowEndDevice ? 20 : 30,
        enableComplexShaders: !this.isLowEndDevice
      }
    };
  }

  shouldReduceQuality(): boolean {
    const metrics = this.getMetrics();
    return metrics.fps < 20 || metrics.frameTime > 50;
  }
}

export const performanceMonitor = new PerformanceMonitor();

// Utility function to get optimized settings
export function getOptimizedSettings(): PerformanceMetrics['recommendedSettings'] {
  return performanceMonitor.getMetrics().recommendedSettings;
}

// Utility function to check if we should enable effects
export function shouldEnableEffect(effectName: string): boolean {
  const metrics = performanceMonitor.getMetrics();
  
  if (metrics.isLowEndDevice) {
    // Only enable basic effects on low-end devices
    return ['StarField', 'BlobField'].includes(effectName);
  }
  
  return true;
}
