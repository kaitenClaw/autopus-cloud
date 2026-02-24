import React, { useState, useCallback } from 'react';
import { CreditCard, ShieldCheck, Loader2, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { createCheckoutSession } from '../../api';

export type CheckoutMode = 'redirect' | 'embedded';

interface StripeCheckoutProps {
  planName: string;
  amount: number;
  interval?: 'month' | 'year';
  features?: string[];
  mode?: CheckoutMode;
  onSuccess?: () => void;
  onCancel?: () => void;
  onError?: (error: Error) => void;
}

const DEFAULT_FEATURES = [
  "Unlimited agent deployments",
  "Priority model access",
  "Real-time coordination insights",
  "Dedicated support channel"
];

export const StripeCheckout: React.FC<StripeCheckoutProps> = ({
  planName,
  amount,
  interval = 'month',
  features = DEFAULT_FEATURES,
  mode = 'redirect',
  onSuccess,
  onCancel,
  onError
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const formatPlanId = useCallback((name: string) => {
    return name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
  }, []);

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const planId = formatPlanId(planName);
      const response = await createCheckoutSession(planId);
      
      if (response.url) {
        if (onSuccess) onSuccess();
        
        if (mode === 'embedded') {
          // For embedded mode, we would render Stripe's embedded checkout
          // This requires @stripe/stripe-js to be installed
          setShowSuccess(true);
          setTimeout(() => {
            window.location.href = response.url;
          }, 1500);
        } else {
          // Redirect mode - immediate navigation
          window.location.href = response.url;
        }
      } else {
        throw new Error('No checkout URL returned from server');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Checkout initialization failed';
      setError(errorMessage);
      if (onError && err instanceof Error) onError(err);
      console.error('[StripeCheckout] Checkout failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const intervalLabel = interval === 'year' ? '/ year' : '/ month';
  const savingsBadge = interval === 'year' ? 'Save 20%' : null;

  if (showSuccess) {
    return (
      <div className="p-8 bg-[var(--surface-1)] rounded-2xl border border-emerald-500/30 shadow-xl max-w-md w-full mx-auto text-center">
        <div className="p-4 bg-emerald-500/15 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        </div>
        <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Redirecting...</h3>
        <p className="text-[var(--text-muted)]">Taking you to secure checkout</p>
      </div>
    );
  }

  return (
    <div className="p-8 bg-[var(--surface-1)] rounded-2xl border border-[var(--border-subtle)] shadow-xl max-w-md w-full mx-auto">
      {/* Header */}
      <div className="flex flex-col items-center text-center mb-8">
        <div className="p-3 bg-[color:var(--accent)]/15 rounded-2xl mb-4 relative">
          <CreditCard className="w-8 h-8 text-[color:var(--accent)]" />
          {savingsBadge && (
            <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {savingsBadge}
            </span>
          )}
        </div>
        <h3 className="text-2xl font-bold text-[var(--text-primary)]">Upgrade to {planName}</h3>
        <div className="flex items-baseline gap-1 mt-2">
          <span className="text-4xl font-extrabold text-[var(--text-primary)]">${amount}</span>
          <span className="text-[var(--text-muted)] font-medium">{intervalLabel}</span>
        </div>
        {interval === 'year' && (
          <p className="text-xs text-emerald-500 mt-1 font-medium">
            Billed annually (${amount * 12}/year)
          </p>
        )}
      </div>

      {/* Features */}
      <div className="space-y-4 mb-8">
        <p className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider">What's included:</p>
        <ul className="space-y-3 text-left">
          {features.map((feature, i) => (
            <li key={i} className="flex items-start gap-3 group">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
              <span className="text-sm text-[var(--text-secondary)]">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-rose-200">Checkout Error</p>
            <p className="text-xs text-rose-300/80 mt-0.5">{error}</p>
          </div>
          <button 
            onClick={() => setError(null)}
            className="text-xs text-rose-400 hover:text-rose-300 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Security Notice */}
      <div className="p-4 bg-[var(--surface-2)] rounded-xl mb-8 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-[var(--text-muted)] shrink-0 mt-0.5" />
        <p className="text-xs text-[var(--text-muted)] leading-relaxed text-left">
          Payments are secure and encrypted. Processed by Stripe. You can cancel or change your plan at any time from your billing settings.
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full py-4 px-6 bg-[color:var(--accent)] hover:brightness-110 text-white rounded-xl font-bold text-lg transition-all shadow-lg shadow-[color:var(--accent)]/20 disabled:opacity-50 flex items-center justify-center gap-3 relative overflow-hidden"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Initializing...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Upgrade Now
            </>
          )}
        </button>
        
        {onCancel && (
          <button
            onClick={onCancel}
            disabled={loading}
            className="w-full py-2 px-4 bg-transparent text-[var(--text-muted)] font-medium hover:text-[var(--text-primary)] transition-colors"
          >
            Not now, maybe later
          </button>
        )}
      </div>

      {/* Footer Note */}
      <p className="mt-6 text-center text-[11px] text-[var(--text-muted)]">
        By upgrading, you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  );
};

export default StripeCheckout;
