'use client';

import { useState } from 'react';

interface CSSOutputProps {
  css: string;
  generateCSS: (format: 'html' | 'react' | 'css') => string;
}

export default function CSSOutput({ css, generateCSS }: CSSOutputProps) {
  const [activeFormat, setActiveFormat] = useState<'html' | 'react' | 'css'>('html');
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  const formats = [
    { key: 'html', label: 'HTML + CSS', description: 'Complete HTML page (works everywhere)' },
    { key: 'react', label: 'React Component', description: 'For lovable.dev, bolt.new, Next.js' },
    { key: 'css', label: 'CSS Only', description: 'Just the CSS styles' }
  ] as const;

  const copyToClipboard = async (format: 'html' | 'react' | 'css') => {
    try {
      const code = format === 'css' ? css : generateCSS(format);
      await navigator.clipboard.writeText(code);
      setCopiedFormat(format);
      setTimeout(() => setCopiedFormat(null), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const getCurrentCode = () => {
    if (activeFormat === 'css') return css;
    return generateCSS(activeFormat);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Generated Code</h2>
        <div className="flex gap-2">
          {formats.map((format) => (
            <button
              key={format.key}
              onClick={() => copyToClipboard(format.key)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                copiedFormat === format.key
                  ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                  : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800'
              }`}
              title={format.description}
            >
              {copiedFormat === format.key ? 'Copied!' : `Copy ${format.label}`}
            </button>
          ))}
        </div>
      </div>
      
      {/* Format selector */}
      <div className="mb-4">
        <div className="flex gap-2 mb-2">
          {formats.map((format) => (
            <button
              key={format.key}
              onClick={() => setActiveFormat(format.key)}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeFormat === format.key
                  ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {format.label}
            </button>
          ))}
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {formats.find(f => f.key === activeFormat)?.description}
        </p>
      </div>

      <div className="bg-white dark:bg-gray-900 p-4 rounded-md border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto">
        <pre className="text-sm text-gray-800 dark:text-gray-200 font-mono whitespace-pre-wrap">
          {getCurrentCode()}
        </pre>
      </div>
    </div>
  );
}