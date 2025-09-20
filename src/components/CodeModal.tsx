'use client';

import CSSOutput from './CSSOutput';

interface CodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  cssCode: string;
  generateCSS: (format: 'html' | 'react' | 'css') => string;
  hasAnimation?: boolean;
}

export default function CodeModal({ isOpen, onClose, cssCode, generateCSS, hasAnimation = false }: CodeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg border border-gray-700 max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Generated Code</h2>
              <p className="text-sm text-gray-400">Copy code for different platforms</p>
            </div>
            {hasAnimation && (
              <div className="flex items-center space-x-1 px-2 py-1 bg-purple-600 rounded text-xs text-white">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z" />
                </svg>
                <span>Animated</span>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <CSSOutput css={cssCode} generateCSS={generateCSS} />
          
          {/* Usage Instructions */}
          <div className="mt-6 p-4 bg-gray-700 rounded-lg">
            <h3 className="text-sm font-medium text-white mb-3">How to use:</h3>
            <div className="grid md:grid-cols-3 gap-4 text-xs text-gray-300">
              <div>
                <h4 className="font-medium text-white mb-2">🌐 HTML + CSS</h4>
                <ol className="space-y-1">
                  <li>• Complete HTML page</li>
                  <li>• Works in any browser</li>
                  <li>• Perfect for testing</li>
                </ol>
              </div>
              <div>
                <h4 className="font-medium text-white mb-2">⚛️ React Component</h4>
                <ol className="space-y-1">
                  <li>• For lovable.dev & bolt.new</li>
                  <li>• Next.js compatible</li>
                  <li>• Includes styled-jsx</li>
                </ol>
              </div>
              <div>
                <h4 className="font-medium text-white mb-2">🎨 CSS Only</h4>
                <ol className="space-y-1">
                  <li>• Just the styles</li>
                  <li>• Add to existing project</li>
                  <li>• Customize as needed</li>
                </ol>
              </div>
            </div>
            {hasAnimation && (
              <div className="mt-4 p-3 bg-purple-900/30 border border-purple-500/30 rounded text-xs">
                <p className="text-purple-200 font-medium mb-1">✨ Animation Included:</p>
                <p className="text-purple-300">This code includes CSS keyframe animations that will automatically animate your gradient colors in a smooth loop.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}