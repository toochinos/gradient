'use client';

import Link from 'next/link';
import { Check, ArrowLeft, Star, Zap, Download, Palette, Sparkles } from 'lucide-react';

export default function UpgradePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      {/* Navigation */}
      <nav className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <ArrowLeft className="w-5 h-5 text-white" />
              <span className="text-white font-bold text-xl">Gradient Master</span>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-white/80 hover:text-white transition-colors">
                Discover
              </Link>
              <Link href="/" className="text-white/80 hover:text-white transition-colors">
                Palettes
              </Link>
              <Link href="/" className="text-white/80 hover:text-white transition-colors">
                Gradients
              </Link>
              <Link href="/" className="text-white/80 hover:text-white transition-colors">
                Tools
              </Link>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              <button className="text-white/80 hover:text-white transition-colors">
                Sign in
              </button>
              <button className="bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                Create account
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Create. Export. Build faster.
          </h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            Unlock the full potential of gradient design with Pro features that streamline your workflow and enhance your creative process.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Basic Plan */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">Basic</h3>
              <div className="flex items-baseline mb-4">
                <span className="text-4xl font-bold text-white">FREE</span>
              </div>
              <p className="text-white/80">Perfect for developers, designers, and color enthusiasts</p>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span className="text-white">Export colors as images (.jpeg, .png, .svg)</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span className="text-white">Up to 3 collections</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span className="text-white">Create/save unlimited colors</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span className="text-white">Like favorite colors</span>
              </li>
            </ul>

            <button className="w-full bg-white/20 text-white py-3 rounded-lg font-medium border border-white/30 hover:bg-white/30 transition-colors">
              Current Plan
            </button>
          </div>

          {/* Pro Plan */}
          <div className="bg-gradient-to-br from-purple-600/20 to-violet-600/20 backdrop-blur-sm rounded-2xl p-8 border-2 border-purple-400/50 relative overflow-hidden">
            {/* Popular Badge */}
            <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-500 to-violet-500 text-white px-4 py-1 text-sm font-medium transform rotate-12 translate-x-3 -translate-y-2">
              <Star className="w-4 h-4 inline mr-1" />
              Popular
            </div>

            <div className="mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
              <div className="flex items-baseline mb-4">
                <span className="text-4xl font-bold text-white">$5</span>
                <span className="text-white/80 ml-2">/month</span>
              </div>
              <p className="text-white/80">For individuals needing advanced project solutions</p>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span className="text-white">All Basic features</span>
              </li>
              <li className="flex items-center space-x-3">
                <Sparkles className="w-5 h-5 text-purple-400 flex-shrink-0" />
                <span className="text-white">AI features</span>
              </li>
              <li className="flex items-center space-x-3">
                <Download className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <span className="text-white">Export Branding Kit colors PDF</span>
              </li>
              <li className="flex items-center space-x-3">
                <Palette className="w-5 h-5 text-pink-400 flex-shrink-0" />
                <span className="text-white">Export Dark/Light themes (.css, .csv)</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span className="text-white">App color tokens (Android, Flutter, Swift, .NET MAUI)</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span className="text-white">Gradients/Palettes wallpapers</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span className="text-white">Unlimited collections</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span className="text-white">Multiple export formats</span>
              </li>
              <li className="flex items-center space-x-3">
                <Zap className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                <span className="text-white">Ad removal</span>
              </li>
            </ul>

            <button className="w-full bg-gradient-to-r from-purple-500 to-violet-500 text-white py-3 rounded-lg font-medium hover:from-purple-600 hover:to-violet-600 transition-all transform hover:scale-105 shadow-lg">
              Upgrade to Pro for $5/mo
            </button>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold text-white mb-12">Why choose Gradient Master Pro?</h2>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Easy CSS Generator</h3>
              <p className="text-white/70">Generate beautiful CSS gradients with our intuitive visual editor</p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Star className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Weekly Updates</h3>
              <p className="text-white/70">Fresh color palettes and gradients added every week</p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Check className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Flexible Subscription</h3>
              <p className="text-white/70">Cancel anytime with Stripe-secured payments</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-20 text-center">
          <div className="bg-gradient-to-r from-purple-600/20 to-violet-600/20 backdrop-blur-sm rounded-2xl p-12 border border-purple-400/30">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to upgrade your workflow?</h2>
            <p className="text-white/80 mb-8 max-w-2xl mx-auto">
              Join thousands of designers and developers who trust Gradient Master Pro for their daily workflow
            </p>
            <button className="bg-gradient-to-r from-purple-500 to-violet-500 text-white px-8 py-4 rounded-lg font-medium text-lg hover:from-purple-600 hover:to-violet-600 transition-all transform hover:scale-105 shadow-lg">
              Start Your Pro Journey
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black/20 backdrop-blur-sm border-t border-white/10 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><Link href="/" className="text-white/70 hover:text-white transition-colors">Gradient Generator</Link></li>
                <li><Link href="/" className="text-white/70 hover:text-white transition-colors">Color Palettes</Link></li>
                <li><Link href="/" className="text-white/70 hover:text-white transition-colors">Export Tools</Link></li>
                <li><Link href="/" className="text-white/70 hover:text-white transition-colors">API Access</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">About Us</h3>
              <ul className="space-y-2">
                <li><Link href="/" className="text-white/70 hover:text-white transition-colors">Our Story</Link></li>
                <li><Link href="/" className="text-white/70 hover:text-white transition-colors">Team</Link></li>
                <li><Link href="/" className="text-white/70 hover:text-white transition-colors">Careers</Link></li>
                <li><Link href="/" className="text-white/70 hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><Link href="/" className="text-white/70 hover:text-white transition-colors">Documentation</Link></li>
                <li><Link href="/" className="text-white/70 hover:text-white transition-colors">Tutorials</Link></li>
                <li><Link href="/" className="text-white/70 hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/" className="text-white/70 hover:text-white transition-colors">Support</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><Link href="/" className="text-white/70 hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/" className="text-white/70 hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="/" className="text-white/70 hover:text-white transition-colors">Cookie Policy</Link></li>
                <li><Link href="/" className="text-white/70 hover:text-white transition-colors">GDPR</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 mt-8 pt-8 text-center">
            <p className="text-white/60">© 2024 Gradient Master. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}