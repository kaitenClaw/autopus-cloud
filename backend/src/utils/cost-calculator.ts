export interface ModelPricing {
  provider: string;
  model: string;
  usdPerMillion: number;
}

export const PRICING_TABLE: ModelPricing[] = [
  { provider: 'google-antigravity', model: '*', usdPerMillion: 0 },
  { provider: 'google', model: 'gemini-1.5-pro', usdPerMillion: 1.25 },
  { provider: 'google', model: 'gemini-1.5-flash', usdPerMillion: 0.075 },
  { provider: 'openai', model: 'gpt-4o', usdPerMillion: 2.50 },
  { provider: 'openai', model: 'gpt-4o-mini', usdPerMillion: 0.15 },
  { provider: 'anthropic', model: 'claude-3-5-sonnet', usdPerMillion: 3.00 },
  { provider: 'anthropic', model: 'claude-3-haiku', usdPerMillion: 0.25 },
];

/**
 * Calculate cost in USD for a given provider, model, and token count.
 */
export function calculateCost(provider: string, model: string, tokens: number): number {
  const normProvider = provider.toLowerCase();
  const normModel = model.toLowerCase();

  // Find best match (exact or wildcard)
  const pricing = PRICING_TABLE.find(p => 
    p.provider.toLowerCase() === normProvider && 
    (p.model === '*' || normModel.includes(p.model.toLowerCase()))
  );

  const rate = pricing ? pricing.usdPerMillion : 0.5; // Default 0.5 per million if unknown
  return (tokens / 1_000_000) * rate;
}
