export const AI_QUEUE_NAME = 'ai-queue';

export enum AiProviderName {
  OPENAI = 'openai',
  GEMINI = 'gemini',
  OPENROUTER = 'openrouter',
  BGE_M3 = 'bge-m3',
}

export enum AiJobName {
  CHAT = 'ai.chat',
  COMPLETION = 'ai.completion',
  EMBEDDING = 'ai.embedding',
  CHUNK_EMBED = 'ai.chunk-embed',
}
