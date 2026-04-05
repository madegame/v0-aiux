import type { LLMProvider } from '@/lib/ai-history/types';

export interface ModelConfig {
  provider: LLMProvider;
  model: string;
  displayName: string;
  contextWindow: number;
  supportsStreaming: boolean;
  supportsFunctionCalling: boolean;
}

export interface ProviderConfig {
  provider: LLMProvider;
  displayName: string;
  description: string;
  requiresApiKey: boolean;
  envVariable?: string;
  defaultModel: string;
  availableModels: ModelConfig[];
}

// v0 AI Gateway - Zero config providers (supported out of the box)
const VERCEL_AI_GATEWAY_MODELS: ModelConfig[] = [
  { provider: 'vercel-ai-gateway', model: 'openai/gpt-5-mini', displayName: 'GPT-5 Mini', contextWindow: 128000, supportsStreaming: true, supportsFunctionCalling: true },
  { provider: 'vercel-ai-gateway', model: 'openai/gpt-4o', displayName: 'GPT-4o', contextWindow: 128000, supportsStreaming: true, supportsFunctionCalling: true },
  { provider: 'vercel-ai-gateway', model: 'anthropic/claude-opus-4.6', displayName: 'Claude Opus 4.6', contextWindow: 200000, supportsStreaming: true, supportsFunctionCalling: true },
  { provider: 'vercel-ai-gateway', model: 'anthropic/claude-sonnet-4', displayName: 'Claude Sonnet 4', contextWindow: 200000, supportsStreaming: true, supportsFunctionCalling: true },
  { provider: 'vercel-ai-gateway', model: 'google/gemini-3-flash', displayName: 'Gemini 3 Flash', contextWindow: 1000000, supportsStreaming: true, supportsFunctionCalling: true },
  { provider: 'vercel-ai-gateway', model: 'google/gemini-3-pro', displayName: 'Gemini 3 Pro', contextWindow: 1000000, supportsStreaming: true, supportsFunctionCalling: true },
  { provider: 'vercel-ai-gateway', model: 'fireworks/llama-v3p1-70b', displayName: 'Llama 3.1 70B', contextWindow: 128000, supportsStreaming: true, supportsFunctionCalling: true },
];

// Direct provider models (require API keys)
const OPENAI_MODELS: ModelConfig[] = [
  { provider: 'openai', model: 'gpt-5-mini', displayName: 'GPT-5 Mini', contextWindow: 128000, supportsStreaming: true, supportsFunctionCalling: true },
  { provider: 'openai', model: 'gpt-4o', displayName: 'GPT-4o', contextWindow: 128000, supportsStreaming: true, supportsFunctionCalling: true },
  { provider: 'openai', model: 'gpt-4-turbo', displayName: 'GPT-4 Turbo', contextWindow: 128000, supportsStreaming: true, supportsFunctionCalling: true },
];

const ANTHROPIC_MODELS: ModelConfig[] = [
  { provider: 'anthropic', model: 'claude-opus-4.6', displayName: 'Claude Opus 4.6', contextWindow: 200000, supportsStreaming: true, supportsFunctionCalling: true },
  { provider: 'anthropic', model: 'claude-sonnet-4', displayName: 'Claude Sonnet 4', contextWindow: 200000, supportsStreaming: true, supportsFunctionCalling: true },
  { provider: 'anthropic', model: 'claude-3.5-sonnet', displayName: 'Claude 3.5 Sonnet', contextWindow: 200000, supportsStreaming: true, supportsFunctionCalling: true },
];

const GOOGLE_MODELS: ModelConfig[] = [
  { provider: 'google', model: 'gemini-3-flash', displayName: 'Gemini 3 Flash', contextWindow: 1000000, supportsStreaming: true, supportsFunctionCalling: true },
  { provider: 'google', model: 'gemini-3-pro', displayName: 'Gemini 3 Pro', contextWindow: 1000000, supportsStreaming: true, supportsFunctionCalling: true },
];

const GROQ_MODELS: ModelConfig[] = [
  { provider: 'groq', model: 'llama-3.1-70b', displayName: 'Llama 3.1 70B', contextWindow: 8192, supportsStreaming: true, supportsFunctionCalling: true },
  { provider: 'groq', model: 'mixtral-8x7b', displayName: 'Mixtral 8x7B', contextWindow: 32768, supportsStreaming: true, supportsFunctionCalling: false },
];

const FIREWORKS_MODELS: ModelConfig[] = [
  { provider: 'fireworks', model: 'llama-v3p1-70b-instruct', displayName: 'Llama 3.1 70B', contextWindow: 128000, supportsStreaming: true, supportsFunctionCalling: true },
];

const OPENROUTER_MODELS: ModelConfig[] = [
  { provider: 'openrouter', model: 'anthropic/claude-3.5-sonnet', displayName: 'Claude 3.5 Sonnet', contextWindow: 200000, supportsStreaming: true, supportsFunctionCalling: true },
  { provider: 'openrouter', model: 'openai/gpt-4o', displayName: 'GPT-4o', contextWindow: 128000, supportsStreaming: true, supportsFunctionCalling: true },
  { provider: 'openrouter', model: 'google/gemini-pro-1.5', displayName: 'Gemini Pro 1.5', contextWindow: 1000000, supportsStreaming: true, supportsFunctionCalling: true },
];

export const MODEL_CONFIGS: Record<LLMProvider, ModelConfig[]> = {
  'vercel-ai-gateway': VERCEL_AI_GATEWAY_MODELS,
  'openai': OPENAI_MODELS,
  'anthropic': ANTHROPIC_MODELS,
  'google': GOOGLE_MODELS,
  'groq': GROQ_MODELS,
  'fireworks': FIREWORKS_MODELS,
  'openrouter': OPENROUTER_MODELS,
};

export const PROVIDER_CONFIGS: Record<LLMProvider, ProviderConfig> = {
  'vercel-ai-gateway': {
    provider: 'vercel-ai-gateway',
    displayName: 'Vercel AI Gateway',
    description: 'Default - Zero config, supports OpenAI, Anthropic, Google, Fireworks',
    requiresApiKey: false,
    defaultModel: 'anthropic/claude-sonnet-4',
    availableModels: VERCEL_AI_GATEWAY_MODELS,
  },
  'openai': {
    provider: 'openai',
    displayName: 'OpenAI',
    description: 'Direct OpenAI API access',
    requiresApiKey: true,
    envVariable: 'OPENAI_API_KEY',
    defaultModel: 'gpt-4o',
    availableModels: OPENAI_MODELS,
  },
  'anthropic': {
    provider: 'anthropic',
    displayName: 'Anthropic',
    description: 'Direct Anthropic API access',
    requiresApiKey: true,
    envVariable: 'ANTHROPIC_API_KEY',
    defaultModel: 'claude-sonnet-4',
    availableModels: ANTHROPIC_MODELS,
  },
  'google': {
    provider: 'google',
    displayName: 'Google AI',
    description: 'Direct Google AI API access',
    requiresApiKey: true,
    envVariable: 'GOOGLE_AI_API_KEY',
    defaultModel: 'gemini-3-flash',
    availableModels: GOOGLE_MODELS,
  },
  'groq': {
    provider: 'groq',
    displayName: 'Groq',
    description: 'Fast inference via AI Gateway',
    requiresApiKey: true,
    envVariable: 'AI_GATEWAY_API_KEY',
    defaultModel: 'llama-3.1-70b',
    availableModels: GROQ_MODELS,
  },
  'fireworks': {
    provider: 'fireworks',
    displayName: 'Fireworks AI',
    description: 'Fireworks AI models',
    requiresApiKey: false,
    defaultModel: 'llama-v3p1-70b-instruct',
    availableModels: FIREWORKS_MODELS,
  },
  'openrouter': {
    provider: 'openrouter',
    displayName: 'OpenRouter',
    description: '200+ models with single API key',
    requiresApiKey: true,
    envVariable: 'OPENROUTER_API_KEY',
    defaultModel: 'anthropic/claude-3.5-sonnet',
    availableModels: OPENROUTER_MODELS,
  },
};

// Default provider for the app
export const DEFAULT_PROVIDER: LLMProvider = 'vercel-ai-gateway';
export const DEFAULT_MODEL = 'anthropic/claude-sonnet-4';

export function getModelsForProvider(provider: LLMProvider): ModelConfig[] {
  return MODEL_CONFIGS[provider] || [];
}

export function getDefaultModel(provider: LLMProvider): ModelConfig | undefined {
  const config = PROVIDER_CONFIGS[provider];
  if (!config) return undefined;
  return config.availableModels.find(m => m.model === config.defaultModel) || config.availableModels[0];
}

export function getModelConfig(provider: LLMProvider, model: string): ModelConfig | undefined {
  const models = getModelsForProvider(provider);
  return models.find(m => m.model === model);
}

export function getAllAvailableModels(): { provider: LLMProvider; models: ModelConfig[] }[] {
  return (Object.keys(MODEL_CONFIGS) as LLMProvider[]).map(provider => ({
    provider,
    models: MODEL_CONFIGS[provider],
  }));
}

export function getProviderConfig(provider: LLMProvider): ProviderConfig | undefined {
  return PROVIDER_CONFIGS[provider];
}

export function getZeroConfigProviders(): LLMProvider[] {
  return (Object.keys(PROVIDER_CONFIGS) as LLMProvider[]).filter(
    p => !PROVIDER_CONFIGS[p].requiresApiKey
  );
}
