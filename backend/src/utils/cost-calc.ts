interface PriceConfig {
  input: number;  // Price per 1M tokens
  output: number; // Price per 1M tokens
}

const PRICING: Record<string, PriceConfig> = {
  // Antigravity (Gemini 3 Flash based) - hypothetical pricing
  'antigravity': { input: 0.10, output: 0.40 },
  'google/gemini-2.0-flash-001': { input: 0.10, output: 0.40 },
  'google/gemini-2.0-pro-exp-02-05': { input: 1.25, output: 5.00 },
  
  // OpenAI
  'gpt-4o': { input: 2.50, output: 10.00 },
  'gpt-4o-mini': { input: 0.15, output: 0.60 },
  
  // Anthropic
  'claude-3-5-sonnet': { input: 3.00, output: 15.00 },
  'claude-3-5-haiku': { input: 0.25, output: 1.25 },
};

export function calculateCost(model: string, provider: string, tokens: number): number {
  // Normalize model name if needed
  const modelKey = model.toLowerCase();
  
  // Try to find exact match or provider match
  let price = PRICING[modelKey];
  
  if (!price) {
    // Fallback to provider default if model unknown
    if (provider === 'openai') price = PRICING['gpt-4o-mini'];
    else if (provider === 'google' || provider === 'vertex') price = PRICING['antigravity'];
    else price = { input: 0.50, output: 1.50 }; // Generic fallback
  }

  // Simplified: treat all tokens as 50/50 split for now if we don't have split metadata
  // Or just assume input/output average
  const avgPricePerMillion = (price.input + price.output) / 2;
  return (tokens / 1_000_000) * avgPricePerMillion;
}
