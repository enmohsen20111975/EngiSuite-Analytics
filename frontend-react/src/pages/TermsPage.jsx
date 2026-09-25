import { Link } from 'react-router-dom';
import { Card } from '../components/ui';
import { FileText, Check, TriangleAlert, Scale, CreditCard, Shield, Mail } from 'lucide-react';

/**
 * Terms of Service Page
 */
export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 mb-4">
          <FileText className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Terms of Service
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Last updated: February 28, 2026
        </p>
      </div>

      <div className="prose prose-gray dark:prose-invert max-w-none">
        {/* Agreement */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Agreement to Terms
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            By accessing or using EngiSuite Analytics ("Service"), you agree to be bound by these Terms of Service ("Terms"). 
            If you disagree with any part of these terms, you may not access the Service.
          </p>
        </Card>

        {/* Description of Service */}
        <Card className="p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Check className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Description of Service
            </h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            EngiSuite Analytics provides engineering calculation tools, including but not limited to:
          </p>
          <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2 mt-4">
            <li>Electrical, mechanical, civil, and chemical engineering calculators</li>
            <li>Unit conversion tools</li>
            <li>Visual workflow builder</li>
            <li>Calculation pipelines</li>
            <li>Report generation and export</li>
            <li>AI-powered engineering assistance</li>
          </ul>
        </Card>

        {/* User Accounts */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            User Accounts
          </h2>
          <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
            <li>You must be at least 13 years old to use this Service</li>
            <li>You are responsible for maintaining the confidentiality of your account</li>
            <li>You are responsible for all activities under your account</li>
            <li>You must provide accurate and complete information</li>
            <li>You may not share your account credentials with others</li>
          </ul>
        </Card>

        {/* Subscription and Payments */}
        <Card className="p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <CreditCard className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Subscriptions and Payments
            </h2>
          </div>
          <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
            <li>Some features require a paid subscription</li>
            <li>Subscriptions are billed monthly or annually in advance</li>
            <li>You may cancel your subscription at any time</li>
            <li>Refunds are provided at our discretion</li>
            <li>Prices are subject to change with 30 days notice</li>
            <li>Credits purchased are non-refundable</li>
          </ul>
        </Card>

        {/* Acceptable Use */}
        <Card className="p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <TriangleAlert className="w-6 h-6 text-yellow-500" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Acceptable Use Policy
            </h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">You agree NOT to:</p>
          <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
            <li>Use the Service for illegal purposes</li>
            <li>Attempt to reverse engineer or extract source code</li>
            <li>Interfere with or disrupt the Service</li>
            <li>Use automated systems to access the Service without permission</li>
            <li>Transmit viruses or malicious code</li>
            <li>Share inappropriate or offensive content</li>
            <li>Violate any applicable laws or regulations</li>
          </ul>
        </Card>

        {/* Intellectual Property */}
        <Card className="p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Scale className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Intellectual Property
            </h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            The Service and its original content, features, and functionality are owned by EngiSuite Analytics 
            and are protected by international copyright, trademark, and other intellectual property laws.
          </p>
          <p className="text-gray-600 dark:text-gray-400 mt-4">
            Your calculations and saved projects remain your property. By using the Service, you grant us 
            a limited license to process and store your data for the purpose of providing the Service.
          </p>
        </Card>

        {/* Limitation of Liability */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Limitation of Liability
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            EngiSuite Analytics provides engineering calculation tools for informational purposes. 
            While we strive for accuracy, we make no warranties about the completeness, reliability, 
            and accuracy of this information.
          </p>
          <p className="text-gray-600 dark:text-gray-400 mt-4">
            <strong>Important:</strong> Engineering calculations should always be verified by a qualified 
            professional before use in real-world applications. We are not responsible for any damages 
            arising from the use of calculation results.
          </p>
        </Card>

        {/* Disclaimer */}
        <Card className="p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Disclaimer
            </h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            The Service is provided "as is" and "as available" without warranties of any kind, 
            either express or implied. We do not warrant that the Service will be uninterrupted, 
            secure, or error-free.
          </p>
        </Card>

        {/* Termination */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Termination
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            We may terminate or suspend your account immediately, without prior notice or liability, 
            for any reason, including breach of these Terms. Upon termination, your right to use 
            the Service will immediately cease.
          </p>
        </Card>

        {/* Changes to Terms */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Changes to Terms
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            We reserve the right to modify these terms at any time. We will notify users of any 
            material changes by posting the new Terms on this page and updating the "Last updated" date.
          </p>
          <p className="text-gray-600 dark:text-gray-400 mt-4">
            Continued use of the Service after changes constitutes acceptance of the new Terms.
          </p>
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
            If you have questions about these Terms, please contact us:
          </p>
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-gray-900 dark:text-white font-medium">EngiSuite Analytics</p>
            <p className="text-gray-600 dark:text-gray-400">Email: legal@engisuite.com</p>
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
