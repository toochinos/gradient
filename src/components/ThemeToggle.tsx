'use client';

import { useState, useEffect } from 'react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    // Check for saved theme or default to light
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    
    setTheme(initialTheme);
    updateTheme(initialTheme);
  }, []);

  const updateTheme = (newTheme: string) => {
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    updateTheme(newTheme);
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="flex bg-white dark:bg-gray-800 rounded-full p-1 shadow-lg border border-gray-200 dark:border-gray-600">
        <button
          onClick={toggleTheme}
          className={`flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium transition-all ${
            theme === 'light'
              ? 'bg-white text-gray-800 shadow-sm border border-gray-300'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <span>☀️</span>
          <span>Day</span>
        </button>
        <button
          onClick={toggleTheme}
          className={`flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium transition-all ${
            theme === 'dark'
              ? 'bg-blue-900 text-blue-100 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <span>🌙</span>
          <span>Night</span>
        </button>
      </div>
    </div>
  );
}