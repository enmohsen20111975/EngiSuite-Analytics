import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Check, X, Sparkles, Zap, Building, Users,
  CircleQuestionMark, ArrowRight
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Card, CardContent, Button } from '../components/ui';

// Pricing plans
const plans = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    description: 'Perfect for getting started',
    features: [
      { text: '10 calculations per month', included: true },
      { text: 'Basic calculators', included: true },
      { text: 'Standard support', included: true },
      { text: 'Export to PDF', included: true },
      { text: 'Advanced calculators', included: false },
      { text: 'API access', included: false },
      { text: 'Custom workflows', included: false },
      { text: 'Priority support', included: false },
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 5,
    description: 'For professional engineers',
    features: [
      { text: 'Unlimited calculations', included: true },
      { text: 'All calculators', included: true },
      { text: 'Priority support', included: true },
      { text: 'Export to PDF/Excel', included: true },
      { text: 'Advanced calculators', included: true },
      { text: 'API access', included: true },
      { text: 'Custom workflows', included: false },
      { text: 'Dedicated support', included: false },
    ],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 8,
    description: 'For teams and organizations',
    features: [
      { text: 'Everything in Pro', included: true },
      { text: 'Unlimited team members', included: true },
      { text: 'Custom workflows', included: true },
      { text: 'Dedicated support', included: true },
      { text: 'SSO authentication', included: true },
      { text: 'Custom integrations', included: true },
      { text: 'On-premise option', included: true },
      { text: 'SLA guarantee', included: true },
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

// FAQ items
const faqs = [
  {
    question: 'Can I switch plans anytime?',
    answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.',
  },
  {
    question: 'Is there a free trial?',
    answer: 'Yes, Pro and Enterprise plans come with a 14-day free trial. No credit card required.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards, PayPal, and bank transfers for Enterprise plans.',
  },
  {
    question: 'Do you offer discounts for annual billing?',
    answer: 'Yes, you get 20% off when you choose annual billing on any paid plan.',
  },
];

/**
 * Pricing page component
 */
function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState('monthly');
  const navigate = useNavigate();

  const handleSelectPlan = (plan) => {
    if (plan.id === 'free') {
      navigate('/register');
    } else {
      navigate(`/subscription?plan=${plan.id}&billing=${billingPeriod}`);
    }
  };

  return (
    <div className="space-y-12 animate-fade-up">
      {/* Page header */}
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-text-primary)]">
          Simple, Transparent Pricing
        </h1>
        <p className="text-[var(--color-text-secondary)] mt-4 text-lg">
          Choose the plan that fits your needs. All plans include access to our core engineering calculation tools.
        </p>
        
        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <span className={cn(
            'text-sm font-medium',
            billingPeriod === 'monthly' ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-muted)]'
          )}>
            Monthly
          </span>
          <button
            onClick={() => setBillingPeriod(prev => prev === 'monthly' ? 'annual' : 'monthly')}
            className={cn(
              'relative w-14 h-7 rounded-full transition-colors',
              billingPeriod === 'annual' ? 'bg-accent' : 'bg-[var(--color-bg-tertiary)]'
            )}
          >
            <span className={cn(
              'absolute top-1 w-5 h-5 rounded-full bg-white transition-transform',
              billingPeriod === 'annual' ? 'left-8' : 'left-1'
            )} />
          </button>
          <span className={cn(
            'text-sm font-medium',
            billingPeriod === 'annual' ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-muted)]'
          )}>
            Annual
            <span className="ml-1 text-success">(Save 20%)</span>
          </span>
        </div>
      </div>
      
      {/* Pricing cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {plans.map((plan) => (
          <Card 
            key={plan.id}
            className={cn(
              'relative',
              plan.popular && 'border-accent border-2 shadow-lg shadow-accent/10'
            )}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-accent text-white text-xs font-medium rounded-full">
                Most Popular
              </div>
            )}
            
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold text-[var(--color-text-primary)]">
                {plan.name}
              </h3>
              <p className="text-sm text-[var(--color-text-muted)] mt-1">
                {plan.description}
              </p>
              
              <div className="mt-6">
                <span className="text-4xl font-bold text-[var(--color-text-primary)]">
                  ${billingPeriod === 'annual' ? Math.round(plan.price * 0.8) : plan.price}
                </span>
                {plan.price > 0 && (
                  <span className="text-[var(--color-text-muted)]">/month</span>
                )}
              </div>
              
              <Button
                className="w-full mt-6"
                variant={plan.popular ? 'primary' : 'secondary'}
                onClick={() => handleSelectPlan(plan)}
              >
                {plan.cta}
                <ArrowRight className="w-4 h-4" />
              </Button>
              
              <ul className="mt-6 space-y-3">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    {feature.included ? (
                      <Check className="w-5 h-5 text-success flex-shrink-0" />
                    ) : (
                      <X className="w-5 h-5 text-[var(--color-text-muted)] flex-shrink-0" />
                    )}
                    <span className={cn(
                      'text-sm',
                      feature.included ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-muted)]'
                    )}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Feature comparison */}
      <Card className="max-w-6xl mx-auto">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-6 text-center">
            Compare Plans
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left py-3 px-4 text-[var(--color-text-muted)] font-medium">Feature</th>
                  <th className="text-center py-3 px-4 text-[var(--color-text-muted)] font-medium">Free</th>
                  <th className="text-center py-3 px-4 text-accent font-medium">Pro</th>
                  <th className="text-center py-3 px-4 text-[var(--color-text-muted)] font-medium">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Calculations per month', '10', 'Unlimited', 'Unlimited'],
                  ['Calculator types', 'Basic', 'All', 'All + Custom'],
                  ['Export formats', 'PDF', 'PDF, Excel', 'PDF, Excel, Word'],
                  ['API access', '-', '✓', '✓'],
                  ['Team members', '1', '5', 'Unlimited'],
                  ['Support', 'Email', 'Priority', 'Dedicated'],
                ].map(([feature, free, pro, enterprise], i) => (
                  <tr key={i} className="border-t border-[var(--color-border)]">
                    <td className="py-3 px-4 text-[var(--color-text-primary)]">{feature}</td>
                    <td className="py-3 px-4 text-center text-[var(--color-text-muted)]">{free}</td>
                    <td className="py-3 px-4 text-center text-accent font-medium">{pro}</td>
                    <td className="py-3 px-4 text-center text-[var(--color-text-muted)]">{enterprise}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      {/* FAQ */}
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-semibold text-[var(--color-text-primary)] text-center mb-8">
          Frequently Asked Questions
        </h2>
        
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <Card key={i}>
              <CardContent className="p-5">
                <h3 className="font-medium text-[var(--color-text-primary)] flex items-center gap-2">
                  <CircleQuestionMark className="w-5 h-5 text-accent" />
                  {faq.question}
                </h3>
                <p className="text-[var(--color-text-secondary)] mt-2 ml-7">
                  {faq.answer}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      {/* CTA */}
      <Card className="bg-gradient-to-r from-accent/10 to-violet-500/10 border-accent/20">
        <CardContent className="p-8 text-center">
          <Sparkles className="w-12 h-12 text-accent mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-[var(--color-text-primary)]">
            Ready to get started?
          </h2>
          <p className="text-[var(--color-text-secondary)] mt-2 max-w-md mx-auto">
            Join thousands of engineers who trust EngiSuite for their calculations.
          </p>
          <Button className="mt-6" onClick={() => navigate('/subscription?plan=pro')}>
            Start Your Free Trial
            <ArrowRight className="w-4 h-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default PricingPage;
