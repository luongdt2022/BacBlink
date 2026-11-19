import { AiProviderName } from '../constants/ai.constants';

export interface AiMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// ─── Chat ────────────────────────────────────────────────────────────────────

export interface AiChatRequest {
  messages: AiMessage[];
  provider?: AiProviderName;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AiChatResponse {
  content: string;
  model: string;
  provider: AiProviderName;
  usage?: AiUsage;
  raw?: unknown;
}

// ─── Completion ───────────────────────────────────────────────────────────────

export interface AiCompletionRequest {
  prompt: string;
  provider?: AiProviderName;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AiCompletionResponse {
  text: string;
  model: string;
  provider: AiProviderName;
  usage?: AiUsage;
  raw?: unknown;
}

// ─── Embedding ────────────────────────────────────────────────────────────────

export interface AiEmbeddingRequest {
  input: string | string[];
  provider?: AiProviderName;
  model?: string;
}

export interface AiEmbeddingResponse {
  embeddings: number[][];
  model: string;
  provider: AiProviderName;
  usage?: Pick<AiUsage, 'totalTokens'>;
  raw?: unknown;
}

// ─── Shared ───────────────────────────────────────────────────────────────────

export interface AiUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}
