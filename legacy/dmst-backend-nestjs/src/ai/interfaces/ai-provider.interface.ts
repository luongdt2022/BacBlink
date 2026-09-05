import { AiProviderName } from '../constants/ai.constants';
import {
  AiChatRequest,
  AiChatResponse,
  AiCompletionRequest,
  AiCompletionResponse,
  AiEmbeddingRequest,
  AiEmbeddingResponse,
} from './ai-request.interface';

export interface IAiProvider {
  readonly providerName: AiProviderName;

  chat(request: AiChatRequest): Promise<AiChatResponse>;
  completion(request: AiCompletionRequest): Promise<AiCompletionResponse>;
  embedding(request: AiEmbeddingRequest): Promise<AiEmbeddingResponse>;
}
