'use client';

import { useState } from 'react';
import { ArrowLeft, Check, Star, Download, FileText, Palette, Smartphone, Monitor, Zap, Heart, Shield } from 'lucide-react';
import Link from 'next/link';

export default function UpgradePage() {
  const [isYearly, setIsYearly] = useState(false);

  const features = [
    { icon: <Download className="w-5 h-5" />, text: "Export colors as images (.jpeg, .png, .svg)" },
    { icon: <Palette className="w-5 h-5" />, text: "Up to 3 collections" },
    { icon: <Star className="w-5 h-5" />, text: "Create and save unlimited colors" },
    { icon: <Heart className="w-5 h-5" />, text: "Like your favorite colors" }
  ];

  const proFeatures = [
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
  ];


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
          <p className="text-lg text-gray-400 mb-6">
            Get access to all the new features of Gradient Master. Cancel anytime. Price in USD.
          </p>
          
          {/* Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <span className={`text-sm ${!isYearly ? 'text-white font-semibold' : 'text-gray-500'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
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
            <div className="bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-800">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-white mb-2">Basic</h3>
                <div className="text-3xl font-bold text-white mb-2">FREE</div>
                <div className="text-gray-400 text-sm">Forever</div>
              </div>
              
              <p className="text-gray-400 mb-6 text-center text-sm">
                For developers, designers, and color lovers building simple apps or projects.
              </p>
              
              <button className="w-full bg-gray-800 text-white py-2 rounded-lg font-semibold hover:bg-gray-700 transition-colors mb-6 text-sm">
                Get started for free
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
            <div className="bg-gray-900 rounded-xl shadow-lg p-6 border border-purple-500 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                  Most Popular
                </span>
              </div>
              
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-white mb-2">Pro</h3>
                <div className="text-3xl font-bold text-white mb-2">
                  ${isYearly ? '3.33' : '5'}
                </div>
                <div className="text-gray-400 text-sm">/{isYearly ? 'month' : 'month'}</div>
              </div>
              
              <p className="text-gray-400 mb-6 text-center text-sm">
                For individuals who need more solutions and features to build and grow their projects.
              </p>
              
              <button className="w-full bg-purple-600 text-white py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors mb-6 text-sm">
                Get PRO
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


      {/* Features Comparison */}
      <section className="py-8 bg-black">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center text-white mb-6">
            Compare plans and features
          </h2>
          
          <div className="bg-gray-900 rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-white">Plans</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-white">
                      <div>Free</div>
                      <div className="text-xs text-gray-400">Forever</div>
                      <button className="mt-1 bg-gray-700 text-white px-3 py-1 rounded text-xs hover:bg-gray-600">
                        Get started for free
                      </button>
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-white">
                      <div>Pro</div>
                      <div className="text-xs text-gray-400">$5/month</div>
                      <button className="mt-1 bg-purple-600 text-white px-3 py-1 rounded text-xs hover:bg-purple-700">
                        Get PRO
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  <tr>
                    <td className="px-4 py-3 font-semibold text-white text-sm">Content & Tools</td>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-gray-300 text-sm">Access to all tools</td>
                    <td className="px-4 py-2 text-center"><Check className="w-4 h-4 text-green-500 mx-auto" /></td>
                    <td className="px-4 py-2 text-center"><Check className="w-4 h-4 text-green-500 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-gray-300 text-sm">Access to featured gradients / palettes</td>
                    <td className="px-4 py-2 text-center"><Check className="w-4 h-4 text-green-500 mx-auto" /></td>
                    <td className="px-4 py-2 text-center"><Check className="w-4 h-4 text-green-500 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-gray-300 text-sm">Early access to new tools & features</td>
                    <td className="px-4 py-2 text-center"><span className="text-gray-500">✗</span></td>
                    <td className="px-4 py-2 text-center"><Check className="w-4 h-4 text-green-500 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-gray-300 text-sm">App color tokens (Android, Flutter, Swift UI, .NET MAUI)</td>
                    <td className="px-4 py-2 text-center"><span className="text-gray-500">✗</span></td>
                    <td className="px-4 py-2 text-center"><Check className="w-4 h-4 text-green-500 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-semibold text-white text-sm">Features</td>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-gray-300 text-sm">Create & save gradients</td>
                    <td className="px-4 py-2 text-center text-gray-300 text-sm">Unlimited</td>
                    <td className="px-4 py-2 text-center text-gray-300 text-sm">Unlimited</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-gray-300 text-sm">Remove ads</td>
                    <td className="px-4 py-2 text-center"><span className="text-gray-500">✗</span></td>
                    <td className="px-4 py-2 text-center"><Check className="w-4 h-4 text-green-500 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-gray-300 text-sm">Export your colors to .json, .css, .csv</td>
                    <td className="px-4 py-2 text-center"><span className="text-gray-500">✗</span></td>
                    <td className="px-4 py-2 text-center"><Check className="w-4 h-4 text-green-500 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-gray-300 text-sm">AI features (color use cases, analysis, and more soon.)</td>
                    <td className="px-4 py-2 text-center"><span className="text-gray-500">✗</span></td>
                    <td className="px-4 py-2 text-center"><Check className="w-4 h-4 text-green-500 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-gray-300 text-sm">Collections</td>
                    <td className="px-4 py-2 text-center text-gray-300 text-sm">Up to 3 collections</td>
                    <td className="px-4 py-2 text-center text-gray-300 text-sm">Unlimited</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-8 bg-black">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center text-white mb-6">
            Frequently asked questions
          </h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">What is Gradient Master?</h3>
              <p className="text-gray-400 text-sm">
                Gradient Master is the easiest CSS gradient generator. We are one of the most intuitive tools to generate CSS-ready gradients, palettes, dark themes, color schemes, and more!
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">How often do you upload new colors?</h3>
              <p className="text-gray-400 text-sm">
                Commonly, we upload and update new colors every week, sometimes every two weeks. But you can still see and like all the current colors or add your favorites to a collection.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Is there a free plan?</h3>
              <p className="text-gray-400 text-sm">
                Yes! We do have a free plan. The free plan allows you to use the basic functionality of Gradient Master, like all the tools, to create and save unlimited gradients & palettes.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Can I cancel my Gradient Master Pro subscription at any time?</h3>
              <p className="text-gray-400 text-sm">
                Yes, you can cancel or pause your subscription after the purchase. Go to your profile, select &quot;Subscription,&quot; and cancel your account on the Stripe panel.
                If you&apos;re in the middle of a subscription, it will be canceled until the ongoing period ends.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Is the payment secure?</h3>
              <p className="text-gray-400 text-sm">
                Yes, all the payments are powered and secure by Stripe Checkout. It is a hosted payment page by Stripe.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-8 bg-gradient-to-br from-purple-600 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-2xl font-bold mb-4">
            Upgrade to Pro and unlock more features.
          </h2>
          <p className="text-lg mb-6 opacity-90">
            Trusted and used by designers and developers from companies around the world.
          </p>
          
          
          <h3 className="text-xl font-bold mb-3">Create. Export. Build faster.</h3>
          <p className="text-base mb-6 opacity-90">
            Get access to more export file formats, app tokens, remove ads, unlimited collections, and more.
          </p>
          
          <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto mb-6">
            <div className="text-left">
              {proFeatures.slice(0, 5).map((feature, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <Check className="w-4 h-4" />
                  <span className="flex items-center text-sm">
                    {feature.text}
                    {feature.isNew && (
                      <span className="ml-2 bg-green-500 text-white text-xs px-1 py-0.5 rounded-full">
                        New
                      </span>
                    )}
                  </span>
                </div>
              ))}
            </div>
            <div className="text-left">
              {proFeatures.slice(5).map((feature, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <Check className="w-4 h-4" />
                  <span className="text-sm">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>
          
          <button className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold text-base hover:bg-gray-100 transition-colors">
            Upgrade to Pro for $3.33/mo
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-6">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-6">
            <div>
              <h3 className="text-base font-semibold mb-3">Gradient Master</h3>
              <p className="text-gray-400 text-sm">contact@gradientmaster.com</p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3 text-sm">Product</h4>
              <ul className="space-y-1 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Updates</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3 text-sm">About Us</h4>
              <ul className="space-y-1 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white">Give Feedback</a></li>
                <li><a href="#" className="hover:text-white">Team</a></li>
                <li><a href="#" className="hover:text-white">Help & Support</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3 text-sm">Resources</h4>
              <ul className="space-y-1 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Jobs</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-6 pt-4 text-center text-gray-400 text-sm">
            <p>Made with a lot of ❤️ by the Gradient Master team</p>
            <p className="mt-1">©2025 Gradient Master v1.0.0</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
