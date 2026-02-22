import React, { useState } from 'react';
import { CreditCard, ShieldCheck, Loader2, CheckCircle2 } from 'lucide-react';

interface StripeCheckoutProps {
  planName: string;
  amount: number;
  features?: string[];
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const StripeCheckout: React.FC<StripeCheckoutProps> = ({
  planName,
  amount,
  features = [
    "Unlimited agent deployments",
    "Priority model access",
    "Real-time coordination insights",
    "Dedicated support channel"
  ],
  onSuccess,
  onCancel
}) => {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      // Create real session via API
      const { createCheckoutSession } = await import('../../api');
      const response = await createCheckoutSession(planName.toLowerCase().replace(/\s+/g, '_'));
      
      // Redirect to Stripe (URL from backend)
      if (response.url) {
        if (onSuccess) onSuccess(); // Signal success before redirect if needed (though redirect will leave page)
        window.location.href = response.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Checkout failed', error);
      alert('Checkout failed to initialize. Please try again later.');
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-[var(--surface-1)] rounded-2xl border border-[var(--border-subtle)] shadow-xl max-w-md w-full mx-auto">
      <div className="flex flex-col items-center text-center mb-8">
        <div className="p-3 bg-[color:var(--accent)]/15 rounded-2xl mb-4">
          <CreditCard className="w-8 h-8 text-[color:var(--accent)]" />
        </div>
        <h3 className="text-2xl font-bold text-[var(--text-primary)]">Upgrade to {planName}</h3>
        <div className="flex items-baseline gap-1 mt-2">
          <span className="text-4xl font-extrabold text-[var(--text-primary)]">${amount}</span>
          <span className="text-[var(--text-muted)] font-medium">/ month</span>
        </div>
      </div>

      <div className="space-y-4 mb-8">
        <p className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider">What's included:</p>
        <ul className="space-y-3 text-left">
          {features.map((feature, i) => (
            <li key={i} className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <span className="text-sm text-[var(--text-secondary)]">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="p-4 bg-[var(--surface-2)] rounded-xl mb-8 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-[var(--text-muted)] shrink-0 mt-0.5" />
        <p className="text-xs text-[var(--text-muted)] leading-relaxed text-left">
          Payments are secure and encrypted. Processed by Stripe. You can cancel or change your plan at any time from your billing settings.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full py-4 px-6 bg-[color:var(--accent)] hover:brightness-110 text-white rounded-xl font-bold text-lg transition-all shadow-lg shadow-[color:var(--accent)]/20 disabled:opacity-50 flex items-center justify-center gap-3"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Initializing...
            </>
          ) : (
            'Upgrade Now'
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
    </div>
  );
};
