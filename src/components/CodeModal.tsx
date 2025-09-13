'use client';

import { useState } from 'react';

interface CodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  cssCode: string;
  hasAnimation?: boolean;
}

export default function CodeModal({ isOpen, onClose, cssCode, hasAnimation = false }: CodeModalProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(cssCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg border border-gray-700 max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-white">CSS Code</h2>
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
        <div className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <p className="text-sm text-gray-300">Copy this CSS code to use in your project:</p>
              {hasAnimation && (
                <div className="flex items-center space-x-1 px-2 py-1 bg-purple-600 rounded text-xs text-white">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z" />
                  </svg>
                  <span>Animated</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-gray-600 hover:bg-gray-700 text-white"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Back to Previous UI</span>
              </button>
              <button
                onClick={copyToClipboard}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  copied
                    ? 'bg-green-600 text-white'
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>{copied ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>
          </div>

          {/* Code Block */}
          <div className="bg-gray-900 rounded-lg border border-gray-700 p-4 max-h-96 overflow-y-auto">
            <pre className="text-sm text-gray-200 font-mono whitespace-pre-wrap">
              <code>{cssCode}</code>
            </pre>
          </div>

          {/* Usage Instructions */}
          <div className="mt-4 p-4 bg-gray-700 rounded-lg">
            <h3 className="text-sm font-medium text-white mb-2">How to use:</h3>
            <ol className="text-xs text-gray-300 space-y-1">
              <li>1. Copy the CSS code above</li>
              <li>2. Add it to your stylesheet or style tag</li>
              <li>3. Apply the class to any HTML element</li>
              <li>4. Adjust the dimensions as needed</li>
              {hasAnimation && (
                <li className="text-purple-300 font-medium">5. Animation will play automatically (10-second loop)</li>
              )}
            </ol>
            {hasAnimation && (
              <div className="mt-3 p-3 bg-purple-900/30 border border-purple-500/30 rounded text-xs">
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