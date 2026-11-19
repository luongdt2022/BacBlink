import { Injectable } from '@nestjs/common';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';

export interface ChunkingOptions {
  chunkSize?: number;
  chunkOverlap?: number;
}

@Injectable()
export class ChunkingService {
  async chunk(text: string, options: ChunkingOptions = {}): Promise<string[]> {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: options.chunkSize ?? 1500,
      chunkOverlap: options.chunkOverlap ?? 150,
    });

    return splitter.splitText(text);
  }
}
