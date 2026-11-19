import { registerAs } from '@nestjs/config';
import { AiProviderName } from '../constants/ai.constants';

export interface AiConfig {
  defaultProvider: AiProviderName;
  openai: {
    apiKey: string;
    defaultModel: string;
  };
  gemini: {
    apiKey: string;
    defaultModel: string;
  };
  openrouter: {
    apiKey: string;
    baseUrl: string;
    defaultModel: string;
  };
}

export const aiConfig = registerAs(
  'ai',
  (): AiConfig => ({
    defaultProvider:
      (process.env.AI_DEFAULT_PROVIDER as AiProviderName) ??
      AiProviderName.OPENAI,
    openai: {
      apiKey: process.env.OPENAI_API_KEY ?? '',
      defaultModel: process.env.OPENAI_DEFAULT_MODEL ?? 'gpt-4o-mini',
    },
    gemini: {
      apiKey: process.env.GEMINI_API_KEY ?? '',
      defaultModel: process.env.GEMINI_DEFAULT_MODEL ?? 'gemini-1.5-flash',
    },
    openrouter: {
      apiKey: process.env.OPENROUTER_API_KEY ?? '',
      baseUrl:
        process.env.OPENROUTER_BASE_URL ?? 'https://openrouter.ai/api/v1',
      defaultModel:
        process.env.OPENROUTER_DEFAULT_MODEL ?? 'openai/gpt-4o-mini',
    },
  }),
);
