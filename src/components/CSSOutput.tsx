'use client';

import { useState } from 'react';

interface CSSOutputProps {
  css: string;
}

export default function CSSOutput({ css }: CSSOutputProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(css);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">CSS</h2>
        <button
          onClick={copyToClipboard}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            copied
              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
              : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800'
          }`}
        >
          {copied ? 'Copied!' : 'Copy CSS'}
        </button>
      </div>
      <div className="bg-white dark:bg-gray-900 p-4 rounded-md border border-gray-200 dark:border-gray-700 max-h-64 overflow-y-auto">
        <pre className="text-sm text-gray-800 dark:text-gray-200 font-mono whitespace-pre-wrap">
          {css}
        </pre>
      </div>
    </div>
  );
}