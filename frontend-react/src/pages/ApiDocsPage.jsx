import { useState } from 'react';
import { Card, Button } from '../components/ui';
import { 
  Code, Book, Key, Play, Copy, Check, ChevronDown, ChevronRight,
  Server, Database, Zap, FileCode, Lock, Globe
} from 'lucide-react';
import { cn } from '../lib/utils';

// API Endpoints
const ENDPOINTS = {
  auth: {
    name: 'Authentication',
    icon: Lock,
    endpoints: [
      { method: 'POST', path: '/auth/login', desc: 'Login with email/password' },
      { method: 'POST', path: '/auth/register', desc: 'Create new account' },
      { method: 'POST', path: '/auth/google', desc: 'Google OAuth login' },
      { method: 'POST', path: '/auth/logout', desc: 'Logout current session' },
      { method: 'GET', path: '/auth/me', desc: 'Get current user' },
      { method: 'POST', path: '/auth/refresh', desc: 'Refresh access token' },
    ],
  },
  calculators: {
    name: 'Calculators',
    icon: Zap,
    endpoints: [
      { method: 'GET', path: '/calculators', desc: 'List all calculators' },
      { method: 'GET', path: '/calculators/{id}', desc: 'Get calculator details' },
      { method: 'POST', path: '/calculators/{id}/calculate', desc: 'Execute calculation' },
      { method: 'GET', path: '/calculators/categories', desc: 'Get calculator categories' },
    ],
  },
  equations: {
    name: 'Equations',
    icon: Database,
    endpoints: [
      { method: 'GET', path: '/equations', desc: 'List all equations' },
      { method: 'GET', path: '/equations/{id}', desc: 'Get equation details' },
      { method: 'GET', path: '/equations/search', desc: 'Search equations' },
      { method: 'GET', path: '/equations/categories', desc: 'Get equation categories' },
    ],
  },
  pipelines: {
    name: 'Pipelines',
    icon: Server,
    endpoints: [
      { method: 'GET', path: '/pipelines', desc: 'List all pipelines' },
      { method: 'POST', path: '/pipelines', desc: 'Create new pipeline' },
      { method: 'GET', path: '/pipelines/{id}', desc: 'Get pipeline details' },
      { method: 'PUT', path: '/pipelines/{id}', desc: 'Update pipeline' },
      { method: 'DELETE', path: '/pipelines/{id}', desc: 'Delete pipeline' },
      { method: 'POST', path: '/pipelines/{id}/execute', desc: 'Execute pipeline' },
    ],
  },
  reports: {
    name: 'Reports',
    icon: FileCode,
    endpoints: [
      { method: 'GET', path: '/reports', desc: 'List all reports' },
      { method: 'POST', path: '/reports', desc: 'Generate new report' },
      { method: 'GET', path: '/reports/{id}', desc: 'Get report details' },
      { method: 'GET', path: '/reports/{id}/download', desc: 'Download report' },
      { method: 'DELETE', path: '/reports/{id}', desc: 'Delete report' },
    ],
  },
};

// Code examples
const CODE_EXAMPLES = {
  javascript: `// JavaScript Example
const response = await fetch('https://api.engisuite.com/v1/calculators/1/calculate', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    inputs: {
      voltage: 220,
      current: 10,
      power_factor: 0.85
    }
  })
});

const result = await response.json();
console.log(result);`,
  python: `# Python Example
import requests

response = requests.post(
    'https://api.engisuite.com/v1/calculators/1/calculate',
    headers={
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json',
    },
    json={
        'inputs': {
            'voltage': 220,
            'current': 10,
            'power_factor': 0.85
        }
    }
)

result = response.json()
print(result)`,
  curl: `# cURL Example
curl -X POST 'https://api.engisuite.com/v1/calculators/1/calculate' \\
  -H 'Authorization: Bearer YOUR_API_KEY' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "inputs": {
      "voltage": 220,
      "current": 10,
      "power_factor": 0.85
    }
  }'`,
};

/**
 * API Documentation Page
 */
export default function ApiDocsPage() {
  const [expandedSection, setExpandedSection] = useState('auth');
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [copied, setCopied] = useState(false);

  const handleCopy = async (code) => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 mb-4">
          <Code className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          API Documentation
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Integrate EngiSuite calculations into your applications
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <Card className="p-4 sticky top-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Getting Started
            </h3>
            <nav className="space-y-2">
              <a href="#overview" className="block text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600">
                Overview
              </a>
              <a href="#authentication" className="block text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600">
                Authentication
              </a>
              <a href="#rate-limits" className="block text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600">
                Rate Limits
              </a>
              <a href="#errors" className="block text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600">
                Errors
              </a>
            </nav>

            <h3 className="font-semibold text-gray-900 dark:text-white mt-6 mb-4">
              API Reference
            </h3>
            <nav className="space-y-2">
              {Object.entries(ENDPOINTS).map(([key, section]) => {
                const Icon = section.icon;
                return (
                  <a
                    key={key}
                    href={`#${key}`}
                    className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600"
                  >
                    <Icon className="w-4 h-4" />
                    {section.name}
                  </a>
                );
              })}
            </nav>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-8">
          {/* Overview */}
          <Card className="p-6" id="overview">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-500" />
              Overview
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              The EngiSuite API provides programmatic access to our engineering calculation engine. 
              Use our REST API to integrate calculations into your applications, automate workflows, 
              and build custom tools.
            </p>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <p className="text-sm font-mono text-gray-900 dark:text-white">
                Base URL: <code className="text-blue-600">https://api.engisuite.com/v1</code>
              </p>
            </div>
          </Card>

          {/* Authentication */}
          <Card className="p-6" id="authentication">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Key className="w-5 h-5 text-blue-500" />
              Authentication
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              All API requests require authentication using an API key. Include your key in the 
              Authorization header as a Bearer token.
            </p>
            <div className="bg-gray-900 rounded-lg p-4 relative">
              <button
                onClick={() => handleCopy('Authorization: Bearer YOUR_API_KEY')}
                className="absolute top-2 right-2 p-2 hover:bg-gray-800 rounded"
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-400" />}
              </button>
              <pre className="text-sm text-gray-100 overflow-x-auto">
                Authorization: Bearer YOUR_API_KEY
              </pre>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mt-4">
              Get your API key from the{' '}
              <a href="/settings" className="text-blue-600 hover:text-blue-700">Settings page</a>.
            </p>
          </Card>

          {/* Code Example */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Play className="w-5 h-5 text-blue-500" />
              Quick Start Example
            </h2>
            
            {/* Language Tabs */}
            <div className="flex gap-2 mb-4">
              {Object.keys(CODE_EXAMPLES).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setSelectedLanguage(lang)}
                  className={cn(
                    'px-3 py-1.5 text-sm rounded-lg transition-colors',
                    selectedLanguage === lang
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                  )}
                >
                  {lang.charAt(0).toUpperCase() + lang.slice(1)}
                </button>
              ))}
            </div>
            
            {/* Code Block */}
            <div className="bg-gray-900 rounded-lg p-4 relative">
              <button
                onClick={() => handleCopy(CODE_EXAMPLES[selectedLanguage])}
                className="absolute top-2 right-2 p-2 hover:bg-gray-800 rounded"
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-400" />}
              </button>
              <pre className="text-sm text-gray-100 overflow-x-auto">
                <code>{CODE_EXAMPLES[selectedLanguage]}</code>
              </pre>
            </div>
          </Card>

          {/* API Endpoints */}
          {Object.entries(ENDPOINTS).map(([key, section]) => {
            const Icon = section.icon;
            const isExpanded = expandedSection === key;
            
            return (
              <Card key={key} className="p-6" id={key}>
                <button
                  onClick={() => setExpandedSection(isExpanded ? null : key)}
                  className="w-full flex items-center justify-between"
                >
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Icon className="w-5 h-5 text-blue-500" />
                    {section.name}
                  </h2>
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                
                {isExpanded && (
                  <div className="mt-4 space-y-2">
                    {section.endpoints.map((endpoint, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <span className={cn(
                          'px-2 py-0.5 text-xs font-medium rounded',
                          endpoint.method === 'GET' && 'bg-green-100 text-green-700',
                          endpoint.method === 'POST' && 'bg-blue-100 text-blue-700',
                          endpoint.method === 'PUT' && 'bg-yellow-100 text-yellow-700',
                          endpoint.method === 'DELETE' && 'bg-red-100 text-red-700',
                        )}>
                          {endpoint.method}
                        </span>
                        <code className="text-sm font-mono text-gray-900 dark:text-white">
                          {endpoint.path}
                        </code>
                        <span className="text-sm text-gray-500 ml-auto">
                          {endpoint.desc}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}

          {/* Rate Limits */}
          <Card className="p-6" id="rate-limits">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Rate Limits
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2 px-3 font-medium text-gray-700 dark:text-gray-300">Plan</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-700 dark:text-gray-300">Requests/hour</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-700 dark:text-gray-300">Requests/month</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-2 px-3 text-gray-900 dark:text-white">Free</td>
                    <td className="py-2 px-3 text-gray-600 dark:text-gray-400">100</td>
                    <td className="py-2 px-3 text-gray-600 dark:text-gray-400">1,000</td>
                  </tr>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-2 px-3 text-gray-900 dark:text-white">Professional</td>
                    <td className="py-2 px-3 text-gray-600 dark:text-gray-400">1,000</td>
                    <td className="py-2 px-3 text-gray-600 dark:text-gray-400">50,000</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-gray-900 dark:text-white">Enterprise</td>
                    <td className="py-2 px-3 text-gray-600 dark:text-gray-400">10,000</td>
                    <td className="py-2 px-3 text-gray-600 dark:text-gray-400">Unlimited</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

          {/* Errors */}
          <Card className="p-6" id="errors">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Error Codes
            </h2>
            <div className="space-y-3">
              {[
                { code: 400, desc: 'Bad Request - Invalid parameters' },
                { code: 401, desc: 'Unauthorized - Invalid or missing API key' },
                { code: 403, desc: 'Forbidden - Insufficient permissions' },
                { code: 404, desc: 'Not Found - Resource does not exist' },
                { code: 429, desc: 'Too Many Requests - Rate limit exceeded' },
                { code: 500, desc: 'Internal Server Error - Please try again later' },
              ].map((error) => (
                <div key={error.code} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <code className="text-sm font-mono text-red-600">{error.code}</code>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{error.desc}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
