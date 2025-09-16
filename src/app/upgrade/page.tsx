'use client';

import { useState, useMemo } from 'react';
import { ArrowLeft, Check, Star, Download, FileText, Palette, Smartphone, Monitor, Zap, Heart, Shield } from 'lucide-react';
import Link from 'next/link';

export default function UpgradePage() {
  const [isYearly, setIsYearly] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'pro'>('pro');

  const features = useMemo(() => [
    { icon: <Download className="w-5 h-5" />, text: "Export colors as images (.jpeg, .png, .svg)" },
    { icon: <Palette className="w-5 h-5" />, text: "Up to 3 collections" },
    { icon: <Star className="w-5 h-5" />, text: "Create and save unlimited colors" },
    { icon: <Heart className="w-5 h-5" />, text: "Like your favorite colors" }
  ], []);

  const proFeatures = useMemo(() => [
    { icon: <Check className="w-5 h-5" />, text: "Everything from free" },
    { icon: <Zap className="w-5 h-5" />, text: "AI features", isNew: true },
    { icon: <FileText className="w-5 h-5" />, text: "Export Branding Kit colors pdf file.", isNew: true },
    { icon: <Monitor className="w-5 h-5" />, text: "Export Dark/Light themes to .css, and .csv", isNew: true },
    { icon: <Smartphone className="w-5 h-5" />, text: "App color tokens (Android, Flutter, Swift, .NET MAUI)", isNew: true },
    { icon: <Download className="w-5 h-5" />, text: "Gradients/Palettes wallpaper (4k, ultrawide, widescreen, iPhone, Pixel, etc.)", isNew: true },
    { icon: <Palette className="w-5 h-5" />, text: "Unlimited collections" },
    { icon: <FileText className="w-5 h-5" />, text: "Export to multiple formats (.json, .css, .csv)" },
    { icon: <Download className="w-5 h-5" />, text: "Export colors as images (.jpeg, .png, .svg)" },
    { icon: <Shield className="w-5 h-5" />, text: "Remove ads" }
  ], []);


  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-black border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-12">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <ArrowLeft className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-semibold text-white">Gradient Master</span>
              </Link>
            </div>
            <nav className="hidden md:flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white text-sm">Discover</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm">Palettes</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm">Gradients</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm">Tools</a>
            </nav>
            <div className="flex items-center space-x-3">
              <button className="text-gray-400 hover:text-white text-sm">Sign in</button>
              <button className="bg-purple-600 text-white px-3 py-1.5 rounded-lg hover:bg-purple-700 text-sm">
                Create account
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-black py-8">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h1 className="text-3xl font-bold text-white mb-4">
            Simple pricing, start for free and upgrade anytime.
          </h1>
          <p className="text-lg text-gray-400 mb-4">
            Get access to all the new features of Gradient Master. Cancel anytime. Price in USD.
          </p>
          <div className="mb-6">
            <p className="text-sm text-gray-300">
              Currently selected: <span className="font-semibold text-purple-400">
                {selectedPlan === 'free' ? 'Free Plan' : 'Pro Plan'}
              </span>
            </p>
          </div>
          
          {/* Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <span className={`text-sm ${!isYearly ? 'text-white font-semibold' : 'text-gray-500'}`}>
              Monthly
            </span>
            <button
              onClick={() => {
                setIsYearly(!isYearly);
                setSelectedPlan('pro');
              }}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                isYearly ? 'bg-purple-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                  isYearly ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm ${isYearly ? 'text-white font-semibold' : 'text-gray-500'}`}>
              Yearly
            </span>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-8 bg-black">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Basic Plan */}
            <div className="relative">
              {/* Background card with blur effect */}
              <div 
                className={`bg-gray-900 rounded-xl shadow-lg p-6 border-2 cursor-pointer transition-all ${
                  selectedPlan === 'free' 
                    ? 'border-purple-500' 
                    : 'border-gray-800 hover:border-gray-600'
                }`}
                style={selectedPlan === 'free' ? {
                  backgroundColor: 'rgba(147, 51, 234, 0.1)',
                  boxShadow: '0 0 30px rgba(147, 51, 234, 0.4)',
                  filter: 'blur(1px)'
                } : {}}
                onClick={() => setSelectedPlan('free')}
              >
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center mb-2">
                    <h3 className="text-xl font-bold text-white">Basic</h3>
                    {selectedPlan === 'free' && (
                      <Check className="w-5 h-5 text-purple-500 ml-2" />
                    )}
                  </div>
                  <div className="text-3xl font-bold text-white mb-2">FREE</div>
                  <div className="text-gray-400 text-sm">Forever</div>
                </div>
                
                <p className="text-gray-400 mb-6 text-center text-sm">
                  For developers, designers, and color lovers building simple apps or projects.
                </p>
                
                <button 
                  className={`w-full py-2 rounded-lg font-semibold transition-colors mb-6 text-sm ${
                    selectedPlan === 'free'
                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                      : 'bg-gray-800 text-white hover:bg-gray-700'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPlan('free');
                  }}
                >
                  {selectedPlan === 'free' ? 'Selected' : 'Get started for free'}
                </button>
                
                <div className="space-y-3">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="text-green-500 text-sm">{feature.icon}</div>
                      <span className="text-gray-300 text-sm">{feature.text}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Clear overlay card when selected */}
              {selectedPlan === 'free' && (
                <div 
                  className="absolute inset-0 bg-gray-900 rounded-xl p-6 border-2 border-purple-500 cursor-pointer"
                  style={{
                    textRendering: 'optimizeLegibility',
                    WebkitFontSmoothing: 'antialiased',
                    MozOsxFontSmoothing: 'grayscale',
                    filter: 'none',
                    backdropFilter: 'none'
                  }}
                  onClick={() => setSelectedPlan('free')}
                >
                  <div className="text-center mb-6">
                    <div className="flex items-center justify-center mb-2">
                      <h3 className="text-xl font-bold text-white">Basic</h3>
                      <Check className="w-5 h-5 text-purple-500 ml-2" />
                    </div>
                    <div className="text-3xl font-bold text-white mb-2">FREE</div>
                    <div className="text-gray-400 text-sm">Forever</div>
                  </div>
                  
                  <p className="text-gray-400 mb-6 text-center text-sm">
                    For developers, designers, and color lovers building simple apps or projects.
                  </p>
                  
                  <button 
                    className="w-full py-2 rounded-lg font-semibold transition-colors mb-6 text-sm bg-purple-600 text-white hover:bg-purple-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPlan('free');
                    }}
                  >
                    Selected
                  </button>
                  
                  <div className="space-y-3">
                    {features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="text-green-500 text-sm">{feature.icon}</div>
                        <span className="text-gray-300 text-sm">{feature.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Pro Plan */}
            <div className="relative">
              {/* Background card with blur effect */}
              <div 
                className={`bg-gray-900 rounded-xl shadow-lg p-6 border-2 relative cursor-pointer transition-all ${
                  selectedPlan === 'pro' 
                    ? 'border-purple-500' 
                    : 'border-gray-800 hover:border-gray-600'
                }`}
                style={selectedPlan === 'pro' ? {
                  backgroundColor: 'rgba(147, 51, 234, 0.1)',
                  boxShadow: '0 0 30px rgba(147, 51, 234, 0.4)',
                  filter: 'blur(1px)'
                } : {}}
                onClick={() => setSelectedPlan('pro')}
              >
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    Most Popular
                  </span>
                </div>
                
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center mb-2">
                    <h3 className="text-xl font-bold text-white">Pro</h3>
                    {selectedPlan === 'pro' && (
                      <Check className="w-5 h-5 text-purple-500 ml-2" />
                    )}
                  </div>
                  <div className="text-3xl font-bold text-white mb-2">
                    ${isYearly ? '3.33' : '5'}
                  </div>
                  <div className="text-gray-400 text-sm">/{isYearly ? 'month' : 'month'}</div>
                </div>
                
                <p className="text-gray-400 mb-6 text-center text-sm">
                  For professionals and teams who need advanced features and unlimited access.
                </p>
                
                <button 
                  className={`w-full py-2 rounded-lg font-semibold transition-colors mb-6 text-sm ${
                    selectedPlan === 'pro'
                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                      : 'bg-gray-800 text-white hover:bg-gray-700'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPlan('pro');
                  }}
                >
                  {selectedPlan === 'pro' ? 'Selected' : 'Get PRO'}
                </button>
                
                <div className="space-y-3">
                  {proFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="text-green-500 text-sm">{feature.icon}</div>
                      <span className="text-gray-300 text-sm flex items-center">
                        {feature.text}
                        {feature.isNew && (
                          <span className="ml-2 bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                            New
                          </span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Clear overlay card when selected */}
              {selectedPlan === 'pro' && (
                <div 
                  className="absolute inset-0 bg-gray-900 rounded-xl p-6 border-2 border-purple-500 cursor-pointer"
                  style={{
                    textRendering: 'optimizeLegibility',
                    WebkitFontSmoothing: 'antialiased',
                    MozOsxFontSmoothing: 'grayscale',
                    filter: 'none',
                    backdropFilter: 'none'
                  }}
                  onClick={() => setSelectedPlan('pro')}
                >
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      Most Popular
                    </span>
                  </div>
                  
                  <div className="text-center mb-6">
                    <div className="flex items-center justify-center mb-2">
                      <h3 className="text-xl font-bold text-white">Pro</h3>
                      <Check className="w-5 h-5 text-purple-500 ml-2" />
                    </div>
                    <div className="text-3xl font-bold text-white mb-2">
                      ${isYearly ? '3.33' : '5'}
                    </div>
                    <div className="text-gray-400 text-sm">/{isYearly ? 'month' : 'month'}</div>
                  </div>
                  
                  <p className="text-gray-400 mb-6 text-center text-sm">
                    For professionals and teams who need advanced features and unlimited access.
                  </p>
                  
                  <button 
                    className="w-full py-2 rounded-lg font-semibold transition-colors mb-6 text-sm bg-purple-600 text-white hover:bg-purple-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPlan('pro');
                    }}
                  >
                    Selected
                  </button>
                  
                  <div className="space-y-3">
                    {proFeatures.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="text-green-500 text-sm">{feature.icon}</div>
                        <span className="text-gray-300 text-sm flex items-center">
                          {feature.text}
                          {feature.isNew && (
                            <span className="ml-2 bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                              New
                            </span>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
