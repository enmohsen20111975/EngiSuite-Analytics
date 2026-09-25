import { Link } from 'react-router-dom';
import { Card } from '../components/ui';
import { Shield, Lock, Eye, Database, Cookie, Users, Mail } from 'lucide-react';

/**
 * Privacy Policy Page
 */
export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 mb-4">
          <Shield className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Privacy Policy
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Last updated: February 28, 2026
        </p>
      </div>

      <div className="prose prose-gray dark:prose-invert max-w-none">
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Introduction
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            EngiSuite Analytics ("we", "our", or "us") is committed to protecting your privacy. 
            This Privacy Policy explains how we collect, use, disclose, and safeguard your information 
            when you visit our website and use our engineering calculation services.
          </p>
        </Card>

        {/* Information Collection */}
        <Card className="p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Database className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Information We Collect
            </h2>
          </div>
          
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mt-4 mb-2">
            Personal Information
          </h3>
          <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
            <li>Name and email address</li>
            <li>Account credentials (hashed passwords)</li>
            <li>Company information (if provided)</li>
            <li>Payment information (processed securely by Stripe/Paymob)</li>
          </ul>

          <h3 className="text-lg font-medium text-gray-900 dark:text-white mt-4 mb-2">
            Usage Data
          </h3>
          <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
            <li>Calculation history and saved projects</li>
            <li>Feature usage and preferences</li>
            <li>Device and browser information</li>
            <li>IP address and location data</li>
          </ul>
        </Card>

        {/* How We Use Information */}
        <Card className="p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Eye className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              How We Use Your Information
            </h2>
          </div>
          <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
            <li>Provide and maintain our services</li>
            <li>Process transactions and send related information</li>
            <li>Send promotional communications (with opt-out)</li>
            <li>Improve our services and develop new features</li>
            <li>Respond to customer service requests</li>
            <li>Detect and prevent fraud</li>
          </ul>
        </Card>

        {/* Data Security */}
        <Card className="p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Lock className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Data Security
            </h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            We implement appropriate technical and organizational measures to protect your personal data, including:
          </p>
          <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2 mt-4">
            <li>SSL/TLS encryption for data transmission</li>
            <li>Encrypted data storage</li>
            <li>Regular security audits</li>
            <li>Access controls and authentication</li>
            <li>Secure payment processing through PCI-compliant providers</li>
          </ul>
        </Card>

        {/* Cookies */}
        <Card className="p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Cookie className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Cookies and Tracking
            </h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            We use cookies and similar technologies to:
          </p>
          <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2 mt-4">
            <li>Authenticate users and maintain sessions</li>
            <li>Remember user preferences</li>
            <li>Analyze site traffic and usage patterns</li>
            <li>Provide personalized content</li>
          </ul>
          <p className="text-gray-600 dark:text-gray-400 mt-4">
            You can control cookies through your browser settings.
          </p>
        </Card>

        {/* Third-Party Sharing */}
        <Card className="p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Third-Party Sharing
            </h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            We may share your information with:
          </p>
          <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2 mt-4">
            <li>Payment processors (Stripe, Paymob)</li>
            <li>Cloud infrastructure providers</li>
            <li>Analytics services (Google Analytics)</li>
            <li>Legal authorities when required by law</li>
          </ul>
          <p className="text-gray-600 dark:text-gray-400 mt-4">
            We do not sell your personal information to third parties.
          </p>
        </Card>

        {/* Your Rights */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Your Rights
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            You have the right to:
          </p>
          <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2 mt-4">
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Delete your account and data</li>
            <li>Export your data</li>
            <li>Opt-out of marketing communications</li>
            <li>Object to data processing</li>
          </ul>
        </Card>

        {/* Contact */}
        <Card className="p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Mail className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Contact Us
            </h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            If you have questions about this Privacy Policy, please contact us at:
          </p>
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-gray-900 dark:text-white font-medium">EngiSuite Analytics</p>
            <p className="text-gray-600 dark:text-gray-400">Email: privacy@engisuite.com</p>
          </div>
        </Card>

        {/* Footer Links */}
        <div className="flex justify-center gap-6 text-sm text-gray-500 dark:text-gray-400">
          <Link to="/terms" className="hover:text-blue-600">Terms of Service</Link>
          <span>•</span>
          <Link to="/privacy" className="hover:text-blue-600">Privacy Policy</Link>
          <span>•</span>
          <Link to="/dashboard" className="hover:text-blue-600">Dashboard</Link>
        </div>
      </div>
    </div>
  );
}
