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
  apiKey?: string;
  baseUrl?: string;
  defaultModel: string;
  availableModels: ModelConfig[];
}

export const MODEL_CONFIGS: Record<LLMProvider, ModelConfig[]> = {
  vercel: [
    { provider: 'vercel', model: 'vercel:gpt-4o', displayName: 'GPT-4O', contextWindow: 128000, supportsStreaming: true, supportsFunctionCalling: true },
  ],
  openrouter: [
    { provider: 'openrouter', model: 'openrouter:anthropic/claude-3.5-sonnet', displayName: 'Claude 3.5 Sonnet', contextWindow: 200000, supportsStreaming: true, supportsFunctionCalling: true },
    { provider: 'openrouter', model: 'openrouter:anthropic/claude-3-opus', displayName: 'Claude 3 Opus', contextWindow: 200000, supportsStreaming: true, supportsFunctionCalling: true },
    { provider: 'openrouter', model: 'openrouter:openai/gpt-4o', displayName: 'GPT-4O', contextWindow: 128000, supportsStreaming: true, supportsFunctionCalling: true },
    { provider: 'openrouter', model: 'openrouter:openai/gpt-4-turbo', displayName: 'GPT-4 Turbo', contextWindow: 128000, supportsStreaming: true, supportsFunctionCalling: true },
    { provider: 'openrouter', model: 'openrouter:google/gemini-pro-1.5', displayName: 'Gemini Pro 1.5', contextWindow: 1000000, supportsStreaming: true, supportsFunctionCalling: true },
    { provider: 'openrouter', model: 'openrouter:mistralai/mixtral-8x7b', displayName: 'Mixtral 8x7B', contextWindow: 32000, supportsStreaming: true, supportsFunctionCalling: false },
    { provider: 'openrouter', model: 'openrouter:meta-llama/llama-3.1-70b', displayName: 'Llama 3.1 70B', contextWindow: 128000, supportsStreaming: true, supportsFunctionCalling: true },
  ],
  openai: [
    { provider: 'openai', model: 'openai:gpt-4o', displayName: 'GPT-4O', contextWindow: 128000, supportsStreaming: true, supportsFunctionCalling: true },
    { provider: 'openai', model: 'openai:gpt-4-turbo', displayName: 'GPT-4 Turbo', contextWindow: 128000, supportsStreaming: true, supportsFunctionCalling: true },
    { provider: 'openai', model: 'openai:gpt-3.5-turbo', displayName: 'GPT-3.5 Turbo', contextWindow: 16385, supportsStreaming: true, supportsFunctionCalling: true },
  ],
  anthropic: [
    { provider: 'anthropic', model: 'anthropic:claude-3.5-sonnet', displayName: 'Claude 3.5 Sonnet', contextWindow: 200000, supportsStreaming: true, supportsFunctionCalling: true },
    { provider: 'anthropic', model: 'anthropic:claude-3-opus', displayName: 'Claude 3 Opus', contextWindow: 200000, supportsStreaming: true, supportsFunctionCalling: true },
    { provider: 'anthropic', model: 'anthropic:claude-3-haiku', displayName: 'Claude 3 Haiku', contextWindow: 200000, supportsStreaming: true, supportsFunctionCalling: true },
  ],
  google: [
    { provider: 'google', model: 'google:gemini-pro-1.5', displayName: 'Gemini Pro 1.5', contextWindow: 1000000, supportsStreaming: true, supportsFunctionCalling: true },
    { provider: 'google', model: 'google:gemini-pro', displayName: 'Gemini Pro', contextWindow: 32768, supportsStreaming: true, supportsFunctionCalling: true },
  ],
  groq: [
    { provider: 'groq', model: 'groq:llama-3.1-70b-versatile', displayName: 'Llama 3.1 70B', contextWindow: 8192, supportsStreaming: true, supportsFunctionCalling: true },
    { provider: 'groq', model: 'groq:llama-3.1-8b-instant', displayName: 'Llama 3.1 8B', contextWindow: 8192, supportsStreaming: true, supportsFunctionCalling: true },
    { provider: 'groq', model: 'groq:mixtral-8x7b-32768', displayName: 'Mixtral 8x7B', contextWindow: 32768, supportsStreaming: true, supportsFunctionCalling: false },
  ],
  fireworks: [
    { provider: 'fireworks', model: 'fireworks:llama-v3p1-70b-instruct', displayName: 'Llama 3.1 70B', contextWindow: 128000, supportsStreaming: true, supportsFunctionCalling: true },
    { provider: 'fireworks', model: 'fireworks:llama-v3p1-8b-instruct', displayName: 'Llama 3.1 8B', contextWindow: 128000, supportsStreaming: true, supportsFunctionCalling: true },
  ],
  roocode: [
    { provider: 'roocode', model: 'roocode:claude-sonnet-4.5', displayName: 'Claude Sonnet 4.5', contextWindow: 200000, supportsStreaming: true, supportsFunctionCalling: true },
    { provider: 'roocode', model: 'roocode:gpt-5', displayName: 'GPT-5', contextWindow: 128000, supportsStreaming: true, supportsFunctionCalling: true },
    { provider: 'roocode', model: 'roocode:claude-opus', displayName: 'Claude Opus', contextWindow: 200000, supportsStreaming: true, supportsFunctionCalling: true },
  ],
  kilocode: [
    { provider: 'kilocode', model: 'kilocode:frontier-coding', displayName: 'Frontier Coding Model', contextWindow: 128000, supportsStreaming: true, supportsFunctionCalling: true },
    { provider: 'kilocode', model: 'kilocode:claude-sonnet', displayName: 'Claude Sonnet', contextWindow: 200000, supportsStreaming: true, supportsFunctionCalling: true },
    { provider: 'kilocode', model: 'kilocode:gpt-4o', displayName: 'GPT-4O', contextWindow: 128000, supportsStreaming: true, supportsFunctionCalling: true },
  ],
  cline: [
    { provider: 'cline', model: 'cline:grok-2', displayName: 'Grok 2', contextWindow: 128000, supportsStreaming: true, supportsFunctionCalling: true },
    { provider: 'cline', model: 'cline:claude-opus', displayName: 'Claude Opus', contextWindow: 200000, supportsStreaming: true, supportsFunctionCalling: true },
    { provider: 'cline', model: 'cline:gemini-pro-1.5', displayName: 'Gemini Pro 1.5', contextWindow: 1000000, supportsStreaming: true, supportsFunctionCalling: true },
  ],
};

export function getModelsForProvider(provider: LLMProvider): ModelConfig[] {
  return MODEL_CONFIGS[provider] || [];
}

export function getDefaultModel(provider: LLMProvider): ModelConfig | undefined {
  const models = getModelsForProvider(provider);
  return models[0];
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
