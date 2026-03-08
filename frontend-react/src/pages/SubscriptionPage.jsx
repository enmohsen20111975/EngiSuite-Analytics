import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionService } from '../services/subscriptionService';
import { Button, Card, Loader, EmptyState, Input } from '../components/ui';
import { 
  Check, X, CreditCard, Coins, History, Download,
  Crown, Zap, Building, ArrowRight, CircleAlert,
  Calendar, DollarSign, TrendingUp, Wallet
} from 'lucide-react';
import { cn } from '../lib/utils';

// Subscription plans
const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    period: 'forever',
    description: 'Perfect for getting started',
    icon: Zap,
    features: [
      { text: '10 calculations per month', included: true },
      { text: 'Basic equations library', included: true },
      { text: 'Standard support', included: true },
      { text: 'Export to PDF', included: false },
      { text: 'Priority support', included: false },
      { text: 'API access', included: false },
    ],
    cta: 'Current Plan',
    popular: false,
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 9.99,
    priceEGP: 299,
    period: 'month',
    description: 'For individual engineers',
    icon: Crown,
    features: [
      { text: '100 calculations per month', included: true },
      { text: 'Full equations library', included: true },
      { text: 'Export to PDF/Excel', included: true },
      { text: 'Email support', included: true },
      { text: 'Custom workflows', included: false },
      { text: 'API access', included: false },
    ],
    cta: 'Get Starter',
    popular: false,
  },
  {
    id: 'pro',
    name: 'Professional',
    price: 29.99,
    priceEGP: 899,
    period: 'month',
    description: 'For serious engineers',
    icon: Crown,
    features: [
      { text: 'Unlimited calculations', included: true },
      { text: 'Full equations library', included: true },
      { text: 'Export to PDF/Excel', included: true },
      { text: 'Priority support', included: true },
      { text: 'Custom workflows', included: true },
      { text: 'API access', included: true },
    ],
    cta: 'Upgrade to Pro',
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 99.99,
    priceEGP: 2999,
    period: 'month',
    description: 'For teams and organizations',
    icon: Building,
    features: [
      { text: 'Everything in Pro', included: true },
      { text: 'Unlimited team members', included: true },
      { text: 'API access', included: true },
      { text: 'Custom integrations', included: true },
      { text: 'Dedicated support', included: true },
      { text: 'SLA guarantee', included: true },
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

// Credit packages
const CREDIT_PACKAGES = [
  { id: 'small', credits: 50, price: 4.99, priceEGP: 150, bonus: 0 },
  { id: 'medium', credits: 150, price: 12.99, priceEGP: 390, bonus: 15 },
  { id: 'large', credits: 500, price: 39.99, priceEGP: 1200, bonus: 75 },
  { id: 'xl', credits: 1000, price: 74.99, priceEGP: 2250, bonus: 200 },
];

/**
 * Subscription Management Page
 * Manage subscriptions, credits, and billing with Paymob support
 */
export default function SubscriptionPage() {
  const queryClient = useQueryClient();
  const [billingPeriod, setBillingPeriod] = useState('monthly');
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showPaymobModal, setShowPaymobModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [billingData, setBillingData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('paymob'); // 'paymob' or 'stripe'

  // Fetch current subscription
  const { data: subscription, isLoading: loadingSubscription } = useQuery({
    queryKey: ['subscription'],
    queryFn: subscriptionService.getCurrentSubscription,
  });

  // Fetch credit balance
  const { data: creditBalance, isLoading: loadingCredits } = useQuery({
    queryKey: ['credits', 'balance'],
    queryFn: subscriptionService.getCreditBalance,
  });

  // Fetch credit history
  const { data: creditHistory, isLoading: loadingHistory } = useQuery({
    queryKey: ['credits', 'history'],
    queryFn: () => subscriptionService.getCreditHistory({ limit: 10 }),
  });

  // Fetch payment history
  const { data: paymentHistory, isLoading: loadingPayments } = useQuery({
    queryKey: ['payments', 'history'],
    queryFn: () => subscriptionService.getPaymentHistory({ limit: 10 }),
  });

  // Subscribe mutation
  const subscribeMutation = useMutation({
    mutationFn: (planId) => subscriptionService.subscribe(planId),
    onSuccess: () => {
      queryClient.invalidateQueries(['subscription']);
    },
  });

  // Cancel subscription mutation
  const cancelMutation = useMutation({
    mutationFn: () => subscriptionService.cancel(),
    onSuccess: () => {
      queryClient.invalidateQueries(['subscription']);
    },
  });

  // Paymob payment mutation
  const paymobMutation = useMutation({
    mutationFn: ({ tier, billingCycle, billingData }) => 
      subscriptionService.createSubscriptionWithPaymob(tier, billingCycle, billingData),
    onSuccess: (response) => {
      // Redirect to Paymob payment page
      if (response.data?.paymentUrl) {
        window.location.href = response.data.paymentUrl;
      }
    },
  });

  // Purchase credits mutation
  const purchaseCreditsMutation = useMutation({
    mutationFn: ({ amount, paymentMethodId }) => 
      subscriptionService.purchaseCredits(amount, paymentMethodId),
    onSuccess: () => {
      queryClient.invalidateQueries(['credits']);
      setShowCreditModal(false);
      setSelectedPackage(null);
    },
  });

  const isLoading = loadingSubscription || loadingCredits || loadingHistory || loadingPayments;

  // Handle plan selection
  const handleSelectPlan = (plan) => {
    if (plan.id === 'free') return;
    
    setSelectedPlan(plan);
    if (paymentMethod === 'paymob') {
      setShowPaymobModal(true);
    } else {
      subscribeMutation.mutate(plan.id);
    }
  };

  // Handle Paymob payment
  const handlePaymobPayment = () => {
    if (!billingData.email || !billingData.phone) {
      alert('Please fill in email and phone number');
      return;
    }

    paymobMutation.mutate({
      tier: selectedPlan.id,
      billingCycle: billingPeriod === 'yearly' ? 'yearly' : 'monthly',
      billingData,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Subscription & Billing
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Manage your subscription, credits, and payment methods
        </p>
      </div>

      {/* Payment Method Toggle */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">Payment Method</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Choose your preferred payment method
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPaymentMethod('paymob')}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2',
                paymentMethod === 'paymob'
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
              )}
            >
              <Wallet className="w-4 h-4" />
              Paymob (EGP)
            </button>
            <button
              onClick={() => setPaymentMethod('stripe')}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2',
                paymentMethod === 'stripe'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
              )}
            >
              <CreditCard className="w-4 h-4" />
              Stripe (USD)
            </button>
          </div>
        </div>
      </Card>

      {/* Current Plan & Credits Overview */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Current Plan */}
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Plan</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {subscription?.plan_name || 'Free'}
              </h3>
              {subscription?.expires_at && (
                <p className="text-sm text-gray-500 mt-1">
                  Renews on {new Date(subscription.expires_at).toLocaleDateString()}
                </p>
              )}
            </div>
            <div className={cn(
              'p-3 rounded-full',
              subscription?.plan_id === 'pro' ? 'bg-purple-100 text-purple-600' :
              subscription?.plan_id === 'enterprise' ? 'bg-blue-100 text-blue-600' :
              subscription?.plan_id === 'starter' ? 'bg-green-100 text-green-600' :
              'bg-gray-100 text-gray-600'
            )}>
              {subscription?.plan_id === 'pro' ? (
                <Crown className="w-6 h-6" />
              ) : subscription?.plan_id === 'enterprise' ? (
                <Building className="w-6 h-6" />
              ) : (
                <Zap className="w-6 h-6" />
              )}
            </div>
          </div>
          
          {subscription?.plan_id !== 'pro' && subscription?.plan_id !== 'enterprise' && (
            <Button className="mt-4" asChild>
              <Link to="/pricing">Upgrade Plan</Link>
            </Button>
          )}
          
          {subscription?.plan_id === 'pro' && (
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => cancelMutation.mutate()}
              disabled={cancelMutation.isPending}
            >
              Cancel Subscription
            </Button>
          )}
        </Card>

        {/* Credit Balance */}
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Credit Balance</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {creditBalance?.balance || 0} credits
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                ≈ ${(((creditBalance?.balance || 0) * 0.1).toFixed(2))} value
              </p>
            </div>
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <Coins className="w-6 h-6" />
            </div>
          </div>
          
          <Button 
            className="mt-4"
            onClick={() => setShowCreditModal(true)}
          >
            Buy Credits
          </Button>
        </Card>
      </div>

      {/* Subscription Plans */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Available Plans
        </h2>
        
        {/* Billing Period Toggle */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setBillingPeriod('monthly')}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              billingPeriod === 'monthly'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
            )}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingPeriod('yearly')}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              billingPeriod === 'yearly'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
            )}
          >
            Yearly
            <span className="ml-2 text-xs text-green-600">(Save 20%)</span>
          </button>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            const isCurrentPlan = subscription?.plan_id === plan.id;
            const price = billingPeriod === 'yearly' 
              ? (paymentMethod === 'paymob' ? plan.priceEGP * 12 * 0.8 : plan.price * 12 * 0.8)
              : (paymentMethod === 'paymob' ? plan.priceEGP : plan.price);
            const currency = paymentMethod === 'paymob' ? 'EGP' : 'USD';
            
            return (
              <Card
                key={plan.id}
                className={cn(
                  'p-5 relative',
                  plan.popular && 'ring-2 ring-blue-500'
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-blue-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-4">
                  <div className={cn(
                    'inline-flex p-3 rounded-full mb-3',
                    plan.popular ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                  )}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {plan.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">{plan.description}</p>
                  <div className="mt-3">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      {currency === 'EGP' ? 'E£' : '$'}{price.toFixed(0)}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-gray-500 text-sm">/{billingPeriod === 'yearly' ? 'year' : 'month'}</span>
                    )}
                  </div>
                </div>

                <ul className="space-y-2 mb-4">
                  {plan.features.slice(0, 4).map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-xs">
                      {feature.included ? (
                        <Check className="w-3 h-3 text-green-500 flex-shrink-0" />
                      ) : (
                        <X className="w-3 h-3 text-gray-300 flex-shrink-0" />
                      )}
                      <span className={feature.included ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400'}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full"
                  size="sm"
                  variant={isCurrentPlan ? 'outline' : 'default'}
                  disabled={isCurrentPlan || subscribeMutation.isPending || paymobMutation.isPending}
                  onClick={() => handleSelectPlan(plan)}
                >
                  {isCurrentPlan ? 'Current Plan' : plan.cta}
                </Button>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Credit Packages */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Buy Credits
        </h2>
        <div className="grid md:grid-cols-4 gap-4">
          {CREDIT_PACKAGES.map((pkg) => (
            <Card
              key={pkg.id}
              className={cn(
                'p-4 cursor-pointer transition-all',
                selectedPackage?.id === pkg.id && 'ring-2 ring-blue-500'
              )}
              onClick={() => {
                setSelectedPackage(pkg);
                setShowCreditModal(true);
              }}
            >
              <div className="text-center">
                <Coins className="w-8 h-8 mx-auto text-yellow-500 mb-2" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {pkg.credits}
                  {pkg.bonus > 0 && (
                    <span className="text-sm text-green-500 ml-1">+{pkg.bonus}</span>
                  )}
                </p>
                <p className="text-sm text-gray-500">credits</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white mt-2">
                  {paymentMethod === 'paymob' ? `E£${pkg.priceEGP}` : `$${pkg.price}`}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Usage History */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Credit History */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <History className="w-5 h-5" />
              Credit History
            </h3>
            <Link to="/credits/history" className="text-sm text-blue-600 hover:text-blue-700">
              View All
            </Link>
          </div>
          
          {creditHistory?.items?.length > 0 ? (
            <div className="space-y-3">
              {creditHistory.items.slice(0, 5).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {item.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={cn(
                    'text-sm font-medium',
                    item.amount > 0 ? 'text-green-600' : 'text-red-600'
                  )}>
                    {item.amount > 0 ? '+' : ''}{item.amount}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={History}
              title="No credit history"
              description="Your credit transactions will appear here"
            />
          )}
        </Card>

        {/* Payment History */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Payment History
            </h3>
            <Link to="/payments/history" className="text-sm text-blue-600 hover:text-blue-700">
              View All
            </Link>
          </div>
          
          {paymentHistory?.items?.length > 0 ? (
            <div className="space-y-3">
              {paymentHistory.items.slice(0, 5).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'p-2 rounded-full',
                      item.status === 'completed' ? 'bg-green-100 text-green-600' :
                      item.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-red-100 text-red-600'
                    )}>
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.description}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(item.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      ${item.amount}
                    </span>
                    <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                      <Download className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={CreditCard}
              title="No payment history"
              description="Your payments will appear here"
            />
          )}
        </Card>
      </div>

      {/* Credit Purchase Modal */}
      {showCreditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md p-6 m-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Purchase Credits
            </h3>
            
            {selectedPackage && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Package:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {selectedPackage.credits} credits
                    {selectedPackage.bonus > 0 && (
                      <span className="text-green-500 ml-1">(+{selectedPackage.bonus} bonus)</span>
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-gray-600 dark:text-gray-400">Total:</span>
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    {paymentMethod === 'paymob' 
                      ? `E£${selectedPackage.priceEGP}` 
                      : `$${selectedPackage.price}`}
                  </span>
                </div>
              </div>
            )}
            
            <div className="space-y-3">
              <Button
                className="w-full"
                onClick={() => {
                  purchaseCreditsMutation.mutate({
                    amount: selectedPackage?.credits + (selectedPackage?.bonus || 0),
                    paymentMethodId: paymentMethod,
                  });
                }}
                disabled={purchaseCreditsMutation.isPending}
              >
                {purchaseCreditsMutation.isPending ? 'Processing...' : `Pay with ${paymentMethod === 'paymob' ? 'Paymob' : 'Card'}`}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setShowCreditModal(false);
                  setSelectedPackage(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Paymob Payment Modal */}
      {showPaymobModal && selectedPlan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg p-6 m-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Complete Payment with Paymob
            </h3>
            
            {/* Plan Summary */}
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedPlan.name} Plan</p>
                  <p className="text-sm text-gray-500">{billingPeriod === 'yearly' ? 'Yearly' : 'Monthly'}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">
                    E£{billingPeriod === 'yearly' 
                      ? (selectedPlan.priceEGP * 12 * 0.8).toFixed(0) 
                      : selectedPlan.priceEGP}
                  </p>
                  <p className="text-xs text-gray-500">/{billingPeriod === 'yearly' ? 'year' : 'month'}</p>
                </div>
              </div>
            </div>

            {/* Billing Data Form */}
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    First Name
                  </label>
                  <Input
                    value={billingData.firstName}
                    onChange={(e) => setBillingData({ ...billingData, firstName: e.target.value })}
                    placeholder="First name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Last Name
                  </label>
                  <Input
                    value={billingData.lastName}
                    onChange={(e) => setBillingData({ ...billingData, lastName: e.target.value })}
                    placeholder="Last name"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <Input
                  type="email"
                  value={billingData.email}
                  onChange={(e) => setBillingData({ ...billingData, email: e.target.value })}
                  placeholder="your@email.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <Input
                  type="tel"
                  value={billingData.phone}
                  onChange={(e) => setBillingData({ ...billingData, phone: e.target.value })}
                  placeholder="+20 xxx xxx xxxx"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Enter your Egyptian phone number</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowPaymobModal(false);
                  setSelectedPlan(null);
                }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={handlePaymobPayment}
                disabled={paymobMutation.isPending || !billingData.email || !billingData.phone}
              >
                {paymobMutation.isPending ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Wallet className="w-4 h-4 mr-2" />
                    Pay with Paymob
                  </>
                )}
              </Button>
            </div>

            {/* Security Note */}
            <p className="text-xs text-gray-500 mt-4 text-center">
              🔒 Your payment is secured by Paymob. You will be redirected to complete payment.
            </p>
          </Card>
        </div>
      )}
    </div>
  );
}
