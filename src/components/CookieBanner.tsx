'use client';

import { useState, useEffect } from 'react';

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const cookiesAccepted = localStorage.getItem('cookiesAccepted');
    if (!cookiesAccepted) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookiesAccepted', 'true');
    setIsVisible(false);
  };

  const handlePolicyClick = () => {
    window.open('https://www.cookiepolicy.org/', '_blank');
  };

  if (!isVisible) return null;

  return (
    <div className="bg-black bg-opacity-80 backdrop-blur-sm border-t border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-300">
          We use cookies to make your experience better. To learn more, check out our policy.{' '}
          <button 
            onClick={handlePolicyClick}
            className="text-purple-400 hover:text-purple-300 transition-colors underline cursor-pointer"
          >
            Cookies Policy
          </button>
        </p>
        <button 
          onClick={handleAccept}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Accept
        </button>
      </div>
    </div>
  );
}