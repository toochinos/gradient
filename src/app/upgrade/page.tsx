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
            <div 
              className={`bg-gray-900 rounded-xl shadow-lg p-6 border-2 cursor-pointer transition-all ${
                selectedPlan === 'free' 
                  ? 'border-purple-500' 
                  : 'border-gray-800 hover:border-gray-600'
              }`}
              style={selectedPlan === 'free' ? {
                backgroundColor: 'rgba(147, 51, 234, 0.1)',
                boxShadow: `
                  0 0 20px rgba(147, 51, 234, 0.6),
                  0 0 40px rgba(147, 51, 234, 0.4),
                  0 0 60px rgba(147, 51, 234, 0.2)
                `
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

            {/* Pro Plan */}
            <div 
              className={`bg-gray-900 rounded-xl shadow-lg p-6 border-2 relative cursor-pointer transition-all ${
                selectedPlan === 'pro' 
                  ? 'border-purple-500' 
                  : 'border-gray-800 hover:border-gray-600'
              }`}
              style={selectedPlan === 'pro' ? {
                backgroundColor: 'rgba(147, 51, 234, 0.1)',
                boxShadow: `
                  0 0 20px rgba(147, 51, 234, 0.6),
                  0 0 40px rgba(147, 51, 234, 0.4),
                  0 0 60px rgba(147, 51, 234, 0.2)
                `
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
                For individuals who need more solutions and features to build and grow their projects.
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
          </div>
        </div>
      </section>

      {/* Compare Plans and Features */}
      <section className="py-16 bg-black">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-white text-center mb-12">
            Compare plans and features
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-4 px-6 text-gray-400 font-medium">Plans</th>
                  <th className="text-center py-4 px-6 text-white font-semibold">
                    <div className="flex flex-col items-center">
                      <span>Free</span>
                      <span className="text-xs text-gray-400 font-normal">Forever</span>
                      <button className="mt-2 px-4 py-1 bg-gray-800 text-white rounded text-xs hover:bg-gray-700 transition-colors">
                        Get started for free
                      </button>
                    </div>
                  </th>
                  <th className="text-center py-4 px-6 text-white font-semibold">
                    <div className="flex flex-col items-center">
                      <span>Pro</span>
                      <span className="text-xs text-gray-400 font-normal">$5/month</span>
                      <button className="mt-2 px-4 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700 transition-colors">
                        Selected
                      </button>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-800">
                  <td className="py-4 px-6 text-gray-300 font-medium">Content & Tools</td>
                  <td></td>
                  <td></td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-4 px-6 text-gray-300">Access to all tools</td>
                  <td className="text-center py-4 px-6 text-green-500">✓</td>
                  <td className="text-center py-4 px-6 text-green-500">✓</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-4 px-6 text-gray-300">Access to featured gradients / palettes</td>
                  <td className="text-center py-4 px-6 text-green-500">✓</td>
                  <td className="text-center py-4 px-6 text-green-500">✓</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-4 px-6 text-gray-300">Early access to new tools & features</td>
                  <td className="text-center py-4 px-6 text-red-500">✗</td>
                  <td className="text-center py-4 px-6 text-green-500">✓</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-4 px-6 text-gray-300">App color tokens (Android, Flutter, Swift UI, .NET MAUI)</td>
                  <td className="text-center py-4 px-6 text-red-500">✗</td>
                  <td className="text-center py-4 px-6 text-green-500">✓</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-4 px-6 text-gray-300 font-medium">Features</td>
                  <td></td>
                  <td></td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-4 px-6 text-gray-300">Create & save gradients</td>
                  <td className="text-center py-4 px-6 text-gray-300">Unlimited</td>
                  <td className="text-center py-4 px-6 text-gray-300">Unlimited</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-4 px-6 text-gray-300">Remove ads</td>
                  <td className="text-center py-4 px-6 text-red-500">✗</td>
                  <td className="text-center py-4 px-6 text-green-500">✓</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-4 px-6 text-gray-300">Export your colors to .json, .css, .csv</td>
                  <td className="text-center py-4 px-6 text-red-500">✗</td>
                  <td className="text-center py-4 px-6 text-green-500">✓</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-4 px-6 text-gray-300">AI features (color use cases, analysis, and more soon.)</td>
                  <td className="text-center py-4 px-6 text-red-500">✗</td>
                  <td className="text-center py-4 px-6 text-green-500">✓</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-4 px-6 text-gray-300 font-medium">Collections</td>
                  <td></td>
                  <td></td>
                </tr>
                <tr>
                  <td className="py-4 px-6 text-gray-300">Collections</td>
                  <td className="text-center py-4 px-6 text-gray-300">Up to 3 collections</td>
                  <td className="text-center py-4 px-6 text-gray-300">Unlimited</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="py-16 bg-black">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-white text-center mb-12">
            Frequently asked questions
          </h2>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">
                What is Gradient Master?
              </h3>
              <p className="text-gray-400">
                Gradient Master is the easiest CSS gradient generator. We are one of the most intuitive tools to generate CSS-ready gradients, palettes, dark themes, color schemes, and more!
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">
                How often do you upload new colors?
              </h3>
              <p className="text-gray-400">
                Commonly, we upload and update new colors every week, sometimes every two weeks. But you can still see and like all the current colors or add your favorites to a collection.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">
                Is there a free plan?
              </h3>
              <p className="text-gray-400">
                Yes! We do have a free plan. The free plan allows you to use the basic functionality of Gradient Master, like all the tools, to create and save unlimited gradients & palettes.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">
                Can I cancel my Gradient Master Pro subscription at any time?
              </h3>
              <p className="text-gray-400">
                Yes, you can cancel or pause your subscription after the purchase. Go to your profile, select &quot;Subscription,&quot; and cancel your account on the Stripe panel. If you&apos;re in the middle of a subscription, it will be canceled until the ongoing period ends.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">
                Is the payment secure?
              </h3>
              <p className="text-gray-400">
                Yes, all the payments are powered and secure by Stripe Checkout. It is a hosted payment page by Stripe.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Upgrade CTA Section */}
      <section className="py-16 bg-black">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Upgrade to Pro and unlock more features.
          </h2>
          <p className="text-gray-400 mb-8">
            Trusted and used by designers and developers from companies around the world.
          </p>
          
          <h3 className="text-xl font-semibold text-white mb-6">
            Create. Export. Build faster.
          </h3>
          <p className="text-gray-400 mb-8">
            Get access to more export file formats, app tokens, remove ads, unlimited collections, and more.
          </p>
          
          <div className="grid md:grid-cols-2 gap-4 mb-8 text-left">
            <div className="space-y-2">
              <div className="flex items-center text-gray-300">
                <Check className="w-4 h-4 text-green-500 mr-2" />
                Everything from free
              </div>
              <div className="flex items-center text-gray-300">
                <Zap className="w-4 h-4 text-green-500 mr-2" />
                AI features
                <span className="ml-2 bg-green-600 text-white text-xs px-2 py-1 rounded-full">New</span>
              </div>
              <div className="flex items-center text-gray-300">
                <FileText className="w-4 h-4 text-green-500 mr-2" />
                Export Branding Kit colors pdf file.
                <span className="ml-2 bg-green-600 text-white text-xs px-2 py-1 rounded-full">New</span>
              </div>
              <div className="flex items-center text-gray-300">
                <Monitor className="w-4 h-4 text-green-500 mr-2" />
                Export Dark/Light themes to .css, and .csv
                <span className="ml-2 bg-green-600 text-white text-xs px-2 py-1 rounded-full">New</span>
              </div>
              <div className="flex items-center text-gray-300">
                <Smartphone className="w-4 h-4 text-green-500 mr-2" />
                App color tokens (Android, Flutter, Swift, .NET MAUI)
                <span className="ml-2 bg-green-600 text-white text-xs px-2 py-1 rounded-full">New</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center text-gray-300">
                <Download className="w-4 h-4 text-green-500 mr-2" />
                Gradients/Palettes wallpaper (4k, ultrawide, widescreen, iPhone, Pixel, etc.)
              </div>
              <div className="flex items-center text-gray-300">
                <Palette className="w-4 h-4 text-green-500 mr-2" />
                Unlimited collections
              </div>
              <div className="flex items-center text-gray-300">
                <FileText className="w-4 h-4 text-green-500 mr-2" />
                Export to multiple formats (.json, .css, .csv)
              </div>
              <div className="flex items-center text-gray-300">
                <Download className="w-4 h-4 text-green-500 mr-2" />
                Export colors as images (.jpeg, .png, .svg)
              </div>
              <div className="flex items-center text-gray-300">
                <Shield className="w-4 h-4 text-green-500 mr-2" />
                Remove ads
              </div>
            </div>
          </div>
          
          <button className="bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors">
            Upgrade to Pro for $5/mo
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-gray-800 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-semibold mb-4">Gradient Master</h3>
              <p className="text-gray-400 text-sm mb-4">contact@gradientmaster.com</p>
            </div>
            
            <div>
              <h4 className="text-white font-medium mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-400 hover:text-white">Pricing</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Updates</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-medium mb-4">About Us</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-400 hover:text-white">Give Feedback</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Team</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Help & Support</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-medium mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-400 hover:text-white">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Jobs</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              Made with a lot of ❤️ by the Gradient Master team
            </p>
            <p className="text-gray-400 text-sm mt-2">
              ©2025 Gradient Master V2
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
