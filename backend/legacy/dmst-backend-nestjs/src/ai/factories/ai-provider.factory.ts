import { BadRequestException, Injectable } from '@nestjs/common';
import { IAiProvider } from '../interfaces/ai-provider.interface';
import { AiProviderName } from '../constants/ai.constants';

@Injectable()
export class AiProviderFactory {
  private readonly registry = new Map<AiProviderName, IAiProvider>();

  register(provider: IAiProvider): void {
    this.registry.set(provider.providerName, provider);
  }

  getProvider(name: AiProviderName): IAiProvider {
    const provider = this.registry.get(name);
    if (!provider) {
      throw new BadRequestException(`AI provider "${name}" is not registered`);
    }
    return provider;
  }

  getRegisteredProviders(): AiProviderName[] {
    return Array.from(this.registry.keys());
  }
}
