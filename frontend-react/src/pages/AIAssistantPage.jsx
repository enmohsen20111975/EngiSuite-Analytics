import { useState, useRef, useEffect } from 'react';
import { Card, Button, Loader } from '../components/ui';
import {
  Bot, Send, Sparkles, Code, Calculator, FileText,
  Lightbulb, CircleQuestionMark, Zap, Copy, RefreshCw, ThumbsUp,
  ThumbsDown, Bookmark, Settings, History, Trash2, MessageSquare
} from 'lucide-react';
import { cn } from '../lib/utils';

// Sample conversation starters
const suggestions = [
  {
    icon: Calculator,
    title: 'Solve an equation',
    prompt: 'Help me solve this engineering equation: ',
  },
  {
    icon: Code,
    title: 'Generate code',
    prompt: 'Write code for: ',
  },
  {
    icon: Lightbulb,
    title: 'Explain a concept',
    prompt: 'Explain the engineering concept of: ',
  },
  {
    icon: FileText,
    title: 'Write documentation',
    prompt: 'Help me write technical documentation for: ',
  },
];

// Sample chat history
const sampleHistory = [
  {
    id: 1,
    title: 'Ohm\'s Law calculation',
    preview: 'How do I calculate voltage...',
    timestamp: '2 hours ago',
  },
  {
    id: 2,
    title: 'Structural analysis script',
    preview: 'Write a JavaScript script for...',
    timestamp: 'Yesterday',
  },
  {
    id: 3,
    title: 'Beam deflection formulas',
    preview: 'What are the formulas for...',
    timestamp: '3 days ago',
  },
];

/**
 * AI Assistant Page
 */
export default function AIAssistantPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle sending a message
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response
    await new Promise(resolve => setTimeout(resolve, 1500));

    const aiResponse = {
      id: Date.now() + 1,
      role: 'assistant',
      content: generateAIResponse(input),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, aiResponse]);
    setIsLoading(false);
  };

  // Handle suggestion click
  const handleSuggestionClick = (prompt) => {
    setInput(prompt);
    inputRef.current?.focus();
  };

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Copy message to clipboard
  const copyToClipboard = (content) => {
    navigator.clipboard.writeText(content);
  };

  // Clear conversation
  const clearConversation = () => {
    setMessages([]);
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Sidebar - Chat History */}
      {showHistory && (
        <div className="w-72 flex-shrink-0">
          <Card className="h-full flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <History className="w-4 h-4" />
                  Chat History
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHistory(false)}
                >
                  ×
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {sampleHistory.map((chat) => (
                <button
                  key={chat.id}
                  className="w-full p-3 text-left rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {chat.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                    {chat.preview}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{chat.timestamp}</p>
                </button>
              ))}
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <Button variant="outline" className="w-full" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                New Chat
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <Card className="p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {!showHistory && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHistory(true)}
                >
                  <History className="w-4 h-4" />
                </Button>
              )}
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                  EngiSuite AI Assistant
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Your intelligent engineering companion
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={clearConversation}>
                <Trash2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Messages Area */}
        <Card className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4">
            {messages.length === 0 ? (
              /* Empty State */
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6">
                  <Sparkles className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  How can I help you today?
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md">
                  I can help you with engineering calculations, code generation,
                  concept explanations, and technical documentation.
                </p>
                <div className="grid grid-cols-2 gap-3 max-w-lg">
                  {suggestions.map((suggestion, index) => {
                    const Icon = suggestion.icon;
                    return (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion.prompt)}
                        className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                      >
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {suggestion.title}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Messages List */
              <div className="space-y-6">
                {messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    onCopy={copyToClipboard}
                  />
                ))}
                {isLoading && (
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-none px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Loader size="sm" />
                        <span className="text-sm text-gray-500">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-end gap-3">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Ask me anything about engineering..."
                  rows={1}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 resize-none"
                  style={{ minHeight: '48px', maxHeight: '200px' }}
                />
                <div className="absolute right-2 bottom-2 flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    <CircleQuestionMark className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="h-12 px-4"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">
              EngiSuite AI can make mistakes. Consider checking important information.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

/**
 * Message Bubble Component
 */
function MessageBubble({ message, onCopy }) {
  const isUser = message.role === 'user';

  return (
    <div className={cn('flex items-start gap-3', isUser && 'flex-row-reverse')}>
      <div
        className={cn(
          'p-2 rounded-xl flex-shrink-0',
          isUser
            ? 'bg-blue-600'
            : 'bg-gradient-to-br from-blue-500 to-purple-600'
        )}
      >
        {isUser ? (
          <MessageSquare className="w-5 h-5 text-white" />
        ) : (
          <Bot className="w-5 h-5 text-white" />
        )}
      </div>
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-3',
          isUser
            ? 'bg-blue-600 text-white rounded-tr-none'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-tl-none'
        )}
      >
        <div className="prose dark:prose-invert prose-sm max-w-none">
          {message.content.split('\n').map((line, i) => (
            <p key={i} className="mb-2 last:mb-0">
              {line}
            </p>
          ))}
        </div>
        <div
          className={cn(
            'flex items-center gap-2 mt-3 pt-2 border-t',
            isUser
              ? 'border-blue-500'
              : 'border-gray-200 dark:border-gray-700'
          )}
        >
          <span className="text-xs opacity-60">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          {!isUser && (
            <div className="flex items-center gap-1 ml-auto">
              <button
                onClick={() => onCopy(message.content)}
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                title="Copy"
              >
                <Copy className="w-4 h-4 opacity-60" />
              </button>
              <button
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                title="Good response"
              >
                <ThumbsUp className="w-4 h-4 opacity-60" />
              </button>
              <button
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                title="Bad response"
              >
                <ThumbsDown className="w-4 h-4 opacity-60" />
              </button>
              <button
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                title="Save"
              >
                <Bookmark className="w-4 h-4 opacity-60" />
              </button>
              <button
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                title="Regenerate"
              >
                <RefreshCw className="w-4 h-4 opacity-60" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Generate simulated AI response
 */
function generateAIResponse(input) {
  const lowerInput = input.toLowerCase();

  if (lowerInput.includes('ohm') || lowerInput.includes('voltage') || lowerInput.includes('current')) {
    return `**Ohm's Law** is fundamental to electrical engineering. The relationship is:

**V = I × R**

Where:
- **V** = Voltage (in Volts)
- **I** = Current (in Amperes)
- **R** = Resistance (in Ohms)

**Example Calculation:**
If you have a circuit with a resistance of 100Ω and a current of 2A flowing through it:
- V = 2A × 100Ω = 200V

**Power Relationship:**
Power can be calculated using: **P = V × I = I²R = V²/R**

Would you like me to help you with a specific calculation?`;
  }

  if (lowerInput.includes('code') || lowerInput.includes('script')) {
    return `Here's a JavaScript example for engineering calculations:

\`\`\`javascript
function calculateBeamDeflection(load, length, elasticity, momentOfInertia) {
  // Formula: delta = (P * L^3) / (48 * E * I)
  return (load * length ** 3) / (48 * elasticity * momentOfInertia);
}

// Example usage
const P = 10000;     // Load in Newtons
const L = 5;         // Length in meters
const E = 200e9;     // Young's modulus for steel (Pa)
const I = 8.33e-5;   // Moment of inertia (m^4)

const maxDeflection = calculateBeamDeflection(P, L, E, I);
console.log('Maximum deflection: ' + (maxDeflection * 1000).toFixed(2) + ' mm');
\`\`\`

This calculates beam deflection using the standard formula. Would you like me to adapt this for your exact use case?`;
  }

  if (lowerInput.includes('beam') || lowerInput.includes('deflection') || lowerInput.includes('structural')) {
    return `**Beam Deflection Formulas**

For a **simply supported beam** with different loading conditions:

1. **Point Load at Center:**
   - δ_max = (P × L³) / (48 × E × I)

2. **Uniformly Distributed Load:**
   - δ_max = (5 × w × L⁴) / (384 × E × I)

3. **Point Load at Any Point:**
   - δ_max = (P × a × b × (L² - a - b)) / (27 × E × I × L)

**Where:**
- δ = Deflection
- P = Point load
- w = Distributed load per unit length
- L = Beam length
- E = Young's modulus
- I = Moment of inertia
- a, b = Distances from supports

**Units:** Ensure consistent units (N, m, Pa, m⁴) for accurate results.

Need help with a specific beam calculation?`;
  }

  // Default response
  return `I understand you're asking about: "${input}"

As your engineering AI assistant, I can help you with:

1. **Engineering Calculations** - Structural, electrical, mechanical, and more
2. **Code Generation** - TypeScript, MATLAB, JavaScript for engineering applications
3. **Concept Explanations** - Clear explanations of engineering principles
4. **Documentation** - Technical writing and report generation

Could you provide more details about what you'd like to explore? For example:
- What specific calculation do you need help with?
- What engineering domain are you working in?
- Are there any constraints or parameters I should know about?`;
}

// Missing Plus component
function Plus({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
